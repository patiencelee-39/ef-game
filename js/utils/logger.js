/**
 * Logger — 受 GAME_CONFIG.DEV.LOG_LEVEL 控制的日誌工具
 *
 * 等級（由低到高）：debug < info < warn < error < silent
 * 生產環境建議設為 "warn"（只顯示警告與錯誤）。
 *
 * 用法：
 *   Logger.debug("偵錯訊息", data);
 *   Logger.info("一般資訊");
 *   Logger.warn("警告");
 *   Logger.error("錯誤", err);
 */
var Logger = (function () {
  "use strict";

  var LEVELS = { debug: 0, info: 1, warn: 2, error: 3, silent: 4 };

  function _level() {
    var cfg =
      typeof GAME_CONFIG !== "undefined" && GAME_CONFIG.DEV
        ? GAME_CONFIG.DEV
        : {};
    return LEVELS[cfg.LOG_LEVEL || "warn"] || 2;
  }

  function _bind(method, threshold) {
    return function () {
      if (_level() <= threshold) {
        method.apply(console, arguments);
      }
    };
  }

  return {
    debug: _bind(console.log, LEVELS.debug),
    info: _bind(console.info, LEVELS.info),
    warn: _bind(console.warn, LEVELS.warn),
    error: _bind(console.error, LEVELS.error),
  };
})();
