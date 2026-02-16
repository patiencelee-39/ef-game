/**
 * ============================================
 * 執行功能訓練遊戲 — 遊戲配置 v4.5
 * ============================================
 * 架構：field × rule（遊戲場 × 規則）
 * 對應需求文件：§2.3, §3.1b, §3.3, §3.4
 * ============================================
 */

const GAME_CONFIG = {
  // === 版本 ===
  VERSION: "4.5",

  // =========================================
  // 試驗時間參數（§3.1b）
  // =========================================
  TIMING: {
    STIMULUS_DURATION_MS: 2000, // 刺激物顯示時間
    ISI_MIN_MS: 800, // 刺激間隔最小值
    ISI_MAX_MS: 1200, // 刺激間隔最大值
    FEEDBACK_DURATION_MS: 800, // 回饋顯示時間
    COUNTDOWN_SECONDS: 3, // 倒數秒數（3-2-1）
  },

  // =========================================
  // 題數預設值
  // =========================================
  QUESTIONS: {
    DEFAULT_COUNT: 6, // 預設題數（規則一/二）
    MIXED_MULTIPLIER: 2, // 混合規則題數倍率（n × 2）
    MIN_COUNT: 6, // 最小題數
    MAX_COUNT: 30, // 最大題數
    PRACTICE_COUNT: 6, // 練習題數
  },

  // =========================================
  // Go/No-Go 比例（§2.3, §2.4）
  // =========================================
  RATIOS: {
    MOUSE_GO: 0.75, // 🐭 小老鼠 Go 比例
    MOUSE_NOGO: 0.25, // 🐭 小老鼠 No-Go 比例
    FISHING_GO: 0.8, // 🐟 釣魚 Go 比例
    FISHING_NOGO: 0.2, // 🐟 釣魚 No-Go 比例
    MIXED_CONTEXT_A: 0.8, // 混合規則 — 規則 A 情境比例
    MIXED_CONTEXT_B: 0.2, // 混合規則 — 規則 B 情境比例
    PRACTICE_GO: 0.5, // 練習模式 Go 比例
    PRACTICE_CONTEXT_A: 0.5, // 練習模式 情境 A 比例
  },

  // =========================================
  // 計分系統（§3.3）
  // =========================================
  SCORING: {
    PASS_THRESHOLD: 0.83, // 通過門檻 83%
    SCORE_PER_CORRECT: 1, // 每答對 +1 分
    PERFECT_STREAK_THRESHOLD: 5, // 完美連續答對加分門檻
    BONUS_SCORE: 1, // 完美加分
  },

  // =========================================
  // 工作記憶（§3.4）
  // =========================================
  WORKING_MEMORY: {
    MIN_POSITIONS: 2, // 最少位置數
    MAX_POSITIONS: 6, // 最多位置數
    HIGHLIGHT_DURATION_MS: 800, // 位置亮起時間
    HIGHLIGHT_INTERVAL_MS: 400, // 位置間隔時間
    RESPONSE_TIMEOUT_MS: 10000, // 作答超時
    PASS_THRESHOLD: 0.83, // WM 通過門檻 83%
    SCORE_PER_POSITION: 1, // 每答對一個位置的分數
    REVERSE_PROBABILITY: 0.5, // 逆向測試機率
  },

  // =========================================
  // 遊戲場定義（§2.3 field × rule）
  // =========================================
  FIELDS: {
    mouse: {
      id: "mouse",
      name: "小老鼠遊戲場",
      icon: "🐭",
      goRatio: 0.75,
      rules: {
        rule1: {
          id: "rule1",
          name: "規則一（建立規則）",
          trainingTarget: "抑制控制",
          go: { action: "press", stimulus: "cheese" }, // 🧀 起司 → 按
          noGo: { action: "nopress", stimulus: "cat" }, // 😺 貓 → 不按
          contextIndicator: null,
        },
        rule2: {
          id: "rule2",
          name: "規則二（規則轉換）",
          trainingTarget: "認知彈性",
          go: { action: "press", stimulus: "cat" }, // 😺 貓 → 按
          noGo: { action: "nopress", stimulus: "cheese" }, // 🧀 起司 → 不按
          contextIndicator: null,
        },
        mixed: {
          id: "mixed",
          name: "混合規則（混合轉換）",
          trainingTarget: "工作記憶 + 認知彈性",
          contextType: "presence", // 有人/沒人
          contextA: { key: "noPerson", label: "沒人", appliesRule: "rule1" },
          contextB: { key: "hasPerson", label: "有人", appliesRule: "rule2" },
        },
      },
    },

    fishing: {
      id: "fishing",
      name: "釣魚遊戲場",
      icon: "🐟",
      goRatio: 0.8,
      rules: {
        rule1: {
          id: "rule1",
          name: "規則一（建立規則）",
          trainingTarget: "抑制控制",
          go: { action: "press", stimulus: "fish" }, // 🐟 魚 → 按
          noGo: { action: "nopress", stimulus: "shark" }, // 🦈 鯊魚 → 不按
          contextIndicator: null,
        },
        rule2: {
          id: "rule2",
          name: "規則二（規則轉換）",
          trainingTarget: "認知彈性",
          go: { action: "press", stimulus: "shark" }, // 🦈 鯊魚 → 按
          noGo: { action: "nopress", stimulus: "fish" }, // 🐟 魚 → 不按
          contextIndicator: null,
        },
        mixed: {
          id: "mixed",
          name: "混合規則（混合轉換）",
          trainingTarget: "工作記憶 + 認知彈性",
          contextType: "dayNight", // 白天/晚上
          contextA: { key: "day", label: "白天", appliesRule: "rule1" },
          contextB: { key: "night", label: "晚上", appliesRule: "rule2" },
        },
      },
    },
  },

  // =========================================
  // 探險地圖解鎖邏輯標記（§3.2）
  // =========================================
  UNLOCK: {
    MAP2_REQUIRES: "mouse_all_passed", // 地圖 2 解鎖條件：地圖 1 六點全通過
    FREE_SELECT_REQUIRES: "all_12_passed", // 自由選擇解鎖：12 個探險點全通過
    TEACHER_OVERRIDE_PARAM: "unlock", // ?unlock=all 教師覆寫
  },

  // =========================================
  // 多人模式（§2.5–§2.11）
  // =========================================
  MULTIPLAYER: {
    MAX_PLAYERS: 8,
    ROOM_CODE_LENGTH: 6,
    VALID_ROOM_CODE_CHARS: "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",
    ROOM_EXPIRY_MS: 600000, // 10 分鐘過期
    DEBOUNCE_MS: 100, // 狀態廣播防抖延遲
    INITIAL_BROADCAST_DELAY_MS: 500, // 初始狀態廣播延遲
  },

  // =========================================
  // 星星系統（§3.2, §3.8）
  // =========================================
  STARS: {
    RULE_PASS_STAR: 1, // 規則通過 → +1⭐
    WM_PASS_STAR: 1, // WM 通過 → +1⭐
    // WM 全對 bonus 依 §3.4 公式計算
  },

  // =========================================
  // 商店系統（購買功能共用設定）
  // =========================================
  SHOP: {
    STICKER_PACK_COST: 3, // 開一包貼紙需花費 3⭐
    STICKERS_PER_PACK: 1, // 每包開出 1 張貼紙
    AVATAR_ITEM_COST_MIN: 5, // 換裝物品最低價
    AVATAR_ITEM_COST_MAX: 15, // 換裝物品最高價
    PET_FEED_COST: 2, // 餵食寵物花費 2⭐
    PET_ACCESSORY_COST_MIN: 5, // 寵物配件最低價
    PET_ACCESSORY_COST_MAX: 12, // 寵物配件最高價
  },

  // =========================================
  // 開發設定
  // =========================================
  DEV: {
    DEBUG_MODE: true,
    LOG_LEVEL: "verbose", // 'silent' | 'error' | 'warn' | 'verbose'
  },
};

// =========================================
// 匯出
// =========================================

// 瀏覽器全域
if (typeof window !== "undefined") {
  window.GAME_CONFIG = GAME_CONFIG;
}

// Node.js（測試用）
if (typeof module !== "undefined" && module.exports) {
  module.exports = GAME_CONFIG;
}
