/**
 * ============================================
 * GameModal — 共用自訂彈窗元件
 * ============================================
 * 取代瀏覽器原生 prompt()、confirm()、alert()
 * 自動建立 DOM（無需頁面預埋 HTML）
 *
 * API：
 *   GameModal.alert(title, msg, opts)          → Promise<void>
 *   GameModal.confirm(title, msg, opts)        → Promise<boolean>
 *   GameModal.prompt(title, placeholder, opts) → Promise<string|null>
 *
 * opts 可選：
 *   icon        — emoji 圖示（預設依類型自動選）
 *   okText      — 確認按鈕文字（預設「確定」）
 *   cancelText  — 取消按鈕文字（預設「取消」）
 *   inputType   — prompt 的 input type（預設 "text"）
 *
 * 匯出：window.GameModal
 * ============================================
 */
var GameModal = (function () {
  "use strict";

  // ─── CSS（只注入一次）───
  var _injected = false;
  var MODAL_CSS =
    ".gm-overlay{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.65);" +
    "display:flex;align-items:center;justify-content:center;padding:24px;" +
    "opacity:0;transition:opacity .25s ease;pointer-events:none}" +
    ".gm-overlay.gm-show{opacity:1;pointer-events:auto}" +
    ".gm-card{background:linear-gradient(135deg,#1a1a2e,#16213e);" +
    "border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:28px 24px;" +
    "max-width:380px;width:100%;text-align:center;" +
    "transform:translateY(30px);transition:transform .3s cubic-bezier(.34,1.56,.64,1)}" +
    ".gm-show .gm-card{transform:translateY(0)}" +
    ".gm-icon{font-size:2.6rem;margin-bottom:8px}" +
    ".gm-title{color:#fff;font-size:1.15rem;font-weight:700;margin-bottom:6px}" +
    ".gm-msg{color:rgba(255,255,255,.72);font-size:.92rem;line-height:1.55;margin-bottom:18px}" +
    ".gm-input{width:100%;padding:10px 14px;border:2px solid rgba(255,255,255,.15);" +
    "border-radius:10px;background:rgba(255,255,255,.06);color:#fff;" +
    "font-size:1rem;outline:none;margin-bottom:16px;box-sizing:border-box}" +
    ".gm-input:focus{border-color:rgba(102,126,234,.6)}" +
    ".gm-input::placeholder{color:rgba(255,255,255,.35)}" +
    ".gm-btns{display:flex;gap:10px;justify-content:center}" +
    ".gm-btn{flex:1;padding:11px 0;border:none;border-radius:12px;font-size:.95rem;" +
    "font-weight:600;cursor:pointer;min-height:44px;transition:transform .15s}" +
    ".gm-btn:active{transform:scale(.95)}" +
    ".gm-btn-ok{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff}" +
    ".gm-btn-cancel{background:rgba(255,255,255,.08);color:rgba(255,255,255,.7);" +
    "border:1px solid rgba(255,255,255,.15)}";

  function _injectCSS() {
    if (_injected) return;
    _injected = true;
    var s = document.createElement("style");
    s.textContent = MODAL_CSS;
    document.head.appendChild(s);
  }

  // ─── 建立 DOM ───
  function _build(type, title, msgOrPlaceholder, opts) {
    _injectCSS();
    opts = opts || {};

    var defaultIcons = { alert: "💡", confirm: "⚠️", prompt: "✏️" };
    var icon = opts.icon || defaultIcons[type] || "💡";
    var okText = opts.okText || "確定";
    var cancelText = opts.cancelText || "取消";

    var overlay = document.createElement("div");
    overlay.className = "gm-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");

    var html =
      '<div class="gm-card">' +
      '<div class="gm-icon">' +
      icon +
      "</div>" +
      '<div class="gm-title">' +
      _esc(title) +
      "</div>";

    if (type === "prompt") {
      html +=
        '<input class="gm-input" type="' +
        (opts.inputType || "text") +
        '" placeholder="' +
        _esc(msgOrPlaceholder) +
        '" autocomplete="off" />';
    } else if (msgOrPlaceholder) {
      html +=
        '<div class="gm-msg">' +
        (opts.rawHtml ? msgOrPlaceholder : _esc(msgOrPlaceholder)) +
        "</div>";
    }

    html += '<div class="gm-btns">';
    if (type !== "alert") {
      html +=
        '<button class="gm-btn gm-btn-cancel">' + cancelText + "</button>";
    }
    html += '<button class="gm-btn gm-btn-ok">' + okText + "</button>";
    html += "</div></div>";

    overlay.innerHTML = html;
    return overlay;
  }

  function _esc(str) {
    if (!str) return "";
    var d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  function _show(overlay) {
    document.body.appendChild(overlay);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlay.classList.add("gm-show");
      });
    });
  }

  function _dismiss(overlay, cb) {
    overlay.classList.remove("gm-show");
    setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      if (cb) cb();
    }, 280);
  }

  // ─── Public API ───

  /**
   * 顯示提示訊息（取代 alert()）
   * @param {string} title
   * @param {string} [msg]
   * @param {Object} [opts]
   * @returns {Promise<void>}
   */
  function alert(title, msg, opts) {
    return new Promise(function (resolve) {
      var el = _build("alert", title, msg, opts);
      _show(el);

      el.querySelector(".gm-btn-ok").addEventListener("click", function () {
        _dismiss(el, resolve);
      });

      // Escape 鍵
      function onKey(e) {
        if (e.key === "Escape" || e.key === "Enter") {
          e.preventDefault();
          document.removeEventListener("keydown", onKey);
          _dismiss(el, resolve);
        }
      }
      document.addEventListener("keydown", onKey);

      // 聚焦確定按鈕
      setTimeout(function () {
        el.querySelector(".gm-btn-ok").focus();
      }, 100);
    });
  }

  /**
   * 顯示確認彈窗（取代 confirm()）
   * @param {string} title
   * @param {string} [msg]
   * @param {Object} [opts]
   * @returns {Promise<boolean>}
   */
  function confirm(title, msg, opts) {
    return new Promise(function (resolve) {
      var el = _build("confirm", title, msg, opts);
      _show(el);

      var resolved = false;
      function done(val) {
        if (resolved) return;
        resolved = true;
        document.removeEventListener("keydown", onKey);
        _dismiss(el, function () {
          resolve(val);
        });
      }

      el.querySelector(".gm-btn-ok").addEventListener("click", function () {
        done(true);
      });
      el.querySelector(".gm-btn-cancel").addEventListener("click", function () {
        done(false);
      });

      function onKey(e) {
        if (e.key === "Escape") {
          e.preventDefault();
          done(false);
        } else if (e.key === "Enter") {
          e.preventDefault();
          done(true);
        }
      }
      document.addEventListener("keydown", onKey);

      setTimeout(function () {
        el.querySelector(".gm-btn-ok").focus();
      }, 100);
    });
  }

  /**
   * 顯示輸入彈窗（取代 prompt()）
   * @param {string} title
   * @param {string} [placeholder]
   * @param {Object} [opts]
   * @returns {Promise<string|null>}   null = 取消
   */
  function prompt(title, placeholder, opts) {
    return new Promise(function (resolve) {
      var el = _build("prompt", title, placeholder, opts);
      _show(el);

      var input = el.querySelector(".gm-input");
      var resolved = false;

      function done(val) {
        if (resolved) return;
        resolved = true;
        document.removeEventListener("keydown", onKey);
        _dismiss(el, function () {
          resolve(val);
        });
      }

      el.querySelector(".gm-btn-ok").addEventListener("click", function () {
        done(input.value || null);
      });
      el.querySelector(".gm-btn-cancel").addEventListener("click", function () {
        done(null);
      });

      function onKey(e) {
        if (e.isComposing || e.keyCode === 229) return;
        if (e.key === "Escape") {
          e.preventDefault();
          done(null);
        } else if (e.key === "Enter") {
          e.preventDefault();
          done(input.value || null);
        }
      }
      document.addEventListener("keydown", onKey);

      setTimeout(function () {
        input.focus();
      }, 100);
    });
  }

  return {
    alert: alert,
    confirm: confirm,
    prompt: prompt,
  };
})();

// ─── 匯出 ───
if (typeof window !== "undefined") {
  window.GameModal = GameModal;
}
