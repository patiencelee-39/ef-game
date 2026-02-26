/**
 * ============================================
 * 遊戲規則說明頁面控制器
 * ============================================
 * 說明：獨立的規則介紹頁面，透過 URL 參數顯示對應規則
 *       URL 格式：game-intro.html?field=mouse&rule=rule1
 *       也可帶 wm=1 參數表示含工作記憶
 *
 * 依賴：game-config.js, svg-assets.js, trial-renderer.js
 * ============================================
 */
(function () {
  "use strict";

  // === DOM ===
  var pageTitle = document.getElementById("pageTitle");
  var introTitle = document.getElementById("introTitle");
  var introTarget = document.getElementById("introTarget");
  var introBoxes = document.getElementById("introBoxes");
  var introContext = document.getElementById("introContext");
  var introWM = document.getElementById("introWM");
  var introNav = document.getElementById("introNav");
  var btnBack = document.getElementById("btnBack");

  // === 初始化 ===
  document.addEventListener("DOMContentLoaded", function () {
    _buildNav();
    _renderFromUrl();
  });

  // === 返回按鈕 ===
  btnBack.addEventListener("click", function () {
    if (
      document.referrer &&
      document.referrer.indexOf(window.location.origin) === 0
    ) {
      history.back();
    } else {
      window.location.href = "../singleplayer/adventure-map.html";
    }
  });

  // === 從 URL 參數解析並渲染 ===
  function _renderFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var fieldId = params.get("field") || "mouse";
    var ruleId = params.get("rule") || "rule1";
    var hasWM = params.get("wm") === "1";

    _renderRule(fieldId, ruleId, hasWM);
    _highlightNav(fieldId, ruleId);
  }

  // === 渲染規則說明 ===
  function _renderRule(fieldId, ruleId, hasWM) {
    var field = GAME_CONFIG.FIELDS[fieldId];
    if (!field) {
      introTitle.textContent = "⚠️ 找不到遊戲場：" + fieldId;
      return;
    }
    var rule = field.rules[ruleId];
    if (!rule) {
      introTitle.textContent = "⚠️ 找不到規則：" + ruleId;
      return;
    }

    // 頁面標題
    pageTitle.textContent = "📖 " + field.name + " — " + (rule.name || ruleId);

    // 卡片標題
    introTitle.textContent = field.icon + " " + (rule.name || ruleId);

    // 訓練目標
    introTarget.textContent = "🎯 訓練目標：" + (rule.trainingTarget || "");

    // 規則框
    introBoxes.innerHTML = "";

    if (ruleId === "mixed") {
      var ruleA = field.rules[rule.contextA.appliesRule];
      var ruleB = field.rules[rule.contextB.appliesRule];

      introBoxes.innerHTML =
        '<p style="font-weight:700;color:var(--text-white);margin-bottom:8px;">' +
        rule.contextA.label +
        "（多數情境 " +
        Math.round(GAME_CONFIG.RATIOS.MIXED_CONTEXT_A * 100) +
        "%）：</p>" +
        _boxHTML(ruleA.go.stimulus, "按空白鍵！", true) +
        _boxHTML(ruleA.noGo.stimulus, "不要按！", false) +
        '<p style="font-weight:700;color:#f39c12;margin:16px 0 8px;">⚠️ ' +
        rule.contextB.label +
        "（少數情境 " +
        Math.round(GAME_CONFIG.RATIOS.MIXED_CONTEXT_B * 100) +
        "%）：</p>" +
        _boxHTML(ruleB.go.stimulus, "按空白鍵！", true) +
        _boxHTML(ruleB.noGo.stimulus, "不要按！", false);

      introContext.classList.remove("hidden");
      introContext.textContent =
        fieldId === "mouse"
          ? "👤 有人出現時規則會改變！注意畫面右上角"
          : "🌛 晚上時規則會改變！注意背景顏色";
    } else {
      // 根據場地取得 Go 比例
      var goRatioPct =
        fieldId === "mouse"
          ? Math.round(GAME_CONFIG.RATIOS.MOUSE_GO * 100)
          : Math.round(GAME_CONFIG.RATIOS.FISHING_GO * 100);
      var noGoRatioPct = 100 - goRatioPct;

      introBoxes.innerHTML =
        _boxHTML(rule.go.stimulus, "按空白鍵！（" + goRatioPct + "%）", true) +
        _boxHTML(
          rule.noGo.stimulus,
          "不要按！（" + noGoRatioPct + "%）",
          false,
        );
      introContext.classList.add("hidden");
    }

    // WM 提示
    introWM.classList.toggle("hidden", !hasWM);
  }

  // === 產生單個規則框 HTML ===
  function _boxHTML(stimKey, actionText, isGo) {
    var cls = isGo ? "rule-box rule-box--go" : "rule-box rule-box--nogo";
    var txtCls = isGo
      ? "rule-action-text rule-action-text--go"
      : "rule-action-text rule-action-text--nogo";
    var svgHTML =
      typeof TrialRenderer !== "undefined" && TrialRenderer.svg
        ? TrialRenderer.svg(stimKey)
        : stimKey;
    return (
      '<div class="' +
      cls +
      '">' +
      '<span class="rule-stim-icon">' +
      svgHTML +
      "</span>" +
      '<span style="color:var(--text-light);font-size:1.5rem;">→</span>' +
      '<span class="' +
      txtCls +
      '">' +
      actionText +
      "</span>" +
      "</div>"
    );
  }

  // === 建立快速切換導航 ===
  function _buildNav() {
    var fields = GAME_CONFIG.FIELDS;
    var navHTML = "";

    Object.keys(fields).forEach(function (fieldId) {
      var field = fields[fieldId];
      Object.keys(field.rules).forEach(function (ruleId) {
        var rule = field.rules[ruleId];
        var label =
          field.icon + " " + (rule.name || ruleId).replace(/（.*）/, "");
        navHTML +=
          '<button class="intro-nav__btn" data-field="' +
          fieldId +
          '" data-rule="' +
          ruleId +
          '">' +
          label +
          "</button>";
      });
    });

    introNav.innerHTML = navHTML;

    // 委派事件
    introNav.addEventListener("click", function (e) {
      var btn = e.target.closest(".intro-nav__btn");
      if (!btn) return;
      var fId = btn.getAttribute("data-field");
      var rId = btn.getAttribute("data-rule");

      // 更新 URL（不重新載入）
      var url = new URL(window.location);
      url.searchParams.set("field", fId);
      url.searchParams.set("rule", rId);
      url.searchParams.delete("wm");
      history.replaceState(null, "", url);

      _renderRule(fId, rId, false);
      _highlightNav(fId, rId);
    });
  }

  // === 高亮當前導航按鈕 ===
  function _highlightNav(fieldId, ruleId) {
    var btns = introNav.querySelectorAll(".intro-nav__btn");
    for (var i = 0; i < btns.length; i++) {
      var btn = btns[i];
      var isActive =
        btn.getAttribute("data-field") === fieldId &&
        btn.getAttribute("data-rule") === ruleId;
      btn.classList.toggle("active", isActive);
    }
  }
})();
