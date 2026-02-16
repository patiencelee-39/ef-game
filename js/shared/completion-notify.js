/**
 * ============================================
 * 完成通知 Toast — CompletionNotify
 * ============================================
 * 對應需求文件：§2.6, §2.8
 * 說明：組合完成時在右上角顯示 toast 通知
 *
 * 觸發時機：
 *   ✅ 完成整組遊戲組合（規則 + WM 都完成）
 *   ✅ 全部組合完成 → 額外「全部完成」通知
 *   ✅ 所有玩家完成 → 「🎉 所有玩家已完成！」
 *   ❌ 不在「每題完成時」觸發
 *
 * 顯示規格：
 *   位置：右上角（不干擾主視覺）
 *   一般完成：半透明藍 rgba(33, 150, 243, 0.9)
 *   全部完成：金色 rgba(255, 152, 0, 0.9)
 *   動畫：淡入 0.5s → 停留 3s → 淡出 0.5s = 共 4 秒
 *   最多堆疊 3 個（超過移除最舊的）
 *
 * CSS：合併至 css/main.css（E3:b 決策）
 *
 * 匯出：window.CompletionNotify + module.exports
 * ============================================
 */

// =========================================
// 常數
// =========================================

/** 停留時間（毫秒）— 不含淡入淡出 */
var STAY_MS = 3000;

/** 淡入時間（毫秒） */
var FADE_IN_MS = 500;

/** 淡出時間（毫秒） */
var FADE_OUT_MS = 500;

/** 最多同時堆疊的通知數 */
var MAX_VISIBLE = 3;

/** Toast 容器的 ID */
var CONTAINER_ID = "completion-toast-container";

// =========================================
// 通知類型
// =========================================

/**
 * 通知類型定義
 * @readonly
 */
var NOTIFY_TYPES = {
  /** 單一組合完成 */
  normal: {
    cssClass: "completion-toast--normal",
    prefix: "✅",
  },
  /** 該玩家全部組合完成 */
  allComplete: {
    cssClass: "completion-toast--all",
    prefix: "🎉",
  },
  /** 所有玩家都完成（多人模式） */
  everyoneComplete: {
    cssClass: "completion-toast--everyone",
    prefix: "🎉",
  },
};

// =========================================
// 私有狀態
// =========================================

/** @type {HTMLElement|null} toast 容器 */
var _container = null;

/** @type {Array<{el: HTMLElement, timerId: number}>} 目前顯示中的 toast */
var _activeToasts = [];

// =========================================
// 私有函式
// =========================================

/**
 * 取得或建立 toast 容器
 * @returns {HTMLElement}
 */
function _getContainer() {
  if (_container && _container.parentNode) {
    return _container;
  }
  _container = document.getElementById(CONTAINER_ID);
  if (!_container) {
    _container = document.createElement("div");
    _container.id = CONTAINER_ID;
    _container.className = "completion-toast-container";
    _container.setAttribute("aria-live", "polite");
    _container.setAttribute("aria-relevant", "additions");
    document.body.appendChild(_container);
  }
  return _container;
}

/**
 * 移除一個 toast 元素（含淡出動畫）
 * @param {Object} toastEntry - { el, timerId }
 */
function _removeToast(toastEntry) {
  if (!toastEntry || !toastEntry.el) return;

  // 淡出
  toastEntry.el.classList.remove("show");
  toastEntry.el.classList.add("hiding");

  setTimeout(function () {
    if (toastEntry.el.parentNode) {
      toastEntry.el.parentNode.removeChild(toastEntry.el);
    }
    // 從 active 清單移除
    var idx = _activeToasts.indexOf(toastEntry);
    if (idx !== -1) {
      _activeToasts.splice(idx, 1);
    }
  }, FADE_OUT_MS);
}

/**
 * 若超過最大堆疊數，移除最舊的
 */
function _pruneOldest() {
  while (_activeToasts.length >= MAX_VISIBLE) {
    var oldest = _activeToasts[0];
    if (oldest.timerId) {
      clearTimeout(oldest.timerId);
    }
    _removeToast(oldest);
  }
}

// =========================================
// 公開 API
// =========================================

var CompletionNotify = {
  /**
   * 顯示完成通知
   *
   * @param {Object} options
   * @param {string} options.message     - 通知文字，例如「✅ 小花 完成了 🐭規則一！」
   * @param {string} [options.type='normal'] - 'normal' | 'allComplete' | 'everyoneComplete'
   * @param {number} [options.stayMs]    - 停留時間 ms（預設 3000）
   * @param {Function} [options.onClick] - 點擊通知回呼
   *
   * @example
   * CompletionNotify.show({
   *   message: '✅ 小花 完成了 🐭規則一！',
   *   type: 'normal'
   * });
   *
   * @example
   * CompletionNotify.show({
   *   message: '🎉 小花 全部完成！',
   *   type: 'allComplete'
   * });
   */
  show: function (options) {
    if (!options || !options.message) {
      console.warn("CompletionNotify: message is required");
      return;
    }

    var message = options.message;
    var type = options.type || "normal";
    var stayMs = options.stayMs || STAY_MS;
    var onClick = options.onClick || null;

    var typeDef = NOTIFY_TYPES[type] || NOTIFY_TYPES.normal;

    // 確保容器存在
    var container = _getContainer();

    // 移除溢出的舊通知
    _pruneOldest();

    // 建立 toast 元素
    var toast = document.createElement("div");
    toast.className = "completion-toast " + typeDef.cssClass;
    toast.textContent = message;
    toast.setAttribute("role", "status");

    if (onClick) {
      toast.style.cursor = "pointer";
      toast.addEventListener("click", function () {
        try {
          onClick();
        } catch (e) {
          console.error("CompletionNotify onClick error:", e);
        }
      });
    }

    container.appendChild(toast);

    // 觸發 reflow 後加入 show class 以啟動動畫
    void toast.offsetWidth;
    toast.classList.add("show");

    // 設定自動消失計時
    var entry = { el: toast, timerId: null };
    entry.timerId = setTimeout(function () {
      _removeToast(entry);
    }, FADE_IN_MS + stayMs);

    _activeToasts.push(entry);
  },

  /**
   * 組合完成的便捷方法
   *
   * @param {string} playerName - 玩家名稱
   * @param {string} comboName  - 組合名稱，例如「🐭規則一」
   */
  comboComplete: function (playerName, comboName) {
    this.show({
      message: "✅ " + playerName + " 完成了 " + comboName + "！",
      type: "normal",
    });
  },

  /**
   * 該玩家全部完成的便捷方法
   *
   * @param {string} playerName - 玩家名稱
   */
  allComplete: function (playerName) {
    this.show({
      message: "🎉 " + playerName + " 全部完成！",
      type: "allComplete",
    });
  },

  /**
   * 所有玩家完成的便捷方法（多人模式）
   */
  everyoneComplete: function () {
    this.show({
      message: "🎉 所有玩家已完成！",
      type: "everyoneComplete",
    });
  },

  /**
   * 清除所有通知
   */
  clearAll: function () {
    for (var i = _activeToasts.length - 1; i >= 0; i--) {
      if (_activeToasts[i].timerId) {
        clearTimeout(_activeToasts[i].timerId);
      }
      if (_activeToasts[i].el && _activeToasts[i].el.parentNode) {
        _activeToasts[i].el.parentNode.removeChild(_activeToasts[i].el);
      }
    }
    _activeToasts = [];
  },

  /**
   * 目前顯示中的通知數量
   * @returns {number}
   */
  activeCount: function () {
    return _activeToasts.length;
  },

  // -----------------------------------------
  // 常數暴露（供測試與外部參照）
  // -----------------------------------------

  /** @readonly */
  MAX_VISIBLE: MAX_VISIBLE,

  /** @readonly */
  STAY_MS: STAY_MS,

  /** @readonly */
  NOTIFY_TYPES: NOTIFY_TYPES,
};

// =========================================
// 匯出
// =========================================

if (typeof window !== "undefined") {
  window.CompletionNotify = CompletionNotify;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = CompletionNotify;
}
