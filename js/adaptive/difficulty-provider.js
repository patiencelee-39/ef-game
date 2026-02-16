/**
 * ============================================
 * 難度參數提供者 — DifficultyProvider
 * ============================================
 * 對應需求文件：§3.1b（時間參數）、§3.4（WM）、IRT/DA 整合預備
 *
 * 設計目標：
 *   將「難度參數從哪裡來」的職責從遊戲流程中抽離。
 *   目前（v1.0）只是轉發 GAME_CONFIG 的靜態值，
 *   行為與原本完全一致。
 *
 *   未來若要接入 IRT/DA 自適應引擎，只需：
 *   1. 建立新的 engine（實作相同介面）
 *   2. 呼叫 DifficultyProvider.setEngine(myEngine)
 *   遊戲流程程式碼零修改。
 *
 * 架構（策略模式 Strategy Pattern）：
 *   DifficultyProvider（門面）
 *     └─ _engine（可替換的策略物件）
 *          ├─ StaticEngine（預設，讀 GAME_CONFIG）
 *          └─ 未來: AdaptiveEngine（IRT/DA）
 *
 * 低耦合原則：
 *   - 遊戲流程只認識 DifficultyProvider 的 API
 *   - DifficultyProvider 不認識遊戲流程
 *   - engine 不認識 DOM
 *
 * 匯出：window.DifficultyProvider
 * ============================================
 */

var DifficultyProvider = (function () {
  "use strict";

  // =========================================
  // 預設引擎：StaticEngine（轉發 GAME_CONFIG）
  // =========================================

  /**
   * 靜態引擎 — 從 GAME_CONFIG 讀取固定值
   * 行為與原本遊戲完全一致
   */
  var StaticEngine = {
    name: "StaticEngine",

    /**
     * 取得試驗參數
     *
     * @param {Object} context
     * @param {string} context.fieldId   - 'mouse' | 'fishing'
     * @param {string} context.ruleId    - 'rule1' | 'rule2' | 'mixed'
     * @param {number} context.trialIndex - 目前第幾題（0-based）
     * @param {number} context.totalTrials - 總題數
     * @param {Array}  [context.history]  - 前面的作答紀錄
     * @returns {Object} 試驗參數
     */
    getTrialParams: function (context) {
      var cfg = typeof GAME_CONFIG !== "undefined" ? GAME_CONFIG : {};
      var timing = cfg.TIMING || {};

      return {
        /** 刺激物顯示時間（ms） */
        stimulusDurationMs: timing.STIMULUS_DURATION_MS || 2000,

        /** ISI 最小值（ms） */
        isiMinMs: timing.ISI_MIN_MS || 800,

        /** ISI 最大值（ms） */
        isiMaxMs: timing.ISI_MAX_MS || 1200,

        /** 回饋顯示時間（ms） */
        feedbackDurationMs: timing.FEEDBACK_DURATION_MS || 800,

        /** 倒數秒數 */
        countdownSeconds: timing.COUNTDOWN_SECONDS || 3,
      };
    },

    /**
     * 取得題目生成參數（Go 比例、情境比例等）
     *
     * @param {Object} context
     * @param {string} context.fieldId
     * @param {string} context.ruleId
     * @param {boolean} [context.isPractice]
     * @returns {Object} 題目生成參數
     */
    getQuestionParams: function (context) {
      var cfg = typeof GAME_CONFIG !== "undefined" ? GAME_CONFIG : {};
      var field = (cfg.FIELDS || {})[context.fieldId] || {};
      var ratios = cfg.RATIOS || {};
      var questions = cfg.QUESTIONS || {};

      // 題數
      var count;
      if (context.isPractice) {
        count = questions.PRACTICE_COUNT || 6;
      } else {
        count = questions.DEFAULT_COUNT || 6;
      }
      if (context.ruleId === "mixed" && !context.isPractice) {
        count = count * (questions.MIXED_MULTIPLIER || 2);
      }

      // Go 比例
      var goRatio;
      if (context.isPractice) {
        goRatio = ratios.PRACTICE_GO || 0.5;
      } else {
        goRatio = field.goRatio || 0.75;
      }

      // 混合規則情境比例
      var contextARatio;
      if (context.isPractice) {
        contextARatio = ratios.PRACTICE_CONTEXT_A || 0.5;
      } else {
        contextARatio = ratios.MIXED_CONTEXT_A || 0.8;
      }

      return {
        /** 題數 */
        questionCount: count,

        /** Go 試驗比例（0~1） */
        goRatio: goRatio,

        /** 混合規則 — 情境 A 比例 */
        contextARatio: contextARatio,
      };
    },

    /**
     * 取得工作記憶測驗參數
     *
     * @param {Object} context
     * @param {string} context.fieldId
     * @param {string} context.ruleId
     * @param {number} context.ruleQuestionCount - 該輪規則的總題數
     * @param {Array}  [context.history]          - 歷史表現
     * @returns {Object} WM 參數
     */
    getWMParams: function (context) {
      var cfg = typeof GAME_CONFIG !== "undefined" ? GAME_CONFIG : {};
      var wm = cfg.WORKING_MEMORY || {};

      var minPos = wm.MIN_POSITIONS || 2;
      var maxPos = Math.min(
        context.ruleQuestionCount || 6,
        wm.MAX_POSITIONS || 6,
      );
      if (maxPos < minPos) maxPos = minPos;

      // 隨機位置數
      var positions =
        Math.floor(Math.random() * (maxPos - minPos + 1)) + minPos;

      // 隨機方向（n < 2 強制順向）
      var direction;
      if (positions < 2) {
        direction = "forward";
      } else {
        direction =
          Math.random() < (wm.REVERSE_PROBABILITY || 0.5)
            ? "reverse"
            : "forward";
      }

      return {
        /** 位置數量 */
        positions: positions,

        /** 'forward' | 'reverse' */
        direction: direction,

        /** 位置亮起時間（ms） */
        highlightDurationMs: wm.HIGHLIGHT_DURATION_MS || 800,

        /** 位置間隔時間（ms） */
        highlightIntervalMs: wm.HIGHLIGHT_INTERVAL_MS || 400,

        /** 作答超時（ms） */
        responseTimeoutMs: wm.RESPONSE_TIMEOUT_MS || 10000,
      };
    },

    /**
     * 取得通過門檻
     *
     * @param {Object} context
     * @param {string} context.fieldId
     * @param {string} context.ruleId
     * @param {string} context.type - 'rule' | 'wm'
     * @returns {number} 門檻值（0~1）
     */
    getPassThreshold: function (context) {
      var cfg = typeof GAME_CONFIG !== "undefined" ? GAME_CONFIG : {};

      if (context.type === "wm") {
        return (cfg.WORKING_MEMORY || {}).PASS_THRESHOLD || 0.83;
      }
      return (cfg.SCORING || {}).PASS_THRESHOLD || 0.83;
    },

    /**
     * 每題結束後的回呼（供未來引擎更新內部狀態用）
     * StaticEngine 不需要做任何事
     *
     * @param {Object} trialResult
     * @param {boolean} trialResult.isCorrect
     * @param {boolean} trialResult.isGo
     * @param {number|null} trialResult.rt - 反應時間（ms）
     * @param {string} trialResult.stimulus
     * @param {string|null} trialResult.context
     */
    onTrialComplete: function (_trialResult) {
      // 靜態引擎不需要反應
    },

    /**
     * 整局遊戲結束後的回呼（供未來引擎做能力估計用）
     * StaticEngine 不需要做任何事
     *
     * @param {Object} sessionResult
     * @param {string} sessionResult.fieldId
     * @param {string} sessionResult.ruleId
     * @param {Array}  sessionResult.trialResults
     * @param {Object|null} sessionResult.wmResult
     * @param {boolean} sessionResult.passed
     */
    onSessionComplete: function (_sessionResult) {
      // 靜態引擎不需要反應
    },

    /**
     * 重置引擎狀態（新的遊戲 session 開始時）
     */
    reset: function () {
      // 靜態引擎無狀態
    },
  };

  // =========================================
  // 門面（Facade）
  // =========================================

  /** @type {Object} 當前使用的引擎 */
  var _engine = StaticEngine;

  return {
    /**
     * 取得試驗參數
     * @param {Object} context
     * @returns {Object}
     */
    getTrialParams: function (context) {
      return _engine.getTrialParams(context || {});
    },

    /**
     * 取得題目生成參數
     * @param {Object} context
     * @returns {Object}
     */
    getQuestionParams: function (context) {
      return _engine.getQuestionParams(context || {});
    },

    /**
     * 取得 WM 測驗參數
     * @param {Object} context
     * @returns {Object}
     */
    getWMParams: function (context) {
      return _engine.getWMParams(context || {});
    },

    /**
     * 取得通過門檻
     * @param {Object} context
     * @returns {number}
     */
    getPassThreshold: function (context) {
      return _engine.getPassThreshold(context || {});
    },

    /**
     * 每題結束後通知引擎
     * @param {Object} trialResult
     */
    onTrialComplete: function (trialResult) {
      if (_engine.onTrialComplete) {
        _engine.onTrialComplete(trialResult);
      }
    },

    /**
     * 整局結束後通知引擎
     * @param {Object} sessionResult
     */
    onSessionComplete: function (sessionResult) {
      if (_engine.onSessionComplete) {
        _engine.onSessionComplete(sessionResult);
      }
    },

    /**
     * 重置引擎（新 session 開始時呼叫）
     */
    reset: function () {
      if (_engine.reset) {
        _engine.reset();
      }
    },

    // =========================================
    // 引擎管理
    // =========================================

    /**
     * 替換難度引擎（策略模式核心）
     *
     * 未來接入 IRT/DA 只需：
     *   DifficultyProvider.setEngine(myAdaptiveEngine);
     *
     * engine 必須實作以下方法：
     *   - getTrialParams(context) → { stimulusDurationMs, isiMinMs, isiMaxMs, ... }
     *   - getQuestionParams(context) → { questionCount, goRatio, contextARatio }
     *   - getWMParams(context) → { positions, direction, ... }
     *   - getPassThreshold(context) → number
     *   - onTrialComplete(trialResult) → void
     *   - onSessionComplete(sessionResult) → void
     *   - reset() → void
     *
     * @param {Object} engine - 新的引擎物件
     * @returns {boolean} 是否設定成功
     */
    setEngine: function (engine) {
      if (!engine || typeof engine.getTrialParams !== "function") {
        console.error(
          "❌ DifficultyProvider.setEngine: 引擎缺少 getTrialParams 方法",
        );
        return false;
      }
      var prev = _engine.name || "unknown";
      _engine = engine;
      console.log(
        "✅ DifficultyProvider 引擎切換：" +
          prev +
          " → " +
          (engine.name || "custom"),
      );
      return true;
    },

    /**
     * 恢復為預設靜態引擎
     */
    resetEngine: function () {
      _engine = StaticEngine;
      console.log("✅ DifficultyProvider 已恢復為 StaticEngine");
    },

    /**
     * 取得當前引擎名稱（除錯用）
     * @returns {string}
     */
    getEngineName: function () {
      return _engine.name || "unknown";
    },

    /**
     * 取得預設的 StaticEngine（供測試或參考用）
     * @returns {Object}
     */
    getStaticEngine: function () {
      return StaticEngine;
    },
  };
})();

// =========================================
// 匯出
// =========================================

if (typeof window !== "undefined") {
  window.DifficultyProvider = DifficultyProvider;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = DifficultyProvider;
}
