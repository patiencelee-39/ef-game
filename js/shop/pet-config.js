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

// ─── 心情×階段 語句庫 ───
// petSpeech[mood][level] = ["phrase", ...]
// 點擊寵物時依據目前心情 + 成長等級抽取語句

var PET_SPEECH = {
  hungry: {
    1: ["肚子好餓…🥚", "嗚嗚，餵我…😢", "好餓好餓…💧"],
    2: ["嘰嘰…好餓…🐣", "給我吃東西～😢", "肚子咕嚕叫…💧"],
    3: ["好餓呀！快餵我！🐥", "嗚～好想吃東西…", "餓到飛不動了…💦"],
    4: ["大王餓了！快上菜！🐓", "咕嚕嚕～餓到沒力了…", "身為大王…也是會餓…"],
    5: ["王者之腹…在呼喚…🦅", "連金鷹也需要吃飯呢…", "好想吃星星糖…✨"],
  },
  normal: {
    1: ["……💤", "嗯…🥚", "我在蛋裡面～"],
    2: ["嘰嘰！🐣", "嗨嗨～", "外面好新鮮！✨"],
    3: ["咕咕！🐥", "今天天氣好好～☀️", "想出去玩！🎮"],
    4: ["咕咕咕！🐓", "身為大王很悠閒～", "來找我玩嘛～🎵"],
    5: ["嘎～🦅", "翱翔中～✨", "彩虹山頂風景真好！🏔️"],
  },
  happy: {
    1: ["嘻嘻～🥚💕", "蛋蛋好開心！", "搖啊搖～🎵"],
    2: ["好開心！🐣✨", "破殼的世界好讚！", "嘰嘰嘰！💕"],
    3: ["開心開心！🐥🎵", "最喜歡你了！❤️", "一起玩！😆"],
    4: ["大王心情很好！🐓✨", "咕咕咕咕咕！🎶", "今天也很厲害喔！💪"],
    5: ["金鷹王者…微笑中 🦅✨", "展翅翱翔的感覺真好！", "你是最棒的夥伴！❤️"],
  },
  excited: {
    1: ["哇哇哇！🥚🎉", "蛋蛋超級開心！！", "要破殼了嗎！？✨✨"],
    2: ["超開心！！🐣🎉🎉", "嘰嘰嘰嘰嘰！！！", "太幸福了～💕💕"],
    3: ["太棒了太棒了！！🐥🎊", "飛起來了！！✈️", "愛死你了！！❤️❤️"],
    4: [
      "大王超級開心！！🐓🎉🎉",
      "整個王國都是快樂的！👑",
      "咕咕嗚嗚呼呼！！🎶",
    ],
    5: [
      "金鷹王者大滿足！🦅🎊🎊",
      "彩虹山都在閃耀！✨✨✨",
      "最強最棒的冒險夥伴！🏆❤️",
    ],
  },
};

// 連擊特殊語句（combo ≥ 5 時使用）
var PET_COMBO_PHRASES = [
  "哇！好多愛心！❤️❤️❤️",
  "好癢好癢！停不下來～🤣",
  "你好喜歡我嗎！？💕💕💕",
  "頭好暈～但好開心！🌀✨",
  "超級 combo！！🎊🎊🎊",
];

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

/**
 * 產生寵物心情語音檔案路徑
 * @param {string} moodId - 'hungry'|'normal'|'happy'|'excited'
 * @param {number} level - 1~5
 * @param {number} index - 0, 1, 2
 * @returns {string} e.g. 'audio/voice/pet/voice-pet-hungry-lv1-a.mp3'
 */
function getPetSpeechVoiceFile(moodId, level, index) {
  var suffix = ["a", "b", "c"][index] || "a";
  return (
    "audio/voice/pet/voice-pet-" +
    moodId +
    "-lv" +
    level +
    "-" +
    suffix +
    ".mp3"
  );
}

/**
 * 產生寵物連擊語音檔案路徑
 * @param {number} index - 0~4
 * @returns {string} e.g. 'audio/voice/pet/voice-pet-combo-1.mp3'
 */
function getPetComboVoiceFile(index) {
  return "audio/voice/pet/voice-pet-combo-" + (index + 1) + ".mp3";
}

// =========================================
// 匯出
// =========================================

if (typeof window !== "undefined") {
  window.PET_MOODS = PET_MOODS;
  window.PET_FOODS = PET_FOODS;
  window.PET_ACCESSORIES = PET_ACCESSORIES;
  window.PET_MOOD_RULES = PET_MOOD_RULES;
  window.PET_SPEECH = PET_SPEECH;
  window.PET_COMBO_PHRASES = PET_COMBO_PHRASES;
  window.getPetFoodById = getPetFoodById;
  window.getPetAccessoryById = getPetAccessoryById;
  window.getAllPetFoods = getAllPetFoods;
  window.getAllPetAccessories = getAllPetAccessories;
  window.getPetSpeechVoiceFile = getPetSpeechVoiceFile;
  window.getPetComboVoiceFile = getPetComboVoiceFile;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    PET_MOODS,
    PET_FOODS,
    PET_ACCESSORIES,
    PET_MOOD_RULES,
    PET_SPEECH,
    PET_COMBO_PHRASES,
    getPetFoodById,
    getPetAccessoryById,
    getAllPetFoods,
    getAllPetAccessories,
    getPetSpeechVoiceFile,
    getPetComboVoiceFile,
  };
}
