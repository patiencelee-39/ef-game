/**
 * ============================================
 * 貼紙圖鑑 — 貼紙管理器（業務邏輯）
 * ============================================
 * 對應功能：P1 貼紙圖鑑（購買功能）
 * 說明：開包抽獎、收藏查詢、統計計算
 *       高內聚 — 所有貼紙業務邏輯集中於此
 *       不碰 DOM — 純邏輯模組
 * 依賴：
 *   - sticker-config.js（貼紙定義資料）
 *   - storage.js（spendStars, getStickerCollection 等）
 *   - game-config.js（SHOP.STICKER_PACK_COST）
 *   - level-calculator.js（calculateLevel）
 * ============================================
 */

var StickerManager = (function () {
  "use strict";

  // =========================================
  // 開包核心邏輯
  // =========================================

  /**
   * 依稀有度權重隨機抽取一張貼紙
   * 優先抽取未擁有的貼紙（保底機制）
   *
   * @returns {Object} { sticker: Object, isNew: boolean }
   */
  function _drawOneSticker() {
    var collection = getStickerCollection();
    var owned = collection.ownedStickers || [];

    // 0. 取得目前小雞等級，只從已解鎖貼紙池中抽取
    var currentLevel = calculateLevel(getTotalStars());
    var unlockedPool = getStickersByMaxLevel(currentLevel);

    // 1. 篩選未擁有的貼紙（在已解鎖範圍內）
    var unowned = unlockedPool.filter(function (s) {
      return owned.indexOf(s.id) === -1;
    });

    // 2. 如果已解鎖的全部收集完，從已解鎖池隨機（標記為重複）
    var pool = unowned.length > 0 ? unowned : unlockedPool;
    var isGuaranteedNew = unowned.length > 0;

    // 3. 依稀有度權重抽取
    var picked = _weightedRandom(pool);

    return {
      sticker: picked,
      isNew: isGuaranteedNew && owned.indexOf(picked.id) === -1,
    };
  }

  /**
   * 依稀有度權重隨機選取
   * @param {Object[]} pool - 貼紙候選池
   * @returns {Object} 被選中的貼紙定義
   */
  function _weightedRandom(pool) {
    // 計算總權重
    var totalWeight = 0;
    var weights = [];

    for (var i = 0; i < pool.length; i++) {
      var rarity = STICKER_RARITY[pool[i].rarity];
      var w = rarity ? rarity.weight : 50;
      weights.push(w);
      totalWeight += w;
    }

    // 隨機選擇
    var rand = Math.random() * totalWeight;
    var cumulative = 0;

    for (var j = 0; j < pool.length; j++) {
      cumulative += weights[j];
      if (rand <= cumulative) {
        return pool[j];
      }
    }

    // fallback（理論上不會走到）
    return pool[pool.length - 1];
  }

  // =========================================
  // 公開 API
  // =========================================

  /**
   * 檢查是否能開包（星星足夠）
   * @returns {{ canOpen: boolean, cost: number, available: number }}
   */
  function canOpenPack() {
    var cost = GAME_CONFIG.SHOP.STICKER_PACK_COST;
    var available = getAvailableStars();
    return {
      canOpen: available >= cost,
      cost: cost,
      available: available,
    };
  }

  /**
   * 開一包貼紙（扣星星 → 抽取 → 儲存）
   *
   * @returns {{
   *   success: boolean,
   *   reason?: string,
   *   results?: Array<{ sticker: Object, isNew: boolean }>,
   *   starsSpent?: number,
   *   starsRemaining?: number
   * }}
   */
  function openPack() {
    var check = canOpenPack();
    if (!check.canOpen) {
      return {
        success: false,
        reason:
          "星星不足（需要 " +
          check.cost +
          "⭐，目前 " +
          check.available +
          "⭐）",
      };
    }

    // 1. 扣除星星
    var spendResult = spendStars(check.cost);
    if (!spendResult.success) {
      return { success: false, reason: "扣除星星失敗" };
    }

    // 2. 抽取貼紙
    var count = GAME_CONFIG.SHOP.STICKERS_PER_PACK || 1;
    var results = [];

    for (var i = 0; i < count; i++) {
      var draw = _drawOneSticker();

      // 3. 儲存到收藏
      var saved = addSticker(draw.sticker.id);
      results.push({
        sticker: draw.sticker,
        isNew: saved.isNew,
      });
    }

    return {
      success: true,
      results: results,
      starsSpent: check.cost,
      starsRemaining: spendResult.remaining,
    };
  }

  /**
   * 取得圖鑑統計資料
   *
   * @returns {{
   *   totalDefined: number,
   *   totalOwned: number,
   *   completionPercent: number,
   *   openedPacks: number,
   *   byCategory: Array<{ category: Object, total: number, owned: number }>,
   *   byRarity: Object<string, { total: number, owned: number }>
   * }}
   */
  function getCollectionStats() {
    var collection = getStickerCollection();
    var owned = collection.ownedStickers || [];
    var totalDefined = STICKER_DEFINITIONS.length;
    var totalOwned = owned.length;

    // 依分類統計
    var byCategory = STICKER_CATEGORIES.map(function (cat) {
      var catStickers = getStickersByCategory(cat.id);
      var catOwned = catStickers.filter(function (s) {
        return owned.indexOf(s.id) !== -1;
      });
      return {
        category: cat,
        total: catStickers.length,
        owned: catOwned.length,
      };
    });

    // 依稀有度統計
    var byRarity = {};
    Object.keys(STICKER_RARITY).forEach(function (key) {
      var rarityStickers = getStickersByRarity(key);
      var rarityOwned = rarityStickers.filter(function (s) {
        return owned.indexOf(s.id) !== -1;
      });
      byRarity[key] = {
        total: rarityStickers.length,
        owned: rarityOwned.length,
      };
    });

    // 解鎖統計
    var currentLevel = calculateLevel(getTotalStars());
    var unlockedCount = getStickersByMaxLevel(currentLevel).length;

    return {
      totalDefined: totalDefined,
      totalOwned: totalOwned,
      totalUnlocked: unlockedCount,
      completionPercent:
        totalDefined > 0 ? Math.round((totalOwned / totalDefined) * 100) : 0,
      unlockedPercent:
        totalDefined > 0 ? Math.round((unlockedCount / totalDefined) * 100) : 0,
      openedPacks: collection.openedPacks || 0,
      byCategory: byCategory,
      byRarity: byRarity,
    };
  }

  /**
   * 取得所有貼紙含擁有狀態（供 UI 渲染用）
   *
   * @param {string} [filterCategory] - 可選：篩選分類
   * @returns {Array<{ sticker: Object, owned: boolean, rarity: Object, locked: boolean, requiredLevel: number }>}
   */
  function getAllStickersWithStatus(filterCategory) {
    var collection = getStickerCollection();
    var owned = collection.ownedStickers || [];
    var currentLevel = calculateLevel(getTotalStars());

    var pool = filterCategory
      ? getStickersByCategory(filterCategory)
      : STICKER_DEFINITIONS;

    return pool.map(function (s) {
      var requiredLevel = s.unlockLevel || 1;
      return {
        sticker: s,
        owned: owned.indexOf(s.id) !== -1,
        rarity: STICKER_RARITY[s.rarity] || STICKER_RARITY.common,
        locked: currentLevel < requiredLevel,
        requiredLevel: requiredLevel,
      };
    });
  }

  /**
   * 檢查是否全部收集完成
   * @returns {boolean}
   */
  function isCollectionComplete() {
    var stats = getCollectionStats();
    return stats.totalOwned >= stats.totalDefined;
  }

  // =========================================
  // 匯出（Revealing Module Pattern）
  // =========================================

  return {
    canOpenPack: canOpenPack,
    openPack: openPack,
    getCollectionStats: getCollectionStats,
    getAllStickersWithStatus: getAllStickersWithStatus,
    isCollectionComplete: isCollectionComplete,
  };
})();

// =========================================
// 全域匯出
// =========================================

if (typeof window !== "undefined") {
  window.StickerManager = StickerManager;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = StickerManager;
}
