/**
 * ============================================
 * 換裝商店 — 商店管理器（業務邏輯）
 * ============================================
 * 對應功能：P2 換裝/頭像商店
 * 說明：購買、裝備、查詢邏輯
 *       高內聚 — 所有換裝業務邏輯集中於此
 *       不碰 DOM — 純邏輯模組
 * 依賴：
 *   - avatar-config.js（物品定義資料）
 *   - storage.js（spendStars, getAvatarData 等）
 *   - level-calculator.js（calculateLevel, getLevelDefinition）
 *   - game-config.js（SHOP 設定）
 * ============================================
 */

var AvatarManager = (function () {
  "use strict";

  // =========================================
  // 購買邏輯
  // =========================================

  /**
   * 檢查是否能購買某物品
   * @param {string} itemId
   * @returns {{ canBuy: boolean, reason?: string, cost: number, available: number }}
   */
  function canBuyItem(itemId) {
    var item = getAvatarItemById(itemId);
    if (!item) {
      return { canBuy: false, reason: "物品不存在", cost: 0, available: 0 };
    }

    // 等級門檻檢查
    var currentLevel = calculateLevel(getTotalStars());
    var requiredLevel = item.unlockLevel || 1;
    if (currentLevel < requiredLevel) {
      var levelDef = getLevelDefinition(requiredLevel);
      var levelName = levelDef
        ? levelDef.icon + " " + levelDef.name
        : "等級 " + requiredLevel;
      return {
        canBuy: false,
        reason: "小雞達到" + levelName + "才能解鎖",
        cost: item.cost,
        available: getAvailableStars(),
        locked: true,
        requiredLevel: requiredLevel,
      };
    }

    if (hasAvatarItem(itemId)) {
      return {
        canBuy: false,
        reason: "已擁有此物品",
        cost: item.cost,
        available: getAvailableStars(),
      };
    }

    var available = getAvailableStars();
    if (available < item.cost) {
      return {
        canBuy: false,
        reason:
          "星星不足（需要 " + item.cost + "⭐，目前 " + available + "⭐）",
        cost: item.cost,
        available: available,
      };
    }

    return { canBuy: true, cost: item.cost, available: available };
  }

  /**
   * 購買物品（扣星星 → 加入收藏）
   * @param {string} itemId
   * @returns {{ success: boolean, reason?: string, item?: Object, starsRemaining?: number }}
   */
  function buyItem(itemId) {
    var check = canBuyItem(itemId);
    if (!check.canBuy) {
      return { success: false, reason: check.reason };
    }

    var item = getAvatarItemById(itemId);

    // 扣星星
    var spendResult = spendStars(item.cost);
    if (!spendResult.success) {
      return { success: false, reason: "扣除星星失敗" };
    }

    // 加入收藏
    addAvatarItem(itemId);

    return {
      success: true,
      item: item,
      starsRemaining: spendResult.remaining,
    };
  }

  // =========================================
  // 裝備邏輯
  // =========================================

  /**
   * 裝備物品到指定欄位
   * @param {string} itemId
   * @returns {{ success: boolean, reason?: string }}
   */
  function equip(itemId) {
    if (!hasAvatarItem(itemId)) {
      return { success: false, reason: "尚未擁有此物品" };
    }

    var item = getAvatarItemById(itemId);
    if (!item) {
      return { success: false, reason: "物品不存在" };
    }

    equipAvatarItem(item.category, itemId);
    return { success: true };
  }

  /**
   * 卸下指定欄位的裝備
   * @param {string} slot - 'frame' | 'accessory'
   * @returns {boolean}
   */
  function unequip(slot) {
    equipAvatarItem(slot, null);
    return true;
  }

  // =========================================
  // 查詢 API
  // =========================================

  /**
   * 取得所有物品含擁有/裝備狀態（供 UI 渲染）
   * @param {string} [filterCategory]
   * @returns {Array<{ item: Object, owned: boolean, equipped: boolean }>}
   */
  function getAllItemsWithStatus(filterCategory) {
    var avatarData = getAvatarData();
    var owned = avatarData.ownedItems || [];
    var equipped = avatarData.equipped || {};
    var currentLevel = calculateLevel(getTotalStars());

    var pool = filterCategory
      ? getAvatarItemsByCategory(filterCategory)
      : AVATAR_ITEMS;

    return pool.map(function (item) {
      var requiredLevel = item.unlockLevel || 1;
      return {
        item: item,
        owned: owned.indexOf(item.id) !== -1,
        equipped: equipped[item.category] === item.id,
        locked: currentLevel < requiredLevel,
        requiredLevel: requiredLevel,
      };
    });
  }

  /**
   * 取得收藏統計
   * @returns {{ totalItems: number, ownedCount: number, completionPercent: number }}
   */
  function getShopStats() {
    var avatarData = getAvatarData();
    var owned = (avatarData.ownedItems || []).length;
    var total = AVATAR_ITEMS.length;
    return {
      totalItems: total,
      ownedCount: owned,
      completionPercent: total > 0 ? Math.round((owned / total) * 100) : 0,
    };
  }

  // =========================================
  // 匯出
  // =========================================

  return {
    canBuyItem: canBuyItem,
    buyItem: buyItem,
    equip: equip,
    unequip: unequip,
    getAllItemsWithStatus: getAllItemsWithStatus,
    getShopStats: getShopStats,
  };
})();

// =========================================
// 全域匯出
// =========================================

if (typeof window !== "undefined") {
  window.AvatarManager = AvatarManager;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = AvatarManager;
}
