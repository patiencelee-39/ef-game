/**
 * ============================================
 * 刺激物彈性系統 — Config
 * ============================================
 * 對應需求文件：§4.5.2
 * 說明：所有刺激物、條件提示、背景均由此檔定義
 *       更換 config 即可切換整套視覺，不需修改遊戲邏輯
 * ============================================
 */

const STIMULI_PACKS = {
  // ===== 預設刺激物包 =====
  default: {
    packName: "預設（小老鼠與釣魚）",

    // -------------------------------------------
    // 🐭 小老鼠遊戲場
    // -------------------------------------------
    mouse: {
      fieldName: "小老鼠遊戲場",
      fieldIcon: "🐭",

      // Go 刺激物
      goStimulus: {
        emoji: "🧀",
        label: "起司",
        svgFile: "stimuli/cheese.svg",
        altText: "一塊黃色起司",
        voiceFemale: "audio/voice/female/cheese.mp3", // 👩 女聲（規則一 / 混合規則 A）
        voiceMale: "audio/voice/male/cheese.mp3", // 👨 男聲（混合規則 B）
        voiceLabel: "起司",
      },

      // No-Go 刺激物
      noGoStimulus: {
        emoji: "😺",
        label: "貓咪",
        svgFile: "stimuli/cat.svg",
        altText: "一隻貓咪",
        voiceFemale: "audio/voice/female/cat.mp3",
        voiceMale: "audio/voice/male/cat.mp3",
        voiceLabel: "貓咪",
      },

      // 混合規則的條件提示
      contextIndicator: {
        type: "presence", // 有人/沒人
        present: {
          emoji: "🧑",
          label: "有人",
          svgFile: "stimuli/person.svg",
          borderColor: "#ff6b6b",
          glowColor: "rgba(255, 107, 107, 0.5)",
        },
        absent: {
          label: "沒人",
          // 無額外視覺（一般畫面）
        },
      },

      // 背景
      backgrounds: {
        rule1: { cssClass: "bg-forest", label: "森林" },
        rule2: { cssClass: "bg-forest-reverse", label: "森林（反轉）" },
        mixed: { cssClass: "bg-village", label: "村莊" },
      },
    },

    // -------------------------------------------
    // 🐟 釣魚遊戲場
    // -------------------------------------------
    fishing: {
      fieldName: "釣魚遊戲場",
      fieldIcon: "🐟",

      goStimulus: {
        emoji: "🐟",
        label: "魚",
        svgFile: "stimuli/fish.svg",
        altText: "一條魚",
        voiceFemale: "audio/voice/female/fish.mp3",
        voiceMale: "audio/voice/male/fish.mp3",
        voiceLabel: "魚",
      },

      noGoStimulus: {
        emoji: "🦈",
        label: "鯊魚",
        svgFile: "stimuli/shark.svg",
        altText: "一隻鯊魚",
        voiceFemale: "audio/voice/female/shark.mp3",
        voiceMale: "audio/voice/male/shark.mp3",
        voiceLabel: "鯊魚",
      },

      contextIndicator: {
        type: "dayNight", // 白天/晚上
        day: {
          emoji: "☀️",
          label: "白天",
          svgFile: "stimuli/sun.svg",
          borderColor: "#3498db",
          backgroundGradient: "linear-gradient(135deg, #3498db, #2980b9)",
        },
        night: {
          emoji: "🌙",
          label: "晚上",
          svgFile: "stimuli/moon.svg",
          borderColor: "#f39c12",
          backgroundGradient: "linear-gradient(135deg, #34495e, #2c3e50)",
          glowColor: "rgba(243, 156, 18, 0.4)",
        },
      },

      backgrounds: {
        rule1: { cssClass: "bg-ocean-day", label: "白天海洋" },
        rule2: { cssClass: "bg-ocean-night", label: "夜晚海洋" },
        mixed: { cssClass: "bg-ocean-mixed", label: "海洋（日夜交替）" },
      },
    },
  },

  // ===== 未來可擴充：替代刺激物包 =====
  // 'animals': { ... }   // 例如：兔子/狼、蝴蝶/蜘蛛
  // 'fruits': { ... }    // 例如：蘋果/辣椒、香蕉/茄子
};

// =========================================
// 當前使用的刺激物包
// =========================================

let currentStimuliPack = "default";

/**
 * 取得當前刺激物包
 * @returns {Object} 當前刺激物包物件
 */
function getCurrentStimuliPack() {
  return STIMULI_PACKS[currentStimuliPack];
}

/**
 * 取得指定遊戲場的刺激物
 * @param {string} fieldId - 'mouse' 或 'fishing'
 * @returns {Object} 該遊戲場的刺激物定義
 */
function getFieldStimuli(fieldId) {
  const pack = getCurrentStimuliPack();
  return pack ? pack[fieldId] : null;
}

/**
 * 切換刺激物包
 * @param {string} packId - 刺激物包 ID
 * @returns {boolean} 是否切換成功
 */
function setStimuliPack(packId) {
  if (STIMULI_PACKS[packId]) {
    currentStimuliPack = packId;
    localStorage.setItem("efgame-stimuli-pack", packId);
    Logger.debug(`✅ 刺激物包已切換為：${STIMULI_PACKS[packId].packName}`);
    return true;
  }
  Logger.warn(`⚠️ 刺激物包 "${packId}" 不存在`);
  return false;
}

// =========================================
// 初始化：讀取 localStorage 偏好
// =========================================
(function initStimuliPack() {
  const saved = localStorage.getItem("efgame-stimuli-pack");
  if (saved && STIMULI_PACKS[saved]) {
    currentStimuliPack = saved;
  }
})();

// =========================================
// 匯出
// =========================================

if (typeof window !== "undefined") {
  window.STIMULI_PACKS = STIMULI_PACKS;
  window.getCurrentStimuliPack = getCurrentStimuliPack;
  window.getFieldStimuli = getFieldStimuli;
  window.setStimuliPack = setStimuliPack;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    STIMULI_PACKS,
    getCurrentStimuliPack,
    getFieldStimuli,
    setStimuliPack,
  };
}
