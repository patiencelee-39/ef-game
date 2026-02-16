/**
 * ============================================
 * 單人模式控制器
 * ============================================
 * 對應需求文件：§3.2, Flow-3, Flow-4, Flow-5
 * 說明：探險地圖 / 自由選擇模式的遊戲流程控制
 *       管理遊戲頁面間的導航與參數傳遞
 * 依賴：
 *   - progress-tracker.js（ProgressTracker）
 *   - adventure-maps-config.js（ADVENTURE_MAPS）
 *   - storage.js（getAdventureProgress, ...）
 *   - game-config.js（GAME_CONFIG）
 * ============================================
 */

var ModeController = (function () {
  "use strict";

  // =========================================
  // 常數
  // =========================================

  var MODES = {
    ADVENTURE: "adventure",
    FREE_SELECT: "free-select",
  };

  var PAGES = {
    ADVENTURE_MAP: "adventure-map.html",
    FREE_SELECT: "free-select.html",
    GAME: "game.html",
    RESULT: "result.html",
    HOME: "../index.html",
  };

  // session 資料暫存 key
  var SESSION_KEY = "efgame-current-session";

  // =========================================
  // Session 管理
  // =========================================

  /**
   * 建立探險模式 session
   * @param {Object} [pointOverride] - 指定要遊玩的探險點（重玩已通過關卡時使用）
   * @param {number} pointOverride.mapIndex
   * @param {number} pointOverride.pointIndex
   * @returns {Object} session 物件
   */
  function createAdventureSession(pointOverride) {
    var mapIndex, pointIndex, mapDef, pointDef, pointRecord;

    if (pointOverride) {
      // 使用指定的探險點（重玩已通過的關卡）
      mapIndex = pointOverride.mapIndex;
      pointIndex = pointOverride.pointIndex;
      mapDef = ADVENTURE_MAPS[mapIndex];
      if (!mapDef || pointIndex >= mapDef.points.length) {
        console.error("❌ 指定探險點不存在:", pointOverride);
        return null;
      }
      pointDef = mapDef.points[pointIndex];
      var pr =
        typeof getPointRecord === "function"
          ? getPointRecord(mapDef.id, pointIndex)
          : null;
      pointRecord = pr;
    } else {
      // 預設：取得進度追蹤的當前探險點
      var current = ProgressTracker.getCurrentPoint();
      if (!current) {
        console.error("❌ 無當前探險點可開始");
        return null;
      }
      mapIndex = current.mapIndex;
      pointIndex = current.pointIndex;
      mapDef = current.mapDef;
      pointDef = current.pointDef;
      pointRecord = current.pointRecord;
    }

    var session = {
      mode: MODES.ADVENTURE,
      mapId: mapDef.id,
      mapIndex: mapIndex,
      pointIndex: pointIndex,
      pointId: pointDef.id,
      field: pointDef.field,
      rule: pointDef.rule,
      hasWM: pointDef.hasWM,
      questionsCount: pointDef.questionsCount,
      startedAt: new Date().toISOString(),
      isRetry: false,
      previousFailed: false,
    };

    _saveSession(session);
    return session;
  }

  /**
   * 建立自由選擇模式 session
   * @param {Object} params
   * @param {Array<Object>} params.combos - game-session-builder 產出的 combo 列表
   * @returns {Object} session 物件
   */
  function createFreeSelectSession(params) {
    var session = {
      mode: MODES.FREE_SELECT,
      combos: params.combos,
      currentComboIndex: 0,
      startedAt: new Date().toISOString(),
      comboResults: [], // 每個 combo 的結果
    };

    _saveSession(session);
    return session;
  }

  /**
   * 取得目前 session
   * @returns {Object|null}
   */
  function getSession() {
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * 更新目前 session
   * @param {Object} updates
   * @returns {Object|null}
   */
  function updateSession(updates) {
    var session = getSession();
    if (!session) return null;
    Object.assign(session, updates);
    _saveSession(session);
    return session;
  }

  /**
   * 清除 session
   */
  function clearSession() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (e) {
      console.warn("⚠️ session 清除失敗");
    }
  }

  /** @private */
  function _saveSession(session) {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (e) {
      console.error("❌ session 儲存失敗:", e);
    }
  }

  // =========================================
  // 導航
  // =========================================

  /**
   * 導航到探險地圖頁
   */
  function goToAdventureMap() {
    window.location.href = PAGES.ADVENTURE_MAP;
  }

  /**
   * 導航到自由選擇頁
   */
  function goToFreeSelect() {
    if (!ProgressTracker.isFreeSelectAvailable()) {
      alert("🔒 請先完成探險地圖所有探險點！");
      return;
    }
    window.location.href = PAGES.FREE_SELECT;
  }

  /**
   * 開始探險模式遊戲
   * @param {Object} [pointOverride] - 指定探險點（重玩用）
   * @param {number} pointOverride.mapIndex
   * @param {number} pointOverride.pointIndex
   */
  function startAdventureGame(pointOverride) {
    var session = createAdventureSession(pointOverride || null);
    if (!session) return;

    var params = new URLSearchParams();
    params.set("mode", MODES.ADVENTURE);
    window.location.href = PAGES.GAME + "?" + params.toString();
  }

  /**
   * 開始自由選擇遊戲
   * @param {Array<Object>} combos
   */
  function startFreeSelectGame(combos) {
    createFreeSelectSession({ combos: combos });

    var params = new URLSearchParams();
    params.set("mode", MODES.FREE_SELECT);
    window.location.href = PAGES.GAME + "?" + params.toString();
  }

  /**
   * 導航到結算頁
   * @param {Object} resultData - 結算資料（會存入 sessionStorage）
   */
  function goToResult(resultData) {
    try {
      sessionStorage.setItem("efgame-result-data", JSON.stringify(resultData));
    } catch (e) {
      console.error("❌ 結算資料儲存失敗:", e);
    }

    var session = getSession();
    var mode = session ? session.mode : MODES.ADVENTURE;
    var params = new URLSearchParams();
    params.set("mode", mode);
    window.location.href = PAGES.RESULT + "?" + params.toString();
  }

  /**
   * 取得結算頁資料
   * @returns {Object|null}
   */
  function getResultData() {
    try {
      var raw = sessionStorage.getItem("efgame-result-data");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * 重試當前探險點
   */
  function retryCurrentPoint() {
    var session = getSession();
    if (session && session.mode === MODES.ADVENTURE) {
      session.isRetry = true;
      session.previousFailed = true;
      _saveSession(session);
    }

    var params = new URLSearchParams();
    params.set("mode", MODES.ADVENTURE);
    window.location.href = PAGES.GAME + "?" + params.toString();
  }

  /**
   * 導航到首頁
   */
  function goToHome() {
    clearSession();
    window.location.href = PAGES.HOME;
  }

  // =========================================
  // 自由選擇：Combo 推進
  // =========================================

  /**
   * 推進到下一個 combo（自由選擇模式）
   * @param {Object} comboResult - 當前 combo 的結果
   * @returns {{ hasNext: boolean, nextCombo: Object|null }}
   */
  function advanceToNextCombo(comboResult) {
    var session = getSession();
    if (!session || session.mode !== MODES.FREE_SELECT) {
      return { hasNext: false, nextCombo: null };
    }

    // 儲存結果
    if (!session.comboResults) session.comboResults = [];
    session.comboResults.push(comboResult);

    var nextIndex = session.currentComboIndex + 1;

    if (nextIndex >= session.combos.length) {
      session.currentComboIndex = nextIndex;
      _saveSession(session);
      return { hasNext: false, nextCombo: null };
    }

    session.currentComboIndex = nextIndex;
    _saveSession(session);

    return {
      hasNext: true,
      nextCombo: session.combos[nextIndex],
    };
  }

  /**
   * 取得當前 combo（自由選擇模式）
   * @returns {Object|null}
   */
  function getCurrentCombo() {
    var session = getSession();
    if (!session || session.mode !== MODES.FREE_SELECT) return null;
    return session.combos[session.currentComboIndex] || null;
  }

  // =========================================
  // 模式檢測
  // =========================================

  /**
   * 從 URL 參數讀取目前模式
   * @returns {string} 'adventure' | 'free-select'
   */
  function getCurrentMode() {
    try {
      var params = new URLSearchParams(window.location.search);
      var mode = params.get("mode");
      if (mode === MODES.FREE_SELECT) return MODES.FREE_SELECT;
      return MODES.ADVENTURE;
    } catch (e) {
      return MODES.ADVENTURE;
    }
  }

  /**
   * 是否為探險模式
   * @returns {boolean}
   */
  function isAdventureMode() {
    return getCurrentMode() === MODES.ADVENTURE;
  }

  /**
   * 是否為自由選擇模式
   * @returns {boolean}
   */
  function isFreeSelectMode() {
    return getCurrentMode() === MODES.FREE_SELECT;
  }

  // ─── 公開 API ───

  return {
    // 常數
    MODES: MODES,
    PAGES: PAGES,

    // Session
    createAdventureSession: createAdventureSession,
    createFreeSelectSession: createFreeSelectSession,
    getSession: getSession,
    updateSession: updateSession,
    clearSession: clearSession,

    // 導航
    goToAdventureMap: goToAdventureMap,
    goToFreeSelect: goToFreeSelect,
    startAdventureGame: startAdventureGame,
    startFreeSelectGame: startFreeSelectGame,
    goToResult: goToResult,
    getResultData: getResultData,
    retryCurrentPoint: retryCurrentPoint,
    goToHome: goToHome,

    // Combo（自由選擇）
    advanceToNextCombo: advanceToNextCombo,
    getCurrentCombo: getCurrentCombo,

    // 模式
    getCurrentMode: getCurrentMode,
    isAdventureMode: isAdventureMode,
    isFreeSelectMode: isFreeSelectMode,
  };
})();

// =========================================
// 匯出
// =========================================

if (typeof window !== "undefined") {
  window.ModeController = ModeController;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ModeController;
}
