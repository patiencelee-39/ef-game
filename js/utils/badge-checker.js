/**
 * ============================================
 * 徽章判定引擎
 * ============================================
 * 對應需求文件：§3.7, Flow-23, Flow-27
 * 說明：18 個徽章的條件檢查 + 批次判定
 *       純邏輯模組，不碰 DOM
 * 依賴：storage.js（getBadges, addBadge, hasBadge,
 *                   getAdventureProgress, isMapAllPassed,
 *                   isAllPointsPassed, getPlayerProfile）
 * ============================================
 */

// =========================================
// 徽章定義（§3.7）
// =========================================

/**
 * 18 個徽章定義
 * category: 'basic' | 'advanced' | 'special'
 * checkFn: function(context) => boolean
 */
var BADGE_DEFINITIONS = [
  // ─── 基礎 5 個 ───
  {
    id: "mouse_adventurer",
    name: "小老鼠冒險家",
    icon: "🐭🏆",
    category: "basic",
    description: "完成小老鼠地圖全部 6 個探險點",
    voiceText: "恭喜你獲得小老鼠冒險家徽章！",
  },
  {
    id: "fishing_adventurer",
    name: "釣魚大冒險家",
    icon: "🐟🏆",
    category: "basic",
    description: "完成釣魚地圖全部 6 個探險點",
    voiceText: "恭喜你獲得釣魚大冒險家徽章！",
  },
  {
    id: "rule_switch_master",
    name: "規則轉換大師",
    icon: "🔄⭐",
    category: "basic",
    description: "規則二通過 3 次以上（任何遊戲場）",
    voiceText: "恭喜你獲得規則轉換大師徽章！",
  },
  {
    id: "mixed_expert",
    name: "混合高手",
    icon: "🎯✨",
    category: "basic",
    description: "混合規則通過 2 次以上（任何遊戲場）",
    voiceText: "恭喜你獲得混合高手徽章！",
  },
  {
    id: "memory_master",
    name: "記憶達人",
    icon: "🧠💫",
    category: "basic",
    description: "工作記憶測驗通過 3 次以上",
    voiceText: "恭喜你獲得記憶達人徽章！",
  },

  // ─── 進階 5 個 ───
  {
    id: "speed_king",
    name: "速度之王",
    icon: "⚡👑",
    category: "advanced",
    description: "平均反應時間 < 800ms 達成 3 次",
    voiceText: "恭喜你獲得速度之王徽章！",
  },
  {
    id: "perfectionist",
    name: "完美主義者",
    icon: "💯🏅",
    category: "advanced",
    description: "任何規則達成 100% 正確率 3 次",
    voiceText: "恭喜你獲得完美主義者徽章！",
  },
  {
    id: "progress_star",
    name: "進步之星",
    icon: "📈🚀",
    category: "advanced",
    description: "獲得進步獎勵 5 次以上",
    voiceText: "恭喜你獲得進步之星徽章！",
  },
  {
    id: "memory_star",
    name: "記憶之星",
    icon: "🧠⭐",
    category: "advanced",
    description: "工作記憶全對 3 次以上",
    voiceText: "恭喜你獲得記憶之星徽章！",
  },
  {
    id: "all_clear",
    name: "全制霸",
    icon: "🏅🎊",
    category: "advanced",
    description: "完成全部 12 個探險點",
    voiceText: "恭喜你獲得全制霸徽章！太厲害了！",
  },

  // ─── 特殊 8 個 ───
  {
    id: "rainbow_collector",
    name: "七彩收藏家",
    icon: "🌟🌈",
    category: "special",
    description: "集齊 7 個不同徽章",
    voiceText: "恭喜你獲得七彩收藏家徽章！",
  },
  {
    id: "unyielding",
    name: "不屈勇士",
    icon: "🦸‍♂️⚔️",
    category: "special",
    description: "同一 session 未達標後重試並達標",
    voiceText: "恭喜你獲得不屈勇士徽章！你好堅持！",
  },
  {
    id: "early_bird",
    name: "早起鳥兒",
    icon: "🌅☀️",
    category: "special",
    description: "早上 6:00-8:00 之間完成一場遊戲",
    voiceText: "恭喜你獲得早起鳥兒徽章！",
  },
  {
    id: "night_owl",
    name: "懸梁刺骨",
    icon: "🌙💪",
    category: "special",
    description: "晚上 20:00-22:00 之間完成一場遊戲",
    voiceText: "恭喜你獲得懸梁刺骨徽章！",
  },
  {
    id: "game_master",
    name: "遊戲達人",
    icon: "🎮🕹️",
    category: "special",
    description: "累計完成 30 場遊戲",
    voiceText: "恭喜你獲得遊戲達人徽章！",
  },
  {
    id: "badge_strong",
    name: "徽章強者",
    icon: "🏅🔰",
    category: "special",
    description: "集齊 10 個不同徽章",
    voiceText: "恭喜你獲得徽章強者徽章！",
  },
  {
    id: "badge_expert",
    name: "徽章專家",
    icon: "🏅🎖️",
    category: "special",
    description: "集齊 14 個不同徽章",
    voiceText: "恭喜你獲得徽章專家徽章！",
  },
  {
    id: "badge_grandmaster",
    name: "徽章職人大師",
    icon: "🏅👑",
    category: "special",
    description: "集齊全部 18 個徽章",
    voiceText: "恭喜你獲得徽章職人大師徽章！你是最強的！",
  },
];

// =========================================
// 統計計數器 key（存於 localStorage）
// =========================================

var BADGE_COUNTER_KEY = "efgame-badge-counters";

/**
 * 取得徽章統計計數
 * @returns {Object}
 */
function getBadgeCounters() {
  try {
    var raw = localStorage.getItem(BADGE_COUNTER_KEY);
    return raw ? JSON.parse(raw) : _createDefaultCounters();
  } catch (e) {
    return _createDefaultCounters();
  }
}

/**
 * 儲存徽章統計計數
 * @param {Object} counters
 */
function saveBadgeCounters(counters) {
  try {
    localStorage.setItem(BADGE_COUNTER_KEY, JSON.stringify(counters));
  } catch (e) {
    Logger.warn("⚠️ 徽章計數儲存失敗:", e);
  }
}

/**
 * 建立預設計數器
 */
function _createDefaultCounters() {
  return {
    rule2PassCount: 0, // 規則二通過次數
    mixedPassCount: 0, // 混合規則通過次數
    wmPassCount: 0, // WM 通過次數
    speedUnder800Count: 0, // 平均 RT < 800ms 次數
    perfectCount: 0, // 100% 正確率次數
    progressBonusCount: 0, // 進步獎勵次數
    wmPerfectCount: 0, // WM 全對次數
    totalGamesCompleted: 0, // 累計完成場次
  };
}

// =========================================
// 計數器更新
// =========================================

/**
 * 根據本輪遊戲結果更新計數器
 *
 * @param {Object} params
 * @param {Object} params.ruleResult  - calculateRuleScore 的結果
 * @param {Object|null} params.wmResult - calculateWMScore 的結果
 * @param {string} params.ruleId      - 'rule1', 'rule2', 'mixed'
 * @returns {Object} 更新後的計數器
 */
function updateBadgeCounters(params) {
  var counters = getBadgeCounters();
  var ruleResult = params.ruleResult;
  var wmResult = params.wmResult;
  var ruleId = params.ruleId;

  // 計場次
  counters.totalGamesCompleted++;

  // 規則二通過
  if (ruleId === "rule2" && ruleResult.passed) {
    counters.rule2PassCount++;
  }

  // 混合通過
  if (ruleId === "mixed" && ruleResult.passed) {
    counters.mixedPassCount++;
  }

  // WM 通過
  if (wmResult && wmResult.wmPassed) {
    counters.wmPassCount++;
  }

  // 速度 < 800ms
  if (ruleResult.avgRT !== null && ruleResult.avgRT < 800) {
    counters.speedUnder800Count++;
  }

  // 100% 正確
  if (ruleResult.accuracy === 1) {
    counters.perfectCount++;
  }

  // 進步獎勵
  if (ruleResult.isNewBestScore) {
    counters.progressBonusCount++;
  }

  // WM 全對
  if (wmResult && wmResult.correctCount === wmResult.totalPositions) {
    counters.wmPerfectCount++;
  }

  saveBadgeCounters(counters);
  return counters;
}

// =========================================
// 批次徽章檢查
// =========================================

/**
 * 檢查所有徽章條件，回傳新獲得的徽章列表
 *
 * @param {Object} context
 * @param {Object}      context.counters       - getBadgeCounters() 結果
 * @param {boolean}     context.isRetrySuccess  - 是否為「不屈勇士」觸發條件
 * @param {Date}        [context.completedAt]   - 完成時間（預設 new Date()）
 * @returns {Array<Object>} 新獲得的徽章定義陣列
 */
function checkAllBadges(context) {
  var counters = context.counters || getBadgeCounters();
  var completedAt = context.completedAt || new Date();
  var isRetrySuccess = context.isRetrySuccess || false;

  var newBadges = [];

  // 逐一檢查
  BADGE_DEFINITIONS.forEach(function (badge) {
    // 已擁有 → 跳過
    if (hasBadge(badge.id)) return;

    var earned = false;

    switch (badge.id) {
      // ─── 基礎 ───
      case "mouse_adventurer":
        earned = isMapAllPassed("mouse");
        break;
      case "fishing_adventurer":
        earned = isMapAllPassed("fishing");
        break;
      case "rule_switch_master":
        earned = counters.rule2PassCount >= 3;
        break;
      case "mixed_expert":
        earned = counters.mixedPassCount >= 2;
        break;
      case "memory_master":
        earned = counters.wmPassCount >= 3;
        break;

      // ─── 進階 ───
      case "speed_king":
        earned = counters.speedUnder800Count >= 3;
        break;
      case "perfectionist":
        earned = counters.perfectCount >= 3;
        break;
      case "progress_star":
        earned = counters.progressBonusCount >= 5;
        break;
      case "memory_star":
        earned = counters.wmPerfectCount >= 3;
        break;
      case "all_clear":
        earned = isAllPointsPassed();
        break;

      // ─── 特殊 ───
      case "rainbow_collector":
        earned = getBadges().length >= 7;
        break;
      case "unyielding":
        earned = isRetrySuccess;
        break;
      case "early_bird":
        var h1 = completedAt.getHours();
        earned = h1 >= 6 && h1 < 8;
        break;
      case "night_owl":
        var h2 = completedAt.getHours();
        earned = h2 >= 20 && h2 < 22;
        break;
      case "game_master":
        earned = counters.totalGamesCompleted >= 30;
        break;
      case "badge_strong":
        earned = getBadges().length >= 10;
        break;
      case "badge_expert":
        earned = getBadges().length >= 14;
        break;
      case "badge_grandmaster":
        earned = getBadges().length >= 17; // 17 = 前 17 個全拿，第 18 個自動達成
        break;
    }

    if (earned) {
      // 寫入 storage
      addBadge(badge.id);
      newBadges.push(badge);
    }
  });

  // 收藏類徽章可能因本次新增而連鎖觸發，再掃一次
  if (newBadges.length > 0) {
    var chainBadges = _checkChainBadges();
    chainBadges.forEach(function (b) {
      newBadges.push(b);
    });
  }

  return newBadges;
}

/**
 * 連鎖檢查：收藏類徽章（集齊 N 個）
 * @returns {Array<Object>}
 * @private
 */
function _checkChainBadges() {
  var chain = [];
  var currentCount = getBadges().length;

  var thresholds = [
    { id: "rainbow_collector", min: 7 },
    { id: "badge_strong", min: 10 },
    { id: "badge_expert", min: 14 },
    { id: "badge_grandmaster", min: 17 },
  ];

  thresholds.forEach(function (t) {
    if (!hasBadge(t.id) && currentCount >= t.min) {
      addBadge(t.id);
      var def = getBadgeDefinition(t.id);
      if (def) chain.push(def);
    }
  });

  return chain;
}

// =========================================
// 輔助 API
// =========================================

/**
 * 取得特定徽章的定義
 *
 * @param {string} badgeId
 * @returns {Object|null}
 */
function getBadgeDefinition(badgeId) {
  return (
    BADGE_DEFINITIONS.find(function (b) {
      return b.id === badgeId;
    }) || null
  );
}

/**
 * 取得所有徽章定義列表
 *
 * @returns {Array<Object>}
 */
function getAllBadgeDefinitions() {
  return BADGE_DEFINITIONS.slice();
}

/**
 * 取得玩家已獲得的徽章定義（含 icon, name 等）
 *
 * @returns {Array<Object>}
 */
function getEarnedBadgeDefinitions() {
  var earned = getBadges();
  return BADGE_DEFINITIONS.filter(function (b) {
    return earned.indexOf(b.id) !== -1;
  });
}

/**
 * 取得徽章進度摘要
 *
 * @returns {{ earned: number, total: number, percent: number }}
 */
function getBadgeProgress() {
  var earned = getBadges().length;
  var total = BADGE_DEFINITIONS.length;
  return {
    earned: earned,
    total: total,
    percent: total > 0 ? Math.round((earned / total) * 100) : 0,
  };
}

// =========================================
// 匯出
// =========================================

if (typeof window !== "undefined") {
  window.BADGE_DEFINITIONS = BADGE_DEFINITIONS;
  window.getBadgeCounters = getBadgeCounters;
  window.saveBadgeCounters = saveBadgeCounters;
  window.updateBadgeCounters = updateBadgeCounters;
  window.checkAllBadges = checkAllBadges;
  window.getBadgeDefinition = getBadgeDefinition;
  window.getAllBadgeDefinitions = getAllBadgeDefinitions;
  window.getEarnedBadgeDefinitions = getEarnedBadgeDefinitions;
  window.getBadgeProgress = getBadgeProgress;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    BADGE_DEFINITIONS,
    getBadgeCounters,
    saveBadgeCounters,
    updateBadgeCounters,
    checkAllBadges,
    getBadgeDefinition,
    getAllBadgeDefinitions,
    getEarnedBadgeDefinitions,
    getBadgeProgress,
  };
}
