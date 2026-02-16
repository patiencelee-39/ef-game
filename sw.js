/**
 * Service Worker — 執行功能訓練遊戲
 *
 * 策略：
 *   - 靜態資源（CSS、JS、SVG）→ Cache-First
 *   - HTML 頁面 → Network-First（離線時 fallback 到 cache）
 *   - Firebase / API 請求 → Network-Only（不快取）
 *
 * 版本號更新時會自動清除舊快取。
 */

var CACHE_VERSION = "efgame-20260216";
var STATIC_CACHE = CACHE_VERSION + "-static";
var PAGE_CACHE = CACHE_VERSION + "-pages";

/**
 * 核心靜態資源 — 安裝時預快取
 * 這些是遊戲正常運作所需的最小集合
 */
var PRE_CACHE = [
  "/",
  "/index.html",
  "/css/themes/base.css",
  "/css/main.css",
  "/css/components/navbar.css",
  "/css/components/landscape-hint.css",
  "/js/shared/navbar.js",
  "/js/shared/landscape-hint.js",
  "/js/shared/focus-trap.js",
  "/js/game-config.js",
  "/js/svg-assets.js",
  "/js/utils/storage.js",
  "/favicon.svg",
  "/manifest.json",
];

// ========================
// Install：預快取核心資源
// ========================
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then(function (cache) {
        return cache.addAll(PRE_CACHE);
      })
      .then(function () {
        return self.skipWaiting();
      }),
  );
});

// ========================
// Activate：清除舊版快取
// ========================
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys.map(function (key) {
            if (key !== STATIC_CACHE && key !== PAGE_CACHE) {
              return caches.delete(key);
            }
          }),
        );
      })
      .then(function () {
        return self.clients.claim();
      }),
  );
});

// ========================
// Fetch：路由策略
// ========================
self.addEventListener("fetch", function (event) {
  var url = new URL(event.request.url);

  // 1) 非 GET 請求 → 直接放行
  if (event.request.method !== "GET") return;

  // 2) Firebase / 第三方 API → Network-Only（不快取）
  if (
    url.hostname.indexOf("firebaseio.com") !== -1 ||
    url.hostname.indexOf("googleapis.com") !== -1 ||
    url.hostname.indexOf("gstatic.com") !== -1 ||
    url.hostname.indexOf("firebasedatabase.app") !== -1
  ) {
    return;
  }

  // 3) 靜態資源（css, js, svg, png, webp, mp3, ogg）→ Cache-First
  if (/\.(css|js|svg|png|webp|mp3|ogg|woff2?)$/i.test(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then(function (cached) {
        if (cached) return cached;
        return fetch(event.request).then(function (response) {
          if (response && response.status === 200) {
            var clone = response.clone();
            caches.open(STATIC_CACHE).then(function (cache) {
              cache.put(event.request, clone);
            });
          }
          return response;
        });
      }),
    );
    return;
  }

  // 4) HTML 頁面 → Network-First
  if (
    event.request.headers.get("accept") &&
    event.request.headers.get("accept").indexOf("text/html") !== -1
  ) {
    event.respondWith(
      fetch(event.request)
        .then(function (response) {
          if (response && response.status === 200) {
            var clone = response.clone();
            caches.open(PAGE_CACHE).then(function (cache) {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(function () {
          return caches.match(event.request).then(function (cached) {
            return cached || caches.match("/index.html");
          });
        }),
    );
    return;
  }
});
