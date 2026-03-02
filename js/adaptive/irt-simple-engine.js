/**
 * ============================================
 * IRT 簡易版自適應引擎 — IRTSimpleEngine
 * ============================================
 * 對應：IRT/DA 整合 — 方案 B（IRT 驅動版）
 *
 * 核心理論：
 *   Item Response Theory (IRT) 三參數模型 (3PL)
 *   P(θ) = c + (1-c) / [1 + exp(-a(θ - b))]
 *
 *   θ = 受試者能力值（本引擎估計的對象）
 *   a = 鑑別度 (discrimination)
 *   b = 難度 (difficulty)
 *   c = 猜測參數 (guessing)
 *
 * 設計：
 *   - 5 級難度，每級對應一組 IRT 參數 (a, b, c)
 *   - 使用簡化 EAP（Expected A Posteriori）估計能力 θ
 *   - 依 θ 值選擇最接近的難度級別
 *   - Level 3 = 與 GAME_CONFIG 現有值完全一致（基準線）
 *   - 前 3 題鎖定 Level 3（暖身期，累積足夠資料再估計）
 *
 * 安全機制：
 *   - θ 限制在 [-3, +3] 範圍
 *   - 每題最多升降 1 級（平滑過渡）
 *   - 極端情況自動回退
 *
 * 學術引用：
 *   Embretson, S. E., & Reise, S. P. (2000). Item response theory.
 *   van der Linden, W. J., & Glas, C. A. W. (2010). Elements of adaptive testing.
 *
 * 低耦合設計：
 *   - 不認識 DOM / 遊戲流程 / 任何 HTML
 *   - 只實作 DifficultyProvider 要求的 engine 介面
 *   - 透過 DifficultyProvider.setEngine() 插入
 *
 * 匯出：window.IRTSimpleEngine
 * ============================================
 */

var IRTSimpleEngine = (function () {
  "use strict";

  // =========================================
  // 常數
  // =========================================

  var ENGINE_NAME = "IRTSimpleEngine";

  /** 難度範圍 */
  var MIN_LEVEL = 1;
  var MAX_LEVEL = 5;

  /** 預設起始難度（= 原本 GAME_CONFIG 的值） */
  var DEFAULT_LEVEL = 3;

  /** 暖身期：前 N 題鎖定 DEFAULT_LEVEL，不用 θ 選題 */
  var WARMUP_TRIALS = 3;

  /** θ 離散化範圍（用於 EAP 估計） */
  var THETA_POINTS = [-3, -2.5, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5, 3];

  /** θ 值邊界 */
  var THETA_MIN = -3;
  var THETA_MAX = 3;

  // =========================================
  // IRT 題目參數表（5 級）
  // =========================================
  // c = 0.5 → Go/NoGo 為二擇一，亂猜 50% 答對
  // a = 鑑別度，中間級別較高（區分力最強）
  // b = 難度，均勻分布在 [-2, +2]

  var ITEM_PARAMS = {
    1: { a: 1.0, b: -2.0, c: 0.5 }, // 最簡單
    2: { a: 1.2, b: -1.0, c: 0.5 }, // 容易
    3: { a: 1.5, b: 0.0, c: 0.5 }, // 中等（= 原始值）
    4: { a: 1.3, b: 1.0, c: 0.5 }, // 困難
    5: { a: 1.0, b: 2.0, c: 0.5 }, // 最困難
  };

  // =========================================
  // 5 級時間參數表（與 SimpleAdaptiveEngine 一致）
  // =========================================

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
  var _theta = 0; // 當前能力估計值
  var _thetaSE = 999; // 標準誤（初始極大，表示不確定）
  var _responses = []; // 作答紀錄 [{level, isCorrect}, ...]
  var _trialCount = 0; // 累計題數

  /** 記錄 θ 與難度變化歷程（供分析） */
  var _irtHistory = [];

  // =========================================
  // IRT 核心演算法
  // =========================================

  /**
   * 3PL 模型：計算在能力 θ 下、對某題目答對的機率
   * P(θ) = c + (1-c) / [1 + exp(-a(θ - b))]
   *
   * @param {number} theta - 能力值
   * @param {Object} item - {a, b, c}
   * @returns {number} 答對機率 (0~1)
   */
  function _probability(theta, item) {
    var exp = Math.exp(-item.a * (theta - item.b));
    return item.c + (1 - item.c) / (1 + exp);
  }

  /**
   * Fisher Information：題目在某能力水準提供多少測量資訊
   *
   * @param {number} theta - 能力值
   * @param {Object} item - {a, b, c}
   * @returns {number} Fisher 資訊量
   */
  function _fisherInformation(theta, item) {
    var p = _probability(theta, item);
    var q = 1 - p;
    if (p <= item.c || q <= 0) return 0; // 防除以零
    var numerator = item.a * item.a * (p - item.c) * (p - item.c) * q;
    var denominator = p * (1 - item.c) * (1 - item.c);
    return denominator > 0 ? numerator / denominator : 0;
  }

  /**
   * 簡化 EAP 估計（Expected A Posteriori）
   *
   * 使用離散化的 θ 網格，計算每個 θ 點的後驗機率，
   * 取加權平均作為能力估計。
   *
   * 先驗分布：N(0, 1)
   *
   * @returns {{ theta: number, se: number }}
   */
  function _estimateTheta() {
    if (_responses.length === 0) {
      return { theta: 0, se: 999 };
    }

    var posteriors = [];
    var totalPosterior = 0;

    for (var i = 0; i < THETA_POINTS.length; i++) {
      var t = THETA_POINTS[i];

      // 先驗 N(0, 1)
      var prior = Math.exp(-0.5 * t * t);

      // 似然 = 各題答對/答錯機率的連乘
      var likelihood = 1;
      for (var j = 0; j < _responses.length; j++) {
        var resp = _responses[j];
        var item = ITEM_PARAMS[resp.level] || ITEM_PARAMS[DEFAULT_LEVEL];
        var p = _probability(t, item);
        likelihood *= resp.isCorrect ? p : 1 - p;

        // 防止 underflow
        if (likelihood < 1e-100) likelihood = 1e-100;
      }

      var post = likelihood * prior;
      posteriors.push(post);
      totalPosterior += post;
    }

    // 正規化 + 加權平均
    var thetaEAP = 0;
    var thetaVar = 0;
    for (var k = 0; k < THETA_POINTS.length; k++) {
      var w = posteriors[k] / totalPosterior;
      thetaEAP += w * THETA_POINTS[k];
    }

    // 計算標準誤
    for (var m = 0; m < THETA_POINTS.length; m++) {
      var w2 = posteriors[m] / totalPosterior;
      var diff = THETA_POINTS[m] - thetaEAP;
      thetaVar += w2 * diff * diff;
    }

    return {
      theta: _clamp(thetaEAP, THETA_MIN, THETA_MAX),
      se: Math.sqrt(thetaVar),
    };
  }

  /**
   * 依 θ 值選擇最佳難度級別
   * 選擇 b 值最接近 θ 的級別，但每次最多升降 1 級
   *
   * @param {number} theta
   * @returns {number} 1~5
   */
  function _selectLevel(theta) {
    var bestLevel = DEFAULT_LEVEL;
    var bestDist = Infinity;

    for (var lvl = MIN_LEVEL; lvl <= MAX_LEVEL; lvl++) {
      var dist = Math.abs(theta - ITEM_PARAMS[lvl].b);
      if (dist < bestDist) {
        bestDist = dist;
        bestLevel = lvl;
      }
    }

    // 平滑約束：每次最多升降 1 級
    if (bestLevel > _level + 1) bestLevel = _level + 1;
    if (bestLevel < _level - 1) bestLevel = _level - 1;

    return _clamp(bestLevel, MIN_LEVEL, MAX_LEVEL);
  }

  // =========================================
  // 持久化 — localStorage
  // =========================================

  var STORAGE_KEY = "ef_irt_state";

  function _saveState() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          level: _level,
          theta: _theta,
          thetaSE: _thetaSE,
          trialCount: _trialCount,
          updatedAt: Date.now(),
        }),
      );
    } catch (e) {
      // quota exceeded 靜默忽略
    }
  }

  /**
   * 從 localStorage 還原狀態（7 天內有效）
   */
  function _loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      var sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - (data.updatedAt || 0) > sevenDays) return null;
      return data;
    } catch (e) {
      return null;
    }
  }

  // =========================================
  // 輔助方法
  // =========================================

  function _clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  // =========================================
  // Engine 介面實作（符合 DifficultyProvider 要求）
  // =========================================

  return {
    name: ENGINE_NAME,

    // ----- getTrialParams -----
    getTrialParams: function (context) {
      var params = LEVEL_TIMING[_level] || LEVEL_TIMING[DEFAULT_LEVEL];
      var cfg = typeof GAME_CONFIG !== "undefined" ? GAME_CONFIG : {};
      var timing = cfg.TIMING || {};
      return {
        stimulusDurationMs: params.stimulusDurationMs,
        responseGraceMs: timing.RESPONSE_GRACE_MS || 1000,
        isiMinMs: params.isiMinMs,
        isiMaxMs: params.isiMaxMs,
        feedbackDurationMs: params.feedbackDurationMs,
        countdownSeconds: params.countdownSeconds,
      };
    },

    // ----- getQuestionParams（不改變題數/比例，轉發 GAME_CONFIG）-----
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

    // ----- getWMParams -----
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

    // ----- getPassThreshold（固定 83%，不隨難度變化）-----
    getPassThreshold: function (context) {
      var cfg = typeof GAME_CONFIG !== "undefined" ? GAME_CONFIG : {};
      if (context.type === "wm") {
        return (cfg.WORKING_MEMORY || {}).PASS_THRESHOLD || 0.83;
      }
      return (cfg.SCORING || {}).PASS_THRESHOLD || 0.83;
    },

    // ----- onTrialComplete — IRT 核心自適應邏輯 -----
    onTrialComplete: function (trialResult) {
      _trialCount++;

      // 記錄作答（滑動視窗：只保留最近 30 筆，避免 EAP 計算量無限增長）
      _responses.push({
        level: _level,
        isCorrect: trialResult.isCorrect,
      });
      if (_responses.length > 30) {
        _responses = _responses.slice(-30);
      }

      // EAP 重新估計 θ
      var estimate = _estimateTheta();
      _theta = estimate.theta;
      _thetaSE = estimate.se;

      var oldLevel = _level;

      // 暖身期後才用 θ 選題
      if (_trialCount > WARMUP_TRIALS) {
        _level = _selectLevel(_theta);
      }

      // 記錄歷程
      var item = ITEM_PARAMS[oldLevel] || ITEM_PARAMS[DEFAULT_LEVEL];
      _irtHistory.push({
        trial: _trialCount,
        isCorrect: trialResult.isCorrect,
        rt: trialResult.rt || null,
        fromLevel: oldLevel,
        toLevel: _level,
        theta: Math.round(_theta * 100) / 100,
        thetaSE: Math.round(_thetaSE * 100) / 100,
        itemB: item.b,
        itemA: item.a,
        fisherInfo: Math.round(_fisherInformation(_theta, item) * 100) / 100,
        timestamp: Date.now(),
      });

      if (_level !== oldLevel) {
        Logger.debug(
          "🧠 [" +
            ENGINE_NAME +
            "] θ=" +
            _theta.toFixed(2) +
            " (SE=" +
            _thetaSE.toFixed(2) +
            ") → 難度 L" +
            oldLevel +
            " → L" +
            _level,
        );
      }
    },

    // ----- onSessionComplete -----
    onSessionComplete: function (sessionResult) {
      _saveState();
      Logger.debug(
        "📊 [" +
          ENGINE_NAME +
          "] Session 結束 — " +
          "θ=" +
          _theta.toFixed(2) +
          " SE=" +
          _thetaSE.toFixed(2) +
          " Level=" +
          _level +
          " 歷程 " +
          _irtHistory.length +
          " 筆",
      );
    },

    // ----- reset -----
    reset: function () {
      var saved = _loadState();
      if (saved) {
        _level = _clamp(saved.level || DEFAULT_LEVEL, MIN_LEVEL, MAX_LEVEL);
        _theta = saved.theta || 0;
        _thetaSE = saved.thetaSE || 999;
        _trialCount = 0; // session 內從 0 開始計
      } else {
        _level = DEFAULT_LEVEL;
        _theta = 0;
        _thetaSE = 999;
        _trialCount = 0;
      }
      _responses = [];
      _irtHistory = [];
      Logger.debug(
        "🔄 [" +
          ENGINE_NAME +
          "] 已重置 — " +
          "起始 L" +
          _level +
          " θ=" +
          _theta.toFixed(2) +
          (saved ? "（從紀錄還原）" : "（預設）"),
      );
    },

    // =========================================
    // 額外 API（除錯 & 分析 & UI 用）
    // =========================================

    /**
     * 取得當前難度等級（與 SimpleAdaptiveEngine 相同 API）
     * @returns {number} 1~5
     */
    getCurrentLevel: function () {
      return _level;
    },

    /**
     * 取得當前 IRT 狀態（供結果頁、設定頁顯示）
     * @returns {Object}
     */
    getIRTState: function () {
      return {
        theta: Math.round(_theta * 100) / 100,
        thetaSE: Math.round(_thetaSE * 100) / 100,
        level: _level,
        trialCount: _trialCount,
        totalResponses: _responses.length,
      };
    },

    /**
     * 取得 IRT 歷程（供資料分析）
     * @returns {Array}
     */
    getIRTHistory: function () {
      return _irtHistory.slice(); // 回傳拷貝
    },

    /**
     * 取得連續答對/答錯計數（相容 SimpleAdaptiveEngine API）
     * @returns {Object}
     */
    getStreakInfo: function () {
      // 計算最近的連續正確/錯誤
      var cc = 0;
      var ci = 0;
      for (var i = _responses.length - 1; i >= 0; i--) {
        if (_responses[i].isCorrect) {
          if (ci > 0) break;
          cc++;
        } else {
          if (cc > 0) break;
          ci++;
        }
      }
      return {
        consecutiveCorrect: cc,
        consecutiveIncorrect: ci,
        currentLevel: _level,
      };
    },

    /**
     * 取得所有 IRT 題目參數（除錯用）
     * @returns {Object}
     */
    getAllLevelParams: function () {
      return {
        timing: JSON.parse(JSON.stringify(LEVEL_TIMING)),
        wm: JSON.parse(JSON.stringify(LEVEL_WM)),
        irt: JSON.parse(JSON.stringify(ITEM_PARAMS)),
      };
    },

    /** 常數匯出 */
    WARMUP_TRIALS: WARMUP_TRIALS,
    MIN_LEVEL: MIN_LEVEL,
    MAX_LEVEL: MAX_LEVEL,
    DEFAULT_LEVEL: DEFAULT_LEVEL,
  };
})();

// =========================================
// 匯出
// =========================================

if (typeof window !== "undefined") {
  window.IRTSimpleEngine = IRTSimpleEngine;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = IRTSimpleEngine;
}
