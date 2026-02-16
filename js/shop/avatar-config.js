/**
 * ============================================
 * 換裝商店 — 物品定義（純資料）
 * ============================================
 * 對應功能：P2 換裝/頭像商店
 * 說明：頭像框、配飾的定義資料
 *       純資料模組，不碰 DOM、不碰 Storage
 *       未來擴增物品只需在 AVATAR_ITEMS 新增物件
 * 依賴：無（可獨立運作）
 * ============================================
 */

// =========================================
// 物品分類
// =========================================

var AVATAR_CATEGORIES = [
  {
    id: "frame",
    label: "🖼️ 頭像框",
    description: "裝飾你的頭像邊框",
    slot: "frame",
  },
  {
    id: "accessory",
    label: "✨ 配飾",
    description: "閃亮的裝飾品",
    slot: "accessory",
  },
];

// =========================================
// 物品定義
// =========================================

/**
 * @property {string} id       - 唯一識別碼
 * @property {string} name     - 顯示名稱
 * @property {string} emoji    - 展示用 emoji
 * @property {string} category - 所屬分類（frame | accessory）
 * @property {number} cost     - 購買價格（⭐）
 * @property {string} cssClass - 套用的 CSS class（用於展示效果）
 * @property {number} unlockLevel - 解鎖所需小雞等級（1-5）
 * @property {string} desc     - 簡短描述
 */
var AVATAR_ITEMS = [
  // ─── 🖼️ 頭像框 ───
  {
    id: "frame-ocean",
    name: "海洋之框",
    emoji: "🌊",
    category: "frame",
    cost: 5,
    cssClass: "avatar-frame-ocean",
    unlockLevel: 1,
    desc: "波浪紋的海洋邊框",
  },
  {
    id: "frame-star",
    name: "星星之框",
    emoji: "⭐",
    category: "frame",
    cost: 8,
    cssClass: "avatar-frame-star",
    unlockLevel: 2,
    desc: "閃亮星星裝飾邊框",
  },
  {
    id: "frame-rainbow",
    name: "彩虹之框",
    emoji: "🌈",
    category: "frame",
    cost: 10,
    cssClass: "avatar-frame-rainbow",
    unlockLevel: 3,
    desc: "七彩繽紛的彩虹邊框",
  },
  {
    id: "frame-fire",
    name: "火焰之框",
    emoji: "🔥",
    category: "frame",
    cost: 12,
    cssClass: "avatar-frame-fire",
    unlockLevel: 4,
    desc: "熊熊燃燒的火焰邊框",
  },
  {
    id: "frame-crown",
    name: "皇冠之框",
    emoji: "👑",
    category: "frame",
    cost: 15,
    cssClass: "avatar-frame-crown",
    unlockLevel: 5,
    desc: "王者專屬的皇冠邊框",
  },

  // ─── ✨ 配飾 ───
  {
    id: "acc-bow",
    name: "蝴蝶結",
    emoji: "🎀",
    category: "accessory",
    cost: 5,
    cssClass: "avatar-acc-bow",
    unlockLevel: 1,
    desc: "可愛的粉紅蝴蝶結",
  },
  {
    id: "acc-sunglasses",
    name: "太陽眼鏡",
    emoji: "🕶️",
    category: "accessory",
    cost: 6,
    cssClass: "avatar-acc-sunglasses",
    unlockLevel: 2,
    desc: "帥氣的太陽眼鏡",
  },
  {
    id: "acc-flower",
    name: "小花朵",
    emoji: "🌸",
    category: "accessory",
    cost: 5,
    cssClass: "avatar-acc-flower",
    unlockLevel: 1,
    desc: "春天的小花裝飾",
  },
  {
    id: "acc-sparkle",
    name: "閃閃發光",
    emoji: "✨",
    category: "accessory",
    cost: 8,
    cssClass: "avatar-acc-sparkle",
    unlockLevel: 3,
    desc: "全身閃閃發光特效",
  },
  {
    id: "acc-heart",
    name: "愛心泡泡",
    emoji: "💕",
    category: "accessory",
    cost: 10,
    cssClass: "avatar-acc-heart",
    unlockLevel: 4,
    desc: "飄出愛心泡泡",
  },
  {
    id: "acc-wings",
    name: "天使翅膀",
    emoji: "👼",
    category: "accessory",
    cost: 15,
    cssClass: "avatar-acc-wings",
    unlockLevel: 5,
    desc: "傳說中的天使翅膀",
  },
];

// =========================================
// 查詢工具函式
// =========================================

/**
 * 依 ID 取得物品定義
 * @param {string} itemId
 * @returns {Object|null}
 */
function getAvatarItemById(itemId) {
  for (var i = 0; i < AVATAR_ITEMS.length; i++) {
    if (AVATAR_ITEMS[i].id === itemId) return AVATAR_ITEMS[i];
  }
  return null;
}

/**
 * 依分類篩選物品
 * @param {string} categoryId
 * @returns {Object[]}
 */
function getAvatarItemsByCategory(categoryId) {
  return AVATAR_ITEMS.filter(function (item) {
    return item.category === categoryId;
  });
}

/**
 * 取得所有物品總數
 * @returns {number}
 */
function getTotalAvatarItemCount() {
  return AVATAR_ITEMS.length;
}

// =========================================
// 匯出
// =========================================

if (typeof window !== "undefined") {
  window.AVATAR_CATEGORIES = AVATAR_CATEGORIES;
  window.AVATAR_ITEMS = AVATAR_ITEMS;
  window.getAvatarItemById = getAvatarItemById;
  window.getAvatarItemsByCategory = getAvatarItemsByCategory;
  window.getTotalAvatarItemCount = getTotalAvatarItemCount;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    AVATAR_CATEGORIES,
    AVATAR_ITEMS,
    getAvatarItemById,
    getAvatarItemsByCategory,
    getTotalAvatarItemCount,
  };
}
