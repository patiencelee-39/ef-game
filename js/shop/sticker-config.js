/**
 * ============================================
 * 貼紙圖鑑 — 貼紙定義（純資料）
 * ============================================
 * 對應功能：P1 貼紙圖鑑（購買功能）
 * 說明：所有貼紙的定義資料
 *       純資料模組，不碰 DOM、不碰 Storage
 *       未來擴增貼紙只需在 STICKER_DEFINITIONS 新增物件
 * 依賴：無（可獨立運作）
 * ============================================
 */

// =========================================
// 稀有度定義
// =========================================

/**
 * 稀有度等級及其抽中機率權重
 * 權重越高 → 越容易抽到
 */
var STICKER_RARITY = {
  common: {
    id: "common",
    label: "普通",
    color: "#95a5a6",
    weight: 60, // 60% 機率
  },
  rare: {
    id: "rare",
    label: "稀有",
    color: "#3498db",
    weight: 30, // 30% 機率
  },
  legendary: {
    id: "legendary",
    label: "傳說",
    color: "#f39c12",
    weight: 10, // 10% 機率
  },
};

// =========================================
// 貼紙分類定義
// =========================================

/**
 * 貼紙分類，方便 UI 分頁顯示
 * 未來新增類別只需加入此陣列
 */
var STICKER_CATEGORIES = [
  { id: "ocean", label: "🌊 海洋生物", description: "來自深海的朋友們" },
  { id: "land", label: "🌿 陸地動物", description: "草原森林的夥伴" },
  { id: "sky", label: "🌤️ 天空飛行", description: "在天空翱翔的身影" },
  { id: "special", label: "✨ 特殊系列", description: "超稀有的神秘收藏" },
];

// =========================================
// 貼紙定義（核心資料）
// =========================================

/**
 * 每張貼紙的定義
 * @property {string} id        - 唯一識別碼（不可重複）
 * @property {string} name      - 顯示名稱
 * @property {string} emoji     - 展示用 emoji
 * @property {string} category  - 所屬分類（對應 STICKER_CATEGORIES.id）
 * @property {string} rarity    - 稀有度（對應 STICKER_RARITY key）
 * @property {number} unlockLevel - 解鎖所需小雞等級（1-5）
 * @property {string} desc      - 簡短描述（圖鑑說明）
 */
var STICKER_DEFINITIONS = [
  // ─── 🌊 海洋生物 ───
  {
    id: "clownfish",
    name: "小丑魚",
    emoji: "🐠",
    category: "ocean",
    rarity: "common",
    unlockLevel: 1,
    desc: "色彩繽紛的小丑魚",
  },
  {
    id: "octopus",
    name: "章魚",
    emoji: "🐙",
    category: "ocean",
    rarity: "common",
    unlockLevel: 1,
    desc: "八隻腳的聰明章魚",
  },
  {
    id: "turtle",
    name: "海龜",
    emoji: "🐢",
    category: "ocean",
    rarity: "common",
    unlockLevel: 1,
    desc: "慢慢游的海龜爺爺",
  },
  {
    id: "dolphin",
    name: "海豚",
    emoji: "🐬",
    category: "ocean",
    rarity: "common",
    unlockLevel: 1,
    desc: "愛跳躍的快樂海豚",
  },
  {
    id: "jellyfish",
    name: "水母",
    emoji: "🪼",
    category: "ocean",
    rarity: "rare",
    unlockLevel: 2,
    desc: "透明發光的水母",
  },
  {
    id: "whale",
    name: "鯨魚",
    emoji: "🐋",
    category: "ocean",
    rarity: "rare",
    unlockLevel: 2,
    desc: "海洋裡最大的朋友",
  },
  {
    id: "seahorse",
    name: "海馬",
    emoji: "🦑",
    category: "ocean",
    rarity: "rare",
    unlockLevel: 3,
    desc: "直立游泳的海馬寶寶",
  },
  {
    id: "narwhal",
    name: "獨角鯨",
    emoji: "🦄",
    category: "ocean",
    rarity: "legendary",
    unlockLevel: 4,
    desc: "傳說中的海洋獨角獸",
  },

  // ─── 🌿 陸地動物 ───
  {
    id: "mouse",
    name: "小老鼠",
    emoji: "🐭",
    category: "land",
    rarity: "common",
    unlockLevel: 1,
    desc: "遊戲裡的好朋友小老鼠",
  },
  {
    id: "cat",
    name: "小貓咪",
    emoji: "🐱",
    category: "land",
    rarity: "common",
    unlockLevel: 1,
    desc: "毛茸茸的小貓咪",
  },
  {
    id: "rabbit",
    name: "兔子",
    emoji: "🐰",
    category: "land",
    rarity: "common",
    unlockLevel: 1,
    desc: "長耳朵的可愛兔子",
  },
  {
    id: "bear",
    name: "棕熊",
    emoji: "🐻",
    category: "land",
    rarity: "rare",
    unlockLevel: 2,
    desc: "森林裡的大棕熊",
  },
  {
    id: "panda",
    name: "熊貓",
    emoji: "🐼",
    category: "land",
    rarity: "rare",
    unlockLevel: 3,
    desc: "愛吃竹子的圓圓熊貓",
  },
  {
    id: "unicorn",
    name: "獨角獸",
    emoji: "🦄",
    category: "land",
    rarity: "legendary",
    unlockLevel: 5,
    desc: "閃閃發光的夢幻獨角獸",
  },

  // ─── 🌤️ 天空飛行 ───
  {
    id: "chick",
    name: "小雞",
    emoji: "🐥",
    category: "sky",
    rarity: "common",
    unlockLevel: 1,
    desc: "嘰嘰叫的可愛小雞",
  },
  {
    id: "owl",
    name: "貓頭鷹",
    emoji: "🦉",
    category: "sky",
    rarity: "common",
    unlockLevel: 1,
    desc: "夜晚守護者貓頭鷹",
  },
  {
    id: "parrot",
    name: "鸚鵡",
    emoji: "🦜",
    category: "sky",
    rarity: "rare",
    unlockLevel: 2,
    desc: "會說話的彩色鸚鵡",
  },
  {
    id: "eagle",
    name: "金鷹",
    emoji: "🦅",
    category: "sky",
    rarity: "rare",
    unlockLevel: 3,
    desc: "翱翔天際的金鷹王者",
  },
  {
    id: "phoenix",
    name: "鳳凰",
    emoji: "🔥",
    category: "sky",
    rarity: "legendary",
    unlockLevel: 5,
    desc: "浴火重生的傳說之鳥",
  },

  // ─── ✨ 特殊系列 ───
  {
    id: "star",
    name: "超級星星",
    emoji: "🌟",
    category: "special",
    rarity: "rare",
    unlockLevel: 3,
    desc: "閃耀的超級星星",
  },
  {
    id: "rainbow",
    name: "彩虹",
    emoji: "🌈",
    category: "special",
    rarity: "rare",
    unlockLevel: 3,
    desc: "雨後出現的美麗彩虹",
  },
  {
    id: "crown",
    name: "皇冠",
    emoji: "👑",
    category: "special",
    rarity: "legendary",
    unlockLevel: 4,
    desc: "只有最厲害的冒險家才有",
  },
  {
    id: "dragon",
    name: "小飛龍",
    emoji: "🐉",
    category: "special",
    rarity: "legendary",
    unlockLevel: 5,
    desc: "最稀有的傳說小飛龍",
  },
];

// =========================================
// 查詢工具函式（純函式，不碰外部狀態）
// =========================================

/**
 * 依 ID 取得貼紙定義
 * @param {string} stickerId
 * @returns {Object|null}
 */
function getStickerById(stickerId) {
  for (var i = 0; i < STICKER_DEFINITIONS.length; i++) {
    if (STICKER_DEFINITIONS[i].id === stickerId) {
      return STICKER_DEFINITIONS[i];
    }
  }
  return null;
}

/**
 * 依分類篩選貼紙
 * @param {string} categoryId
 * @returns {Object[]}
 */
function getStickersByCategory(categoryId) {
  return STICKER_DEFINITIONS.filter(function (s) {
    return s.category === categoryId;
  });
}

/**
 * 依稀有度篩選貼紙
 * @param {string} rarityId
 * @returns {Object[]}
 */
function getStickersByRarity(rarityId) {
  return STICKER_DEFINITIONS.filter(function (s) {
    return s.rarity === rarityId;
  });
}

/**
 * 取得所有貼紙總數
 * @returns {number}
 */
function getTotalStickerCount() {
  return STICKER_DEFINITIONS.length;
}

/**
 * 取得指定等級以下已解鎖的貼紙
 * @param {number} level - 目前小雞等級
 * @returns {Object[]}
 */
function getStickersByMaxLevel(level) {
  return STICKER_DEFINITIONS.filter(function (s) {
    return (s.unlockLevel || 1) <= level;
  });
}

/**
 * 取得所有分類定義
 * @returns {Object[]}
 */
function getAllCategories() {
  return STICKER_CATEGORIES.slice();
}

// =========================================
// 匯出
// =========================================

if (typeof window !== "undefined") {
  window.STICKER_RARITY = STICKER_RARITY;
  window.STICKER_CATEGORIES = STICKER_CATEGORIES;
  window.STICKER_DEFINITIONS = STICKER_DEFINITIONS;
  window.getStickerById = getStickerById;
  window.getStickersByCategory = getStickersByCategory;
  window.getStickersByRarity = getStickersByRarity;
  window.getTotalStickerCount = getTotalStickerCount;
  window.getStickersByMaxLevel = getStickersByMaxLevel;
  window.getAllCategories = getAllCategories;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    STICKER_RARITY,
    STICKER_CATEGORIES,
    STICKER_DEFINITIONS,
    getStickerById,
    getStickersByCategory,
    getStickersByRarity,
    getTotalStickerCount,
    getStickersByMaxLevel,
    getAllCategories,
  };
}
