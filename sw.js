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

var CACHE_VERSION = "efgame-20260225a";
var STATIC_CACHE = CACHE_VERSION + "-static";
var PAGE_CACHE = CACHE_VERSION + "-pages";

/**
 * 核心靜態資源 — 安裝時預快取
 * 只預快取必要的 HTML / CSS / JS / 圖片，讓 SW 快速安裝。
 * 語音 MP3 檔改為「首次播放時自動快取」(Cache-First on demand)，
 * 避免一次下載 160+ 檔案導致頁面卡頓。
 */
var PRE_CACHE = [
  "/",
  "/index.html",
  "/home.html",
  "/offline.html",
  // ── 單人遊戲頁面 ──
  "/singleplayer/game.html",
  "/singleplayer/result.html",
  "/singleplayer/pet.html",
  "/singleplayer/adventure-map.html",
  // ── CSS 基礎 ──
  "/css/themes/base.css",
  "/css/themes/theme-field-primary.css",
  "/css/themes/theme-rule-independent.css",
  "/css/main.css",
  "/css/components/navbar.css",
  "/css/components/landscape-hint.css",
  "/css/components/story-dialogue.css",
  // ── CSS 頁面 ──
  "/css/pages/game.css",
  "/css/pages/adventure-map.css",
  "/css/pages/result.css",
  "/css/pages/pet.css",
  // ── JS 共用 ──
  "/js/shared/navbar.js",
  "/js/shared/landscape-hint.js",
  "/js/shared/focus-trap.js",
  "/js/shared/trial-renderer.js",
  "/js/stimuli-config.js",
  "/js/game/stimulus-renderer.js",
  "/js/shared/audio-player.js",
  "/js/shared/countdown.js",
  "/js/shared/feedback-overlay.js",
  "/js/shared/working-memory.js",
  "/js/shared/completion-notify.js",
  "/js/shared/story-dialogue-controller.js",
  "/js/shared/game-modal.js",
  // ── JS 單人模組 ──
  "/js/singleplayer/game-controller.js",
  "/js/singleplayer/mode-controller.js",
  "/js/singleplayer/result-controller.js",
  "/js/singleplayer/adventure-map-controller.js",
  "/js/singleplayer/progress-tracker.js",
  "/js/singleplayer/pet-controller.js",
  "/js/utils/level-calculator.js",
  // ── JS 設定 & 工具 ──
  "/js/firebase-bundle.js",
  "/js/game-config.js",
  "/js/svg-assets.js",
  "/js/story-config.js",
  "/js/sound-config.js",
  "/js/utils/storage.js",
  "/js/utils/logger.js",
  // ── 靜態資源 ──
  "/favicon.svg",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/manifest.json",
  // ── 語音：僅預快取遊戲核心音效 (刺激詞 + 倒數 + 回饋) ──
  "/audio/voice/female/cat.mp3",
  "/audio/voice/female/cheese.mp3",
  "/audio/voice/female/fish.mp3",
  "/audio/voice/female/shark.mp3",
  "/audio/voice/male/cat.mp3",
  "/audio/voice/male/cheese.mp3",
  "/audio/voice/male/fish.mp3",
  "/audio/voice/male/shark.mp3",
  "/audio/voice/ui/voice-ui-countdown-go.mp3",
  "/audio/voice/ui/voice-ui-countdown-hint.mp3",
  "/audio/voice/ui/voice-ui-feedback-correct.mp3",
  "/audio/voice/ui/voice-ui-feedback-incorrect.mp3",
  "/audio/voice/ui/voice-ui-rule-go.mp3",
  "/audio/voice/ui/voice-ui-rule-nogo.mp3",
  "/audio/voice/ui/voice-ui-rule-reverse-warning.mp3",
  "/audio/voice/wm/wm-forward.mp3",
  "/audio/voice/wm/wm-reverse.mp3",
  // 其餘 ~140 個語音檔（徽章、寵物、故事、解鎖、等級等）
  // 改為 Cache-First on demand：首次播放時自動快取，不影響安裝速度
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
// Activate：清除舊版快取 + 限制快取大小
// ========================

/**
 * 限制快取條目數量（FIFO：刪除最早的條目）
 */
function trimCache(cacheName, maxEntries) {
  caches.open(cacheName).then(function (cache) {
    cache.keys().then(function (keys) {
      if (keys.length > maxEntries) {
        cache.delete(keys[0]).then(function () {
          trimCache(cacheName, maxEntries);
        });
      }
    });
  });
}

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
        // 限制靜態快取 250 筆、頁面快取 20 筆
        trimCache(STATIC_CACHE, 250);
        trimCache(PAGE_CACHE, 20);
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
            return cached || caches.match("/offline.html");
          });
        }),
    );
    return;
  }
});
