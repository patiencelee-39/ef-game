/**
 * ============================================
 * Storage 封裝模組
 * ============================================
 * 對應需求文件：§5.4
 * 說明：統一管理所有 storage 讀寫
 *       key 使用 efgame- 前綴避免與其他網站衝突
 *       所有讀取自動 JSON.parse，寫入自動 JSON.stringify
 *
 *       一般模式 → localStorage（持久保存）
 *       訪客模式 → sessionStorage（關閉分頁即消失）
 * ============================================
 */

// =========================================
// Storage Keys（統一管理所有 key）
// =========================================

const STORAGE_KEYS = {
  PLAYER_PROFILE: "efgame-player-profile",
  ADVENTURE_PROGRESS: "efgame-adventure-progress",
  CLASS_DATA: "efgame-class-data",
  STICKER_COLLECTION: "efgame-sticker-collection",
  AVATAR_DATA: "efgame-avatar-data",
  PET_STATE: "efgame-pet-state",
  // 以下 key 由其他 config 模組管理，列出供參考：
  // STIMULI_PACK: 'efgame-stimuli-pack'     → stimuli-config.js
  // SOUND_PACK:   'efgame-sound-pack'       → sound-config.js
  // SOUND_OVERRIDES: 'efgame-sound-overrides' → sound-config.js
};

// =========================================
// 通用讀寫
// =========================================

/**
 * 取得目前應使用的 Storage 物件
 * 訪客模式使用 sessionStorage（關閉分頁即消失）
 * 一般模式使用 localStorage（持久保存）
 * @returns {Storage}
 */
function _getStorage() {
  try {
    // 先查 sessionStorage 有沒有訪客旗標
    var guestFlag = sessionStorage.getItem("efgame-guest-mode");
    if (guestFlag === "true") return sessionStorage;
    // 再查 localStorage 是否有訪客 profile（舊版相容）
    var raw = localStorage.getItem(STORAGE_KEYS.PLAYER_PROFILE);
    if (raw) {
      var p = JSON.parse(raw);
      if (p && (p.nickname === "00NoName" || p.seatNumber === "00")) {
        return sessionStorage;
      }
    }
  } catch (e) {
    /* ignore */
  }
  return localStorage;
}

/**
 * 從 storage 讀取並解析 JSON
 * @param {string} key
 * @returns {*} 解析後的物件，或 null
 */
function storageGet(key) {
  try {
    var storage = _getStorage();
    var raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    Logger.warn("⚠️ storage 讀取失敗 [" + key + "]:", e);
    return null;
  }
}

/**
 * 將物件序列化後寫入 storage
 * @param {string} key
 * @param {*} value
 * @returns {boolean} 是否成功
 */
function storageSet(key, value) {
  try {
    var storage = _getStorage();
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    Logger.error("❌ storage 寫入失敗 [" + key + "]:", e);
    return false;
  }
}

/**
 * 刪除指定 key
 * @param {string} key
 */
function storageRemove(key) {
  try {
    // 兩邊都刪除以確保清乾淨
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  } catch (e) {
    Logger.warn("⚠️ storage 刪除失敗 [" + key + "]:", e);
  }
}

/**
 * 將訪客 profile 標記為 sessionStorage 模式
 * 呼叫此函式後，後續 storageGet/Set 都會自動使用 sessionStorage
 */
function enableGuestSessionMode() {
  try {
    sessionStorage.setItem("efgame-guest-mode", "true");
    // 如果 localStorage 有殘留的訪客 profile，搬移到 sessionStorage 再刪除
    var raw = localStorage.getItem(STORAGE_KEYS.PLAYER_PROFILE);
    if (raw) {
      var p = JSON.parse(raw);
      if (p && (p.nickname === "00NoName" || p.seatNumber === "00")) {
        sessionStorage.setItem(STORAGE_KEYS.PLAYER_PROFILE, raw);
        localStorage.removeItem(STORAGE_KEYS.PLAYER_PROFILE);
      }
    }
  } catch (e) {
    /* ignore */
  }
}

// =========================================
// 預設資料結構（§5.4）
// =========================================

/**
 * 建立預設的 playerProfile 結構
 * @param {string} seatNumber - 座號
 * @param {string} nickname - 暱稱
 * @returns {Object}
 */
function createDefaultPlayerProfile(seatNumber, nickname) {
  return {
    seatNumber: seatNumber || "",
    nickname: nickname || "",
    childCode: "",
    playerClass: "",
    totalStars: 0,
    spentStars: 0,
    level: 1,
    badges: [],
    soundSettings: {
      masterVolume: 0.8,
      sfx: true,
      voice: true,
      voiceRate: 1.0,
    },
    colorTheme: "field-primary",
    stimuliPack: "default",
    soundPack: "default",
    soundOverrides: {},
    questionCountPrefs: {
      ruleQuestionCount: 50, // 預設 50 題
    },
    totalPlayTime: 0,
    firestoreUploadPrefs: {
      nickname: false,
      totalStars: false,
      level: false,
      badges: false,
      questionCountPrefs: false,
      passed: false,
      bestScore: false,
      bestAvgRT: false,
      starsEarned: false,
      wmStarsEarned: false,
      firstClear: false,
      bestTime: false,
    },
  };
}

/**
 * 建立預設的 adventureProgress 結構
 * @returns {Object}
 */
function createDefaultAdventureProgress() {
  return {
    currentMapIndex: 0,
    currentPointIndex: 0,
    freeChoiceUnlocked: false,

    // 遊戲場×規則共用紀錄（firstClear + bestAvgRT 不分探險點）
    fieldRuleRecords: {
      mouse_rule1: { firstClear: true, bestAvgRT: null },
      mouse_rule2: { firstClear: true, bestAvgRT: null },
      mouse_mixed: { firstClear: true, bestAvgRT: null },
      fishing_rule1: { firstClear: true, bestAvgRT: null },
      fishing_rule2: { firstClear: true, bestAvgRT: null },
      fishing_mixed: { firstClear: true, bestAvgRT: null },
    },

    // 探險地圖（每個探險點各自保留 bestScore）
    maps: [
      {
        id: "mouse",
        name: "🐭 小老鼠冒險",
        points: [
          {
            id: "mouse_r1",
            field: "mouse",
            rule: "rule1",
            hasWM: false,
            passed: false,
            bestScore: 0,
            starsEarned: 0,
            wmStarsEarned: 0,
            bestTime: null,
          },
          {
            id: "mouse_r1_wm",
            field: "mouse",
            rule: "rule1",
            hasWM: true,
            passed: false,
            bestScore: 0,
            starsEarned: 0,
            wmStarsEarned: 0,
            bestTime: null,
          },
          {
            id: "mouse_r2",
            field: "mouse",
            rule: "rule2",
            hasWM: false,
            passed: false,
            bestScore: 0,
            starsEarned: 0,
            wmStarsEarned: 0,
            bestTime: null,
          },
          {
            id: "mouse_r2_wm",
            field: "mouse",
            rule: "rule2",
            hasWM: true,
            passed: false,
            bestScore: 0,
            starsEarned: 0,
            wmStarsEarned: 0,
            bestTime: null,
          },
          {
            id: "mouse_mix",
            field: "mouse",
            rule: "mixed",
            hasWM: false,
            passed: false,
            bestScore: 0,
            starsEarned: 0,
            wmStarsEarned: 0,
            bestTime: null,
          },
          {
            id: "mouse_mix_wm",
            field: "mouse",
            rule: "mixed",
            hasWM: true,
            passed: false,
            bestScore: 0,
            starsEarned: 0,
            wmStarsEarned: 0,
            bestTime: null,
          },
        ],
      },
      {
        id: "fishing",
        name: "🐟 釣魚冒險",
        points: [
          {
            id: "fishing_r1",
            field: "fishing",
            rule: "rule1",
            hasWM: false,
            passed: false,
            bestScore: 0,
            starsEarned: 0,
            wmStarsEarned: 0,
            bestTime: null,
          },
          {
            id: "fishing_r1_wm",
            field: "fishing",
            rule: "rule1",
            hasWM: true,
            passed: false,
            bestScore: 0,
            starsEarned: 0,
            wmStarsEarned: 0,
            bestTime: null,
          },
          {
            id: "fishing_r2",
            field: "fishing",
            rule: "rule2",
            hasWM: false,
            passed: false,
            bestScore: 0,
            starsEarned: 0,
            wmStarsEarned: 0,
            bestTime: null,
          },
          {
            id: "fishing_r2_wm",
            field: "fishing",
            rule: "rule2",
            hasWM: true,
            passed: false,
            bestScore: 0,
            starsEarned: 0,
            wmStarsEarned: 0,
            bestTime: null,
          },
          {
            id: "fishing_mix",
            field: "fishing",
            rule: "mixed",
            hasWM: false,
            passed: false,
            bestScore: 0,
            starsEarned: 0,
            wmStarsEarned: 0,
            bestTime: null,
          },
          {
            id: "fishing_mix_wm",
            field: "fishing",
            rule: "mixed",
            hasWM: true,
            passed: false,
            bestScore: 0,
            starsEarned: 0,
            wmStarsEarned: 0,
            bestTime: null,
          },
        ],
      },
    ],
  };
}

// =========================================
// 玩家 Profile API
// =========================================

/**
 * 取得玩家 profile（不存在則回傳 null）
 * @returns {Object|null}
 */
function getPlayerProfile() {
  return storageGet(STORAGE_KEYS.PLAYER_PROFILE);
}

/**
 * 儲存玩家 profile
 * @param {Object} profile
 * @returns {boolean}
 */
function savePlayerProfile(profile) {
  return storageSet(STORAGE_KEYS.PLAYER_PROFILE, profile);
}

/**
 * 初始化玩家 profile（若不存在才建立）
 * @param {string} seatNumber
 * @param {string} nickname
 * @param {string} [playerClass]
 * @returns {Object} 玩家 profile
 */
function initPlayerProfile(seatNumber, nickname, playerClass) {
  let profile = getPlayerProfile();
  if (!profile) {
    profile = createDefaultPlayerProfile(seatNumber, nickname);
    if (playerClass) profile.playerClass = playerClass;
    savePlayerProfile(profile);
    Logger.debug(`✅ 玩家 profile 已初始化：${nickname}`);
  }
  return profile;
}

/**
 * 更新玩家 profile 的部分欄位（淺層合併）
 * @param {Object} updates - 要更新的欄位
 * @returns {Object|null} 更新後的 profile
 */
function updatePlayerProfile(updates) {
  const profile = getPlayerProfile();
  if (!profile) {
    Logger.warn("⚠️ 尚未初始化 playerProfile");
    return null;
  }
  const updated = { ...profile, ...updates };
  savePlayerProfile(updated);
  return updated;
}

// =========================================
// 探險進度 API
// =========================================

/**
 * 取得探險進度（不存在則自動初始化）
 * @returns {Object}
 */
function getAdventureProgress() {
  let progress = storageGet(STORAGE_KEYS.ADVENTURE_PROGRESS);
  if (!progress) {
    progress = createDefaultAdventureProgress();
    saveAdventureProgress(progress);
  }
  return progress;
}

/**
 * 儲存探險進度
 * @param {Object} progress
 * @returns {boolean}
 */
function saveAdventureProgress(progress) {
  return storageSet(STORAGE_KEYS.ADVENTURE_PROGRESS, progress);
}

/**
 * 取得遊戲場×規則的共用紀錄（firstClear + bestAvgRT）
 * @param {string} fieldId - 'mouse' 或 'fishing'
 * @param {string} ruleId - 'rule1', 'rule2', 'mixed'
 * @returns {Object} { firstClear: boolean, bestAvgRT: number|null }
 */
function getFieldRuleRecord(fieldId, ruleId) {
  const progress = getAdventureProgress();
  const key = `${fieldId}_${ruleId}`;
  return (
    progress.fieldRuleRecords[key] || { firstClear: true, bestAvgRT: null }
  );
}

/**
 * 更新遊戲場×規則的共用紀錄
 * @param {string} fieldId
 * @param {string} ruleId
 * @param {Object} updates - { firstClear?, bestAvgRT? }
 * @returns {Object} 更新後的紀錄
 */
function updateFieldRuleRecord(fieldId, ruleId, updates) {
  const progress = getAdventureProgress();
  const key = `${fieldId}_${ruleId}`;

  if (!progress.fieldRuleRecords[key]) {
    progress.fieldRuleRecords[key] = { firstClear: true, bestAvgRT: null };
  }

  Object.assign(progress.fieldRuleRecords[key], updates);
  saveAdventureProgress(progress);
  return progress.fieldRuleRecords[key];
}

/**
 * 取得特定探險點的紀錄
 * @param {string} mapId - 'mouse' 或 'fishing'
 * @param {number} pointIndex - 探險點索引（0-5）
 * @returns {Object|null}
 */
function getPointRecord(mapId, pointIndex) {
  const progress = getAdventureProgress();
  const map = progress.maps.find(function (m) {
    return m.id === mapId;
  });
  if (!map || !map.points[pointIndex]) {
    Logger.warn(`⚠️ 找不到探險點：${mapId}[${pointIndex}]`);
    return null;
  }
  return map.points[pointIndex];
}

/**
 * 更新特定探險點的紀錄
 * @param {string} mapId
 * @param {number} pointIndex
 * @param {Object} updates - { passed?, bestScore?, starsEarned?, wmStarsEarned?, bestTime? }
 * @returns {Object|null} 更新後的探險點紀錄
 */
function updatePointRecord(mapId, pointIndex, updates) {
  const progress = getAdventureProgress();
  const map = progress.maps.find(function (m) {
    return m.id === mapId;
  });
  if (!map || !map.points[pointIndex]) {
    Logger.warn(`⚠️ 找不到探險點：${mapId}[${pointIndex}]`);
    return null;
  }

  Object.assign(map.points[pointIndex], updates);
  saveAdventureProgress(progress);
  return map.points[pointIndex];
}

/**
 * 檢查指定地圖是否全部通過
 * @param {string} mapId
 * @returns {boolean}
 */
function isMapAllPassed(mapId) {
  const progress = getAdventureProgress();
  var map = progress.maps.find(function (m) {
    return m.id === mapId;
  });
  if (!map) return false;
  return map.points.every(function (p) {
    return p.passed;
  });
}

/**
 * 檢查是否全部 12 點通過（解鎖自由選擇條件）
 * @returns {boolean}
 */
function isAllPointsPassed() {
  var progress = getAdventureProgress();
  return progress.maps.every(function (map) {
    return map.points.every(function (p) {
      return p.passed;
    });
  });
}

// =========================================
// 偏好設定 API
// =========================================

/**
 * 取得聲音設定
 * @returns {Object} { masterVolume, sfx, voice }
 */
function getSoundSettings() {
  var profile = getPlayerProfile();
  if (!profile) {
    return { masterVolume: 0.8, sfx: true, voice: true };
  }
  return profile.soundSettings;
}

/**
 * 儲存聲音設定
 * @param {Object} settings - { masterVolume?, sfx?, voice? }
 * @returns {boolean}
 */
function saveSoundSettings(settings) {
  var profile = getPlayerProfile();
  if (!profile) {
    profile = createDefaultPlayerProfile("00", "訪客");
    savePlayerProfile(profile);
  }
  profile.soundSettings = { ...profile.soundSettings, ...settings };
  return savePlayerProfile(profile);
}

/**
 * 取得配色主題偏好
 * @returns {string} 'field-primary' 或 'rule-independent'
 */
function getThemePreference() {
  var profile = getPlayerProfile();
  return profile ? profile.colorTheme : "field-primary";
}

/**
 * 儲存配色主題偏好
 * @param {string} theme
 * @returns {boolean}
 */
function saveThemePreference(theme) {
  var profile = getPlayerProfile();
  if (!profile) return false;
  profile.colorTheme = theme;
  return savePlayerProfile(profile);
}

/**
 * 取得刺激物包偏好
 * @returns {string}
 */
function getStimuliPackPreference() {
  var profile = getPlayerProfile();
  return profile ? profile.stimuliPack : "default";
}

/**
 * 儲存刺激物包偏好
 * @param {string} packId
 * @returns {boolean}
 */
function saveStimuliPackPreference(packId) {
  var profile = getPlayerProfile();
  if (!profile) return false;
  profile.stimuliPack = packId;
  return savePlayerProfile(profile);
}

/**
 * 取得題數偏好
 * @returns {number} 預設 6
 */
function getQuestionCountPreference() {
  var profile = getPlayerProfile();
  var def = (typeof GAME_CONFIG !== "undefined") ? GAME_CONFIG.QUESTIONS.DEFAULT_COUNT : 50;
  if (!profile || !profile.questionCountPrefs) return def;
  return profile.questionCountPrefs.ruleQuestionCount || def;
}

/**
 * 儲存題數偏好
 * @param {number} count
 * @returns {boolean}
 */
function saveQuestionCountPreference(count) {
  var profile = getPlayerProfile();
  if (!profile) {
    profile = createDefaultPlayerProfile("00", "訪客");
    savePlayerProfile(profile);
  }
  if (!profile.questionCountPrefs) {
    profile.questionCountPrefs = {};
  }
  profile.questionCountPrefs.ruleQuestionCount = count;
  return savePlayerProfile(profile);
}

// =========================================
// 星星 & 等級 API
// =========================================

/**
 * 增加總星星數
 * @param {number} amount
 * @returns {number} 更新後的總星星數
 */
function addStars(amount) {
  var profile = getPlayerProfile();
  if (!profile) return 0;
  profile.totalStars = (profile.totalStars || 0) + amount;
  savePlayerProfile(profile);
  return profile.totalStars;
}

/**
 * 取得總星星數
 * @returns {number}
 */
function getTotalStars() {
  var profile = getPlayerProfile();
  return profile ? profile.totalStars || 0 : 0;
}

/**
 * 取得目前等級
 * @returns {number}
 */
function getLevel() {
  var profile = getPlayerProfile();
  return profile ? profile.level || 1 : 1;
}

/**
 * 設定等級
 * @param {number} level
 * @returns {boolean}
 */
function setLevel(level) {
  var profile = getPlayerProfile();
  if (!profile) return false;
  profile.level = level;
  return savePlayerProfile(profile);
}

// =========================================
// 徽章 API
// =========================================

/**
 * 取得已獲得的徽章列表
 * @returns {string[]}
 */
function getBadges() {
  var profile = getPlayerProfile();
  return profile ? profile.badges || [] : [];
}

/**
 * 新增徽章（若已存在則不重複加入）
 * @param {string} badgeId
 * @returns {boolean} 是否為新增（true = 新獲得）
 */
function addBadge(badgeId) {
  var profile = getPlayerProfile();
  if (!profile) return false;
  if (!profile.badges) profile.badges = [];
  if (profile.badges.indexOf(badgeId) !== -1) return false; // 已有
  profile.badges.push(badgeId);
  savePlayerProfile(profile);
  return true;
}

/**
 * 檢查是否擁有特定徽章
 * @param {string} badgeId
 * @returns {boolean}
 */
function hasBadge(badgeId) {
  var badges = getBadges();
  return badges.indexOf(badgeId) !== -1;
}

// =========================================
// 商店 & 貼紙 API（購買功能共用基礎層）
// =========================================

/**
 * 取得可花費的星星數（totalStars - spentStars）
 * 等級依 totalStars 計算，永不降級
 * @returns {number}
 */
function getAvailableStars() {
  var profile = getPlayerProfile();
  if (!profile) return 0;
  var total = profile.totalStars || 0;
  var spent = profile.spentStars || 0;
  return Math.max(0, total - spent);
}

/**
 * 花費星星（僅增加 spentStars，不影響 totalStars / 等級）
 * @param {number} amount - 花費數量（正整數）
 * @returns {{ success: boolean, remaining: number }} 是否成功 + 剩餘可用星星
 */
function spendStars(amount) {
  if (typeof amount !== "number" || amount <= 0) {
    return { success: false, remaining: getAvailableStars() };
  }
  var available = getAvailableStars();
  if (amount > available) {
    return { success: false, remaining: available };
  }
  var profile = getPlayerProfile();
  profile.spentStars = (profile.spentStars || 0) + amount;
  savePlayerProfile(profile);
  return { success: true, remaining: getAvailableStars() };
}

/**
 * 取得貼紙收藏資料
 * @returns {{ ownedStickers: string[], openedPacks: number }}
 */
function getStickerCollection() {
  var data = storageGet(STORAGE_KEYS.STICKER_COLLECTION);
  return data || { ownedStickers: [], openedPacks: 0 };
}

/**
 * 儲存貼紙收藏資料
 * @param {Object} collection
 * @returns {boolean}
 */
function saveStickerCollection(collection) {
  return storageSet(STORAGE_KEYS.STICKER_COLLECTION, collection);
}

/**
 * 新增貼紙到收藏（若已存在標記為重複）
 * @param {string} stickerId
 * @returns {{ isNew: boolean, stickerId: string }}
 */
function addSticker(stickerId) {
  var collection = getStickerCollection();
  var isNew = collection.ownedStickers.indexOf(stickerId) === -1;
  if (isNew) {
    collection.ownedStickers.push(stickerId);
  }
  collection.openedPacks = (collection.openedPacks || 0) + 1;
  saveStickerCollection(collection);
  return { isNew: isNew, stickerId: stickerId };
}

/**
 * 檢查是否擁有特定貼紙
 * @param {string} stickerId
 * @returns {boolean}
 */
function hasSticker(stickerId) {
  var collection = getStickerCollection();
  return collection.ownedStickers.indexOf(stickerId) !== -1;
}

/**
 * 取得已收集貼紙數量
 * @returns {number}
 */
function getOwnedStickerCount() {
  var collection = getStickerCollection();
  return collection.ownedStickers.length;
}

// =========================================
// 換裝 / 頭像 API（P2）
// =========================================

/**
 * 取得換裝資料
 * @returns {{ ownedItems: string[], equipped: Object }}
 */
function getAvatarData() {
  var data = storageGet(STORAGE_KEYS.AVATAR_DATA);
  return data || { ownedItems: [], equipped: { frame: null, accessory: null } };
}

/**
 * 儲存換裝資料
 * @param {Object} data
 * @returns {boolean}
 */
function saveAvatarData(data) {
  return storageSet(STORAGE_KEYS.AVATAR_DATA, data);
}

/**
 * 新增換裝物品
 * @param {string} itemId
 * @returns {{ isNew: boolean }}
 */
function addAvatarItem(itemId) {
  var data = getAvatarData();
  var isNew = data.ownedItems.indexOf(itemId) === -1;
  if (isNew) {
    data.ownedItems.push(itemId);
    saveAvatarData(data);
  }
  return { isNew: isNew };
}

/**
 * 裝備物品
 * @param {string} slot - 'frame' | 'accessory'
 * @param {string|null} itemId - null = 卸下
 * @returns {boolean}
 */
function equipAvatarItem(slot, itemId) {
  var data = getAvatarData();
  data.equipped[slot] = itemId;
  return saveAvatarData(data);
}

/**
 * 取得目前裝備
 * @returns {Object}
 */
function getEquippedItems() {
  var data = getAvatarData();
  return data.equipped || { frame: null, accessory: null };
}

/**
 * 檢查是否擁有某物品
 * @param {string} itemId
 * @returns {boolean}
 */
function hasAvatarItem(itemId) {
  var data = getAvatarData();
  return data.ownedItems.indexOf(itemId) !== -1;
}

// =========================================
// 寵物雞 API（P3）
// =========================================

/**
 * 取得寵物狀態
 * @returns {{ fedCount: number, lastFedTime: number|null, accessories: string[], mood: string }}
 */
function getPetState() {
  var data = storageGet(STORAGE_KEYS.PET_STATE);
  return (
    data || {
      fedCount: 0,
      lastFedTime: null,
      accessories: [],
      equippedAccessories: [],
      petName: "",
      mood: "normal",
    }
  );
}

/**
 * 儲存寵物狀態
 * @param {Object} state
 * @returns {boolean}
 */
function savePetState(state) {
  return storageSet(STORAGE_KEYS.PET_STATE, state);
}

/**
 * 餵食寵物（增加餵食次數、更新時間）
 * @returns {{ fedCount: number, mood: string }}
 */
function feedPet() {
  var state = getPetState();
  state.fedCount = (state.fedCount || 0) + 1;
  state.lastFedTime = Date.now();
  state.mood = "happy";
  savePetState(state);
  return { fedCount: state.fedCount, mood: state.mood };
}

/**
 * 新增寵物配件
 * @param {string} accessoryId
 * @returns {{ isNew: boolean }}
 */
function addPetAccessory(accessoryId) {
  var state = getPetState();
  if (!state.accessories) state.accessories = [];
  var isNew = state.accessories.indexOf(accessoryId) === -1;
  if (isNew) {
    state.accessories.push(accessoryId);
    savePetState(state);
  }
  return { isNew: isNew };
}

/**
 * 檢查是否擁有某寵物配件
 * @param {string} accessoryId
 * @returns {boolean}
 */
function hasPetAccessory(accessoryId) {
  var state = getPetState();
  return (state.accessories || []).indexOf(accessoryId) !== -1;
}

/**
 * 設定寵物名字
 * @param {string} name
 */
function setPetName(name) {
  var state = getPetState();
  state.petName = name || "";
  savePetState(state);
}

/**
 * 切換配件穿戴/卸下
 * @param {string} accessoryId
 * @returns {{ equipped: boolean }}
 */
function togglePetAccessory(accessoryId) {
  var state = getPetState();
  if (!state.equippedAccessories) state.equippedAccessories = [];
  var idx = state.equippedAccessories.indexOf(accessoryId);
  if (idx !== -1) {
    state.equippedAccessories.splice(idx, 1);
    savePetState(state);
    return { equipped: false };
  } else {
    state.equippedAccessories.push(accessoryId);
    savePetState(state);
    return { equipped: true };
  }
}

/**
 * 取得已穿戴的配件 ID 列表
 * @returns {string[]}
 */
function getEquippedAccessories() {
  var state = getPetState();
  var owned = state.accessories || [];
  var equipped = state.equippedAccessories;
  // 相容舊版：若 equippedAccessories 未定義，預設全部穿戴
  if (!equipped) return owned.slice();
  // 只回傳同時 owned + equipped 的
  return equipped.filter(function (id) {
    return owned.indexOf(id) !== -1;
  });
}

// =========================================
// 班級資料 API
// =========================================

/**
 * 取得班級資料
 * @returns {Object|null}
 */
function getClassData() {
  return storageGet(STORAGE_KEYS.CLASS_DATA);
}

/**
 * 儲存班級資料
 * @param {Object} data
 * @returns {boolean}
 */
function saveClassData(data) {
  return storageSet(STORAGE_KEYS.CLASS_DATA, data);
}

// =========================================
// 資料管理工具
// =========================================

/**
 * 訪客帳號常數
 */
var GUEST_SEAT = "00";
var GUEST_NAME = "NoName";
var GUEST_NICKNAME = "00NoName";

/**
 * 檢查目前玩家是否為訪客（00NoName）
 * @returns {boolean}
 */
function isGuestPlayer() {
  var profile = getPlayerProfile();
  if (!profile) return false;
  return (
    profile.nickname === GUEST_NICKNAME || profile.seatNumber === GUEST_SEAT
  );
}

/**
 * 清除訪客的所有本機資料（遊戲 + 排行榜 + session）
 * sessionStorage 模式下關閉分頁即自動清除，此函式可手動呼叫
 */
function clearGuestData() {
  if (!isGuestPlayer()) return;
  clearAllGameData();
  try {
    sessionStorage.removeItem("efgame-guest-mode");
  } catch (e) {
    /* ignore */
  }
  Logger.debug("🧹 訪客資料已清除（00NoName）");
}

/**
 * 清除本遊戲的所有 localStorage 資料
 */
function clearAllGameData() {
  Object.values(STORAGE_KEYS).forEach(function (key) {
    storageRemove(key);
  });
  // 同時清除其他模組的 key
  storageRemove("efgame-stimuli-pack");
  storageRemove("efgame-sound-pack");
  storageRemove("efgame-sound-overrides");
  // 清除排行榜資料
  storageRemove("efgame_leaderboard");
  // 清除徽章計數器
  storageRemove("efgame-badge-counters");
  // 清除難度引擎與音訊偏好
  storageRemove("ef_engine_choice");
  storageRemove("efgame-sfx-enabled");
  storageRemove("efgame-voice-enabled");
  storageRemove("efgame-volume");
  storageRemove("efgame-voice-rate");
  // 清除 sessionStorage
  try {
    sessionStorage.removeItem("efgame-current-session");
    sessionStorage.removeItem("efgame-result-data");
  } catch (e) {
    /* ignore */
  }
  // 清除 Cache Storage（Service Worker 快取）
  clearCacheStorage();
  Logger.info("✅ 所有遊戲資料已清除（含快取）");
}

/**
 * 清除所有 Cache Storage + 註銷 Service Worker
 * @returns {Promise<void>}
 */
function clearCacheStorage() {
  // 1. 刪除所有 Cache Storage
  if ("caches" in window) {
    caches
      .keys()
      .then(function (names) {
        names.forEach(function (name) {
          caches.delete(name);
        });
        Logger.info(
          "✅ Cache Storage 已全部清除 (" + names.length + " 個快取)",
        );
      })
      .catch(function (e) {
        Logger.warn("⚠️ 清除 Cache Storage 失敗:", e);
      });
  }
  // 2. 註銷 Service Worker（讓下次載入重新安裝乾淨的 SW）
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .getRegistrations()
      .then(function (registrations) {
        registrations.forEach(function (reg) {
          reg.unregister();
        });
        if (registrations.length > 0) {
          Logger.info(
            "✅ Service Worker 已註銷 (" + registrations.length + " 個)",
          );
        }
      })
      .catch(function (e) {
        Logger.warn("⚠️ 註銷 Service Worker 失敗:", e);
      });
  }
}

/**
 * 匯出所有遊戲資料（JSON 字串）
 * @returns {string}
 */
function exportGameData() {
  var data = {
    playerProfile: getPlayerProfile(),
    adventureProgress: storageGet(STORAGE_KEYS.ADVENTURE_PROGRESS),
    classData: getClassData(),
    stimuliPack: localStorage.getItem("efgame-stimuli-pack"),
    soundPack: localStorage.getItem("efgame-sound-pack"),
    soundOverrides: localStorage.getItem("efgame-sound-overrides"),
    exportedAt: new Date().toISOString(),
    version: "4.5",
  };
  return JSON.stringify(data, null, 2);
}

/**
 * 匯入遊戲資料（覆蓋現有資料）
 * @param {string} jsonString
 * @returns {boolean}
 */
function importGameData(jsonString) {
  try {
    var data = JSON.parse(jsonString);
    if (data.playerProfile) savePlayerProfile(data.playerProfile);
    if (data.adventureProgress) saveAdventureProgress(data.adventureProgress);
    if (data.classData) saveClassData(data.classData);
    if (data.stimuliPack)
      localStorage.setItem("efgame-stimuli-pack", data.stimuliPack);
    if (data.soundPack)
      localStorage.setItem("efgame-sound-pack", data.soundPack);
    if (data.soundOverrides)
      localStorage.setItem("efgame-sound-overrides", data.soundOverrides);
    Logger.info("✅ 遊戲資料已匯入");
    return true;
  } catch (e) {
    Logger.error("❌ 匯入失敗：", e);
    return false;
  }
}

// =========================================
// 匯出
// =========================================

if (typeof window !== "undefined") {
  window.STORAGE_KEYS = STORAGE_KEYS;
  window.storageGet = storageGet;
  window.storageSet = storageSet;
  window.getPlayerProfile = getPlayerProfile;
  window.savePlayerProfile = savePlayerProfile;
  window.initPlayerProfile = initPlayerProfile;
  window.updatePlayerProfile = updatePlayerProfile;
  window.getAdventureProgress = getAdventureProgress;
  window.saveAdventureProgress = saveAdventureProgress;
  window.getFieldRuleRecord = getFieldRuleRecord;
  window.updateFieldRuleRecord = updateFieldRuleRecord;
  window.getPointRecord = getPointRecord;
  window.updatePointRecord = updatePointRecord;
  window.isMapAllPassed = isMapAllPassed;
  window.isAllPointsPassed = isAllPointsPassed;
  window.getSoundSettings = getSoundSettings;
  window.saveSoundSettings = saveSoundSettings;
  window.getThemePreference = getThemePreference;
  window.saveThemePreference = saveThemePreference;
  window.getStimuliPackPreference = getStimuliPackPreference;
  window.saveStimuliPackPreference = saveStimuliPackPreference;
  window.getQuestionCountPreference = getQuestionCountPreference;
  window.saveQuestionCountPreference = saveQuestionCountPreference;
  window.addStars = addStars;
  window.getTotalStars = getTotalStars;
  window.getLevel = getLevel;
  window.setLevel = setLevel;
  window.getBadges = getBadges;
  window.addBadge = addBadge;
  window.hasBadge = hasBadge;
  window.getAvailableStars = getAvailableStars;
  window.spendStars = spendStars;
  window.getStickerCollection = getStickerCollection;
  window.saveStickerCollection = saveStickerCollection;
  window.addSticker = addSticker;
  window.hasSticker = hasSticker;
  window.getOwnedStickerCount = getOwnedStickerCount;
  window.getAvatarData = getAvatarData;
  window.saveAvatarData = saveAvatarData;
  window.addAvatarItem = addAvatarItem;
  window.equipAvatarItem = equipAvatarItem;
  window.getEquippedItems = getEquippedItems;
  window.hasAvatarItem = hasAvatarItem;
  window.getPetState = getPetState;
  window.savePetState = savePetState;
  window.feedPet = feedPet;
  window.addPetAccessory = addPetAccessory;
  window.hasPetAccessory = hasPetAccessory;
  window.setPetName = setPetName;
  window.togglePetAccessory = togglePetAccessory;
  window.getEquippedAccessories = getEquippedAccessories;
  window.getClassData = getClassData;
  window.saveClassData = saveClassData;
  window.clearAllGameData = clearAllGameData;
  window.clearCacheStorage = clearCacheStorage;
  window.exportGameData = exportGameData;
  window.importGameData = importGameData;
  window.isGuestPlayer = isGuestPlayer;
  window.clearGuestData = clearGuestData;
  window.enableGuestSessionMode = enableGuestSessionMode;
  window.GUEST_NICKNAME = GUEST_NICKNAME;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    STORAGE_KEYS,
    storageGet,
    storageSet,
    getPlayerProfile,
    savePlayerProfile,
    initPlayerProfile,
    updatePlayerProfile,
    getAdventureProgress,
    saveAdventureProgress,
    getFieldRuleRecord,
    updateFieldRuleRecord,
    getPointRecord,
    updatePointRecord,
    isMapAllPassed,
    isAllPointsPassed,
    getSoundSettings,
    saveSoundSettings,
    getThemePreference,
    saveThemePreference,
    getStimuliPackPreference,
    saveStimuliPackPreference,
    getQuestionCountPreference,
    saveQuestionCountPreference,
    addStars,
    getTotalStars,
    getLevel,
    setLevel,
    getBadges,
    addBadge,
    hasBadge,
    getAvailableStars,
    spendStars,
    getStickerCollection,
    saveStickerCollection,
    addSticker,
    hasSticker,
    getOwnedStickerCount,
    getAvatarData,
    saveAvatarData,
    addAvatarItem,
    equipAvatarItem,
    getEquippedItems,
    hasAvatarItem,
    getPetState,
    savePetState,
    feedPet,
    addPetAccessory,
    hasPetAccessory,
    getClassData,
    saveClassData,
    clearAllGameData,
    exportGameData,
    importGameData,
    isGuestPlayer,
    clearGuestData,
    enableGuestSessionMode,
    GUEST_NICKNAME,
  };
}
