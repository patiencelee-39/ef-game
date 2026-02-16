/**
 * ============================================
 * 養電子雞 — 寵物定義（純資料）
 * ============================================
 * 對應功能：P3 養電子雞（等級 = 雞的成長）
 * 說明：寵物成長階段直接複用 LEVEL_DEFINITIONS
 *       食物 & 配件是花星星購買的裝飾
 *       純資料模組，不碰 DOM、不碰 Storage
 * 依賴：level-calculator.js（LEVEL_DEFINITIONS）
 * ============================================
 */

// =========================================
// 寵物成長階段（映射自等級系統）
// =========================================

/**
 * 寵物成長階段 = 等級系統
 * 不另外定義 → 直接複用 LEVEL_DEFINITIONS
 *
 * Level 1 (0-10⭐)  → 🥚 蛋寶寶 → 還在蛋裡
 * Level 2 (11-20⭐) → 🐣 破殼雞 → 剛破殼
 * Level 3 (21-40⭐) → 🐥 小雞仔 → 活潑長大
 * Level 4 (41-60⭐) → 🐓 雞大王 → 威風凜凜
 * Level 5 (61+⭐)   → 🦅 金鷹王者 → 最終形態
 *
 * 取得方式：getLevelByStars(totalStars)
 */

// =========================================
// 寵物心情定義
// =========================================

var PET_MOODS = {
  hungry: {
    id: "hungry",
    label: "肚子餓",
    emoji: "😢",
    animation: "pet-hungry",
  },
  normal: {
    id: "normal",
    label: "普通",
    emoji: "😐",
    animation: "pet-idle",
  },
  happy: {
    id: "happy",
    label: "開心",
    emoji: "😊",
    animation: "pet-happy",
  },
  excited: {
    id: "excited",
    label: "超開心",
    emoji: "🤩",
    animation: "pet-excited",
  },
};

// =========================================
// 食物定義（花星星餵食）
// =========================================

/**
 * @property {string} id    - 唯一識別碼
 * @property {string} name  - 顯示名稱
 * @property {string} emoji - 展示 emoji
 * @property {number} cost  - 花費星星數
 * @property {number} moodBoost - 心情提升值（累計 3 次 → happy, 5 次 → excited）
 * @property {number} unlockLevel - 解鎖所需小雞等級（1-5）
 * @property {string} desc  - 描述
 */
var PET_FOODS = [
  {
    id: "food-grain",
    name: "穀物",
    emoji: "🌾",
    cost: 2,
    moodBoost: 1,
    unlockLevel: 1,
    desc: "基本的穀物飼料",
  },
  {
    id: "food-worm",
    name: "蟲蟲大餐",
    emoji: "🪱",
    cost: 3,
    moodBoost: 2,
    unlockLevel: 2,
    desc: "雞最愛的蟲蟲！",
  },
  {
    id: "food-cake",
    name: "小蛋糕",
    emoji: "🍰",
    cost: 5,
    moodBoost: 3,
    unlockLevel: 3,
    desc: "特別的生日蛋糕",
  },
  {
    id: "food-star-candy",
    name: "星星糖",
    emoji: "🍬",
    cost: 4,
    moodBoost: 2,
    unlockLevel: 2,
    desc: "閃閃發光的星星糖果",
  },
];

// =========================================
// 寵物配件定義（裝飾用）
// =========================================

/**
 * @property {string} id       - 唯一識別碼
 * @property {string} name     - 顯示名稱
 * @property {string} emoji    - 展示 emoji
 * @property {number} cost     - 花費星星數
 * @property {string} position - 裝飾位置（top | left | right | bottom）
 * @property {number} unlockLevel - 解鎖所需小雞等級（1-5）
 * @property {string} desc     - 描述
 */
var PET_ACCESSORIES = [
  {
    id: "pet-hat",
    name: "小帽子",
    emoji: "🎩",
    cost: 5,
    position: "top",
    unlockLevel: 1,
    desc: "帥氣的小帽子",
  },
  {
    id: "pet-scarf",
    name: "圍巾",
    emoji: "🧣",
    cost: 6,
    position: "bottom",
    unlockLevel: 2,
    desc: "暖暖的紅圍巾",
  },
  {
    id: "pet-glasses",
    name: "眼鏡",
    emoji: "👓",
    cost: 5,
    position: "center",
    unlockLevel: 2,
    desc: "學者風的圓眼鏡",
  },
  {
    id: "pet-ribbon",
    name: "蝴蝶結",
    emoji: "🎀",
    cost: 5,
    position: "top",
    unlockLevel: 1,
    desc: "可愛的蝴蝶結",
  },
  {
    id: "pet-medal",
    name: "勳章",
    emoji: "🏅",
    cost: 8,
    position: "center",
    unlockLevel: 3,
    desc: "勇者的榮譽勳章",
  },
  {
    id: "pet-cape",
    name: "披風",
    emoji: "🦸",
    cost: 10,
    position: "right",
    unlockLevel: 4,
    desc: "超級英雄披風",
  },
  {
    id: "pet-crown",
    name: "小皇冠",
    emoji: "👑",
    cost: 12,
    position: "top",
    unlockLevel: 5,
    desc: "尊貴的小皇冠",
  },
];

// =========================================
// 心情計算規則
// =========================================

/**
 * 心情衰減規則（距離上次餵食經過的時間）
 * 單位：毫秒
 */
var PET_MOOD_RULES = {
  HAPPY_DURATION_MS: 2 * 60 * 60 * 1000, // 餵食後 2 小時內保持 happy
  HUNGRY_AFTER_MS: 24 * 60 * 60 * 1000, // 超過 24 小時未餵 → hungry
  MOOD_BOOST_HAPPY: 3, // 累計餵食 3 次以上 → happy
  MOOD_BOOST_EXCITED: 5, // 累計餵食 5 次以上 → excited
};

// =========================================
// 查詢工具函式
// =========================================

/**
 * 依 ID 取得食物定義
 * @param {string} foodId
 * @returns {Object|null}
 */
function getPetFoodById(foodId) {
  for (var i = 0; i < PET_FOODS.length; i++) {
    if (PET_FOODS[i].id === foodId) return PET_FOODS[i];
  }
  return null;
}

/**
 * 依 ID 取得配件定義
 * @param {string} accId
 * @returns {Object|null}
 */
function getPetAccessoryById(accId) {
  for (var i = 0; i < PET_ACCESSORIES.length; i++) {
    if (PET_ACCESSORIES[i].id === accId) return PET_ACCESSORIES[i];
  }
  return null;
}

/**
 * 取得所有食物
 * @returns {Object[]}
 */
function getAllPetFoods() {
  return PET_FOODS.slice();
}

/**
 * 取得所有配件
 * @returns {Object[]}
 */
function getAllPetAccessories() {
  return PET_ACCESSORIES.slice();
}

// =========================================
// 匯出
// =========================================

if (typeof window !== "undefined") {
  window.PET_MOODS = PET_MOODS;
  window.PET_FOODS = PET_FOODS;
  window.PET_ACCESSORIES = PET_ACCESSORIES;
  window.PET_MOOD_RULES = PET_MOOD_RULES;
  window.getPetFoodById = getPetFoodById;
  window.getPetAccessoryById = getPetAccessoryById;
  window.getAllPetFoods = getAllPetFoods;
  window.getAllPetAccessories = getAllPetAccessories;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    PET_MOODS,
    PET_FOODS,
    PET_ACCESSORIES,
    PET_MOOD_RULES,
    getPetFoodById,
    getPetAccessoryById,
    getAllPetFoods,
    getAllPetAccessories,
  };
}
