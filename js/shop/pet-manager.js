/**
 * ============================================
 * 養電子雞 — 寵物管理器（業務邏輯）
 * ============================================
 * 對應功能：P3 養電子雞（等級 = 雞的成長）
 * 說明：餵食、心情計算、配件購買邏輯
 *       高內聚 — 所有寵物業務邏輯集中於此
 *       不碰 DOM — 純邏輯模組
 * 依賴：
 *   - pet-config.js（食物/配件/心情定義）
 *   - level-calculator.js（LEVEL_DEFINITIONS, getLevelByStars, calculateLevel, getLevelDefinition）
 *   - storage.js（spendStars, getPetState, feedPet 等）
 *   - game-config.js（SHOP 設定）
 * ============================================
 */

var PetManager = (function () {
  "use strict";

  // =========================================
  // 成長階段（直接複用等級系統）
  // =========================================

  /**
   * 取得寵物目前的成長階段
   * 直接映射自等級系統 → 零額外邏輯
   *
   * @returns {{
   *   stage: Object,
   *   totalStars: number,
   *   progress: Object
   * }}
   */
  function getGrowthStage() {
    var totalStars = getTotalStars();
    var levelDef = getLevelByStars(totalStars);
    var progress = getProgressToNextLevel(totalStars);

    return {
      stage: levelDef,
      totalStars: totalStars,
      progress: progress,
    };
  }

  // =========================================
  // 心情計算
  // =========================================

  /**
   * 計算寵物目前心情（基於餵食歷史 + 時間衰減）
   *
   * @returns {{ mood: Object, timeSinceLastFed: number|null }}
   */
  function getCurrentMood() {
    var state = getPetState();
    var now = Date.now();
    var lastFed = state.lastFedTime;
    var timeSince = lastFed ? now - lastFed : null;

    var moodId;

    if (!lastFed || timeSince > PET_MOOD_RULES.HUNGRY_AFTER_MS) {
      // 從未餵過 或 超過 24 小時
      moodId = "hungry";
    } else if (timeSince < PET_MOOD_RULES.HAPPY_DURATION_MS) {
      // 最近 2 小時內剛餵過
      if (state.fedCount >= PET_MOOD_RULES.MOOD_BOOST_EXCITED) {
        moodId = "excited";
      } else if (state.fedCount >= PET_MOOD_RULES.MOOD_BOOST_HAPPY) {
        moodId = "happy";
      } else {
        moodId = "happy";
      }
    } else {
      // 2~24 小時之間
      moodId = "normal";
    }

    return {
      mood: PET_MOODS[moodId] || PET_MOODS.normal,
      timeSinceLastFed: timeSince,
    };
  }

  // =========================================
  // 餵食邏輯
  // =========================================

  /**
   * 檢查是否能餵食
   * @param {string} foodId
   * @returns {{ canFeed: boolean, reason?: string, cost: number, available: number }}
   */
  function canFeed(foodId) {
    var food = getPetFoodById(foodId);
    if (!food) {
      return { canFeed: false, reason: "食物不存在", cost: 0, available: 0 };
    }

    // 等級門檻檢查
    var currentLevel = calculateLevel(getTotalStars());
    var requiredLevel = food.unlockLevel || 1;
    if (currentLevel < requiredLevel) {
      var levelDef = getLevelDefinition(requiredLevel);
      var levelName = levelDef
        ? levelDef.icon + " " + levelDef.name
        : "等級 " + requiredLevel;
      return {
        canFeed: false,
        reason: "小雞達到" + levelName + "才能解鎖",
        cost: food.cost,
        available: getAvailableStars(),
        locked: true,
        requiredLevel: requiredLevel,
      };
    }

    var available = getAvailableStars();
    if (available < food.cost) {
      return {
        canFeed: false,
        reason:
          "星星不足（需要 " + food.cost + "⭐，目前 " + available + "⭐）",
        cost: food.cost,
        available: available,
      };
    }

    return { canFeed: true, cost: food.cost, available: available };
  }

  /**
   * 餵食寵物（扣星星 → 更新狀態）
   *
   * @param {string} foodId
   * @returns {{
   *   success: boolean,
   *   reason?: string,
   *   food?: Object,
   *   newMood?: Object,
   *   fedCount?: number,
   *   starsRemaining?: number
   * }}
   */
  function feed(foodId) {
    var check = canFeed(foodId);
    if (!check.canFeed) {
      return { success: false, reason: check.reason };
    }

    var food = getPetFoodById(foodId);

    // 扣星星
    var spendResult = spendStars(food.cost);
    if (!spendResult.success) {
      return { success: false, reason: "扣除星星失敗" };
    }

    // 餵食
    var feedResult = feedPet();

    // 取得新心情
    var moodResult = getCurrentMood();

    return {
      success: true,
      food: food,
      newMood: moodResult.mood,
      fedCount: feedResult.fedCount,
      starsRemaining: spendResult.remaining,
    };
  }

  // =========================================
  // 配件購買邏輯
  // =========================================

  /**
   * 檢查是否能購買配件
   * @param {string} accId
   * @returns {{ canBuy: boolean, reason?: string, cost: number }}
   */
  function canBuyAccessory(accId) {
    var acc = getPetAccessoryById(accId);
    if (!acc) {
      return { canBuy: false, reason: "配件不存在", cost: 0 };
    }

    // 等級門檻檢查
    var currentLevel = calculateLevel(getTotalStars());
    var requiredLevel = acc.unlockLevel || 1;
    if (currentLevel < requiredLevel) {
      var levelDef = getLevelDefinition(requiredLevel);
      var levelName = levelDef
        ? levelDef.icon + " " + levelDef.name
        : "等級 " + requiredLevel;
      return {
        canBuy: false,
        reason: "小雞達到" + levelName + "才能解鎖",
        cost: acc.cost,
        locked: true,
        requiredLevel: requiredLevel,
      };
    }

    if (hasPetAccessory(accId)) {
      return { canBuy: false, reason: "已擁有此配件", cost: acc.cost };
    }

    var available = getAvailableStars();
    if (available < acc.cost) {
      return {
        canBuy: false,
        reason: "星星不足（需要 " + acc.cost + "⭐，目前 " + available + "⭐）",
        cost: acc.cost,
      };
    }

    return { canBuy: true, cost: acc.cost };
  }

  /**
   * 購買配件
   * @param {string} accId
   * @returns {{ success: boolean, reason?: string, accessory?: Object, starsRemaining?: number }}
   */
  function buyAccessory(accId) {
    var check = canBuyAccessory(accId);
    if (!check.canBuy) {
      return { success: false, reason: check.reason };
    }

    var acc = getPetAccessoryById(accId);

    var spendResult = spendStars(acc.cost);
    if (!spendResult.success) {
      return { success: false, reason: "扣除星星失敗" };
    }

    addPetAccessory(accId);

    return {
      success: true,
      accessory: acc,
      starsRemaining: spendResult.remaining,
    };
  }

  // =========================================
  // 查詢 API
  // =========================================

  /**
   * 取得寵物完整狀態（供 UI 渲染用）
   *
   * @returns {{
   *   stage: Object,
   *   mood: Object,
   *   fedCount: number,
   *   accessories: Array<{ accessory: Object, owned: boolean }>,
   *   totalStars: number,
   *   availableStars: number,
   *   progress: Object
   * }}
   */
  function getFullPetStatus() {
    var growth = getGrowthStage();
    var moodResult = getCurrentMood();
    var state = getPetState();

    var allAcc = getAllPetAccessories();
    var currentLevel = calculateLevel(growth.totalStars);
    var accessories = allAcc.map(function (acc) {
      var requiredLevel = acc.unlockLevel || 1;
      return {
        accessory: acc,
        owned: hasPetAccessory(acc.id),
        locked: currentLevel < requiredLevel,
        requiredLevel: requiredLevel,
      };
    });

    return {
      stage: growth.stage,
      mood: moodResult.mood,
      fedCount: state.fedCount || 0,
      accessories: accessories,
      totalStars: growth.totalStars,
      availableStars: getAvailableStars(),
      progress: growth.progress,
    };
  }

  // =========================================
  // 匯出
  // =========================================

  return {
    getGrowthStage: getGrowthStage,
    getCurrentMood: getCurrentMood,
    canFeed: canFeed,
    feed: feed,
    canBuyAccessory: canBuyAccessory,
    buyAccessory: buyAccessory,
    getFullPetStatus: getFullPetStatus,
  };
})();

// =========================================
// 全域匯出
// =========================================

if (typeof window !== "undefined") {
  window.PetManager = PetManager;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = PetManager;
}
