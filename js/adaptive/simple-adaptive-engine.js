/**
 * ============================================
 * 簡化版自適應引擎 — SimpleAdaptiveEngine
 * ============================================
 * 對應：IRT/DA 整合 Phase 5B（簡化版）
 *
 * 規則：
 *   - 連對 2 題 → 難度 +1（上限 5）
 *   - 連錯 2 題 → 難度 −1（下限 1）
 *   - 5 級難度（Level 1 = 最簡單, Level 5 = 最困難）
 *   - 預設 Level 3 = 與 GAME_CONFIG 現有值一致
 *
 * 調整的參數（時間面）：
 *   ┌────────┬──────────────┬──────────┬──────────┬──────────┬──────────┐
 *   │  Level │ stimulusDur  │ isiMin   │ isiMax   │ feedback │ countdown│
 *   ├────────┼──────────────┼──────────┼──────────┼──────────┼──────────┤
 *   │  1     │ 3000 ms      │ 1000 ms  │ 1500 ms  │ 1200 ms  │ 3 s      │
 *   │  2     │ 2500 ms      │  900 ms  │ 1300 ms  │ 1000 ms  │ 3 s      │
 *   │  3     │ 2000 ms (預設)│ 800 ms  │ 1200 ms  │  800 ms  │ 3 s      │
 *   │  4     │ 1500 ms      │  600 ms  │ 1000 ms  │  600 ms  │ 3 s      │
 *   │  5     │ 1200 ms      │  500 ms  │  800 ms  │  500 ms  │ 3 s      │
 *   └────────┴──────────────┴──────────┴──────────┴──────────┴──────────┘
 *
 * 調整的參數（WM 面）：
 *   ┌────────┬──────────────┬────────────────┬──────────────────┐
 *   │  Level │ minPositions │ maxPositions   │ highlightDur     │
 *   ├────────┼──────────────┼────────────────┼──────────────────┤
 *   │  1     │ 2            │ 3              │ 1000 ms          │
 *   │  2     │ 2            │ 4              │  900 ms          │
 *   │  3     │ 2 (預設)     │ 6 (預設)       │  800 ms (預設)   │
 *   │  4     │ 3            │ 6              │  700 ms          │
 *   │  5     │ 3            │ 6              │  600 ms          │
 *   └────────┴──────────────┴────────────────┴──────────────────┘
 *
 * 低耦合設計：
 *   - 本檔案不認識 DOM / 遊戲流程 / 任何 HTML
 *   - 只實作 DifficultyProvider 要求的 engine 介面
 *   - 透過 DifficultyProvider.setEngine() 插入
 *
 * 匯出：window.SimpleAdaptiveEngine
 * ============================================
 */

var SimpleAdaptiveEngine = (function () {
  "use strict";

  // =========================================
  // 常數
  // =========================================

  var ENGINE_NAME = "SimpleAdaptiveEngine";

  /** 連續答對/答錯幾題觸發難度變化 */
  var STREAK_THRESHOLD = 2;

  /** 難度範圍 */
  var MIN_LEVEL = 1;
  var MAX_LEVEL = 5;

  /** 預設起始難度（= 原本 GAME_CONFIG 的值） */
  var DEFAULT_LEVEL = 3;

  // =========================================
  // 5 級參數表
  // =========================================

  /**
   * 每一級的時間參數
   * Level 3 = 與 GAME_CONFIG.TIMING 完全一致
   */
  var LEVEL_TIMING = {
    1: {
      stimulusDurationMs: 3000,
      isiMinMs: 1000,
      isiMaxMs: 1500,
      feedbackDurationMs: 1200,
      countdownSeconds: 3,
    },
    2: {
      stimulusDurationMs: 2500,
      isiMinMs: 900,
      isiMaxMs: 1300,
      feedbackDurationMs: 1000,
      countdownSeconds: 3,
    },
    3: {
      stimulusDurationMs: 2000,
      isiMinMs: 800,
      isiMaxMs: 1200,
      feedbackDurationMs: 800,
      countdownSeconds: 3,
    },
    4: {
      stimulusDurationMs: 1500,
      isiMinMs: 600,
      isiMaxMs: 1000,
      feedbackDurationMs: 600,
      countdownSeconds: 3,
    },
    5: {
      stimulusDurationMs: 1200,
      isiMinMs: 500,
      isiMaxMs: 800,
      feedbackDurationMs: 500,
      countdownSeconds: 3,
    },
  };

  /**
   * 每一級的 WM 參數
   */
  var LEVEL_WM = {
    1: { minPositions: 2, maxPositions: 3, highlightDurationMs: 1000 },
    2: { minPositions: 2, maxPositions: 4, highlightDurationMs: 900 },
    3: { minPositions: 2, maxPositions: 6, highlightDurationMs: 800 },
    4: { minPositions: 3, maxPositions: 6, highlightDurationMs: 700 },
    5: { minPositions: 3, maxPositions: 6, highlightDurationMs: 600 },
  };

  // =========================================
  // 內部狀態
  // =========================================

  var _level = DEFAULT_LEVEL;
  var _consecutiveCorrect = 0;
  var _consecutiveIncorrect = 0;

  /** 記錄難度變化歷程（供除錯 & 未來分析） */
  var _levelHistory = [];

  // =========================================
  // 持久化 — localStorage
  // =========================================

  var STORAGE_KEY = "ef_adaptive_level";

  /**
   * 儲存難度等級到 localStorage
   */
  function _saveLevel() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          level: _level,
          updatedAt: Date.now(),
        }),
      );
    } catch (e) {
      // quota exceeded 等錯誤靜默忽略
    }
  }

  /**
   * 從 localStorage 還原難度等級（若 7 天內有效）
   * @returns {number} 還原的等級（或 DEFAULT_LEVEL）
   */
  function _loadLevel() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_LEVEL;
      var data = JSON.parse(raw);
      var sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - (data.updatedAt || 0) > sevenDays) return DEFAULT_LEVEL;
      var level = Number(data.level);
      if (level >= MIN_LEVEL && level <= MAX_LEVEL) return level;
    } catch (e) {
      // parse error
    }
    return DEFAULT_LEVEL;
  }

  // =========================================
  // 內部方法
  // =========================================

  function _clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  /**
   * 嘗試調整難度
   * @returns {boolean} 是否有變化
   */
  function _tryAdjustLevel() {
    var oldLevel = _level;

    if (_consecutiveCorrect >= STREAK_THRESHOLD) {
      _level = _clamp(_level + 1, MIN_LEVEL, MAX_LEVEL);
      _consecutiveCorrect = 0;
      _consecutiveIncorrect = 0;
    } else if (_consecutiveIncorrect >= STREAK_THRESHOLD) {
      _level = _clamp(_level - 1, MIN_LEVEL, MAX_LEVEL);
      _consecutiveCorrect = 0;
      _consecutiveIncorrect = 0;
    }

    if (_level !== oldLevel) {
      var entry = {
        from: oldLevel,
        to: _level,
        timestamp: Date.now(),
        reason:
          _level > oldLevel
            ? "連對 " + STREAK_THRESHOLD + " 題"
            : "連錯 " + STREAK_THRESHOLD + " 題",
      };
      _levelHistory.push(entry);
      _saveLevel(); // 持久化新等級
      Logger.debug(
        "🎯 [" +
          ENGINE_NAME +
          "] 難度調整：L" +
          oldLevel +
          " → L" +
          _level +
          "（" +
          entry.reason +
          "）",
      );
      return true;
    }
    return false;
  }

  // =========================================
  // Engine 介面實作（符合 DifficultyProvider 要求）
  // =========================================

  return {
    name: ENGINE_NAME,

    /**
     * 取得試驗參數（依當前難度等級）
     * @param {Object} context
     * @returns {Object}
     */
    getTrialParams: function (context) {
      var params = LEVEL_TIMING[_level] || LEVEL_TIMING[DEFAULT_LEVEL];
      var cfg = typeof GAME_CONFIG !== "undefined" ? GAME_CONFIG : {};
      var timing = cfg.TIMING || {};
      // 淺拷貝以防外部修改
      return {
        stimulusDurationMs: params.stimulusDurationMs,
        responseGraceMs: timing.RESPONSE_GRACE_MS || 1000,
        isiMinMs: params.isiMinMs,
        isiMaxMs: params.isiMaxMs,
        feedbackDurationMs: params.feedbackDurationMs,
        countdownSeconds: params.countdownSeconds,
      };
    },

    /**
     * 取得題目生成參數
     * 簡化版不改變題數/Go比例，轉發 GAME_CONFIG
     * @param {Object} context
     * @returns {Object}
     */
    getQuestionParams: function (context) {
      var cfg = typeof GAME_CONFIG !== "undefined" ? GAME_CONFIG : {};
      var field = (cfg.FIELDS || {})[context.fieldId] || {};
      var ratios = cfg.RATIOS || {};
      var questions = cfg.QUESTIONS || {};

      var count;
      if (context.isPractice) {
        count = questions.PRACTICE_COUNT || 6;
      } else {
        count = questions.DEFAULT_COUNT || 6;
      }
      if (context.ruleId === "mixed" && !context.isPractice) {
        count = count * (questions.MIXED_MULTIPLIER || 2);
      }

      var goRatio;
      if (context.isPractice) {
        goRatio = ratios.PRACTICE_GO || 0.5;
      } else {
        goRatio = field.goRatio || 0.75;
      }

      var contextARatio;
      if (context.isPractice) {
        contextARatio = ratios.PRACTICE_CONTEXT_A || 0.5;
      } else {
        contextARatio = ratios.MIXED_CONTEXT_A || 0.8;
      }

      return {
        questionCount: count,
        goRatio: goRatio,
        contextARatio: contextARatio,
      };
    },

    /**
     * 取得 WM 參數（依當前難度等級）
     * @param {Object} context
     * @returns {Object}
     */
    getWMParams: function (context) {
      var cfg = typeof GAME_CONFIG !== "undefined" ? GAME_CONFIG : {};
      var wm = cfg.WORKING_MEMORY || {};
      var lvl = LEVEL_WM[_level] || LEVEL_WM[DEFAULT_LEVEL];

      var minPos = lvl.minPositions;
      var maxPos = Math.min(context.ruleQuestionCount || 6, lvl.maxPositions);
      if (maxPos < minPos) maxPos = minPos;

      var positions =
        Math.floor(Math.random() * (maxPos - minPos + 1)) + minPos;

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
        positions: positions,
        direction: direction,
        highlightDurationMs: lvl.highlightDurationMs,
        highlightIntervalMs: wm.HIGHLIGHT_INTERVAL_MS || 400,
        responseTimeoutMs: wm.RESPONSE_TIMEOUT_MS || 10000,
      };
    },

    /**
     * 取得通過門檻（不隨難度變化，維持 83%）
     * @param {Object} context
     * @returns {number}
     */
    getPassThreshold: function (context) {
      var cfg = typeof GAME_CONFIG !== "undefined" ? GAME_CONFIG : {};
      if (context.type === "wm") {
        return (cfg.WORKING_MEMORY || {}).PASS_THRESHOLD || 0.83;
      }
      return (cfg.SCORING || {}).PASS_THRESHOLD || 0.83;
    },

    /**
     * 每題結束後通知引擎 — 核心自適應邏輯
     * @param {Object} trialResult
     * @param {boolean} trialResult.isCorrect
     */
    onTrialComplete: function (trialResult) {
      if (trialResult.isCorrect) {
        _consecutiveCorrect++;
        _consecutiveIncorrect = 0;
      } else {
        _consecutiveIncorrect++;
        _consecutiveCorrect = 0;
      }

      _tryAdjustLevel();
    },

    /**
     * 整局結束後通知引擎
     * @param {Object} sessionResult
     */
    onSessionComplete: function (sessionResult) {
      _saveLevel(); // 確保 session 結束時儲存最新難度
      Logger.debug(
        "📊 [" +
          ENGINE_NAME +
          "] Session 結束 — 最終難度 L" +
          _level +
          "，歷程記錄 " +
          _levelHistory.length +
          " 筆",
      );
    },

    /**
     * 重置引擎狀態（新 session 開始時）
     * 從 localStorage 還原上次的難度等級
     */
    reset: function () {
      _level = _loadLevel();
      _consecutiveCorrect = 0;
      _consecutiveIncorrect = 0;
      _levelHistory = [];
      Logger.debug(
        "🔄 [" +
          ENGINE_NAME +
          "] 已重置 — 起始難度 L" +
          _level +
          (_level !== DEFAULT_LEVEL ? "（從紀錄還原）" : "（預設）"),
      );
    },

    // =========================================
    // 額外 API（除錯 & 分析用）
    // =========================================

    /**
     * 取得當前難度等級
     * @returns {number} 1~5
     */
    getCurrentLevel: function () {
      return _level;
    },

    /**
     * 取得難度變化歷程
     * @returns {Array} [{from, to, timestamp, reason}, ...]
     */
    getLevelHistory: function () {
      return _levelHistory.slice(); // 回傳拷貝
    },

    /**
     * 取得連續答對/答錯計數（除錯用）
     * @returns {Object}
     */
    getStreakInfo: function () {
      return {
        consecutiveCorrect: _consecutiveCorrect,
        consecutiveIncorrect: _consecutiveIncorrect,
        currentLevel: _level,
      };
    },

    /**
     * 取得所有難度等級的參數（除錯用）
     * @returns {Object}
     */
    getAllLevelParams: function () {
      return {
        timing: JSON.parse(JSON.stringify(LEVEL_TIMING)),
        wm: JSON.parse(JSON.stringify(LEVEL_WM)),
      };
    },

    /** 常數匯出（供外部參考） */
    STREAK_THRESHOLD: STREAK_THRESHOLD,
    MIN_LEVEL: MIN_LEVEL,
    MAX_LEVEL: MAX_LEVEL,
    DEFAULT_LEVEL: DEFAULT_LEVEL,
  };
})();

// =========================================
// 匯出
// =========================================

if (typeof window !== "undefined") {
  window.SimpleAdaptiveEngine = SimpleAdaptiveEngine;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = SimpleAdaptiveEngine;
}
