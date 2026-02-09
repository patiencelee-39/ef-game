// ====================================
// 全域常數定義
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
export const ROOM_CODE_LENGTH = 5;

/**
 * 房間代碼可用字元（排除易混淆字元 I, O, 0, 1）
 * @constant {string}
 */
export const VALID_ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * 房間過期時間（毫秒）
 * 1 小時 = 3600 秒 × 1000 毫秒
 * @constant {number}
 */
export const ROOM_EXPIRY_TIME_MS = 3600000;

/**
 * 生成唯一房間代碼的最大嘗試次數
 * @constant {number}
 */
export const MAX_ROOM_CODE_GENERATION_ATTEMPTS = 10;

// ============================================
// 玩家相關常數
// ============================================

/**
 * 隨機玩家暱稱的最大數字範圍
 * 用於生成 "玩家123" 格式的暱稱
 * @constant {number}
 */
export const RANDOM_NICKNAME_MAX = 1000;

/**
 * 預設玩家暱稱前綴
 * @constant {string}
 */
export const DEFAULT_PLAYER_NICKNAME_PREFIX = '玩家';

/**
 * 房主預設暱稱
 * @constant {string}
 */
export const DEFAULT_HOST_NICKNAME = '房主';

// ============================================
// 房間狀態常數
// ============================================

/**
 * 房間狀態枚舉
 * @constant {Object}
 */
export const ROOM_STATUS = {
  WAITING: 'waiting', // 等待中
  PLAYING: 'playing', // 遊戲中
  FINISHED: 'finished', // 已結束
};

// ============================================
// 匯出給非 ES6 環境使用（瀏覽器全域）
// ============================================

if (typeof window !== 'undefined') {
  window.GameConstants = {
    // 房間相關
    ROOM_CODE_LENGTH,
    VALID_ROOM_CODE_CHARS,
    ROOM_EXPIRY_TIME_MS,
    MAX_ROOM_CODE_GENERATION_ATTEMPTS,

    // 玩家相關
    RANDOM_NICKNAME_MAX,
    DEFAULT_PLAYER_NICKNAME_PREFIX,
    DEFAULT_HOST_NICKNAME,

    // 房間狀態
    ROOM_STATUS,
  };
}
