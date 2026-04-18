/**
 * ============================================
 * 工作記憶測驗 — WorkingMemory
 * ============================================
 * 對應需求文件：§3.4, Flow-12, Flow-13
 * 說明：WM 測驗邏輯模組（DOM fragment 方式插入 game.html）
 *
 * 遊戲機制：
 *   1. 系統隨機決定：順向（Forward）or 逆向（Reverse）
 *   2. 系統從該規則最後 N 題動態擷取刺激物序列
 *   3. 🔊 語音播報：「請照順序點選！」or「請倒著點選！」
 *   4. n 個位置按鈕顯示為 ❓，玩家依記憶作答（Toggle 循環）
 *   5. 按「確認」提交 → 比對答案 → 計分
 *   6. 答對：顯示鼓勵 / 答錯：顯示正確答案 vs 你的答案比對
 *
 * Toggle 機制：
 *   🐭 小老鼠：❓ → 🧀（起司）→ 🐈‍⬛（貓咪）→ ❓
 *   🐟 釣魚：  ❓ → 🐟（小魚）→ 🦈（鯊魚）→ ❓
 *
 * 計分（§3.4）：
 *   基礎：每答對一個位置 +1
 *   全對獎勵（Bonus）：
 *     逆向 n≥2：+(n-1)
 *     順向 2-6：+1 | 7-9：+2 | n≥10：+(n-7)
 *   速度獎勵：完成時間 < 個人最快 → +1
 *   通過門檻：≥83%
 *
 * DOM Fragment 模式（E1:b）：
 *   此模組提供 init() 將 working-memory.html 的模板
 *   載入並插入到 game.html 的指定容器中。
 *   不做頁面跳轉。
 *
 * 依賴：
 *   - GAME_CONFIG（game-config.js）
 *   - AudioPlayer（audio-player.js）
 *   - STIMULI_PACKS（stimuli-config.js）
 *   - Storage（js/utils/storage.js）
 *
 * 匯出：window.WorkingMemory + module.exports
 * ============================================
 */

// =========================================
// 常數
// =========================================

/**
 * WM 配置（從 GAME_CONFIG 讀取，此處為 fallback）
 * @readonly
 */
var WM_DEFAULTS = {
  MIN_POSITIONS: 2,
  MAX_POSITIONS: 6,
  HIGHLIGHT_DURATION_MS: 800,
  HIGHLIGHT_INTERVAL_MS: 400,
  RESPONSE_TIMEOUT_MS: 10000,
  PASS_THRESHOLD: 0.83,
  SCORE_PER_POSITION: 1,
  REVERSE_PROBABILITY: 0.5,
};

/**
 * Toggle 狀態定義（每個遊戲場的循環順序）
 * @readonly
 */
var TOGGLE_STATES = {
  mouse: [
    { key: "unknown", emoji: "❓", label: "未選擇" },
    { key: "cheese", emoji: "🧀", label: "起司" },
    { key: "cat", emoji: "🐈‍⬛", label: "貓咪" },
  ],
  fishing: [
    { key: "unknown", emoji: "❓", label: "未選擇" },
    { key: "fish", emoji: "🐟", label: "小魚" },
    { key: "shark", emoji: "🦈", label: "鯊魚" },
  ],
};

/**
 * 刺激物 key → 對應的 TOGGLE_STATES 索引
 * @readonly
 */
var STIMULUS_TO_TOGGLE_INDEX = {
  cheese: 1,
  cat: 2,
  fish: 1,
  shark: 2,
};

// =========================================
// 私有狀態
// =========================================

/** @type {Object|null} 目前的 WM 測驗狀態 */
var _state = null;

/** @type {HTMLElement|null} WM DOM 容器 */
var _container = null;

/** @type {boolean} 是否已載入 template */
var _templateLoaded = false;

// =========================================
// WM 配置讀取工具
// =========================================

/**
 * 讀取 WM 配置值（優先從 GAME_CONFIG）
 * @param {string} key
 * @returns {*}
 */
function _getConfig(key) {
  if (
    typeof GAME_CONFIG !== "undefined" &&
    GAME_CONFIG.WORKING_MEMORY &&
    GAME_CONFIG.WORKING_MEMORY[key] !== undefined
  ) {
    return GAME_CONFIG.WORKING_MEMORY[key];
  }
  return WM_DEFAULTS[key];
}

// =========================================
// 序列生成
// =========================================

/**
 * 從該規則 questions 最後 N 題擷取刺激物序列（方案 C）
 *
 * @param {Array<Object>} questions - 該規則的所有 question 物件
 * @param {number} n - 要擷取的位置數
 * @returns {Array<string>} stimulusKey 陣列，如 ['cheese', 'cat', 'cheese']
 */
function _extractSequence(questions, n) {
  var total = questions.length;
  var start = Math.max(0, total - n);
  var seq = [];
  for (var i = start; i < total && seq.length < n; i++) {
    seq.push(questions[i].stimulusKey || questions[i].stimulus || "unknown");
  }
  return seq;
}

/**
 * 根據 ruleId 決定 WM 方向
 *   rule1 → 順向（forward）
 *   rule2 → 逆向（reverse）
 *   mixed → 隨機（依 customProb 或 REVERSE_PROBABILITY）
 *
 * @param {string} [ruleId] - 'rule1' | 'rule2' | 'mixed'
 * @param {number} [customProb] - 自訂逆向機率（可選）
 * @returns {'forward'|'reverse'}
 */
function _resolveDirection(ruleId, customProb) {
  if (ruleId === "rule1") return "forward";
  if (ruleId === "rule2") return "reverse";
  // mixed 或未指定 → 隨機
  var prob = customProb !== undefined ? customProb : _getConfig("REVERSE_PROBABILITY");
  return Math.random() < prob ? "reverse" : "forward";
}

/**
 * 顯示活潑版指導語
 /**
 * 隨機決定位置數量 n
 * @param {number} questionCount - 該規則的題數
 * @returns {number}
 */
function _randomN(questionCount) {
  var min = _getConfig("MIN_POSITIONS");
  var max = Math.min(_getConfig("MAX_POSITIONS"), questionCount);
  if (max < min) max = min;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// =========================================
// 計分邏輯（§3.4, Flow-12）
// =========================================

/**
 * 比對玩家答案與正確答案
 *
 * @param {Array<string>} playerAnswer - 玩家的作答序列
 * @param {Array<string>} sequence     - 原始序列
 * @param {string}        direction    - 'forward' | 'reverse'
 * @returns {Object} { correctCount, total, details[] }
 */
function _compareAnswers(playerAnswer, sequence, direction) {
  var expected =
    direction === "reverse" ? sequence.slice().reverse() : sequence.slice();
  var total = expected.length;
  var correctCount = 0;
  var details = [];

  for (var i = 0; i < total; i++) {
    var isCorrect = i < playerAnswer.length && playerAnswer[i] === expected[i];
    if (isCorrect) correctCount++;
    details.push({
      position: i + 1,
      expected: expected[i],
      actual: playerAnswer[i] || "none",
      correct: isCorrect,
    });
  }

  return {
    correctCount: correctCount,
    total: total,
    details: details,
  };
}

/**
 * 計算全對獎勵 Bonus（§3.4 公式）
 *
 * @param {string} direction - 'forward' | 'reverse'
 * @param {number} n         - 位置數量
 * @param {boolean} allCorrect - 是否全對
 * @returns {number} 獎勵分數
 */
function _calcBonus(direction, n, allCorrect) {
  if (!allCorrect) return 0;

  if (direction === "reverse") {
    // 逆向 n=1 → +0, n≥2 → +(n-1)
    return n >= 2 ? n - 1 : 0;
  }

  // 順向
  if (n <= 1) return 0;
  if (n <= 6) return 1; // 2-6 → +1
  if (n <= 9) return 2; // 7-9 → +2
  return n - 7; // n≥10 → +(n-7)
}

/**
 * 計算速度獎勵
 *
 * @param {number} completionTimeMs  - 本次完成時間 ms
 * @param {number|null} personalBest - 個人最快紀錄 ms（null = 無紀錄）
 * @returns {number} 0 或 1
 */
function _calcSpeedBonus(completionTimeMs, personalBest) {
  if (personalBest === null || personalBest === undefined) return 0;
  return completionTimeMs < personalBest ? 1 : 0;
}

/**
 * 完整 WM 計分
 *
 * @param {Object} params
 * @param {Array<string>} params.playerAnswer  - 玩家答案序列
 * @param {Array<string>} params.sequence      - 原始序列
 * @param {string}        params.direction     - 'forward' | 'reverse'
 * @param {number}        params.completionMs  - 完成時間 ms
 * @param {number|null}   params.personalBest  - 個人最快 ms
 * @returns {Object} WM 計分結果
 */
function _calculateWmScore(params) {
  var comparison = _compareAnswers(
    params.playerAnswer,
    params.sequence,
    params.direction,
  );

  var n = params.sequence.length;
  var allCorrect = comparison.correctCount === n;

  var baseScore = comparison.correctCount * _getConfig("SCORE_PER_POSITION");
  var bonus = _calcBonus(params.direction, n, allCorrect);
  var speedBonus = _calcSpeedBonus(params.completionMs, params.personalBest);
  var totalScore = baseScore + bonus + speedBonus;

  var accuracy = n > 0 ? comparison.correctCount / n : 0;
  var passed = accuracy >= _getConfig("PASS_THRESHOLD");

  return {
    direction: params.direction,
    n: n,
    correctCount: comparison.correctCount,
    total: n,
    accuracy: accuracy,
    baseScore: baseScore,
    bonus: bonus,
    speedBonus: speedBonus,
    totalScore: totalScore,
    passed: passed,
    allCorrect: allCorrect,
    completionMs: params.completionMs,
    details: comparison.details,
  };
}

// =========================================
// UI 操作（DOM Fragment）
// =========================================

/**
 * 載入 WM HTML template 到指定容器
 *
 * @param {HTMLElement} container - 要插入 WM 介面的容器
 * @param {string} [templatePath='shared/working-memory.html']
 * @returns {Promise<void>}
 */
function _loadTemplate(container, templatePath) {
  var path = templatePath || "shared/working-memory.html";

  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", path, true);
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        // P15: DOMParser 安全解析，避免直接 innerHTML 注入
        var parser = new DOMParser();
        var doc = parser.parseFromString(xhr.responseText, "text/html");
        container.innerHTML = "";
        var body = doc.body;
        while (body && body.firstChild) {
          // adoptNode 會從原始文件「移除」節點（importNode 只是複製，不移除→無限迴圈）
          container.appendChild(document.adoptNode(body.firstChild));
        }
        _templateLoaded = true;
        resolve();
      } else {
        reject(new Error("WM template load failed: " + xhr.status));
      }
    };
    xhr.onerror = function () {
      reject(new Error("WM template load network error"));
    };
    xhr.send();
  });
}

/**
 * 顯示「準備記住亮起順序」提示（3 秒倒數）
 *
 * @param {HTMLElement} gridEl - 按鈕容器（用於定位提示）
 * @returns {Promise<void>} 倒數結束後 resolve
 */
function _showMemoryPrompt(gridEl) {
  return new Promise(function (resolve) {
    // 建立覆蓋提示元素
    var prompt = document.createElement("div");
    prompt.className = "wm-memory-prompt";
    prompt.innerHTML =
      '<div class="wm-memory-prompt-inner">' +
      '<div class="wm-memory-prompt-icon">🧠</div>' +
      '<div class="wm-memory-prompt-text">注意！請記住接下來亮起的順序</div>' +
      '<div class="wm-memory-prompt-countdown">3</div>' +
      "</div>";

    // 加入樣式（如果尚未加入）
    if (!document.getElementById("wm-memory-prompt-style")) {
      var style = document.createElement("style");
      style.id = "wm-memory-prompt-style";
      style.textContent =
        ".wm-memory-prompt{position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.75);z-index:10;border-radius:12px;animation:wm-prompt-in .3s ease-out}" +
        "@keyframes wm-prompt-in{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}" +
        ".wm-memory-prompt-inner{text-align:center;color:#fff}" +
        ".wm-memory-prompt-icon{font-size:3rem;margin-bottom:12px;animation:wm-icon-bounce 1s ease-in-out infinite}" +
        "@keyframes wm-icon-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}" +
        ".wm-memory-prompt-text{font-size:1.1rem;font-weight:700;margin-bottom:16px;color:#ffd700}" +
        ".wm-memory-prompt-countdown{font-size:2.5rem;font-weight:900;color:#fff;text-shadow:0 0 20px rgba(255,215,0,0.6)}";
      document.head.appendChild(style);
    }

    // 插入到 grid 的父容器（讓 position:absolute 相對於 WM 區域）
    var parent = gridEl.parentElement || gridEl;
    if (parent.style.position === "" || parent.style.position === "static") {
      parent.style.position = "relative";
    }
    parent.appendChild(prompt);

    var countdownEl = prompt.querySelector(".wm-memory-prompt-countdown");
    var count = 3;

    var timer = setInterval(function () {
      count--;
      if (count > 0) {
        countdownEl.textContent = String(count);
      } else {
        clearInterval(timer);
        if (prompt.parentElement) prompt.parentElement.removeChild(prompt);
        resolve();
      }
    }, 1000);
  });
}

/**
 * 亮起位置按鈕序列（依序動畫展示 — 只亮位置，不揭露內容）
 *
 * @param {Array<string>} sequence   - stimulus key 序列
 * @param {string}        fieldId    - 'mouse' | 'fishing'
 * @param {HTMLElement}   gridEl     - 按鈕容器
 * @returns {Promise<void>} 展示完畢後 resolve
 */
function _highlightSequence(sequence, fieldId, gridEl) {
  var highlightMs = _getConfig("HIGHLIGHT_DURATION_MS");
  var intervalMs = _getConfig("HIGHLIGHT_INTERVAL_MS");
  var buttons = gridEl.querySelectorAll(".wm-position-btn");

  return new Promise(function (resolve) {
    var i = 0;

    function next() {
      if (i >= sequence.length) {
        resolve();
        return;
      }

      var stimKey = sequence[i];

      // 只亮起位置標示（數字），不揭露刺激物 emoji
      if (buttons[i]) {
        buttons[i].classList.add("wm-highlight");
        buttons[i].textContent = String(i + 1);
        buttons[i].setAttribute("data-stim", stimKey);

        // 播放亮起音效
        if (typeof AudioPlayer !== "undefined" && AudioPlayer.playSfx) {
          AudioPlayer.playSfx("audio/sfx/wm-highlight.mp3", {
            synthPreset: "highlight",
          });
        }
      }

      // 維持亮起
      setTimeout(function () {
        // 不移除高亮 — 讓玩家記住位置順序
        setTimeout(next, intervalMs);
      }, highlightMs);

      i++;
    }

    next();
  });
}

/**
 * 練習用亮起序列：顯示實際刺激物 emoji（讓兒童看清楚要記什麼）
 *
 * @param {Array<string>} sequence - stimulus key 序列
 * @param {string}        fieldId  - 'mouse' | 'fishing'
 * @param {HTMLElement}   gridEl   - 按鈕容器
 * @returns {Promise<void>}
 */
function _highlightPractice(sequence, fieldId, gridEl) {
  var highlightMs = _getConfig("HIGHLIGHT_DURATION_MS");
  var intervalMs = _getConfig("HIGHLIGHT_INTERVAL_MS");
  var buttons = gridEl.querySelectorAll(".wm-position-btn");
  var toggleStates = TOGGLE_STATES[fieldId] || TOGGLE_STATES.mouse;

  // 建立 stimKey → emoji 對照
  var keyToEmoji = {};
  for (var t = 0; t < toggleStates.length; t++) {
    keyToEmoji[toggleStates[t].key] = toggleStates[t].emoji;
  }

  return new Promise(function (resolve) {
    var i = 0;

    function next() {
      if (i >= sequence.length) {
        resolve();
        return;
      }

      var stimKey = sequence[i];

      if (buttons[i]) {
        buttons[i].classList.add("wm-highlight");
        buttons[i].textContent = keyToEmoji[stimKey] || "❓";
        buttons[i].setAttribute("data-stim", stimKey);

        if (typeof AudioPlayer !== "undefined" && AudioPlayer.playSfx) {
          AudioPlayer.playSfx("audio/sfx/wm-highlight.mp3", {
            synthPreset: "highlight",
          });
        }
      }

      setTimeout(function () {
        setTimeout(next, intervalMs);
      }, highlightMs);

      i++;
    }

    next();
  });
}

/**
 * 重設所有位置按鈕為 ❓ 狀態（含移除舊事件）
 *
 * @param {HTMLElement} gridEl
 * @param {number} n
 */
function _resetButtons(gridEl, n) {
  var buttons = gridEl.querySelectorAll(".wm-position-btn");
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove("wm-highlight");
    if (i < n) {
      buttons[i].textContent = "❓";
      buttons[i].removeAttribute("data-stim");
      buttons[i].setAttribute("data-toggle-index", "0");
      buttons[i].style.display = "";
    } else {
      buttons[i].style.display = "none";
    }
  }
}

/**
 * 設定 Toggle 點擊事件
 *
 * @param {HTMLElement} gridEl
 * @param {string} fieldId - 'mouse' | 'fishing'
 * @param {number} n
 */
function _setupToggle(gridEl, fieldId, n) {
  var buttons = gridEl.querySelectorAll(".wm-position-btn");
  var toggleStates = TOGGLE_STATES[fieldId] || TOGGLE_STATES.mouse;

  for (var i = 0; i < n; i++) {
    (function (btn) {
      btn.addEventListener("click", function () {
        var currentIndex = parseInt(
          btn.getAttribute("data-toggle-index") || "0",
          10,
        );
        var nextIndex = (currentIndex + 1) % toggleStates.length;

        btn.setAttribute("data-toggle-index", String(nextIndex));
        btn.textContent = toggleStates[nextIndex].emoji;

        if (nextIndex === 0) {
          btn.removeAttribute("data-stim");
        } else {
          btn.setAttribute("data-stim", toggleStates[nextIndex].key);
        }

        // 播放點擊音
        if (typeof AudioPlayer !== "undefined" && AudioPlayer.playSfx) {
          AudioPlayer.playSfx("audio/sfx/click.mp3", {
            synthPreset: "click",
          });
        }
      });
    })(buttons[i]);
  }
}

/**
 * 收集玩家答案
 *
 * @param {HTMLElement} gridEl
 * @param {number} n
 * @returns {Array<string>} stimulusKey 陣列
 */
function _collectAnswers(gridEl, n) {
  var buttons = gridEl.querySelectorAll(".wm-position-btn");
  var answers = [];
  for (var i = 0; i < n; i++) {
    var stim = buttons[i] ? buttons[i].getAttribute("data-stim") : null;
    answers.push(stim || "unknown");
  }
  return answers;
}

// =========================================
// 公開 API
// =========================================

var WorkingMemory = {
  /**
   * 初始化 WM 測驗（載入 template 到容器）
   *
   * @param {Object} options
   * @param {HTMLElement} options.container - 要插入 WM 介面的父容器
   * @param {string}      [options.templatePath] - template 路徑
   * @returns {Promise<void>}
   */
  init: function (options) {
    if (!options || !options.container) {
      return Promise.reject(
        new Error("WorkingMemory.init: container is required"),
      );
    }

    _container = options.container;
    return _loadTemplate(_container, options.templatePath);
  },

  /**
   * 開始一輪 WM 測驗
   *
   * @param {Object} options
   * @param {string}        options.fieldId     - 'mouse' | 'fishing'
   * @param {Array<Object>} options.questions   - 該規則的所有 question 物件
   * @param {number|null}   [options.personalBest] - 個人最快紀錄 ms
   * @param {Function}      [options.onResult]  - 結果回呼 onResult(wmScore)
   * @returns {Promise<Object>} WM 計分結果
   *
   * @example
   * WorkingMemory.start({
   *   fieldId: 'mouse',
   *   questions: ruleQuestions,
   *   personalBest: 5200,
   *   onResult: function(score) { Logger.debug(score); }
   * });
   */
  start: function (options) {
    if (!options || !options.fieldId || !options.questions) {
      return Promise.reject(
        new Error("WorkingMemory.start: fieldId and questions are required"),
      );
    }

    var fieldId = options.fieldId;
    var ruleId = options.ruleId || "";
    var questions = options.questions;
    var personalBest = options.personalBest || null;
    var onResult = options.onResult || null;
    var reverseProbability = options.reverseProbability;

    // 1. 根據 ruleId 決定方向 + 隨機位置數
    var direction = _resolveDirection(ruleId, reverseProbability);
    var n = _randomN(questions.length);

    // 2. 擷取序列
    var sequence = _extractSequence(questions, n);

    // 3. 初始化狀態
    _state = {
      fieldId: fieldId,
      direction: direction,
      n: n,
      sequence: sequence,
      startTime: null,
      personalBest: personalBest,
    };

    // 4. 取得 UI 元素
    var gridEl = _container ? _container.querySelector(".wm-grid") : null;
    var directionEl = _container
      ? _container.querySelector(".wm-direction-label")
      : null;
    var confirmBtn = _container
      ? _container.querySelector(".wm-confirm-btn")
      : null;
    var resultEl = _container ? _container.querySelector(".wm-result") : null;

    if (!gridEl) {
      return Promise.reject(
        new Error("WorkingMemory: .wm-grid not found in container"),
      );
    }

    // 確保 WM 容器可見
    if (_container) {
      _container.style.display = "";
      _container.classList.remove("hidden");
    }

    // 隱藏結果區域
    if (resultEl) {
      resultEl.style.display = "none";
    }

    // 5. 顯示方向指示（含色彩提示）
    var n = sequence.length;
    var dirText =
      direction === "reverse" ? "🔄 請倒著點選！" : "👉 請照順序點選！";
    if (directionEl) {
      if (direction === "reverse") {
        directionEl.innerHTML =
          '🔄 按照<span style="color:#ff6b6b;font-weight:700">逆序</span>，點選剛才最後 ' +
          '<span style="color:#ffd43b;font-weight:700">' + n + '</span> 個物件的次序';
      } else {
        directionEl.innerHTML =
          '👉 按照<span style="color:#51cf66;font-weight:700">順序</span>，點選剛才最後 ' +
          '<span style="color:#ffd43b;font-weight:700">' + n + '</span> 個物件的次序';
      }
    }

    // 6. 語音播報方向
    var voicePath =
      direction === "reverse"
        ? "audio/voice/wm/wm-reverse.mp3"
        : "audio/voice/wm/wm-forward.mp3";

    var voicePromise = Promise.resolve();
    if (typeof AudioPlayer !== "undefined" && AudioPlayer.playVoice) {
      voicePromise = AudioPlayer.playVoice(voicePath, {
        text: direction === "reverse" ? "請倒著點選" : "請照順序點選",
        gender: "female",
      });
    }

    // 7. 重設按鈕
    _resetButtons(gridEl, n);

    return voicePromise.then(function () {
      // 語音播報結束 → 直接重設按鈕為 ❓ → 開放作答
      // （移除了原本的「準備記住順序」提示和「亮起序列」階段，
      //   因為玩家應從遊戲過程中記憶）
      _resetButtons(gridEl, n);
      _setupToggle(gridEl, fieldId, n);

      // 開始計時
      _state.startTime = Date.now();

      // --- 可見倒數計時器 ---
      var timeoutMs = WM_DEFAULTS.RESPONSE_TIMEOUT_MS || 10000;
      var countdownEl = document.createElement("div");
      countdownEl.className = "wm-countdown";
      countdownEl.style.cssText = "text-align:center;font-size:1.1rem;color:#ffd43b;margin-bottom:6px;font-weight:600;";
      countdownEl.textContent = "⏱️ " + Math.ceil(timeoutMs / 1000) + " 秒";
      if (confirmBtn && confirmBtn.parentNode) {
        confirmBtn.parentNode.insertBefore(countdownEl, confirmBtn);
      }
      var _cdInterval = setInterval(function () {
        var elapsed = Date.now() - _state.startTime;
        var remaining = Math.max(0, Math.ceil((timeoutMs - elapsed) / 1000));
        countdownEl.textContent = "⏱️ " + remaining + " 秒";
        if (remaining <= 3) countdownEl.style.color = "#ff6b6b";
      }, 250);

      // 8. 等待玩家按「確認」（或逾時）
      return new Promise(function (resolve) {
        var _resolved = false;
        var _timeoutTimer = null;

        function _finalize(isTimeout) {
          if (_resolved) return;
          _resolved = true;
          clearInterval(_cdInterval);
          if (_timeoutTimer) clearTimeout(_timeoutTimer);
          if (countdownEl.parentNode) countdownEl.parentNode.removeChild(countdownEl);
  
            if (isTimeout) {
              // ── 逾時處理：偵測玩家是否已有選擇 ──
              var playerAnswer = _collectAnswers(gridEl, n);
              var hasSelection = playerAnswer.some(function (a) {
                return a !== "unknown";
              });
  
              if (hasSelection) {
                // ✅ 玩家已有選擇 → 鎖定為最終答案並計分
                // 鎖定按鈕（禁止再更改）
                var allBtns = gridEl.querySelectorAll(".wm-position-btn");
                for (var li = 0; li < allBtns.length; li++) {
                  allBtns[li].style.pointerEvents = "none";
                  allBtns[li].style.opacity = "0.8";
                }
  
                var wmScore = _calculateWmScore({
                  playerAnswer: playerAnswer,
                  sequence: sequence,
                  direction: direction,
                  completionMs: timeoutMs,
                  personalBest: personalBest,
                });
                wmScore.timedOut = true;
  
                // 播放結果音效
                if (typeof AudioPlayer !== "undefined" && AudioPlayer.playSfx) {
                  var sfxPath = wmScore.passed
                    ? "audio/sfx/wm-correct.mp3"
                    : "audio/sfx/wm-incorrect.mp3";
                  AudioPlayer.playSfx(sfxPath, { synthPreset: wmScore.passed ? "correct" : "error" });
                }
  
                // 顯示結果（含答案比對）
                if (resultEl) {
                  resultEl.style.display = "";
  
                  var toggleStates = TOGGLE_STATES[fieldId] || TOGGLE_STATES.mouse;
                  var stimKeyToEmoji = {};
                  for (var si = 0; si < toggleStates.length; si++) {
                    stimKeyToEmoji[toggleStates[si].key] = toggleStates[si].emoji;
                  }
  
                  var timeoutHeader =
                    "<div class='wm-result-summary'>" +
                    "<div style='font-size:2em;margin-bottom:10px;color:#ffa726;'>⏰ 時間到！</div>" +
                    "<div style='margin-bottom:12px;'>已自動鎖定你目前的選擇作為答案</div>" +
                    "</div>";
  
                  if (wmScore.allCorrect) {
                    resultEl.innerHTML = timeoutHeader +
                      "<div class='wm-result-summary'>" +
                      "<div style='font-size:1.5em;margin-bottom:10px;'>✓ 全部答對！</div>" +
                      "<p>答對：" + wmScore.correctCount + " / " + wmScore.total + "</p>" +
                      "<p>WM 得分：" + wmScore.totalScore + "</p>" +
                      "</div>";
                  } else {
                    // 顯示答案比對
                    var compHtml = "<div class='wm-comparison'>";
                    compHtml += "<div class='wm-comparison-row'><div class='wm-comparison-label'>正確答案：</div><div class='wm-comparison-items'>";
                    for (var ci = 0; ci < wmScore.details.length; ci++) {
                      var d = wmScore.details[ci];
                      compHtml += "<div class='wm-comparison-item'><span style='color:#ffd700;'>" + d.position + ":</span> <span>" + (stimKeyToEmoji[d.expected] || "❓") + "</span></div>";
                    }
                    compHtml += "</div></div>";
                    compHtml += "<div class='wm-comparison-row'><div class='wm-comparison-label'>你的答案：</div><div class='wm-comparison-items'>";
                    for (var pi = 0; pi < wmScore.details.length; pi++) {
                      var dp = wmScore.details[pi];
                      var itemClass = dp.correct ? "wm-comparison-item correct" : "wm-comparison-item incorrect";
                      compHtml += "<div class='" + itemClass + "'><span style='color:#ffd700;'>" + dp.position + ":</span> <span>" + (stimKeyToEmoji[dp.actual] || "❓") + "</span></div>";
                    }
                    compHtml += "</div></div></div>";
  
                    resultEl.innerHTML = timeoutHeader + compHtml +
                      "<div class='wm-result-summary' style='margin-top:12px;'>" +
                      "<p>答對：" + wmScore.correctCount + " / " + wmScore.total + "</p>" +
                      "<p>WM 得分：" + wmScore.totalScore + "</p>" +
                      "</div>";
                  }
  
                  // 注入比對樣式
                  if (!document.getElementById("wm-comparison-style")) {
                    var cmpStyle = document.createElement("style");
                    cmpStyle.id = "wm-comparison-style";
                    cmpStyle.textContent =
                      ".wm-comparison{display:flex;flex-direction:column;gap:12px;margin-top:16px;width:100%;max-width:600px}" +
                      ".wm-comparison-row{display:flex;align-items:center;gap:10px;padding:10px;background:rgba(255,255,255,0.05);border-radius:8px}" +
                      ".wm-comparison-label{font-size:1em;min-width:80px;color:#ccc;white-space:nowrap}" +
                      ".wm-comparison-items{display:flex;gap:8px;flex-wrap:wrap}" +
                      ".wm-comparison-item{display:flex;align-items:center;gap:4px;padding:4px 10px;background:rgba(255,255,255,0.1);border-radius:5px;font-size:1.1em}" +
                      ".wm-comparison-item.correct{background:rgba(46,204,113,0.2);border:1px solid #2ecc71}" +
                      ".wm-comparison-item.incorrect{background:rgba(231,76,60,0.2);border:1px solid #e74c3c}" +
                      ".wm-continue-btn{display:block;margin:20px auto 0;padding:12px 32px;font-size:1.1rem;font-weight:700;border:none;border-radius:12px;cursor:pointer;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;box-shadow:0 4px 12px rgba(102,126,234,0.4);transition:all .2s}" +
                      ".wm-continue-btn:hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(102,126,234,0.5)}";
                    document.head.appendChild(cmpStyle);
                  }
  
                  // 加入「繼續」按鈕
                  var continueBtn = document.createElement("button");
                  continueBtn.className = "wm-continue-btn";
                  continueBtn.textContent = "➡️ 繼續";
                  resultEl.appendChild(continueBtn);
  
                  continueBtn.addEventListener("click", function () {
                    continueBtn.disabled = true;
                    if (onResult) {
                      try { onResult(wmScore); } catch (e) { Logger.error("WorkingMemory onResult error:", e); }
                    }
                    resolve(wmScore);
                  }, { once: true });
                } else {
                  // 無結果區域 — 直接回呼
                  if (onResult) {
                    try { onResult(wmScore); } catch (e) { Logger.error("WorkingMemory onResult error:", e); }
                  }
                  resolve(wmScore);
                }
  
              } else {
                // ❌ 玩家完全未選擇 → 顯示無資料 + 繼續按鈕
                var emptyResult = {
                  correctCount: 0,
                  totalPositions: sequence.length,
                  direction: direction,
                  completionTimeMs: timeoutMs,
                  passed: false,
                  timedOut: true,
                };
  
                if (resultEl) {
                  resultEl.style.display = "";
                  resultEl.innerHTML =
                    "<div class='wm-result-summary'>" +
                    "<div style='font-size:2em;margin-bottom:10px;color:#ff6b6b;'>⏰ 時間到！</div>" +
                    "<div style='margin-bottom:12px;'>工作記憶逾時 " + Math.ceil(timeoutMs / 1000) + " 秒未作答，無資料</div>" +
                    "</div>";
  
                  // 注入按鈕樣式
                  if (!document.getElementById("wm-comparison-style")) {
                    var btnStyle = document.createElement("style");
                    btnStyle.id = "wm-comparison-style";
                    btnStyle.textContent =
                      ".wm-continue-btn{display:block;margin:20px auto 0;padding:12px 32px;font-size:1.1rem;font-weight:700;border:none;border-radius:12px;cursor:pointer;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;box-shadow:0 4px 12px rgba(102,126,234,0.4);transition:all .2s}" +
                      ".wm-continue-btn:hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(102,126,234,0.5)}";
                    document.head.appendChild(btnStyle);
                  }
  
                  var continueBtn = document.createElement("button");
                  continueBtn.className = "wm-continue-btn";
                  continueBtn.textContent = "➡️ 繼續";
                  resultEl.appendChild(continueBtn);
  
                  continueBtn.addEventListener("click", function () {
                    continueBtn.disabled = true;
                    if (onResult) {
                      try { onResult(emptyResult); } catch (e) { Logger.error("WorkingMemory onResult error:", e); }
                    }
                    resolve(emptyResult);
                  }, { once: true });
                } else {
                  // 無結果區域 — 直接回呼
                  if (onResult) {
                    try { onResult(emptyResult); } catch (e) { Logger.error("WorkingMemory onResult error:", e); }
                  }
                  resolve(emptyResult);
                }
              }
              return;
            }
          }
  
          // 設定逾時
          _timeoutTimer = setTimeout(function () {
            _finalize(true);
          }, timeoutMs);
  
          if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.style.display = "";
  
            // 移除舊的 listener（防重複綁定）
            var newBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
  
            newBtn.addEventListener(
              "click",
              function () {
                if (_resolved) return; // 已逾時，忽略點擊
                _finalize(false); // 停止倒數
                newBtn.disabled = true;
                var completionMs = Date.now() - _state.startTime;
  
                // 11. 收集答案
                var playerAnswer = _collectAnswers(gridEl, n);
  
                // 12. 計分
                var wmScore = _calculateWmScore({
                  playerAnswer: playerAnswer,
                  sequence: sequence,
                  direction: direction,
                  completionMs: completionMs,
                  personalBest: personalBest,
                });
  
                // 13. 播放結果音效
                if (typeof AudioPlayer !== "undefined" && AudioPlayer.playSfx) {
                  var sfxPath = wmScore.passed
                    ? "audio/sfx/wm-correct.mp3"
                    : "audio/sfx/wm-incorrect.mp3";
                  var sfxPreset = wmScore.passed ? "correct" : "error";
                  AudioPlayer.playSfx(sfxPath, {
                    synthPreset: sfxPreset,
                  });
                }
  
                // 14. 顯示結果（含答錯比對回饋）
                if (resultEl) {
                  resultEl.style.display = "";
  
                  // 取得刺激物 emoji 映射
                  var toggleStates =
                    TOGGLE_STATES[fieldId] || TOGGLE_STATES.mouse;
                  var stimKeyToEmoji = {};
                  for (var si = 0; si < toggleStates.length; si++) {
                    stimKeyToEmoji[toggleStates[si].key] = toggleStates[si].emoji;
                  }
  
                  if (wmScore.allCorrect) {
                    // ✅ 全對
                    resultEl.innerHTML =
                      "<div class='wm-result-summary'>" +
                      "<div style='font-size:2em;margin-bottom:10px;'>✓ 答對了！</div>" +
                      "<div style='margin-bottom:12px;'>你的記憶力真棒！</div>" +
                      "<p>方向：" +
                      (direction === "reverse" ? "逆向 🔄" : "順向 👉") +
                      "</p>" +
                      "<p>答對：" +
                      wmScore.correctCount +
                      " / " +
                      wmScore.total +
                      "</p>" +
                      "<p>完成時間：" +
                      (completionMs / 1000).toFixed(1) +
                      " 秒</p>" +
                      "<p>WM 得分：" +
                      wmScore.totalScore +
                      "（基礎 " +
                      wmScore.baseScore +
                      " + 全對 " +
                      wmScore.bonus +
                      " + 速度 " +
                      wmScore.speedBonus +
                      "）</p>" +
                      "<p>✅ 通過！</p>" +
                      "</div>";
                  } else {
                    // ❌ 答錯 — 顯示比對
                    var compHtml = "<div class='wm-comparison'>";
  
                    // 正確答案列
                    compHtml += "<div class='wm-comparison-row'>";
                    compHtml +=
                      "<div class='wm-comparison-label'>正確答案：</div>";
                    compHtml += "<div class='wm-comparison-items'>";
                    for (var ci = 0; ci < wmScore.details.length; ci++) {
                      var d = wmScore.details[ci];
                      var expectedEmoji = stimKeyToEmoji[d.expected] || "❓";
                      compHtml +=
                        "<div class='wm-comparison-item'>" +
                        "<span style='color:#ffd700;'>" +
                        d.position +
                        ":</span> " +
                        "<span>" +
                        expectedEmoji +
                        "</span></div>";
                    }
                    compHtml += "</div></div>";
  
                    // 玩家答案列
                    compHtml += "<div class='wm-comparison-row'>";
                    compHtml +=
                      "<div class='wm-comparison-label'>你的答案：</div>";
                    compHtml += "<div class='wm-comparison-items'>";
                    for (var pi = 0; pi < wmScore.details.length; pi++) {
                      var dp = wmScore.details[pi];
                      var actualEmoji = stimKeyToEmoji[dp.actual] || "❓";
                      var itemClass = dp.correct
                        ? "wm-comparison-item correct"
                        : "wm-comparison-item incorrect";
                      compHtml +=
                        "<div class='" +
                        itemClass +
                        "'>" +
                        "<span style='color:#ffd700;'>" +
                        dp.position +
                        ":</span> " +
                        "<span>" +
                        actualEmoji +
                        "</span></div>";
                    }
                    compHtml += "</div></div>";
                    compHtml += "</div>";
  
                    resultEl.innerHTML =
                      "<div class='wm-result-summary'>" +
                      "<div style='font-size:2em;margin-bottom:10px;'>✗ 答錯了</div>" +
                      "<div style='margin-bottom:12px;'>請對照下方的答案：</div>" +
                      "</div>" +
                      compHtml +
                      "<div class='wm-result-summary' style='margin-top:12px;'>" +
                      "<p>方向：" +
                      (direction === "reverse" ? "逆向 🔄" : "順向 👉") +
                      "</p>" +
                      "<p>答對：" +
                      wmScore.correctCount +
                      " / " +
                      wmScore.total +
                      "</p>" +
                      "<p>完成時間：" +
                      (completionMs / 1000).toFixed(1) +
                      " 秒</p>" +
                      "<p>WM 得分：" +
                      wmScore.totalScore +
                      "（基礎 " +
                      wmScore.baseScore +
                      " + 全對 " +
                      wmScore.bonus +
                      " + 速度 " +
                      wmScore.speedBonus +
                      "）</p>" +
                      "<p>❌ 未通過</p>" +
                      "</div>";
                  }
  
                  // 注入比對樣式（如尚未注入）
                  if (!document.getElementById("wm-comparison-style")) {
                    var cmpStyle = document.createElement("style");
                    cmpStyle.id = "wm-comparison-style";
                    cmpStyle.textContent =
                      ".wm-comparison{display:flex;flex-direction:column;gap:12px;margin-top:16px;width:100%;max-width:600px}" +
                      ".wm-comparison-row{display:flex;align-items:center;gap:10px;padding:10px;background:rgba(255,255,255,0.05);border-radius:8px}" +
                      ".wm-comparison-label{font-size:1em;min-width:80px;color:#ccc;white-space:nowrap}" +
                      ".wm-comparison-items{display:flex;gap:8px;flex-wrap:wrap}" +
                      ".wm-comparison-item{display:flex;align-items:center;gap:4px;padding:4px 10px;background:rgba(255,255,255,0.1);border-radius:5px;font-size:1.1em}" +
                      ".wm-comparison-item.correct{background:rgba(46,204,113,0.2);border:1px solid #2ecc71}" +
                      ".wm-comparison-item.incorrect{background:rgba(231,76,60,0.2);border:1px solid #e74c3c}" +
                      ".wm-continue-btn{display:block;margin:20px auto 0;padding:12px 32px;font-size:1.1rem;font-weight:700;border:none;border-radius:12px;cursor:pointer;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;box-shadow:0 4px 12px rgba(102,126,234,0.4);transition:all .2s}" +
                      ".wm-continue-btn:hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(102,126,234,0.5)}";
                    document.head.appendChild(cmpStyle);
                  }
  
                  // 在結果區域加入「繼續」按鈕，等待使用者手動點擊
                  var continueBtn = document.createElement("button");
                  continueBtn.className = "wm-continue-btn";
                  continueBtn.textContent = "➡️ 繼續";
                  resultEl.appendChild(continueBtn);
  
                  continueBtn.addEventListener(
                    "click",
                    function () {
                      continueBtn.disabled = true;
  
                      // 回呼
                      if (onResult) {
                        try {
                          onResult(wmScore);
                        } catch (e) {
                          Logger.error("WorkingMemory onResult error:", e);
                        }
                      }
  
                      resolve(wmScore);
                    },
                    { once: true },
                  );
                } else {
                  // 無結果區域 — 直接回呼
                  if (onResult) {
                    try {
                      onResult(wmScore);
                    } catch (e) {
                      Logger.error("WorkingMemory onResult error:", e);
                    }
                  }
                  resolve(wmScore);
                }
              },
              { once: true },
            );
          } else {
            // 無確認按鈕 — 直接 resolve（不應發生）
            resolve(null);
          }
        });
      });
  },

  /**
   * 白話版說明：
   *   WM 練習模式 — 固定只記 2 個位置，讓兒童先練習一次。
   *   會亮起刺激物讓兒童看，然後開放作答。
   *   答對 → 成功過關。答錯 → 顯示正確答案，最多重試 3 次後強制通過。
   *
   * 可修改項目：
   *   - PRACTICE_N：練習的位置數（預設 2）
   *   - MAX_PRACTICE_ATTEMPTS：最多重試次數（預設 3）
   *
   * 修改注意：
   *   - 必須先呼叫 init() 載入模板才能使用
   *   - 使用 onComplete 回呼通知完成，不使用 Promise
   *
   * @param {Object} options
   * @param {string}   options.fieldId    - 'mouse' | 'fishing'
   * @param {string}   [options.ruleId]   - 'rule1' | 'rule2' | 'mixed'
   * @param {Function} options.onComplete - 練習結束後回呼
   */
  startPractice: function (options) {
    if (!options || !options.fieldId) {
      Logger.error("WorkingMemory.startPractice: fieldId is required");
      if (options && options.onComplete) options.onComplete();
      return;
    }

    var fieldId = options.fieldId;
    var ruleId = options.ruleId || "";
    var onComplete = options.onComplete || function () {};
    var PRACTICE_N = 2;
    var MAX_ATTEMPTS = 3;
    var attemptCount = 0;

    // 根據 ruleId 決定方向
    var direction = _resolveDirection(ruleId);

    // 從 Go/No-Go 練習題擷取序列；若無題目則 fallback 隨機
    var sequence;
    if (options.questions && options.questions.length >= PRACTICE_N) {
      sequence = _extractSequence(options.questions, PRACTICE_N);
    } else {
      var stimKeys = fieldId === "fishing" ? ["fish", "shark"] : ["cheese", "cat"];
      var s = [];
      for (var i = 0; i < PRACTICE_N; i++) {
        s.push(stimKeys[Math.floor(Math.random() * stimKeys.length)]);
      }
      sequence = s;
    }

    // 取得 UI 元素
    var gridEl = _container ? _container.querySelector(".wm-grid") : null;
    var directionEl = _container
      ? _container.querySelector(".wm-direction-label")
      : null;
    var confirmBtn = _container
      ? _container.querySelector(".wm-confirm-btn")
      : null;
    var resultEl = _container ? _container.querySelector(".wm-result") : null;

    if (!gridEl) {
      Logger.error("WorkingMemory.startPractice: .wm-grid not found");
      onComplete();
      return;
    }

    // 顯示容器
    if (_container) {
      _container.style.display = "";
      _container.classList.remove("hidden");
    }

    // 方向標籤（加「練習」前綴）
    if (directionEl) {
      if (direction === "reverse") {
        directionEl.innerHTML =
          '🔄 練習：按照<span style="color:#ff6b6b;font-weight:700">逆序</span>點選！';
      } else {
        directionEl.innerHTML =
          '👉 練習：按照<span style="color:#51cf66;font-weight:700">順序</span>點選！';
      }
    }

    // 注入比對樣式（如尚未注入）
    if (!document.getElementById("wm-comparison-style")) {
      var cmpStyle = document.createElement("style");
      cmpStyle.id = "wm-comparison-style";
      cmpStyle.textContent =
        ".wm-comparison{display:flex;flex-direction:column;gap:12px;margin-top:16px;width:100%;max-width:600px}" +
        ".wm-comparison-row{display:flex;align-items:center;gap:10px;padding:10px;background:rgba(255,255,255,0.05);border-radius:8px}" +
        ".wm-comparison-label{font-size:1em;min-width:80px;color:#ccc;white-space:nowrap}" +
        ".wm-comparison-items{display:flex;gap:8px;flex-wrap:wrap}" +
        ".wm-comparison-item{display:flex;align-items:center;gap:4px;padding:4px 10px;background:rgba(255,255,255,0.1);border-radius:5px;font-size:1.1em}" +
        ".wm-comparison-item.correct{background:rgba(46,204,113,0.2);border:1px solid #2ecc71}" +
        ".wm-comparison-item.incorrect{background:rgba(231,76,60,0.2);border:1px solid #e74c3c}" +
        ".wm-continue-btn{display:block;margin:20px auto 0;padding:12px 32px;font-size:1.1rem;font-weight:700;border:none;border-radius:12px;cursor:pointer;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;box-shadow:0 4px 12px rgba(102,126,234,0.4);transition:all .2s}" +
        ".wm-continue-btn:hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(102,126,234,0.5)}";
      document.head.appendChild(cmpStyle);
    }

    // 建立答案比對 HTML
    function buildComparisonHtml(details) {
      var toggleStates = TOGGLE_STATES[fieldId] || TOGGLE_STATES.mouse;
      var stimKeyToEmoji = {};
      for (var si = 0; si < toggleStates.length; si++) {
        stimKeyToEmoji[toggleStates[si].key] = toggleStates[si].emoji;
      }

      var html = "<div class='wm-comparison'>";
      html +=
        "<div class='wm-comparison-row'><div class='wm-comparison-label'>正確答案：</div><div class='wm-comparison-items'>";
      for (var ci = 0; ci < details.length; ci++) {
        html +=
          "<div class='wm-comparison-item'><span style='color:#ffd700;'>" +
          details[ci].position +
          ":</span> <span>" +
          (stimKeyToEmoji[details[ci].expected] || "❓") +
          "</span></div>";
      }
      html += "</div></div>";
      html +=
        "<div class='wm-comparison-row'><div class='wm-comparison-label'>你的答案：</div><div class='wm-comparison-items'>";
      for (var pi = 0; pi < details.length; pi++) {
        var cls = details[pi].correct
          ? "wm-comparison-item correct"
          : "wm-comparison-item incorrect";
        html +=
          "<div class='" + cls + "'><span style='color:#ffd700;'>" +
          details[pi].position +
          ":</span> <span>" +
          (stimKeyToEmoji[details[pi].actual] || "❓") +
          "</span></div>";
      }
      html += "</div></div></div>";
      return html;
    }

    /** 執行一輪練習 */
    function runAttempt() {
      attemptCount++;

      // 清除舊按鈕事件：clone 所有 position-btn
      var oldBtns = gridEl.querySelectorAll(".wm-position-btn");
      for (var bi = 0; bi < oldBtns.length; bi++) {
        var fresh = oldBtns[bi].cloneNode(true);
        oldBtns[bi].parentNode.replaceChild(fresh, oldBtns[bi]);
      }

      _resetButtons(gridEl, PRACTICE_N);
      if (resultEl) resultEl.style.display = "none";
      if (confirmBtn) {
        confirmBtn.style.display = "none";
        confirmBtn.disabled = true;
      }

      // 語音播報方向
      var voicePath =
        direction === "reverse"
          ? "audio/voice/wm/wm-reverse.mp3"
          : "audio/voice/wm/wm-forward.mp3";

      var voicePromise = Promise.resolve();
      if (typeof AudioPlayer !== "undefined" && AudioPlayer.playVoice) {
        voicePromise = AudioPlayer.playVoice(voicePath, {
          text: direction === "reverse" ? "請倒著點選" : "請照順序點選",
          gender: "female",
        });
      }

      voicePromise.then(function () {
          _resetButtons(gridEl, PRACTICE_N);
          _setupToggle(gridEl, fieldId, PRACTICE_N);

          // 顯示確認按鈕（clone 移除舊事件）
          var curConfirm = _container
            ? _container.querySelector(".wm-confirm-btn")
            : null;
          if (curConfirm) {
            var newConfirm = curConfirm.cloneNode(true);
            curConfirm.parentNode.replaceChild(newConfirm, curConfirm);
            confirmBtn = newConfirm;

            newConfirm.style.display = "";
            newConfirm.disabled = false;

            newConfirm.addEventListener(
              "click",
              function () {
                newConfirm.disabled = true;

                var playerAnswer = _collectAnswers(gridEl, PRACTICE_N);
                var comparison = _compareAnswers(
                  playerAnswer,
                  sequence,
                  direction,
                );
                var allCorrect = comparison.correctCount === PRACTICE_N;

                // 音效回饋
                if (typeof AudioPlayer !== "undefined" && AudioPlayer.playSfx) {
                  AudioPlayer.playSfx(
                    allCorrect
                      ? "audio/sfx/wm-correct.mp3"
                      : "audio/sfx/wm-incorrect.mp3",
                    { synthPreset: allCorrect ? "correct" : "error" },
                  );
                }

                if (allCorrect) {
                  // ✅ 答對
                  if (resultEl) {
                    resultEl.style.display = "";
                    resultEl.innerHTML =
                      "<div class='wm-result-summary'>" +
                      "<div style='font-size:2em;margin-bottom:10px;'>🎉 答對了！</div>" +
                      "<div>你的記憶力真棒！準備開始正式遊戲囉～</div>" +
                      "</div>";

                    var doneBtn = document.createElement("button");
                    doneBtn.className = "wm-continue-btn";
                    doneBtn.textContent = "➡️ 開始正式遊戲";
                    resultEl.appendChild(doneBtn);
                    doneBtn.addEventListener(
                      "click",
                      function () {
                        doneBtn.disabled = true;
                        onComplete();
                      },
                      { once: true },
                    );
                  } else {
                    onComplete();
                  }
                } else {
                  // ❌ 答錯
                  var compHtml = buildComparisonHtml(comparison.details);

                  if (resultEl) {
                    resultEl.style.display = "";

                    if (attemptCount >= MAX_ATTEMPTS) {
                      // 已達重試上限 → 強制通過
                      resultEl.innerHTML =
                        "<div class='wm-result-summary'>" +
                        "<div style='font-size:2em;margin-bottom:10px;'>沒關係！</div>" +
                        "<div style='margin-bottom:12px;'>我們直接開始正式遊戲吧～</div>" +
                        "</div>" +
                        compHtml;

                      var forceBtn = document.createElement("button");
                      forceBtn.className = "wm-continue-btn";
                      forceBtn.textContent = "➡️ 開始正式遊戲";
                      resultEl.appendChild(forceBtn);
                      forceBtn.addEventListener(
                        "click",
                        function () {
                          forceBtn.disabled = true;
                          onComplete();
                        },
                        { once: true },
                      );
                    } else {
                      // 還可以重試
                      resultEl.innerHTML =
                        "<div class='wm-result-summary'>" +
                        "<div style='font-size:2em;margin-bottom:10px;'>✗ 再試試看！</div>" +
                        "<div style='margin-bottom:12px;'>看看正確答案，再來一次吧！</div>" +
                        "</div>" +
                        compHtml;

                      var retryBtn = document.createElement("button");
                      retryBtn.className = "wm-continue-btn";
                      retryBtn.textContent =
                        "🔄 再試一次 (" +
                        attemptCount +
                        "/" +
                        MAX_ATTEMPTS +
                        ")";
                      resultEl.appendChild(retryBtn);
                      retryBtn.addEventListener(
                        "click",
                        function () {
                          retryBtn.disabled = true;
                          runAttempt();
                        },
                        { once: true },
                      );
                    }
                  } else {
                    if (attemptCount >= MAX_ATTEMPTS) {
                      onComplete();
                    } else {
                      runAttempt();
                    }
                  }
                }
              },
              { once: true },
            );
          }
        });
    }

    // 開始第一輪練習
    runAttempt();
  },

  /**
   * 隱藏 WM 測驗介面
   */
  hide: function () {
    if (_container) {
      _container.style.display = "none";
    }
    _state = null;
  },

  /**
   * 銷毀 WM 測驗（移除 DOM）
   */
  destroy: function () {
    if (_container) {
      _container.innerHTML = "";
      _container.style.display = "none";
    }
    _container = null;
    _state = null;
    _templateLoaded = false;
  },

  /**
   * 取得目前的 WM 狀態（測試用）
   * @returns {Object|null}
   */
  getState: function () {
    return _state;
  },

  // -----------------------------------------
  // 純計分函式（供外部呼叫，不依賴 DOM）
  // -----------------------------------------

  /**
   * 純計分 — 不操作 DOM，可用於重算或測試
   *
   * @param {Object} params - 同 _calculateWmScore 參數
   * @returns {Object} WM 計分結果
   */
  calculateScore: function (params) {
    return _calculateWmScore(params);
  },

  /**
   * 純比對答案
   *
   * @param {Array<string>} playerAnswer
   * @param {Array<string>} sequence
   * @param {string}        direction
   * @returns {Object}
   */
  compareAnswers: function (playerAnswer, sequence, direction) {
    return _compareAnswers(playerAnswer, sequence, direction);
  },

  /**
   * 計算全對獎勵
   *
   * @param {string}  direction
   * @param {number}  n
   * @param {boolean} allCorrect
   * @returns {number}
   */
  calcBonus: function (direction, n, allCorrect) {
    return _calcBonus(direction, n, allCorrect);
  },

  // -----------------------------------------
  // 常數暴露
  // -----------------------------------------

  /** @readonly */
  TOGGLE_STATES: TOGGLE_STATES,

  /** @readonly */
  STIMULUS_TO_TOGGLE_INDEX: STIMULUS_TO_TOGGLE_INDEX,

  /** @readonly */
  WM_DEFAULTS: WM_DEFAULTS,
};

// =========================================
// 匯出
// =========================================

if (typeof window !== "undefined") {
  window.WorkingMemory = WorkingMemory;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = WorkingMemory;
}
