/**
 * ============================================
 * 倒數動畫元件 — Countdown
 * ============================================
 * 對應需求文件：§2.7, §2.8, §3.1b
 * 說明：3-2-1 倒數動畫，含音效同步、顏色遞變與按鈕鎖定
 *
 * 適用時機：
 *   - 遊戲最開始（第一組合前）— 所有玩家同步倒數
 *   - 組合切換（後續組合前）— 各自倒數
 *   - WM 測驗開始前 — 各自倒數
 *   - ❌ 題目之間 — 無倒數
 *
 * 視覺設計：
 *   3（紅底）→ 2（黃底）→ 1（綠底）→ 🚀 開始！（白光閃爍）
 *   數字 120px，「🎹 請將手指放在空白鍵上」閃爍提示
 *   所有互動按鈕在倒數期間鎖定
 *
 * 音效同步（via AudioPlayer）：
 *   3 → 低音嗶 (countdown-beep)
 *   2 → 中音嗶 (countdown-beep)
 *   1 → 高音嗶 (countdown-beep)
 *   開始 → "開始！" (countdown-go) + 語音
 *
 * 依賴：
 *   - AudioPlayer（audio-player.js）
 *   - GAME_CONFIG.TIMING.COUNTDOWN_SECONDS（game-config.js）
 *
 * 匯出：window.Countdown + module.exports
 * ============================================
 */

// =========================================
// 常數
// =========================================

/**
 * 倒數各階段的顏色配置
 * @readonly
 */
var COUNTDOWN_COLORS = {
  3: { bg: "#e74c3c", text: "#fff" }, // 紅色
  2: { bg: "#f39c12", text: "#fff" }, // 黃色
  1: { bg: "#2ecc71", text: "#fff" }, // 綠色
  go: { bg: "#fff", text: "#2c3e50" }, // 白色（閃爍）
};

/**
 * 倒數各階段的音調頻率（Hz）
 * 當 AudioPlayer 可用時直接調用 playSfx，
 * fallback 到 Web Audio 合成音
 * @readonly
 */
var COUNTDOWN_TONES = {
  3: { freq: 330, type: "sine", duration: 0.15 }, // 低音
  2: { freq: 440, type: "sine", duration: 0.15 }, // 中音
  1: { freq: 660, type: "sine", duration: 0.15 }, // 高音
};

/** 「開始！」顯示時長（毫秒） */
var GO_DISPLAY_MS = 500;

/** 閃爍動畫的 class name */
var BLINK_CLASS = "countdown-blink";

// =========================================
// 私有狀態
// =========================================

/** @type {HTMLElement|null} 目前的倒數覆蓋層 */
var _overlay = null;

/** @type {boolean} 是否正在倒數中 */
var _isRunning = false;

/** @type {number|null} 目前的 timer ID */
var _timerId = null;

// =========================================
// 私有函式
// =========================================

/**
 * 建立倒數覆蓋層 DOM
 * @param {HTMLElement} container - 要插入的父容器
 * @returns {Object} { overlay, numberEl, hintEl }
 */
function _createOverlay(container) {
  var overlay = document.createElement("div");
  overlay.className = "countdown-overlay";
  overlay.setAttribute("role", "alert");
  overlay.setAttribute("aria-live", "assertive");

  var numberEl = document.createElement("div");
  numberEl.className = "countdown-number";
  overlay.appendChild(numberEl);

  var hintEl = document.createElement("div");
  hintEl.className = "countdown-hint " + BLINK_CLASS;
  hintEl.textContent = "🎹 請將手指放在空白鍵上";
  overlay.appendChild(hintEl);

  container.appendChild(overlay);

  return { overlay: overlay, numberEl: numberEl, hintEl: hintEl };
}

/**
 * 設定覆蓋層的顏色主題
 * @param {HTMLElement} overlay
 * @param {HTMLElement} numberEl
 * @param {number|string} step - 3, 2, 1, 或 'go'
 */
function _applyColor(overlay, numberEl, step) {
  var colorDef = COUNTDOWN_COLORS[step] || COUNTDOWN_COLORS.go;
  overlay.style.backgroundColor = colorDef.bg;
  numberEl.style.color = colorDef.text;
}

/** Fallback AudioContext（重用單一實例，避免記憶體洩漏） */
var _fallbackAudioCtx = null;
function _getFallbackCtx() {
  if (!_fallbackAudioCtx) {
    var AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) _fallbackAudioCtx = new AudioCtx();
  }
  if (_fallbackAudioCtx && _fallbackAudioCtx.state === "suspended") {
    _fallbackAudioCtx.resume();
  }
  return _fallbackAudioCtx;
}

/**
 * 播放倒數嗶聲（優先使用 AudioPlayer，fallback 合成音）
 * @param {number} step - 3, 2, 1
 */
function _playBeep(step) {
  var tone = COUNTDOWN_TONES[step];
  if (!tone) return;

  // 優先使用 AudioPlayer.playTone（差異化頻率：3=330Hz 低 / 2=440Hz 中 / 1=660Hz 高）
  if (typeof AudioPlayer !== "undefined" && AudioPlayer.playTone) {
    AudioPlayer.playTone(tone.freq, tone.type, tone.duration);
    return;
  }

  // Fallback：重用單一 AudioContext，避免每次建立新的
  try {
    var ctx = _getFallbackCtx();
    if (!ctx) return;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = tone.type;
    osc.frequency.value = tone.freq;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + tone.duration,
    );
    osc.start();
    osc.stop(ctx.currentTime + tone.duration);
    osc.onended = function () {
      try {
        osc.disconnect();
      } catch (e) {
        /* ignore */
      }
      try {
        gain.disconnect();
      } catch (e) {
        /* ignore */
      }
    };
  } catch (e) {
    // 靜默失敗
  }
}

/**
 * 播放「開始！」音效
 */
function _playGoSound() {
  if (typeof AudioPlayer !== "undefined" && AudioPlayer.playSfx) {
    AudioPlayer.playSfx("audio/sfx/countdown-go.mp3", {
      synthPreset: "go",
    });
    return;
  }

  // Fallback：重用單一 AudioContext
  try {
    var ctx = _getFallbackCtx();
    if (!ctx) return;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 660;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
    osc.onended = function () {
      try {
        osc.disconnect();
      } catch (e) {
        /* ignore */
      }
      try {
        gain.disconnect();
      } catch (e) {
        /* ignore */
      }
    };
  } catch (e) {
    // 靜默失敗
  }
}

/**
 * 鎖定所有互動按鈕
 * @param {HTMLElement} container
 * @returns {Array<HTMLElement>} 被鎖定的按鈕清單（供解鎖用）
 */
function _lockButtons(container) {
  var buttons = container.querySelectorAll(
    "button, [role='button'], a.btn, input[type='submit']",
  );
  var locked = [];
  for (var i = 0; i < buttons.length; i++) {
    if (!buttons[i].disabled) {
      buttons[i].disabled = true;
      buttons[i].setAttribute("data-countdown-locked", "true");
      locked.push(buttons[i]);
    }
  }
  return locked;
}

/**
 * 解鎖先前被鎖定的按鈕
 * @param {Array<HTMLElement>} lockedButtons
 */
function _unlockButtons(lockedButtons) {
  for (var i = 0; i < lockedButtons.length; i++) {
    lockedButtons[i].disabled = false;
    lockedButtons[i].removeAttribute("data-countdown-locked");
  }
}

/**
 * 移除覆蓋層
 */
function _removeOverlay() {
  if (_overlay && _overlay.parentNode) {
    _overlay.parentNode.removeChild(_overlay);
  }
  _overlay = null;
}

// =========================================
// 公開 API
// =========================================

var Countdown = {
  /**
   * 啟動倒數動畫
   *
   * @param {Object} options
   * @param {HTMLElement} options.container - 要顯示倒數的父容器（通常是遊戲區域）
   * @param {number}      [options.seconds=3] - 倒數秒數（2-5，預設 3）
   * @param {boolean}     [options.lockButtons=true] - 是否鎖定容器內按鈕
   * @param {boolean}     [options.showHint=true] - 是否顯示「請將手指放在空白鍵上」提示
   * @param {Function}    [options.onTick] - 每秒回呼 onTick(remainingSeconds)
   * @param {Function}    [options.onComplete] - 倒數結束後回呼
   * @returns {Promise<void>} 倒數完成（含「開始！」顯示後）resolve
   *
   * @example
   * Countdown.start({
   *   container: document.getElementById('game-area'),
   *   seconds: 3,
   *   onComplete: function() { startFirstQuestion(); }
   * });
   */
  start: function (options) {
    if (!options || !options.container) {
      return Promise.reject(new Error("Countdown: container is required"));
    }

    if (_isRunning) {
      Logger.warn("⏳ Countdown: 倒數進行中，忽略重複啟動");
      return Promise.resolve();
    }

    var container = options.container;
    var seconds = Math.min(5, Math.max(2, options.seconds || 3));
    var lockButtons =
      options.lockButtons !== undefined ? options.lockButtons : true;
    var showHint = options.showHint !== undefined ? options.showHint : true;
    var onTick = options.onTick || null;
    var onComplete = options.onComplete || null;

    _isRunning = true;

    // 建立覆蓋層
    var dom = _createOverlay(container);
    _overlay = dom.overlay;

    if (!showHint) {
      dom.hintEl.style.display = "none";
    }

    // 鎖定按鈕
    var lockedButtons = lockButtons ? _lockButtons(container) : [];

    return new Promise(function (resolve) {
      var remaining = seconds;

      function tick() {
        if (remaining > 0) {
          // 顯示數字
          dom.numberEl.textContent = remaining;
          dom.numberEl.className = "countdown-number countdown-pop";

          // 套用顏色（只有 3, 2, 1 有對應色）
          var colorKey = Math.min(remaining, 3);
          _applyColor(dom.overlay, dom.numberEl, colorKey);

          // 播放嗶聲
          _playBeep(colorKey);

          // 回呼
          if (onTick) {
            try {
              onTick(remaining);
            } catch (e) {
              Logger.error("Countdown onTick error:", e);
            }
          }

          // 重設動畫（需要 reflow 觸發）
          void dom.numberEl.offsetWidth;
          dom.numberEl.className = "countdown-number countdown-pop";

          remaining--;
          _timerId = setTimeout(tick, 1000);
        } else {
          // === 🚀 開始！ ===
          dom.numberEl.textContent = "🚀 開始！";
          dom.numberEl.className = "countdown-number countdown-go-flash";
          _applyColor(dom.overlay, dom.numberEl, "go");

          // 隱藏提示文字
          dom.hintEl.style.display = "none";

          // 播放「開始！」音效
          _playGoSound();

          // 「開始！」顯示 500ms 後結束
          _timerId = setTimeout(function () {
            _isRunning = false;
            _removeOverlay();
            _unlockButtons(lockedButtons);

            if (onComplete) {
              try {
                onComplete();
              } catch (e) {
                Logger.error("Countdown onComplete error:", e);
              }
            }

            resolve();
          }, GO_DISPLAY_MS);
        }
      }

      // 開始第一個 tick
      tick();
    });
  },

  /**
   * 強制取消正在進行的倒數
   */
  cancel: function () {
    if (_timerId) {
      clearTimeout(_timerId);
      _timerId = null;
    }
    _isRunning = false;
    _removeOverlay();
  },

  /**
   * 是否正在倒數中
   * @returns {boolean}
   */
  isRunning: function () {
    return _isRunning;
  },

  // -----------------------------------------
  // 常數暴露（供測試與外部參照）
  // -----------------------------------------

  /** @readonly */
  COUNTDOWN_COLORS: COUNTDOWN_COLORS,

  /** @readonly */
  GO_DISPLAY_MS: GO_DISPLAY_MS,
};

// =========================================
// 匯出
// =========================================

if (typeof window !== "undefined") {
  window.Countdown = Countdown;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = Countdown;
}
