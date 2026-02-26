// ====================================
// 房間代碼工具
// ====================================

/**
 * 生成房間代碼（6位字元，排除易混淆字元）
 * 排除：I, O, 0, 1
 * 使用：A-Z（除I,O）+ 2-9
 * @returns {string} 6 位字元的房間代碼
 */
function generateRoomCode() {
  const { ROOM_CODE_LENGTH, VALID_ROOM_CODE_CHARS } = window.GameConstants;
  let code = "";

  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    const randomIndex = Math.floor(
      Math.random() * VALID_ROOM_CODE_CHARS.length,
    );
    code += VALID_ROOM_CODE_CHARS[randomIndex];
  }

  return code;
}

/**
 * 格式化房間代碼（加空格）
 * 例如：H7K2MN → H7K 2MN
 * @param {string} code - 未格式化的房間代碼
 * @returns {string} 格式化後的房間代碼
 */
function formatRoomCode(code) {
  const { ROOM_CODE_LENGTH } = window.GameConstants;
  if (!code || code.length !== ROOM_CODE_LENGTH) return code;
  return `${code.substring(0, 3)} ${code.substring(3)}`;
}

/**
 * 移除房間代碼的空格
 * 例如：H7K 2M → H7K2M
 * @param {string} formattedCode - 格式化的房間代碼
 * @returns {string} 移除空格後的房間代碼
 */
function unformatRoomCode(formattedCode) {
  return formattedCode.replace(/\s+/g, "");
}

/**
 * 驗證房間代碼格式
 * @param {string} code - 待驗證的房間代碼
 * @returns {boolean} 是否為有效的房間代碼格式
 */
function isValidRoomCode(code) {
  const { ROOM_CODE_LENGTH, VALID_ROOM_CODE_CHARS } = window.GameConstants;
  const cleanCode = unformatRoomCode(code);
  const validChars = new RegExp(
    `^[${VALID_ROOM_CODE_CHARS}]{${ROOM_CODE_LENGTH}}$`,
  );
  return validChars.test(cleanCode);
}

/**
 * 檢查房間代碼是否已存在
 * @param {string} roomCode - 房間代碼
 * @returns {Promise<boolean>} 房間是否存在
 */
async function isRoomCodeExists(roomCode) {
  try {
    const snapshot = await firebase
      .database()
      .ref(`rooms/${roomCode}`)
      .once("value");
    return snapshot.exists();
  } catch (error) {
    Logger.error("檢查房間代碼失敗:", error);
    return false;
  }
}

/**
 * 生成唯一的房間代碼
 * @param {number} [maxAttempts] - 最大嘗試次數
 * @returns {Promise<string>} 唯一的房間代碼
 * @throws {Error} 當無法生成唯一代碼時拋出錯誤
 */
async function generateUniqueRoomCode(maxAttempts) {
  const attempts =
    maxAttempts || window.GameConstants.MAX_ROOM_CODE_GENERATION_ATTEMPTS;
  for (let i = 0; i < attempts; i++) {
    const code = generateRoomCode();
    const exists = await isRoomCodeExists(code);

    if (!exists) {
      return code;
    }
  }

  throw new Error("無法生成唯一的房間代碼，請稍後再試");
}

// 匯出函式
window.RoomCodeUtils = {
  generate: generateRoomCode,
  generateUnique: generateUniqueRoomCode,
  format: formatRoomCode,
  unformat: unformatRoomCode,
  isValid: isValidRoomCode,
  exists: isRoomCodeExists,
};
