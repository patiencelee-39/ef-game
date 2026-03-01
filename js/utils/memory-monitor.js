/**
 * ============================================
 * 記憶體監控埋樁工具 — MemoryMonitor
 * ============================================
 * 依照「程式除錯完整指南」§8 效能監控工具設計
 *
 * 功能：
 *   1. 定期記錄 JS Heap 使用量（Chrome only: performance.memory）
 *   2. 偵測記憶體持續增長趨勢，提前警告
 *   3. 在 OOM 前記錄最後狀態到 localStorage（事後取證）
 *   4. 可選：畫面右上角顯示即時記憶體（debug 模式）
 *
 * 使用方式：
 *   MemoryMonitor.start();          // 遊戲開始時
 *   MemoryMonitor.checkpoint("combo1_done"); // 關鍵節點埋樁
 *   MemoryMonitor.stop();           // 遊戲結束時
 *
 * 匯出：window.MemoryMonitor
 * ============================================
 */

var MemoryMonitor = (function () {
  "use strict";

  var _timer = null;
  var _samples = []; // 最近 N 筆 heap 快照
  var _checkpoints = []; // 手動埋樁紀錄
  var _startTime = 0;
  var _isRunning = false;
  var _debugOverlay = null;

  var SAMPLE_INTERVAL_MS = 5000; // 每 5 秒採樣
  var MAX_SAMPLES = 60; // 最多保留 60 筆（5 分鐘）
  var WARN_GROWTH_MB = 20; // 連續增長超過 20MB 發警告
  var CRITICAL_MB = 150; // 超過 150MB 發出嚴重警告

  /**
   * 取得目前記憶體資訊（MB）
   * @returns {Object|null} {used, total, limit} in MB, or null if unsupported
   */
  function _getMemoryInfo() {
    if (!performance || !performance.memory) return null;
    return {
      used:
        Math.round((performance.memory.usedJSHeapSize / 1048576) * 100) / 100,
      total:
        Math.round((performance.memory.totalJSHeapSize / 1048576) * 100) / 100,
      limit:
        Math.round((performance.memory.jsHeapSizeLimit / 1048576) * 100) / 100,
    };
  }

  /**
   * 採樣一次
   */
  function _sample() {
    var mem = _getMemoryInfo();
    if (!mem) return;

    var entry = {
      t: Date.now() - _startTime,
      used: mem.used,
      total: mem.total,
    };
    _samples.push(entry);

    // 限制樣本數
    if (_samples.length > MAX_SAMPLES) {
      _samples.shift();
    }

    // 趨勢偵測：最近 6 筆（30 秒）是否持續增長？
    if (_samples.length >= 6) {
      var recent = _samples.slice(-6);
      var growing = true;
      for (var i = 1; i < recent.length; i++) {
        if (recent[i].used <= recent[i - 1].used) {
          growing = false;
          break;
        }
      }
      var growth = recent[recent.length - 1].used - recent[0].used;
      if (growing && growth > WARN_GROWTH_MB) {
        console.warn(
          "⚠️ [MemoryMonitor] 記憶體持續增長！" +
            " 30 秒內增加 " +
            growth.toFixed(1) +
            "MB" +
            " (目前 " +
            mem.used.toFixed(1) +
            "MB)",
        );
      }
    }

    // 嚴重警告
    if (mem.used > CRITICAL_MB) {
      console.error(
        "🔴 [MemoryMonitor] 記憶體使用量危險！" +
          mem.used.toFixed(1) +
          "MB / " +
          mem.limit.toFixed(0) +
          "MB" +
          " — 可能即將 OOM",
      );
      _saveToLocalStorage("crisis");
    }

    // 更新 debug overlay
    if (_debugOverlay) {
      _debugOverlay.textContent =
        "🧠 " + mem.used.toFixed(0) + "MB / " + mem.limit.toFixed(0) + "MB";
      _debugOverlay.style.color =
        mem.used > CRITICAL_MB
          ? "#ff4444"
          : mem.used > 80
            ? "#ffaa00"
            : "#44ff44";
    }
  }

  /**
   * 埋樁：在關鍵節點記錄記憶體快照
   * @param {string} label - 節點名稱（如 "combo1_start", "combo2_done"）
   */
  function checkpoint(label) {
    var mem = _getMemoryInfo();
    var entry = {
      label: label,
      t: Date.now() - (_startTime || Date.now()),
      used: mem ? mem.used : -1,
      total: mem ? mem.total : -1,
    };
    _checkpoints.push(entry);
    console.log(
      "📌 [MemoryMonitor] " +
        label +
        " — " +
        (mem ? mem.used.toFixed(1) + "MB" : "N/A"),
    );
  }

  /**
   * 儲存最後狀態到 localStorage（供事後取證）
   * @param {string} reason - 儲存原因（如 "crisis", "stop", "beforeunload"）
   */
  function _saveToLocalStorage(reason) {
    try {
      var data = {
        reason: reason,
        timestamp: new Date().toISOString(),
        samples: _samples.slice(-10), // 最後 10 筆
        checkpoints: _checkpoints,
        finalMemory: _getMemoryInfo(),
      };
      localStorage.setItem("memoryMonitor_lastRun", JSON.stringify(data));
    } catch (e) {
      // localStorage 可能也爆了
    }
  }

  /**
   * 建立 debug overlay（右上角小型記憶體顯示）
   */
  function _createOverlay() {
    if (_debugOverlay) return;
    _debugOverlay = document.createElement("div");
    _debugOverlay.id = "memoryMonitorOverlay";
    _debugOverlay.style.cssText =
      "position:fixed;top:4px;right:4px;z-index:99999;" +
      "font:11px monospace;color:#44ff44;background:rgba(0,0,0,0.7);" +
      "padding:2px 6px;border-radius:4px;pointer-events:none;";
    document.body.appendChild(_debugOverlay);
  }

  return {
    /**
     * 開始監控
     * @param {Object} [opts]
     * @param {boolean} [opts.showOverlay=false] - 是否顯示畫面右上角記憶體指示
     */
    start: function (opts) {
      if (_isRunning) return;
      _isRunning = true;
      _startTime = Date.now();
      _samples = [];
      _checkpoints = [];

      var options = opts || {};
      if (options.showOverlay) {
        _createOverlay();
      }

      checkpoint("start");
      _timer = setInterval(_sample, SAMPLE_INTERVAL_MS);
      _sample(); // 立即採樣

      // beforeunload 時自動保存
      window.addEventListener("beforeunload", function () {
        _saveToLocalStorage("beforeunload");
      });

      console.log(
        "🧠 [MemoryMonitor] 監控已啟動（每 " +
          SAMPLE_INTERVAL_MS / 1000 +
          " 秒採樣）",
      );
    },

    /**
     * 停止監控
     */
    stop: function () {
      if (!_isRunning) return;
      _isRunning = false;
      if (_timer) {
        clearInterval(_timer);
        _timer = null;
      }
      checkpoint("stop");
      _saveToLocalStorage("stop");

      if (_debugOverlay && _debugOverlay.parentNode) {
        _debugOverlay.parentNode.removeChild(_debugOverlay);
        _debugOverlay = null;
      }
      console.log("🧠 [MemoryMonitor] 監控已停止");
    },

    /** 手動埋樁 */
    checkpoint: checkpoint,

    /**
     * 取得上次執行的記錄（從 localStorage）
     * @returns {Object|null}
     */
    getLastRun: function () {
      try {
        var raw = localStorage.getItem("memoryMonitor_lastRun");
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    },

    /**
     * 列印上次執行報告到 console
     */
    printLastRun: function () {
      var data = this.getLastRun();
      if (!data) {
        console.log("🧠 [MemoryMonitor] 無上次執行紀錄");
        return;
      }
      console.group("🧠 [MemoryMonitor] 上次執行報告");
      console.log("原因:", data.reason);
      console.log("時間:", data.timestamp);
      console.log("最終記憶體:", data.finalMemory);
      console.table(data.checkpoints);
      console.table(data.samples);
      console.groupEnd();
    },

    /** 是否正在運行 */
    isRunning: function () {
      return _isRunning;
    },
  };
})();

if (typeof window !== "undefined") {
  window.MemoryMonitor = MemoryMonitor;
}
