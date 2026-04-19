/**
 * 全局主題初始化腳本
 * 
 * 白話版說明：
 * 這個腳本在頁面載入時立即執行，讀取玩家上次選擇的主題色，
 * 然後設定到 <html> 標籤上，讓 CSS 知道要用哪個主題。
 * 不依賴任何其他模組，可以在任何 JS 之前執行。
 */
(function () {
  "use strict";

  var KEY = "efgame-player-profile";
  var DEFAULT_THEME = "field-primary";

  try {
    var raw = localStorage.getItem(KEY);
    var theme = raw ? (JSON.parse(raw).colorTheme || DEFAULT_THEME) : DEFAULT_THEME;
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", DEFAULT_THEME);
  }
})();
