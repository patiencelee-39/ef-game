/**
 * landscape-hint.js — 橫向螢幕提示自動注入
 *
 * 搭配 css/components/landscape-hint.css 使用。
 * 在行動裝置橫放時自動顯示「請直立裝置」的全螢幕提示。
 * 桌面瀏覽器不受影響（CSS media query 限制 ≤900px）。
 */
(function () {
  "use strict";

  function _injectLandscapeHint() {
    // 避免重複注入
    if (document.querySelector(".landscape-overlay")) return;

    var overlay = document.createElement("div");
    overlay.className = "landscape-overlay";
    overlay.setAttribute("aria-live", "assertive");
    overlay.innerHTML =
      '<div class="landscape-overlay__icon">📱</div>' +
      '<div class="landscape-overlay__title">請將裝置直立</div>' +
      '<div class="landscape-overlay__msg">本遊戲專為直向螢幕設計，<br>請旋轉您的裝置以獲得最佳體驗 🎮</div>';

    document.body.appendChild(overlay);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", _injectLandscapeHint);
  } else {
    _injectLandscapeHint();
  }
})();
