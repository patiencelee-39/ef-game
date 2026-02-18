/**
 * TrialRenderer — 共用試驗視覺渲染模組
 * ============================================
 * 負責：Go/No-Go 試驗的背景 + 情境指示 + 刺激物 SVG 渲染與清除
 * 從 singleplayer/game-controller.js 和 multiplayer/game-controller.js
 * 中提取的共用邏輯，消除兩邊 ~40 行重複程式碼。
 *
 * 依賴：svg-assets.js（SVG_ASSETS 全域物件）
 *
 * API：
 *   TrialRenderer.render(els, question, fieldId, ruleId)
 *   TrialRenderer.clear(els)
 *   TrialRenderer.svg(key)
 * ============================================
 */
var TrialRenderer = (function () {
  "use strict";

  /**
   * 取得 SVG HTML 字串
   * @param {string} key - SVG_ASSETS 中的 key（如 'mouseHole', 'cheese', 'person'）
   * @returns {string} SVG HTML 或空字串
   */
  function svg(key) {
    return (typeof SVG_ASSETS !== "undefined" && SVG_ASSETS[key]) || "";
  }

  /**
   * 渲染單題視覺：背景 + 情境指示 + 刺激物
   *
   * @param {Object} els - DOM 元素集合
   * @param {HTMLElement} els.stimContainer  - .stimulus-container 容器
   * @param {HTMLElement} els.bgLayer        - 背景圖層（#backgroundLayer）
   * @param {HTMLElement} els.ctxIndicator   - 情境指示器（#contextIndicator）
   * @param {HTMLElement} els.stimulus       - 刺激物容器（#stimulus）
   * @param {Object} question - 題目物件 { stimulus, context, isGo, ... }
   * @param {string} fieldId  - 'mouse' | 'fishing'
   * @param {string} ruleId   - 'rule1' | 'rule2' | 'mixed'
   */
  function render(els, question, fieldId, ruleId) {
    // === 重置 ===
    els.stimContainer.className = "stimulus-container";
    els.ctxIndicator.style.display = "none";
    els.ctxIndicator.innerHTML = "";

    // === 背景 ===
    if (fieldId === "mouse") {
      els.bgLayer.innerHTML = svg("mouseHole");
    } else if (fieldId === "fishing") {
      var isNight = ruleId === "mixed" && question.context === "night";
      els.bgLayer.innerHTML = isNight ? svg("oceanNight") : svg("oceanBg");
    }

    // === 混合規則情境指示 ===
    if (ruleId === "mixed" && question.context) {
      switch (question.context) {
        case "hasPerson":
          els.ctxIndicator.innerHTML = svg("person");
          els.ctxIndicator.style.display = "block";
          els.stimContainer.classList.add("context-has-person");
          break;
        case "noPerson":
          // 無人情境：不顯示指示器，僅加 CSS class
          els.stimContainer.classList.add("context-no-person");
          break;
        case "day":
          els.ctxIndicator.innerHTML = svg("sun");
          els.ctxIndicator.style.display = "block";
          els.stimContainer.classList.add("context-day");
          break;
        case "night":
          els.ctxIndicator.innerHTML = svg("moon");
          els.ctxIndicator.style.display = "block";
          els.stimContainer.classList.add("context-night");
          break;
      }
    }

    // === 刺激物 ===
    els.stimulus.innerHTML = svg(question.stimulus) || question.stimulus || "?";
  }

  /**
   * 清空刺激物舞台（ISI 期間 + combo 結束時呼叫）
   *
   * @param {Object} els - 同 render() 的 DOM 元素集合
   */
  function clear(els) {
    els.stimulus.innerHTML = "";
    els.bgLayer.innerHTML = "";
    els.ctxIndicator.style.display = "none";
    els.stimContainer.className = "stimulus-container";
  }

  return { render: render, clear: clear, svg: svg };
})();
