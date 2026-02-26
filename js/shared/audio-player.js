/**
 * ============================================
 * 統一音訊播放器 — AudioPlayer
 * ============================================
 * 對應需求文件：§4.3, §5.4c, Flow-20, Flow-29
 * 說明：統一管理所有音效（SFX）和語音（Voice）的播放與降級
 *
 * 兩條獨立的 Fallback 路線：
 *   🔊 音效（SFX）：MP3 → Web Audio 合成音 → 靜默跳過
 *   🗣️ 語音（Voice）：自訂 MP3 → Edge TTS → gTTS 預生成 → Web Speech API → 純視覺
 *
 * 依賴：
 *   - sound-config.js（getSoundFile 提供已解析的音檔路徑）
 *   - stimulus-renderer.js（getStimulusVoiceFile 提供語音檔路徑）
 *
 * 取代：js/audio-controller.js（v14 舊版，Web Audio 合成音已整合至本模組）
 *
 * 匯出：window.AudioPlayer + module.exports
 * ============================================
 */

// =========================================
// Web Audio 合成音預設值（源自 v14 audio-controller.js）
// =========================================

/**
 * SFX 合成音預設值
 * 當 MP3 檔案載入失敗時，使用 Web Audio API 產生替代音效
 *
 * @readonly
 */
var SYNTH_PRESETS = {
  /** 答對 — 880Hz 正弦波 0.1 秒 */
  correct: { freq: 880, type: "sine", duration: 0.1 },
  /** 答錯 — 150Hz 鋸齒波 0.3 秒 */
  error: { freq: 150, type: "sawtooth", duration: 0.3 },
  /** 按鈕點擊 / 通用互動音 — 600Hz 正弦波 0.1 秒 */
  click: { freq: 600, type: "sine", duration: 0.1 },
  /** 倒數嗶聲 — 440Hz 正弦波 0.15 秒 */
  countdown: { freq: 440, type: "sine", duration: 0.15 },
  /** 倒數「開始！」— 660Hz 正弦波 0.2 秒 */
  go: { freq: 660, type: "sine", duration: 0.2 },
  /** WM 位置亮起 — 500Hz 三角波 0.12 秒 */
  highlight: { freq: 500, type: "triangle", duration: 0.12 },
  /** 徽章解鎖 — 雙音（會連播兩個音） */
  badge: { freq: 880, type: "sine", duration: 0.15 },
  /** 升級 — 上升音 */
  levelUp: { freq: 1000, type: "sine", duration: 0.2 },
  /** 遊戲完成 */
  complete: { freq: 1200, type: "sine", duration: 0.25 },
  /** 頁面切換 */
  transition: { freq: 350, type: "triangle", duration: 0.1 },
  /** 玩家加入 */
  playerJoin: { freq: 520, type: "sine", duration: 0.12 },
  /** 刺激物出現 */
  pop: { freq: 700, type: "sine", duration: 0.08 },
};

/**
 * SFX 路徑 → 合成音預設值的對照表
 * audio-player 會自動比對路徑尾段來找到對應的合成音
 *
 * @readonly
 */
var SFX_SYNTH_MAP = {
  "correct-ding": "correct",
  "incorrect-buzz": "error",
  "badge-unlock": "badge",
  "level-up": "levelUp",
  "game-complete": "complete",
  pop: "pop",
  "countdown-beep": "countdown",
  "countdown-go": "go",
  "wm-highlight": "highlight",
  "wm-correct": "correct",
  "wm-incorrect": "error",
  click: "click",
  transition: "transition",
  "player-join": "playerJoin",
};

// =========================================
// 私有狀態
// =========================================

/** @type {AudioContext|null} */
var _audioCtx = null;

/** @type {boolean} 🔊 音效總開關 */
var _sfxEnabled = true;

/** @type {boolean} 🗣️ 語音總開關 */
var _voiceEnabled = true;

/** @type {number} 總音量 0~1 */
var _volume = 1.0;

/** @type {number} 🗣️ 語音語速 0.6~1.3（1.0 = 正常速度） */
var _voiceRate = 1.0;

/**
 * AudioBuffer 快取 — 避免相同檔案重複 fetch + decode
 * key = 檔案路徑, value = AudioBuffer
 * 頁面切換時可呼叫 clearBufferCache() 手動釋放
 * @type {Object.<string, AudioBuffer>}
 */
var _bufferCache = {};

/** @type {boolean} 是否已初始化 */
var _initialized = false;

/** MP3 載入逾時（毫秒） */
var LOAD_TIMEOUT_MS = 5000;

// --- 語音強制停止追蹤 ---
/** @type {AudioBufferSourceNode|null} 目前正在播放的語音 source 節點 */
var _currentVoiceSource = null;
/** @type {number|null} 目前語音播放的逾時 ID */
var _currentVoiceTimeout = null;
/** @type {Function|null} 目前語音播放的 resolve callback（用於提前完成 Promise） */
var _currentVoiceResolve = null;

// =========================================
// 私有工具函式
// =========================================

/**
 * 取得或建立 AudioContext（惰性建立）
 * @returns {AudioContext}
 */
function _getAudioContext() {
  if (!_audioCtx) {
    var AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      _audioCtx = new AudioCtx();
    }
  }
  // 處理瀏覽器自動播放政策：suspended → resume
  if (_audioCtx && _audioCtx.state === "suspended") {
    _audioCtx.resume();
  }
  return _audioCtx;
}

/**
 * 將相對音檔路徑正規化為根絕對路徑
 * 避免子目錄頁面（如 /singleplayer/）載入時路徑解析錯誤
 * @param {string} p - 音檔路徑
 * @returns {string} 以 / 開頭的絕對路徑
 */
function _normalizePath(p) {
  if (!p || p.charAt(0) === "/" || /^https?:\/\//.test(p) || /^data:/.test(p)) {
    return p;
  }
  return "/" + p;
}

/**
 * 載入並播放 MP3 檔案
 *
 * @param {string} path - MP3 檔案路徑
 * @returns {Promise<void>} 播放完畢後 resolve
 */
function _playMp3(path) {
  path = _normalizePath(path);
  return new Promise(function (resolve, reject) {
    var audio = new Audio(path);
    audio.volume = _volume;

    // 逾時保護
    var timeout = setTimeout(function () {
      audio.pause();
      audio.src = "";
      reject(new Error("Audio load timeout: " + path));
    }, LOAD_TIMEOUT_MS);

    audio.addEventListener(
      "canplaythrough",
      function () {
        clearTimeout(timeout);
        audio.play().then(resolve).catch(reject);
      },
      { once: true },
    );

    audio.addEventListener(
      "error",
      function () {
        clearTimeout(timeout);
        reject(new Error("Audio load error: " + path));
      },
      { once: true },
    );

    audio.load();
  });
}

/**
 * 載入並播放 MP3 檔案，等待播放結束
 * 用於語音（需要等念完才接下一步）
 *
 * @param {string} path - MP3 檔案路徑
 * @returns {Promise<void>} 播放結束後 resolve
 */
function _playMp3UntilEnd(path) {
  path = _normalizePath(path);
  return new Promise(function (resolve, reject) {
    var audio = new Audio(path);
    audio.volume = _volume;

    var timeout = setTimeout(function () {
      audio.pause();
      audio.src = "";
      reject(new Error("Audio load timeout: " + path));
    }, LOAD_TIMEOUT_MS);

    audio.addEventListener(
      "ended",
      function () {
        resolve();
      },
      { once: true },
    );

    audio.addEventListener(
      "canplaythrough",
      function () {
        clearTimeout(timeout);
        audio.play().catch(reject);
      },
      { once: true },
    );

    audio.addEventListener(
      "error",
      function () {
        clearTimeout(timeout);
        reject(new Error("Audio load error: " + path));
      },
      { once: true },
    );

    audio.load();
  });
}

/**
 * 使用 Web Audio API 播放 MP3 並套用語速（方案 B）
 *
 * 流程：fetch → decodeAudioData → AudioBufferSourceNode（可調 playbackRate）
 * 優點：playbackRate 調整時音調偏移較 HTMLAudioElement 小，
 *       且可搭配 detune 微調補償。
 * 快取：已 decode 的 AudioBuffer 存入 _bufferCache，
 *       同一檔案第二次播放直接從快取取用。
 *
 * @param {string} path - MP3/WAV 檔案路徑
 * @param {number} [rate=1.0] - 播放速率 0.6~1.3
 * @returns {Promise<void>} 播放結束後 resolve
 */
function _playMp3WithRate(path, rate, isVoice) {
  path = _normalizePath(path);
  var ctx = _getAudioContext();
  if (!ctx) {
    // 無 AudioContext → 降級回 HTMLAudioElement
    return _playMp3UntilEnd(path);
  }

  var playbackRate = Math.max(0.6, Math.min(1.3, rate || 1.0));

  // 如果快取中已有 AudioBuffer，直接播放
  if (_bufferCache[path]) {
    return _playBufferSource(_bufferCache[path], playbackRate, isVoice);
  }

  // fetch → arrayBuffer → decodeAudioData → 快取 → 播放
  return fetch(path)
    .then(function (res) {
      if (!res.ok)
        throw new Error("Fetch failed (" + res.status + "): " + path);
      return res.arrayBuffer();
    })
    .then(function (arrayBuf) {
      return ctx.decodeAudioData(arrayBuf);
    })
    .then(function (audioBuffer) {
      // 存入快取
      _bufferCache[path] = audioBuffer;
      return _playBufferSource(audioBuffer, playbackRate, isVoice);
    });
}

/**
 * 強制停止目前正在播放的語音
 * 包含 Web Audio API source 節點與 Web Speech API
 */
function _stopCurrentVoice() {
  // 停止 Web Audio source
  if (_currentVoiceSource) {
    try {
      _currentVoiceSource.stop();
    } catch (e) {
      /* 已停止 */
    }
    _currentVoiceSource = null;
  }
  // 清除逾時計時器
  if (_currentVoiceTimeout) {
    clearTimeout(_currentVoiceTimeout);
    _currentVoiceTimeout = null;
  }
  // 提前 resolve 上一次的 Promise（避免掛起）
  if (_currentVoiceResolve) {
    _currentVoiceResolve();
    _currentVoiceResolve = null;
  }
  // 停止 Web Speech API（L4）
  if (window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      /* ignore */
    }
  }
}

/**
 * 內部輔助：從 AudioBuffer 建立 source 節點並播放
 *
 * @param {AudioBuffer} audioBuffer - 已解碼的音訊資料
 * @param {number} rate - 播放速率
 * @param {boolean} [isVoice=false] - 是否為語音播放（啟用強制停止追蹤）
 * @returns {Promise<void>}
 */
function _playBufferSource(audioBuffer, rate, isVoice) {
  return new Promise(function (resolve) {
    var ctx = _getAudioContext();
    if (!ctx) {
      resolve();
      return;
    }

    var source = ctx.createBufferSource();
    var gainNode = ctx.createGain();

    source.buffer = audioBuffer;
    source.playbackRate.value = rate;
    gainNode.gain.value = _volume;

    source.connect(gainNode);
    gainNode.connect(ctx.destination);

    // 逾時保護：依實際音訊長度 / 播放速率 + 3 秒緩衝
    var estimatedMs = Math.ceil((audioBuffer.duration / rate) * 1000) + 3000;
    var timeout = setTimeout(function () {
      try {
        source.stop();
      } catch (e) {
        /* 已停止 */
      }
      // 清除語音追蹤
      if (isVoice) {
        _currentVoiceSource = null;
        _currentVoiceTimeout = null;
        _currentVoiceResolve = null;
      }
      resolve();
    }, estimatedMs);

    source.onended = function () {
      clearTimeout(timeout);
      // 清除語音追蹤
      if (isVoice) {
        _currentVoiceSource = null;
        _currentVoiceTimeout = null;
        _currentVoiceResolve = null;
      }
      resolve();
    };

    // 語音播放追蹤：儲存 source / timeout / resolve 供強制停止使用
    if (isVoice) {
      _currentVoiceSource = source;
      _currentVoiceTimeout = timeout;
      _currentVoiceResolve = resolve;
    }

    source.start();
  });
}

/**
 * 使用 Web Audio API 合成並播放音調
 *
 * @param {number} freq     - 頻率 Hz
 * @param {string} type     - 波形 'sine' | 'square' | 'sawtooth' | 'triangle'
 * @param {number} duration - 持續時間（秒）
 */
function _playTone(freq, type, duration) {
  var ctx = _getAudioContext();
  if (!ctx) return;

  var osc = ctx.createOscillator();
  var gain = ctx.createGain();

  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  gain.gain.setValueAtTime(0.3 * _volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.stop(ctx.currentTime + duration);
}

/**
 * 從 MP3 路徑推測對應的合成音預設值名稱
 * 例如 "audio/sfx/countdown-beep.mp3" → "countdown"
 *
 * @param {string} path - 音效檔路徑
 * @returns {string|null} SYNTH_PRESETS 的 key，或 null
 */
function _guessSynthPreset(path) {
  if (!path) return null;
  // 取得檔名（不含 .mp3）
  var filename = path.split("/").pop().replace(".mp3", "");
  return SFX_SYNTH_MAP[filename] || null;
}

/**
 * 將原始語音路徑映射到 Edge TTS fallback 路徑
 *
 * 映射規則與 gTTS 相同，但使用 audio/voice/edge-tts/ 目錄
 *
 * @param {string|null} originalPath - 原始語音檔路徑
 * @returns {string|null} Edge TTS fallback 路徑，或 null
 */
function _getEdgeTtsFallbackPath(originalPath) {
  if (!originalPath) return null;

  var EDGE_DIR = "audio/voice/edge-tts/";
  var filename = originalPath.split("/").pop();

  // 規則說明語音太長，無 TTS 備用
  if (originalPath.indexOf("audio/guide/") === 0) {
    return null;
  }

  // 男聲/女聲 刺激物語音 → stimulus- 前綴
  if (
    originalPath.indexOf("/female/") !== -1 ||
    originalPath.indexOf("/male/") !== -1
  ) {
    return EDGE_DIR + "stimulus-" + filename;
  }

  // 其他語音（wm, badge, level, unlock）→ 直接搬到 edge-tts/
  return EDGE_DIR + filename;
}

/**
 * 將原始語音路徑映射到 gTTS fallback 路徑
 *
 * 映射規則：
 *   audio/voice/female/cheese.mp3  → audio/voice/tts-fallback/stimulus-cheese.mp3
 *   audio/voice/male/cheese.mp3    → audio/voice/tts-fallback/stimulus-cheese.mp3
 *   audio/voice/wm/wm-forward.mp3  → audio/voice/tts-fallback/wm-forward.mp3
 *   audio/voice/badge/badge-xx.mp3  → audio/voice/tts-fallback/badge-xx.mp3
 *   audio/voice/level/level-xx.mp3  → audio/voice/tts-fallback/level-xx.mp3
 *   audio/voice/unlock/unlock-xx.mp3 → audio/voice/tts-fallback/unlock-xx.mp3
 *   audio/guide/*.mp3               → null（規則說明太長，無 gTTS 備用）
 *
 * @param {string|null} originalPath - 原始語音檔路徑
 * @returns {string|null} gTTS fallback 路徑，或 null
 */
function _getTtsFallbackPath(originalPath) {
  if (!originalPath) return null;

  var TTS_DIR = "audio/voice/tts-fallback/";
  var filename = originalPath.split("/").pop(); // e.g. "cheese.mp3"

  // 規則說明語音太長，無 gTTS 備用
  if (originalPath.indexOf("audio/guide/") === 0) {
    return null;
  }

  // 男聲/女聲 刺激物語音 → stimulus- 前綴
  if (
    originalPath.indexOf("/female/") !== -1 ||
    originalPath.indexOf("/male/") !== -1
  ) {
    return TTS_DIR + "stimulus-" + filename;
  }

  // 其他語音（wm, badge, level, unlock）→ 直接搬到 tts-fallback/
  return TTS_DIR + filename;
}

/**
 * 使用 Web Speech API 即時合成語音（Level 3）
 *
 * 設計決策（E4）：Web Speech API 男/女聲替代策略
 *   現行方案：以語速差異作為替代提示——
 *   - 女聲情境（rule1/mixed-rule1）：rate = 1.0（正常）
 *   - 男聲情境（mixed-rule2）：rate = 0.8（稍慢）
 *   狀態：可運作，待自訂 MP3 素材完成後可進一步替換。
 *
 * @param {string} text   - 要朗讀的文字
 * @param {string} gender - 'female' 或 'male'
 * @returns {Promise<void>}
 */
function _speakWithWebSpeech(text, gender) {
  return new Promise(function (resolve, reject) {
    if (!window.speechSynthesis) {
      reject(new Error("speechSynthesis not available"));
      return;
    }

    var utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-TW";
    utterance.volume = _volume;

    // E4 暫定策略：語速差異替代男/女聲
    // 方案 C 補充：基礎 rate × 使用者語速設定 _voiceRate
    if (gender === "male") {
      utterance.rate = 0.8 * _voiceRate; // 稍慢 × 使用者語速
    } else {
      utterance.rate = 1.0 * _voiceRate; // 正常 × 使用者語速
    }

    utterance.onend = function () {
      resolve();
    };

    utterance.onerror = function (event) {
      reject(new Error("Web Speech error: " + event.error));
    };

    // 逾時保護（Web Speech 有時不觸發 onend）
    var timeout = setTimeout(function () {
      window.speechSynthesis.cancel();
      resolve(); // 超時不算致命錯誤，靜默通過
    }, 8000);

    utterance.onend = function () {
      clearTimeout(timeout);
      resolve();
    };

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * 從 localStorage 讀取使用者偏好
 */
function _initFromStorage() {
  try {
    var sfx = localStorage.getItem("efgame-sfx-enabled");
    if (sfx !== null) _sfxEnabled = sfx === "true";

    var voice = localStorage.getItem("efgame-voice-enabled");
    if (voice !== null) _voiceEnabled = voice === "true";

    var vol = localStorage.getItem("efgame-volume");
    if (vol !== null) {
      var parsed = parseFloat(vol);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
        _volume = parsed;
      }
    }

    var rate = localStorage.getItem("efgame-voice-rate");
    if (rate !== null) {
      var parsedRate = parseFloat(rate);
      if (!isNaN(parsedRate) && parsedRate >= 0.6 && parsedRate <= 1.3) {
        _voiceRate = parsedRate;
      }
    }
  } catch (e) {
    Logger.warn("⚠️ AudioPlayer: localStorage 讀取失敗", e);
  }
}

// =========================================
// 公開 API
// =========================================

var AudioPlayer = {
  // -----------------------------------------
  // 初始化
  // -----------------------------------------

  /**
   * 初始化音訊播放器
   * 建議在頁面載入時呼叫，並在首次使用者互動時呼叫 resumeContext()
   */
  init: function () {
    if (_initialized) return;
    _initFromStorage();
    _initialized = true;
    Logger.debug(
      "🔊 AudioPlayer 已初始化 — SFX:" +
        (_sfxEnabled ? "ON" : "OFF") +
        " Voice:" +
        (_voiceEnabled ? "ON" : "OFF") +
        " Vol:" +
        _volume,
    );
  },

  /**
   * 在使用者首次互動時呼叫
   * 解決瀏覽器自動播放政策限制
   */
  resumeContext: function () {
    _getAudioContext();
  },

  // -----------------------------------------
  // 🔊 音效播放（SFX 三級 Fallback）
  // -----------------------------------------

  /**
   * 播放音效
   *
   * Fallback 順序：
   *   L1: MP3 檔案（soundPath 由 getSoundFile() 已解析 自訂→預設）
   *   L2: Web Audio 合成音（從 v14 audio-controller.js 移植）
   *   L3: 靜默跳過（console.warn）
   *
   * @param {string|null} soundPath   - 音效檔路徑（來自 getSoundFile()）
   * @param {Object}      [options]
   * @param {string}      [options.synthPreset] - 合成音預設名稱（如 'correct', 'error'）
   *                                              若不指定，會自動從路徑推測
   * @returns {Promise<{level: string, played: boolean}>}
   *
   * @example
   * // 基本用法
   * AudioPlayer.playSfx(getSoundFile('feedback.correct'));
   *
   * // 指定合成音 fallback
   * AudioPlayer.playSfx(getSoundFile('sfx.countdown'), { synthPreset: 'countdown' });
   */
  playSfx: function (soundPath, options) {
    var opts = options || {};

    if (!_sfxEnabled) {
      return Promise.resolve({ level: "off", played: false });
    }

    // L1: 嘗試播放 MP3
    if (soundPath) {
      return _playMp3(soundPath)
        .then(function () {
          return { level: "L1", played: true };
        })
        .catch(function (err) {
          Logger.warn("🔊 L1 MP3 音效失敗: " + soundPath, err.message);

          // L2: Web Audio 合成音
          var presetName = opts.synthPreset || _guessSynthPreset(soundPath);
          if (presetName && SYNTH_PRESETS[presetName]) {
            var preset = SYNTH_PRESETS[presetName];
            _playTone(preset.freq, preset.type, preset.duration);
            return { level: "L2-synth", played: true };
          }

          // L3: 靜默跳過
          Logger.warn("🔊 L3 靜默跳過: " + soundPath);
          return { level: "L3", played: false };
        });
    }

    // 無路徑 → 嘗試合成音 → 靜默
    var presetName = opts.synthPreset || null;
    if (presetName && SYNTH_PRESETS[presetName]) {
      var preset = SYNTH_PRESETS[presetName];
      _playTone(preset.freq, preset.type, preset.duration);
      return Promise.resolve({ level: "L2-synth", played: true });
    }

    Logger.warn("🔊 L3 靜默跳過（無路徑）");
    return Promise.resolve({ level: "L3", played: false });
  },

  // -----------------------------------------
  // 🗣️ 語音播放（Voice 四級 Fallback）
  // -----------------------------------------

  /**
   * 播放語音
   *
   * Fallback 順序：
   *   L1: 自訂語音 MP3（人聲錄製，有男/女聲區分）
   *   L2: Edge TTS 預生成 MP3（高品質 AI 語音）
   *   L3: gTTS 預生成 MP3（無男/女聲區分）
   *   L4: Web Speech API 即時合成（語速差異替代男/女聲）
   *   L5: 純視覺模式（觸發 onVisualFallback 回調）
   *
   * @param {string|null} filePath - 語音 MP3 路徑（來自 getStimulusVoiceFile()）
   * @param {Object}      options
   * @param {string}      options.text             - 要朗讀的文字（L3 使用）
   * @param {string}      [options.gender='female'] - 'female' 或 'male'（L3 語速策略）
   * @param {Function}    [options.onVisualFallback] - L4 視覺補償回調
   *                        接收 { text: string, gender: string }
   * @returns {Promise<{level: string, played: boolean}>}
   *
   * @example
   * // 刺激物語音
   * var voicePath = getStimulusVoiceFile('mouse', 'go', 'rule1');
   * AudioPlayer.playVoice(voicePath, {
   *   text: '起司',
   *   gender: 'female',
   *   onVisualFallback: function(info) {
   *     // 放大刺激物、加粗邊框等視覺補償
   *     document.querySelector('.stimulus').classList.add('visual-enhanced');
   *   }
   * });
   *
   * // 徽章播報
   * AudioPlayer.playVoice(getSoundFile('badgeVoice.mouseAdventurer'), {
   *   text: '獲得小老鼠冒險家'
   * });
   */
  playVoice: function (filePath, options) {
    var opts = options || {};
    var text = opts.text || "";
    var gender = opts.gender || "female";
    var onVisualFallback = opts.onVisualFallback || null;

    if (!_voiceEnabled) {
      return Promise.resolve({ level: "off", played: false });
    }

    // 強制停止上一次語音播放，避免重疊
    _stopCurrentVoice();

    // L1: 自訂語音 MP3（方案 B — Web Audio API + playbackRate）
    var l1Promise;
    if (filePath) {
      l1Promise = _playMp3WithRate(filePath, _voiceRate, true)
        .then(function () {
          return { level: "L1", played: true };
        })
        .catch(function (err) {
          Logger.warn("🗣️ L1 自訂語音失敗: " + filePath, err.message);
          return null; // 繼續降級
        });
    } else {
      l1Promise = Promise.resolve(null);
    }

    return l1Promise
      .then(function (result) {
        if (result) return result;

        // L2: Edge TTS 預生成 MP3
        var edgeFallback = _getEdgeTtsFallbackPath(filePath);
        var l2Promise;
        if (edgeFallback) {
          l2Promise = _playMp3WithRate(edgeFallback, _voiceRate, true)
            .then(function () {
              return { level: "L2", played: true };
            })
            .catch(function (err) {
              Logger.warn(
                "🗣️ L2 Edge TTS 備用失敗: " + edgeFallback,
                err.message,
              );
              return null;
            });
        } else {
          l2Promise = Promise.resolve(null);
        }

        return l2Promise.then(function (result2) {
          if (result2) return result2;

          // L3: gTTS 預生成 MP3
          var ttsFallback = _getTtsFallbackPath(filePath);
          var l3Promise;
          if (ttsFallback) {
            l3Promise = _playMp3WithRate(ttsFallback, _voiceRate, true)
              .then(function () {
                return { level: "L3", played: true };
              })
              .catch(function (err) {
                Logger.warn("🗣️ L3 gTTS 備用失敗: " + ttsFallback, err.message);
                return null;
              });
          } else {
            l3Promise = Promise.resolve(null);
          }

          return l3Promise.then(function (result3) {
            if (result3) return result3;

            // L4: Web Speech API
            if (text && window.speechSynthesis) {
              return _speakWithWebSpeech(text, gender)
                .then(function () {
                  return { level: "L4", played: true };
                })
                .catch(function (err) {
                  Logger.warn("🗣️ L4 Web Speech API 失敗:", err.message);
                  return null;
                });
            }
            return null;
          });
        });
      })
      .then(function (finalResult) {
        if (finalResult) return finalResult;

        // L5: 純視覺模式
        Logger.warn('🗣️ L5 純視覺模式 — 語音完全不可用: "' + text + '"');
        if (typeof onVisualFallback === "function") {
          onVisualFallback({ text: text, gender: gender });
        }
        return { level: "L5", played: false };
      });
  },

  /**
   * 強制停止當前語音播放
   * 外部可呼叫此方法在切換動作時打斷尚未播完的語音
   */
  stopVoice: function () {
    _stopCurrentVoice();
  },

  // -----------------------------------------
  // 合成音直接播放（v14 相容 API）
  // -----------------------------------------

  /**
   * 直接播放合成音調
   *
   * @param {number} freq     - 頻率 Hz
   * @param {string} type     - 波形類型
   * @param {number} duration - 持續時間（秒）
   */
  playTone: function (freq, type, duration) {
    if (!_sfxEnabled) return;
    _playTone(freq, type, duration);
  },

  /** 播放答對音效（880Hz 正弦波，v14 相容） */
  playCorrectTone: function () {
    this.playTone(880, "sine", 0.1);
  },

  /** 播放答錯音效（150Hz 鋸齒波，v14 相容） */
  playErrorTone: function () {
    this.playTone(150, "sawtooth", 0.3);
  },

  // -----------------------------------------
  // 開關與音量控制
  // -----------------------------------------

  /**
   * 設定 🔊 音效開關
   * @param {boolean} enabled
   */
  setSfxEnabled: function (enabled) {
    _sfxEnabled = !!enabled;
    try {
      localStorage.setItem("efgame-sfx-enabled", String(_sfxEnabled));
    } catch (e) {
      /* ignore */
    }
  },

  /**
   * 設定 🗣️ 語音開關
   * @param {boolean} enabled
   */
  setVoiceEnabled: function (enabled) {
    _voiceEnabled = !!enabled;
    try {
      localStorage.setItem("efgame-voice-enabled", String(_voiceEnabled));
    } catch (e) {
      /* ignore */
    }
  },

  /**
   * 設定總音量
   * @param {number} vol - 0~1
   */
  setVolume: function (vol) {
    _volume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem("efgame-volume", String(_volume));
    } catch (e) {
      /* ignore */
    }
  },

  /** @returns {boolean} */
  isSfxEnabled: function () {
    return _sfxEnabled;
  },

  /** @returns {boolean} */
  isVoiceEnabled: function () {
    return _voiceEnabled;
  },

  /** @returns {number} */
  getVolume: function () {
    return _volume;
  },

  // -----------------------------------------
  // 🗣️ 語音語速控制
  // -----------------------------------------

  /**
   * 設定語音語速
   *
   * 🐢 0.7 = 慢速（初學 / 重度聽損）
   * 🐇 1.0 = 正常（預設）
   * 🐆 1.2 = 快速（進階練習）
   *
   * 影響 L1（自訂 MP3）、L2（Edge TTS MP3）、L3（gTTS MP3）、L4（Web Speech API）全部四級。
   * L1/L2/L3 透過 Web Audio API AudioBufferSourceNode.playbackRate 實現。
   * L4 透過 SpeechSynthesisUtterance.rate 實現（方案 C 補充）。
   *
   * @param {number} rate - 語速 0.6~1.3（超出範圍會被 clamp）
   */
  setVoiceRate: function (rate) {
    _voiceRate = Math.max(0.6, Math.min(1.3, rate));
    try {
      localStorage.setItem("efgame-voice-rate", String(_voiceRate));
    } catch (e) {
      /* ignore */
    }
    Logger.debug("🗣️ 語速已設定: " + _voiceRate + "x");
  },

  /**
   * 取得目前語音語速
   * @returns {number} 0.6~1.3
   */
  getVoiceRate: function () {
    return _voiceRate;
  },

  /**
   * 清除 AudioBuffer 快取
   * 建議在頁面切換（如從遊戲頁回到大廳）時呼叫，釋放記憶體。
   * 不清除也不會出問題，但清除後下次播放需重新 fetch + decode。
   */
  clearBufferCache: function () {
    var count = Object.keys(_bufferCache).length;
    _bufferCache = {};
    if (count > 0) {
      Logger.debug("🧹 AudioBuffer 快取已清除（" + count + " 筆）");
    }
  },

  // -----------------------------------------
  // 預載
  // -----------------------------------------

  /**
   * 預先載入音效/語音檔案到瀏覽器快取
   * 適合在遊戲開始前呼叫，減少首次播放延遲
   *
   * @param {string[]} paths - MP3 路徑陣列
   * @returns {Promise<{loaded: number, failed: number}>}
   */
  preload: function (paths) {
    var loaded = 0;
    var failed = 0;
    var promises = paths.map(function (path) {
      return new Promise(function (resolve) {
        var audio = new Audio();
        audio.addEventListener(
          "canplaythrough",
          function () {
            loaded++;
            resolve();
          },
          { once: true },
        );
        audio.addEventListener(
          "error",
          function () {
            failed++;
            resolve(); // 不 reject，繼續載入其他
          },
          { once: true },
        );
        audio.src = path;
        audio.load();
      });
    });
    return Promise.all(promises).then(function () {
      Logger.debug(
        "📦 預載完成：✅ " + loaded + " 成功 ｜ ❌ " + failed + " 失敗",
      );
      return { loaded: loaded, failed: failed };
    });
  },

  // -----------------------------------------
  // 常數暴露（供測試與外部參照）
  // -----------------------------------------

  /** @readonly */
  SYNTH_PRESETS: SYNTH_PRESETS,

  /** @readonly */
  SFX_SYNTH_MAP: SFX_SYNTH_MAP,
};

// =========================================
// 匯出
// =========================================

if (typeof window !== "undefined") {
  window.AudioPlayer = AudioPlayer;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = AudioPlayer;
}
