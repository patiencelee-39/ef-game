// ====================================
// 全域常數定義（v3.0 遺留）
// ====================================
// ⚠️ @deprecated — 未來 Phase 6+ 可整合至 GAME_CONFIG.MULTIPLAYER
//   目前多人模式 HTML 仍引用此檔，暫時保留。
//   合併時需更新 multiplayer/*.html 的 <script> 引用。
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
 * 每個房間的最大玩家數（預設值）
 * 教師可在建房時透過「進階設定」調整為 2~20
 * @constant {number}
 */
const MAX_PLAYERS_PER_ROOM = 8;

/**
 * 最大玩家數的允許上限
 * @constant {number}
 */
const MAX_PLAYERS_UPPER_LIMIT = 20;

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
  CHILD_CODE: "ChildCode",
  SESSION_ID: "SessionId",
  MODE: "Mode",
  FIELD_ID: "FieldId",
  RULE_ID: "RuleId",
  ROUND: "Round",
  TRIAL: "Trial",
  STIMULUS: "Stimulus",
  IS_GO: "IsGo",
  CONTEXT: "Context",
  INPUT_KEY: "InputKey",
  CORRECT: "Correct",
  RESULT: "Result",
  RT_MS: "RT(ms)",
  STIMULUS_DURATION: "StimulusDuration",
  ISI: "ISI",
  WM_SPAN: "WMSpan",
  WM_DIRECTION: "WMDirection",
  WM_COMPLETION_TIME: "WMCompletionTime",
  TIMESTAMP: "Timestamp",
  GAME_END_TIME: "GameEndTime",
  // v4.7 自適應難度欄位
  ADAPTIVE_ENGINE: "AdaptiveEngine",
  DIFFICULTY_LEVEL: "DifficultyLevel",
  THETA: "Theta",
};

/**
 * CSV 欄位順序（決定 CSV header 的輸出順序）
 * @constant {string[]}
 */
const CSV_FIELD_ORDER = [
  CSV_FIELDS.FILE_NAME,
  CSV_FIELDS.PARTICIPANT,
  CSV_FIELDS.CHILD_CODE,
  CSV_FIELDS.SESSION_ID,
  CSV_FIELDS.MODE,
  CSV_FIELDS.FIELD_ID,
  CSV_FIELDS.RULE_ID,
  CSV_FIELDS.ROUND,
  CSV_FIELDS.TRIAL,
  CSV_FIELDS.STIMULUS,
  CSV_FIELDS.IS_GO,
  CSV_FIELDS.CONTEXT,
  CSV_FIELDS.INPUT_KEY,
  CSV_FIELDS.CORRECT,
  CSV_FIELDS.RESULT,
  CSV_FIELDS.RT_MS,
  CSV_FIELDS.STIMULUS_DURATION,
  CSV_FIELDS.ISI,
  CSV_FIELDS.WM_SPAN,
  CSV_FIELDS.WM_DIRECTION,
  CSV_FIELDS.WM_COMPLETION_TIME,
  CSV_FIELDS.TIMESTAMP,
  CSV_FIELDS.GAME_END_TIME,
  // v4.7 自適應難度欄位
  CSV_FIELDS.ADAPTIVE_ENGINE,
  CSV_FIELDS.DIFFICULTY_LEVEL,
  CSV_FIELDS.THETA,
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
 * 對應 fieldId + ruleId 的 6 種組合：
 *   1 = mouse + rule1, 2 = mouse + rule2, 3 = mouse + mixed,
 *   4 = fishing + rule1, 5 = fishing + rule2, 6 = fishing + mixed
 * @constant {number[]}
 */
const REGULAR_ROUND_IDS = [1, 2, 3, 4, 5, 6];

/**
 * 工作記憶回合 ID 列表（字串型別）
 * @constant {string[]}
 */
const WM_ROUND_IDS = ["WM1", "WM2", "WM3", "WM4", "WM5", "WM6"];

/**
 * 工作記憶 Round 前綴（用於判斷是否為 WM 回合）
 * @constant {string}
 */
const WM_ROUND_PREFIX = "WM";

/**
 * fieldId + ruleId → 回合編號 映射表
 * @constant {Object}
 */
const FIELD_RULE_TO_ROUND = {
  mouse_rule1: 1,
  mouse_rule2: 2,
  mouse_mixed: 3,
  fishing_rule1: 4,
  fishing_rule2: 5,
  fishing_mixed: 6,
};

/**
 * 回合顯示名稱
 * @constant {Object}
 */
const ROUND_DISPLAY_NAMES = {
  1: "🐱 回合 1：貓咪與起司（規則一）",
  2: "🐱 回合 2：貓咪與起司（規則二）",
  3: "🐱 回合 3：貓咪與起司（混合）",
  4: "🐟 回合 4：魚與鯊魚（規則一）",
  5: "🐟 回合 5：魚與鯊魚（規則二）",
  6: "🐟 回合 6：魚與鯊魚（混合）",
};

/**
 * 回合圖表標籤（短版）
 * @constant {Object}
 */
const ROUND_SHORT_LABELS = {
  1: "🐭R1",
  2: "🐭R2",
  3: "🐭混合",
  4: "🐟R1",
  5: "🐟R2",
  6: "🐟混合",
  7: "回合 7",
  8: "回合 8",
  9: "回合 9",
  10: "回合 10",
  11: "回合 11",
  12: "回合 12",
};

/**
 * 回合圖表顏色
 * @constant {Object}
 */
const ROUND_CHART_COLORS = {
  1: "rgba(255, 99, 132, 0.8)", // 紅 — mouse rule1
  2: "rgba(255, 159, 64, 0.8)", // 橙 — mouse rule2
  3: "rgba(255, 206, 86, 0.8)", // 黃 — mouse mixed
  4: "rgba(54, 162, 235, 0.8)", // 藍 — fishing rule1
  5: "rgba(75, 192, 192, 0.8)", // 青 — fishing rule2
  6: "rgba(153, 102, 255, 0.8)", // 紫 — fishing mixed
  7: "rgba(255, 99, 132, 0.5)", // 淡紅
  8: "rgba(255, 159, 64, 0.5)", // 淡橙
  9: "rgba(255, 206, 86, 0.5)", // 淡黃
  10: "rgba(54, 162, 235, 0.5)", // 淡藍
  11: "rgba(75, 192, 192, 0.5)", // 淡青
  12: "rgba(153, 102, 255, 0.5)", // 淡紫
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
// 排行榜 CSV 欄位名（Single Source of Truth）
// ============================================
// 使用位置：
//   - js/shared/class-leaderboard-controller.js exportBoardCSV()
// ============================================

/**
 * 排行榜 CSV 欄位名稱映射
 * @constant {Object}
 */
const LEADERBOARD_CSV_FIELDS = {
  RANK: "排名",
  PLAYER: "玩家",
  TOTAL_SCORE: "總分",
  AVG_ACCURACY: "平均正確率(%)",
  AVG_RT: "平均RT(ms)",
  D_PRIME: "d′(敏感度)",
  CRITERION: "c(決策準則)",
  BETA: "β(決策權重)",
  COMBO_ORDER: "遊戲場規則+WM順序",
  TOTAL_TIME: "遊戲總花費時間(s)",
  GAME_END_TIME: "遊戲結束時間",
  UPLOAD_TIME: "數據上傳時間",
};

/**
 * 排行榜 CSV 欄位順序
 * @constant {string[]}
 */
const LEADERBOARD_CSV_FIELD_ORDER = [
  LEADERBOARD_CSV_FIELDS.RANK,
  LEADERBOARD_CSV_FIELDS.PLAYER,
  LEADERBOARD_CSV_FIELDS.TOTAL_SCORE,
  LEADERBOARD_CSV_FIELDS.AVG_ACCURACY,
  LEADERBOARD_CSV_FIELDS.AVG_RT,
  LEADERBOARD_CSV_FIELDS.D_PRIME,
  LEADERBOARD_CSV_FIELDS.CRITERION,
  LEADERBOARD_CSV_FIELDS.BETA,
  LEADERBOARD_CSV_FIELDS.COMBO_ORDER,
  LEADERBOARD_CSV_FIELDS.TOTAL_TIME,
  LEADERBOARD_CSV_FIELDS.GAME_END_TIME,
  LEADERBOARD_CSV_FIELDS.UPLOAD_TIME,
];

// ============================================
// CSV 檔案命名
// ============================================

/**
 * CSV 檔名相關常數
 * @constant {Object}
 */
const CSV_FILE_NAMING = {
  /** 資料檔名前綴 */
  DATA_PREFIX: "EF單人冒險數據",
  /** 合併匯出檔名前綴 */
  MERGE_PREFIX: "EF單人冒險數據_合併",
  /** PDF 匯出檔名前綴 */
  PDF_PREFIX: "EF單人冒險分析報告",
  /** 截圖匯出檔名前綴 */
  SCREENSHOT_PREFIX: "EF單人冒險分析截圖",
  /** 檔名分隔符 */
  SEPARATOR: "_",
  /** 預設參與者 ID */
  DEFAULT_PARTICIPANT: "Player",
};

/**
 * CSV 檔名正規式（用於解析上傳的檔案名稱）
 * 格式：{DATA_PREFIX}_{ChildCode or Nickname}_{YYYYMMDD}_{HHMMSS}.csv
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
    MAX_PLAYERS_UPPER_LIMIT,
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
    FIELD_RULE_TO_ROUND,
    ROUND_DISPLAY_NAMES,
    ROUND_SHORT_LABELS,
    ROUND_CHART_COLORS,

    // 報告元資料
    REPORT_META,

    // 檔案命名
    CSV_FILE_NAMING,
    CSV_FILENAME_REGEX,

    // 排行榜 CSV
    LEADERBOARD_CSV_FIELDS,
    LEADERBOARD_CSV_FIELD_ORDER,
  };
}
