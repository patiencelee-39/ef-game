// ====================================
// 全域常數定義（v3.0 遺留）
// ====================================
// ⚠️ @deprecated — Phase 5 時需整合至 game-config.js
// @todo Phase 5：將此檔多人模式常數合併至 GAME_CONFIG.MULTIPLAYER，
//       並更新所有引用此檔的 HTML（multiplayer/*.html）
//       合併後刪除此檔案。
// ====================================
// 根據 NAMING-CONVENTION.md v2.3 規範
// 所有具備業務意義的值必須提取為常數
// ====================================

// ============================================
// 房間相關常數
// ============================================

/**
 * 房間代碼長度
 * @constant {number}
 */
const ROOM_CODE_LENGTH = 6;

/**
 * 房間代碼可用字元（排除易混淆字元 I, O, 0, 1）
 * @constant {string}
 */
const VALID_ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * 房間過期時間（毫秒）
 * 10 分鐘 = 600 秒 × 1000 毫秒
 * @constant {number}
 */
const ROOM_EXPIRY_TIME_MS = 600000;

/**
 * 生成唯一房間代碼的最大嘗試次數
 * @constant {number}
 */
const MAX_ROOM_CODE_GENERATION_ATTEMPTS = 10;

// ============================================
// 玩家相關常數
// ============================================

/**
 * 隨機玩家暱稱的最大數字範圍
 * 用於生成 "玩家123" 格式的暱稱
 * @constant {number}
 */
const RANDOM_NICKNAME_MAX = 1000;

/**
 * 每個房間的最大玩家數
 * @constant {number}
 */
const MAX_PLAYERS_PER_ROOM = 8;

/**
 * 預設玩家暱稱前綴
 * @constant {string}
 */
const DEFAULT_PLAYER_NICKNAME_PREFIX = "玩家";

/**
 * 房主預設暱稱
 * @constant {string}
 */
const DEFAULT_HOST_NICKNAME = "房主";

// ============================================
// 房間狀態常數
// ============================================

/**
 * 房間狀態枚舉
 * @constant {Object}
 */
const ROOM_STATUS = {
  WAITING: "waiting", // 等待中
  PLAYING: "playing", // 遊戲中
  FINISHED: "finished", // 已結束
};

// ============================================
// CSV 欄位名（Single Source of Truth）
// ============================================
// ⚠️ 所有產生或讀取 CSV 的程式碼都必須引用這裡的常數
//    修改欄位名時只需改這裡，不需逐檔搜尋替換
// 使用位置：
//   - js/game-logic.js        exportData() — 產生 CSV
//   - js/shared/csv-report.js — 解析/渲染/匯出 CSV
//   - singleplayer/result.html _convertTrials() — 逐題轉 CSV 格式
// ============================================

/**
 * CSV 欄位名稱映射
 * key = 程式碼邏輯名（不會變）
 * value = 實際輸出到 CSV 的欄位名（可能會改）
 * @constant {Object}
 */
const CSV_FIELDS = {
  FILE_NAME: "FileName",
  PARTICIPANT: "Participant",
  ROUND: "Round",
  TRIAL: "Trial",
  STIMULUS: "Stimulus",
  HAS_PERSON: "HasPerson",
  IS_NIGHT_TIME: "IsNightTime",
  INPUT_KEY: "InputKey",
  CORRECT: "Correct",
  RT_MS: "RT(ms)",
  TIMESTAMP: "Timestamp",
};

/**
 * CSV 欄位順序（決定 CSV header 的輸出順序）
 * @constant {string[]}
 */
const CSV_FIELD_ORDER = [
  CSV_FIELDS.FILE_NAME,
  CSV_FIELDS.PARTICIPANT,
  CSV_FIELDS.ROUND,
  CSV_FIELDS.TRIAL,
  CSV_FIELDS.STIMULUS,
  CSV_FIELDS.HAS_PERSON,
  CSV_FIELDS.IS_NIGHT_TIME,
  CSV_FIELDS.INPUT_KEY,
  CSV_FIELDS.CORRECT,
  CSV_FIELDS.RT_MS,
  CSV_FIELDS.TIMESTAMP,
];

/**
 * 正確/不正確的字串值
 * @constant {Object}
 */
const CSV_VALUES = {
  CORRECT_YES: "yes",
  CORRECT_NO: "no",
  BOOL_TRUE: "true",
  BOOL_FALSE: "false",
};

// ============================================
// 回合設定（Round Configuration）
// ============================================
// 新增回合時只需在這裡加一筆，所有 UI/圖表/統計自動跟隨
// ============================================

/**
 * 一般回合 ID 列表（數字型別）
 * @constant {number[]}
 */
const REGULAR_ROUND_IDS = [1, 2, 3, 4];

/**
 * 工作記憶回合 ID 列表（字串型別）
 * @constant {string[]}
 */
const WM_ROUND_IDS = ["WM1", "WM2", "WM3", "WM4"];

/**
 * 工作記憶 Round 前綴（用於判斷是否為 WM 回合）
 * @constant {string}
 */
const WM_ROUND_PREFIX = "WM";

/**
 * 回合顯示名稱
 * @constant {Object}
 */
const ROUND_DISPLAY_NAMES = {
  1: "🐱 回合 1：貓咪與起司",
  2: "👤 回合 2：起司與人物",
  3: "🐟 回合 3：魚與鯊魚",
  4: "🌙 回合 4：白天/晚上鯊魚",
};

/**
 * 回合圖表標籤（短版）
 * @constant {Object}
 */
const ROUND_SHORT_LABELS = {
  1: "回合 1",
  2: "回合 2",
  3: "回合 3",
  4: "回合 4",
};

/**
 * 回合圖表顏色
 * @constant {Object}
 */
const ROUND_CHART_COLORS = {
  1: "rgba(255, 99, 132, 0.8)", // 紅
  2: "rgba(54, 162, 235, 0.8)", // 藍
  3: "rgba(255, 206, 86, 0.8)", // 黃
  4: "rgba(75, 192, 192, 0.8)", // 綠
};

// ============================================
// 報告 / PDF 元資料
// ============================================

/**
 * 報告相關元資料
 * @constant {Object}
 */
const REPORT_META = {
  /** 應用程式名稱 */
  APP_NAME: "EF 執行功能訓練遊戲",
  /** 報告副標題 */
  REPORT_SUBTITLE: "資料分析報告",
  /** 版權文字（{year} 會被實際年份取代） */
  COPYRIGHT_TEMPLATE: "© {year} 執行功能訓練遊戲 ─ 本報告由系統自動產生",
};

// ============================================
// CSV 檔案命名
// ============================================

/**
 * CSV 檔名相關常數
 * @constant {Object}
 */
const CSV_FILE_NAMING = {
  /** 資料檔名前綴 */
  DATA_PREFIX: "EF訓練遊戲數據",
  /** 合併匯出檔名前綴 */
  MERGE_PREFIX: "EF訓練遊戲數據_合併",
  /** PDF 匯出檔名前綴 */
  PDF_PREFIX: "EF訓練遊戲分析報告",
  /** 截圖匯出檔名前綴 */
  SCREENSHOT_PREFIX: "EF訓練遊戲分析截圖",
  /** 檔名分隔符 */
  SEPARATOR: "_",
  /** 預設參與者 ID */
  DEFAULT_PARTICIPANT: "Player",
};

/**
 * CSV 檔名正規式（用於解析上傳的檔案名稱）
 * 格式：{DATA_PREFIX}_{ParticipantID}_{YYYYMMDD}_{HHMMSS}.csv
 * @constant {RegExp}
 */
const CSV_FILENAME_REGEX = new RegExp(
  "^" + CSV_FILE_NAMING.DATA_PREFIX + "_(.+)_(\\d{8})_(\\d{6})\\.csv$",
);

// ============================================
// 匯出給非 ES6 環境使用（瀏覽器全域）
// ============================================

if (typeof window !== "undefined") {
  window.GameConstants = {
    // 房間相關
    ROOM_CODE_LENGTH,
    VALID_ROOM_CODE_CHARS,
    ROOM_EXPIRY_TIME_MS,
    MAX_ROOM_CODE_GENERATION_ATTEMPTS,

    // 玩家相關
    RANDOM_NICKNAME_MAX,
    MAX_PLAYERS_PER_ROOM,
    DEFAULT_PLAYER_NICKNAME_PREFIX,
    DEFAULT_HOST_NICKNAME,

    // 房間狀態
    ROOM_STATUS,

    // CSV 欄位
    CSV_FIELDS,
    CSV_FIELD_ORDER,
    CSV_VALUES,

    // 回合設定
    REGULAR_ROUND_IDS,
    WM_ROUND_IDS,
    WM_ROUND_PREFIX,
    ROUND_DISPLAY_NAMES,
    ROUND_SHORT_LABELS,
    ROUND_CHART_COLORS,

    // 報告元資料
    REPORT_META,

    // 檔案命名
    CSV_FILE_NAMING,
    CSV_FILENAME_REGEX,
  };
}
