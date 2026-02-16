/**
 * ============================================
 * 等級計算器
 * ============================================
 * 對應需求文件：§3.8, Flow-22
 * 說明：⭐ → 等級對照表 + 升級偵測
 *       純邏輯模組，不碰 DOM
 * 依賴：無（可獨立運作）
 * ============================================
 */

// =========================================
// 等級定義（§3.8）
// =========================================

/**
 * 5 個等級，依累計星星數分級
 * minStars: 進入該等級的最低星星數
 * maxStars: 該等級的上限（含），null = 無上限
 */
var LEVEL_DEFINITIONS = [
  {
    level: 1,
    name: "蛋寶寶",
    icon: "🥚",
    minStars: 0,
    maxStars: 10,
    description: "剛剛開始冒險的蛋寶寶",
  },
  {
    level: 2,
    name: "破殼雞",
    icon: "🐣",
    minStars: 11,
    maxStars: 20,
    description: "破殼而出的小雞",
  },
  {
    level: 3,
    name: "小雞仔",
    icon: "🐥",
    minStars: 21,
    maxStars: 40,
    description: "越來越厲害的小雞仔",
  },
  {
    level: 4,
    name: "雞大王",
    icon: "🐓",
    minStars: 41,
    maxStars: 60,
    description: "威風凜凜的雞大王",
  },
  {
    level: 5,
    name: "金鷹王者",
    icon: "🦅",
    minStars: 61,
    maxStars: null,
    description: "翱翔天際的金鷹王者",
  },
];

// =========================================
// 核心 API
// =========================================

/**
 * 根據累計星星數計算等級
 *
 * @param {number} totalStars - 累計星星數
 * @returns {number} 等級（1-5）
 */
function calculateLevel(totalStars) {
  if (typeof totalStars !== "number" || totalStars < 0) {
    return 1;
  }

  for (var i = LEVEL_DEFINITIONS.length - 1; i >= 0; i--) {
    if (totalStars >= LEVEL_DEFINITIONS[i].minStars) {
      return LEVEL_DEFINITIONS[i].level;
    }
  }

  return 1;
}

/**
 * 取得等級的完整定義
 *
 * @param {number} level - 等級（1-5）
 * @returns {Object|null} 等級定義物件
 */
function getLevelDefinition(level) {
  return (
    LEVEL_DEFINITIONS.find(function (def) {
      return def.level === level;
    }) || null
  );
}

/**
 * 取得指定星星數對應的等級定義
 *
 * @param {number} totalStars
 * @returns {Object} 等級定義物件
 */
function getLevelByStars(totalStars) {
  var level = calculateLevel(totalStars);
  return getLevelDefinition(level);
}

/**
 * 偵測升級事件
 * 比較加星前後的等級，判斷是否升級
 *
 * @param {number} oldStars - 加星前的累計星星數
 * @param {number} newStars - 加星後的累計星星數
 * @returns {{
 *   leveledUp: boolean,
 *   oldLevel: number,
 *   newLevel: number,
 *   oldLevelDef: Object,
 *   newLevelDef: Object,
 *   levelsGained: number
 * }}
 */
function detectLevelUp(oldStars, newStars) {
  var oldLevel = calculateLevel(oldStars);
  var newLevel = calculateLevel(newStars);
  var oldLevelDef = getLevelDefinition(oldLevel);
  var newLevelDef = getLevelDefinition(newLevel);

  return {
    leveledUp: newLevel > oldLevel,
    oldLevel: oldLevel,
    newLevel: newLevel,
    oldLevelDef: oldLevelDef,
    newLevelDef: newLevelDef,
    levelsGained: newLevel - oldLevel,
  };
}

/**
 * 計算距離下一等級還差多少星星
 *
 * @param {number} totalStars - 目前累計星星數
 * @returns {{
 *   currentLevel: number,
 *   starsToNextLevel: number|null,
 *   nextLevelDef: Object|null,
 *   isMaxLevel: boolean,
 *   progressPercent: number
 * }}
 */
function getProgressToNextLevel(totalStars) {
  var currentLevel = calculateLevel(totalStars);
  var currentDef = getLevelDefinition(currentLevel);

  // 已達最高等級
  if (currentLevel >= LEVEL_DEFINITIONS.length) {
    return {
      currentLevel: currentLevel,
      starsToNextLevel: null,
      nextLevelDef: null,
      isMaxLevel: true,
      progressPercent: 100,
    };
  }

  var nextDef = getLevelDefinition(currentLevel + 1);
  var starsToNext = nextDef.minStars - totalStars;
  var rangeTotal = nextDef.minStars - currentDef.minStars;
  var rangeProgress = totalStars - currentDef.minStars;
  var progressPercent =
    rangeTotal > 0
      ? Math.min(100, Math.round((rangeProgress / rangeTotal) * 100))
      : 100;

  return {
    currentLevel: currentLevel,
    starsToNextLevel: starsToNext,
    nextLevelDef: nextDef,
    isMaxLevel: false,
    progressPercent: progressPercent,
  };
}

/**
 * 取得所有等級定義列表（UI 顯示用）
 *
 * @returns {Array<Object>}
 */
function getAllLevelDefinitions() {
  return LEVEL_DEFINITIONS.slice();
}

// =========================================
// 匯出
// =========================================

if (typeof window !== "undefined") {
  window.LEVEL_DEFINITIONS = LEVEL_DEFINITIONS;
  window.calculateLevel = calculateLevel;
  window.getLevelDefinition = getLevelDefinition;
  window.getLevelByStars = getLevelByStars;
  window.detectLevelUp = detectLevelUp;
  window.getProgressToNextLevel = getProgressToNextLevel;
  window.getAllLevelDefinitions = getAllLevelDefinitions;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    LEVEL_DEFINITIONS,
    calculateLevel,
    getLevelDefinition,
    getLevelByStars,
    detectLevelUp,
    getProgressToNextLevel,
    getAllLevelDefinitions,
  };
}
