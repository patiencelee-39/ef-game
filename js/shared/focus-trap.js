/**
 * ============================================
 * 焦點陷阱工具 (Focus Trap Utility)
 * ============================================
 * 版本: v1.0
 * 說明: 為對話框 / 彈窗提供焦點陷阱功能
 *       開啟時鎖定 Tab 在對話框內循環，
 *       關閉時還原先前焦點。
 *
 * 使用方式:
 *   // 開啟
 *   FocusTrap.activate(dialogElement);
 *   // 關閉
 *   FocusTrap.deactivate();
 * ============================================
 */

var FocusTrap = (function () {
  "use strict";

  var _activeDialog = null;
  var _previousFocus = null;

  var FOCUSABLE =
    'a[href], button:not([disabled]), textarea, input:not([disabled]), select, [tabindex]:not([tabindex="-1"])';

  function _getFocusable(container) {
    var els = Array.prototype.slice.call(container.querySelectorAll(FOCUSABLE));
    // 只保留可見元素
    return els.filter(function (el) {
      return el.offsetParent !== null;
    });
  }

  function _handleKeydown(e) {
    if (e.key !== "Tab" || !_activeDialog) return;

    var focusable = _getFocusable(_activeDialog);
    if (focusable.length === 0) {
      e.preventDefault();
      return;
    }

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      // Shift+Tab: 到第一個時跳回最後一個
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      // Tab: 到最後一個時跳回第一個
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  /**
   * 啟動焦點陷阱
   * @param {HTMLElement} dialogEl - 要鎖定焦點的對話框元素
   */
  function activate(dialogEl) {
    if (!dialogEl) return;

    // 若已有陷阱在運作，先釋放
    if (_activeDialog) {
      deactivate();
    }

    _previousFocus = document.activeElement;
    _activeDialog = dialogEl;

    // 設定 ARIA 屬性
    dialogEl.setAttribute("aria-modal", "true");

    document.addEventListener("keydown", _handleKeydown);

    // 將焦點移到對話框中第一個可聚焦元素
    requestAnimationFrame(function () {
      var focusable = _getFocusable(dialogEl);
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        // 若無可聚焦元素，讓 dialog 本身可聚焦
        dialogEl.setAttribute("tabindex", "-1");
        dialogEl.focus();
      }
    });
  }

  /**
   * 釋放焦點陷阱，還原先前焦點
   */
  function deactivate() {
    document.removeEventListener("keydown", _handleKeydown);

    if (_previousFocus && typeof _previousFocus.focus === "function") {
      _previousFocus.focus();
    }

    _activeDialog = null;
    _previousFocus = null;
  }

  return {
    activate: activate,
    deactivate: deactivate,
  };
})();
