/**
 * ============================================
 * 回饋疊加層 — FeedbackOverlay
 * ============================================
 * 對應需求文件：§2.5, §3.1b, Flow-9
 * 說明：在答題後於原畫面疊加 ✅/❌ 回饋框
 *
 * 視覺設計：
 *   ✅ 答對：綠框 + pulse-green 0.3s + 靜止 0.5s = 共 800ms
 *   ❌ 答錯：紅框 + shake-red 0.2s + 靜止 0.6s = 共 800ms
 *   刺激物自身動畫：pulse-correct / shake-error
 *   無 opacity 變化
 *
 * 音效：
 *   答對 → correct-ding.mp3 → L2 合成音 880Hz
 *   答錯 → incorrect-buzz.mp3 → L2 合成音 150Hz
 *
 * 判定結果（§3.1b）：
 *   Hit  — Go 正確按下（答對）
 *   CR   — No-Go 正確未按（答對）
 *   Miss — Go 漏按（答錯）
 *   FA   — No-Go 誤按（答錯）
 *
 * CSS：合併至 css/main.css（E3:b 決策）
 *
 * 依賴：
 *   - AudioPlayer（audio-player.js）
 *   - GAME_CONFIG.TIMING.FEEDBACK_DURATION_MS（game-config.js）
 *
 * 匯出：window.FeedbackOverlay + module.exports
 * ============================================
 */

// =========================================
// 常數
// =========================================

/** 回饋總時長（毫秒），對應 §3.1b */
var FEEDBACK_TOTAL_MS = 800;

/** 答對動畫時長（毫秒） */
var CORRECT_ANIM_MS = 300;

/** 答錯動畫時長（毫秒） */
var ERROR_ANIM_MS = 200;

/**
 * 回饋類型與 CSS class 對照
 * @readonly
 */
var FEEDBACK_TYPES = {
  correct: {
    containerClass: "correct-feedback",
    stimulusClass: "correct-flash",
    icon: "✅",
    label: "答對了！",
    ariaLabel: "答對",
    sfxPath: "audio/feedback/correct-ding.mp3",
    sfxConfigKey: "feedback.correct",
    sfxPreset: "correct",
  },
  incorrect: {
    containerClass: "incorrect-feedback",
    stimulusClass: "error-flash",
    icon: "❌",
    label: "再試試！",
    ariaLabel: "答錯",
    sfxPath: "audio/feedback/incorrect-buzz.mp3",
    sfxConfigKey: "feedback.incorrect",
    sfxPreset: "error",
  },
};

/**
 * 判定結果是否「答對」
 * Hit = Go 正確按下, CR = No-Go 正確未按
 * @readonly
 */
var CORRECT_RESULTS = { Hit: true, CR: true };

// =========================================
// 私有狀態
// =========================================

/** @type {number|null} 清除回饋的 timer ID */
var _clearTimerId = null;

/** @type {boolean} 是否正在顯示回饋中 */
var _isShowing = false;

// =========================================
// 私有函式
// =========================================

/**
 * 從判定結果字串推斷回饋類型
 * @param {string} result - 'Hit' | 'CR' | 'Miss' | 'FA'
 * @returns {'correct'|'incorrect'}
 */
function _getType(result) {
  return CORRECT_RESULTS[result] ? "correct" : "incorrect";
}

/**
 * 建立回饋圖示 DOM 元素
 * @param {Object} typeDef - FEEDBACK_TYPES 中的定義
 * @returns {HTMLElement}
 */
function _createBadge(typeDef) {
  var badge = document.createElement("div");
  badge.className = "feedback-badge";
  badge.setAttribute("aria-hidden", "true");

  var iconSpan = document.createElement("span");
  iconSpan.className = "feedback-icon";
  iconSpan.textContent = typeDef.icon;
  badge.appendChild(iconSpan);

  var labelSpan = document.createElement("span");
  labelSpan.className = "feedback-label";
  labelSpan.textContent = typeDef.label;
  badge.appendChild(labelSpan);

  return badge;
}

/**
 * 播放回饋音效
 * @param {Object} typeDef - FEEDBACK_TYPES 中的定義
 */
function _playSfx(typeDef) {
  if (typeof AudioPlayer !== "undefined" && AudioPlayer.playSfx) {
    var path =
      typeof getSoundFile === "function" && typeDef.sfxConfigKey
        ? getSoundFile(typeDef.sfxConfigKey)
        : null;
    AudioPlayer.playSfx(path || typeDef.sfxPath, {
      synthPreset: typeDef.sfxPreset,
    });
  }
}

// =========================================
// 公開 API
// =========================================

var FeedbackOverlay = {
  /**
   * 顯示回饋疊加層
   *
   * @param {Object}      options
   * @param {HTMLElement}  options.gameContainer - 遊戲區域容器（會被加上邊框 class）
   * @param {HTMLElement}  [options.stimulusEl]  - 刺激物元素（會被加上動畫 class）
   * @param {string}       options.result        - 判定結果 'Hit' | 'CR' | 'Miss' | 'FA'
   * @param {number}       [options.duration]    - 回饋總時長 ms（預設 800）
   * @param {boolean}      [options.playSound=true] - 是否播放音效
   * @param {Function}     [options.onComplete]  - 回饋結束後回呼
   * @returns {Promise<void>} 回饋完全結束後 resolve
   *
   * @example
   * FeedbackOverlay.show({
   *   gameContainer: document.getElementById('game-area'),
   *   stimulusEl: document.getElementById('stimulus'),
   *   result: 'Hit',
   *   onComplete: function() { showNextQuestion(); }
   * });
   */
  show: function (options) {
    if (!options || !options.gameContainer) {
      return Promise.reject(
        new Error("FeedbackOverlay: gameContainer is required"),
      );
    }

    // 如果上一個回饋還在顯示，先強制清除
    if (_isShowing) {
      this.clear();
    }

    var container = options.gameContainer;
    var stimulusEl = options.stimulusEl || null;
    var result = options.result || "Miss";
    var duration = options.duration || FEEDBACK_TOTAL_MS;
    var playSound = options.playSound !== undefined ? options.playSound : true;
    var onComplete = options.onComplete || null;

    var type = _getType(result);
    var typeDef = FEEDBACK_TYPES[type];

    _isShowing = true;

    // 1. 容器加上邊框 class
    container.classList.add(typeDef.containerClass);

    // 2. 刺激物加上動畫 class
    if (stimulusEl) {
      stimulusEl.classList.add(typeDef.stimulusClass);
    }

    // 3. 插入回饋圖示
    var badge = _createBadge(typeDef);
    container.appendChild(badge);

    // 4. 螢幕閱讀器播報
    var srAnnounce = document.createElement("div");
    srAnnounce.className = "sr-only";
    srAnnounce.setAttribute("role", "status");
    srAnnounce.textContent = typeDef.ariaLabel;
    container.appendChild(srAnnounce);

    // 5. 播放音效
    if (playSound) {
      _playSfx(typeDef);
    }

    // 6. 設定回饋結束計時
    return new Promise(function (resolve) {
      _clearTimerId = setTimeout(function () {
        // 移除所有回饋元素與 class
        container.classList.remove(typeDef.containerClass);
        if (stimulusEl) {
          stimulusEl.classList.remove(typeDef.stimulusClass);
        }
        if (badge.parentNode) {
          badge.parentNode.removeChild(badge);
        }
        if (srAnnounce.parentNode) {
          srAnnounce.parentNode.removeChild(srAnnounce);
        }

        _isShowing = false;
        _clearTimerId = null;

        if (onComplete) {
          try {
            onComplete();
          } catch (e) {
            Logger.error("FeedbackOverlay onComplete error:", e);
          }
        }

        resolve();
      }, duration);
    });
  },

  /**
   * 強制清除正在顯示的回饋
   */
  clear: function () {
    if (_clearTimerId) {
      clearTimeout(_clearTimerId);
      _clearTimerId = null;
    }

    // 移除所有回饋 class（保守清除）
    var containers = document.querySelectorAll(
      ".correct-feedback, .incorrect-feedback",
    );
    for (var i = 0; i < containers.length; i++) {
      containers[i].classList.remove("correct-feedback", "incorrect-feedback");
    }

    var stimuli = document.querySelectorAll(".correct-flash, .error-flash");
    for (var j = 0; j < stimuli.length; j++) {
      stimuli[j].classList.remove("correct-flash", "error-flash");
    }

    // 移除回饋圖示
    var badges = document.querySelectorAll(".feedback-badge");
    for (var k = 0; k < badges.length; k++) {
      if (badges[k].parentNode) {
        badges[k].parentNode.removeChild(badges[k]);
      }
    }

    _isShowing = false;
  },

  /**
   * 判斷結果是否「答對」
   *
   * @param {string} result - 'Hit' | 'CR' | 'Miss' | 'FA'
   * @returns {boolean}
   */
  isCorrect: function (result) {
    return !!CORRECT_RESULTS[result];
  },

  /**
   * 是否正在顯示回饋
   * @returns {boolean}
   */
  isShowing: function () {
    return _isShowing;
  },

  // -----------------------------------------
  // 常數暴露（供測試與外部參照）
  // -----------------------------------------

  /** @readonly */
  FEEDBACK_TYPES: FEEDBACK_TYPES,

  /** @readonly */
  FEEDBACK_TOTAL_MS: FEEDBACK_TOTAL_MS,
};

// =========================================
// 匯出
// =========================================

if (typeof window !== "undefined") {
  window.FeedbackOverlay = FeedbackOverlay;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = FeedbackOverlay;
}
