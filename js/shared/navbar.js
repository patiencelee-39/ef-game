/**
 * ============================================
 * 底部導覽列 — Navbar
 * ============================================
 * 用法：在頁面底部 </body> 前引入此 JS
 *   <link rel="stylesheet" href="../css/components/navbar.css" />
 *   <script src="../js/shared/navbar.js"></script>
 *
 * 會自動：
 *   1. 注入導覽列 HTML
 *   2. 根據當前 URL 標記 active
 *   3. body 加上 has-navbar class
 *
 * 若頁面是淺色背景，加 data-navbar-light="true" 到 <body>
 * 若遊戲進行中不想顯示，加 class="game-playing" 到 <body>
 * ============================================
 */

(function () {
  "use strict";

  // 導覽項目定義
  var NAV_ITEMS = [
    {
      id: "adventure",
      icon: "🗺️",
      label: "冒險",
      href: "/singleplayer/adventure-map.html",
    },
    {
      id: "compete",
      icon: "⚔️",
      label: "競賽",
      href: "/multiplayer/room-create.html",
    },
    {
      id: "leaderboard",
      icon: "📊",
      label: "排行",
      href: "/leaderboard/index.html",
    },
    {
      id: "pet",
      icon: "🐔",
      label: "養雞場",
      href: "/singleplayer/pet.html",
    },
    {
      id: "shop",
      icon: "🛒",
      label: "商店",
      href: "/singleplayer/avatar-shop.html",
    },
    { id: "settings", icon: "⚙️", label: "設定", href: "/settings/index.html" },
  ];

  /**
   * 判斷當前路徑對應哪個 nav item
   */
  function _detectActiveId() {
    var path = window.location.pathname;

    // 精確匹配
    for (var i = 0; i < NAV_ITEMS.length; i++) {
      if (path.endsWith(NAV_ITEMS[i].href)) return NAV_ITEMS[i].id;
    }

    // 模糊匹配：依資料夾
    if (
      path.indexOf("/singleplayer/") !== -1 &&
      path.indexOf("shop") === -1 &&
      path.indexOf("pet") === -1
    ) {
      return "adventure";
    }
    if (path.indexOf("/multiplayer/") !== -1) return "compete";
    if (path.indexOf("/leaderboard/") !== -1) return "leaderboard";
    if (path.indexOf("/settings/") !== -1) return "settings";
    if (path.indexOf("pet") !== -1) return "pet";
    if (
      path.indexOf("shop") !== -1 ||
      path.indexOf("avatar-shop") !== -1 ||
      path.indexOf("sticker-book") !== -1
    )
      return "shop";

    // 首頁 → 冒險
    if (path === "/" || path.endsWith("/index.html")) return "adventure";

    return "";
  }

  /**
   * 計算相對路徑前綴
   * 例如 /singleplayer/result.html → "../"
   * 例如 /index.html → ""
   */
  function _getPathPrefix() {
    var path = window.location.pathname;

    // 在子資料夾中（singleplayer/ multiplayer/ leaderboard/ settings/）
    if (
      path.indexOf("/singleplayer/") !== -1 ||
      path.indexOf("/multiplayer/") !== -1 ||
      path.indexOf("/leaderboard/") !== -1 ||
      path.indexOf("/settings/") !== -1 ||
      path.indexOf("/management/") !== -1
    ) {
      return "../";
    }

    // 根目錄
    return "";
  }

  function _injectNavbar() {
    // — Skip Navigation 連結（如尚未存在）
    if (!document.querySelector(".skip-link")) {
      var skipLink = document.createElement("a");
      skipLink.className = "skip-link";
      skipLink.href = "#main-content";
      skipLink.textContent = "跳到主要內容";
      document.body.insertBefore(skipLink, document.body.firstChild);
    }

    var activeId = _detectActiveId();
    var prefix = _getPathPrefix();
    var isLight = document.body.getAttribute("data-navbar-light") === "true";

    var nav = document.createElement("nav");
    nav.className = "bottom-nav" + (isLight ? " bottom-nav--light" : "");
    nav.setAttribute("aria-label", "主導覽");

    var html = "";
    for (var i = 0; i < NAV_ITEMS.length; i++) {
      var item = NAV_ITEMS[i];
      var isActive = item.id === activeId;
      var href = prefix + item.href.substring(1); // 去掉開頭的 /

      html += '<a class="bottom-nav__item' + (isActive ? " active" : "") + '"';
      html += ' href="' + href + '"';
      html += ' data-nav-id="' + item.id + '"';
      html += ">";
      html += '<span class="bottom-nav__icon">' + item.icon + "</span>";
      html += '<span class="bottom-nav__label">' + item.label + "</span>";
      html += "</a>";
    }

    nav.innerHTML = html;
    document.body.appendChild(nav);
    document.body.classList.add("has-navbar");
  }

  // 頁面載入後注入
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", _injectNavbar);
  } else {
    _injectNavbar();
  }
})();
