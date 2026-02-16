/**
 * ============================================
 * 刺激物渲染器
 * ============================================
 * 對應需求文件：§4.5, §4.5.5
 * 說明：負責刺激物視覺渲染（SVG/Emoji fallback）
 *       + 條件提示渲染（有人/白天/晚上）
 *       + 語音檔案路徑查詢（男女聲切換）
 * 依賴：stimuli-config.js（STIMULI_PACKS, getFieldStimuli）
 *
 * 三級 Fallback：SVG → Emoji → 文字 label
 *
 * @todo Phase 3 — 語音四級 Fallback 整合
 *   本檔 getStimulusVoiceFile() 目前只回傳路徑，無 fallback 邏輯。
 *   Phase 3 新建 audio-player.js 時，需實作語音四級降級：
 *   L1 自訂 MP3 → L2 gTTS 預生成 → L3 Web Speech API → L4 純視覺
 *   詳見 §5.4c 第 5 項 + Flow-20 語音分支
 * ============================================
 */

// =========================================
// 刺激物渲染
// =========================================

/**
 * 渲染刺激物（SVG 優先，Emoji fallback）
 *
 * @param {string} fieldId      - 'mouse' 或 'fishing'
 * @param {string} stimulusType - 'go' 或 'noGo'
 * @returns {string} HTML 字串
 */
function renderStimulus(fieldId, stimulusType) {
  var fieldStimuli = getFieldStimuli(fieldId);
  if (!fieldStimuli) {
    console.warn("⚠️ 找不到遊戲場刺激物：" + fieldId);
    return '<span class="stimulus-fallback">?</span>';
  }

  var stim =
    stimulusType === "go" ? fieldStimuli.goStimulus : fieldStimuli.noGoStimulus;
  if (!stim) {
    console.warn("⚠️ 找不到刺激物類型：" + stimulusType);
    return '<span class="stimulus-fallback">?</span>';
  }

  // 嘗試 SVG
  if (stim.svgFile) {
    return (
      '<img src="' +
      stim.svgFile +
      '" ' +
      'alt="' +
      (stim.altText || stim.label) +
      '" ' +
      'class="stimulus-svg" ' +
      "onerror=\"this.style.display='none';this.nextElementSibling.style.display='inline'\" />" +
      '<span class="stimulus-emoji" style="display:none">' +
      stim.emoji +
      "</span>"
    );
  }

  // Emoji fallback
  return '<span class="stimulus-emoji">' + stim.emoji + "</span>";
}

/**
 * 根據刺激物 key 渲染（混合規則用，刺激物 key 可能是 'cheese'/'cat'/'fish'/'shark'）
 *
 * @param {string} fieldId       - 'mouse' 或 'fishing'
 * @param {string} stimulusKey   - 刺激物 key（如 'cheese', 'cat', 'fish', 'shark'）
 * @returns {string} HTML 字串
 */
function renderStimulusByKey(fieldId, stimulusKey) {
  var fieldStimuli = getFieldStimuli(fieldId);
  if (!fieldStimuli) return '<span class="stimulus-fallback">?</span>';

  // 判斷是 Go 還是 NoGo
  if (
    fieldStimuli.goStimulus &&
    fieldStimuli.goStimulus.label === stimulusKey
  ) {
    return renderStimulus(fieldId, "go");
  }
  if (
    fieldStimuli.noGoStimulus &&
    fieldStimuli.noGoStimulus.label === stimulusKey
  ) {
    return renderStimulus(fieldId, "noGo");
  }

  // 用 stimulus key 比對（game-config 中的 stimulus key）
  var goKey = null;
  var noGoKey = null;
  if (typeof GAME_CONFIG !== "undefined") {
    var field = GAME_CONFIG.FIELDS[fieldId];
    if (field) {
      goKey = field.rules.rule1.go.stimulus;
      noGoKey = field.rules.rule1.noGo.stimulus;
    }
  }

  if (stimulusKey === goKey) {
    return renderStimulus(fieldId, "go");
  }
  if (stimulusKey === noGoKey) {
    return renderStimulus(fieldId, "noGo");
  }

  console.warn("⚠️ 未知的刺激物 key：" + stimulusKey);
  return '<span class="stimulus-fallback">' + stimulusKey + "</span>";
}

// =========================================
// 條件提示渲染（混合規則用）
// =========================================

/**
 * 渲染混合規則的條件提示
 *
 * @param {string} fieldId      - 'mouse' 或 'fishing'
 * @param {string} contextValue - 情境值（如 'noPerson', 'hasPerson', 'day', 'night'）
 * @returns {{ html: string, borderColor: string|null, backgroundGradient: string|null, cssClass: string }}
 */
function renderContext(fieldId, contextValue) {
  var fieldStimuli = getFieldStimuli(fieldId);
  if (!fieldStimuli || !fieldStimuli.contextIndicator) {
    return {
      html: "",
      borderColor: null,
      backgroundGradient: null,
      cssClass: "",
    };
  }

  var ctx = fieldStimuli.contextIndicator;
  var result = {
    html: "",
    borderColor: null,
    backgroundGradient: null,
    cssClass: "",
  };

  if (ctx.type === "presence") {
    // 🐭 小老鼠：有人/沒人
    if (contextValue === "hasPerson" && ctx.present) {
      var p = ctx.present;
      if (p.svgFile) {
        result.html =
          '<img src="' +
          p.svgFile +
          '" alt="' +
          p.label +
          '" class="context-indicator-svg" ' +
          "onerror=\"this.style.display='none';this.nextElementSibling.style.display='inline'\" />" +
          '<span class="context-indicator-emoji" style="display:none">' +
          p.emoji +
          "</span>";
      } else {
        result.html =
          '<span class="context-indicator-emoji">' + p.emoji + "</span>";
      }
      result.borderColor = p.borderColor || null;
      result.cssClass = "context-person";
    } else {
      // noPerson → 一般畫面，無額外視覺
      result.cssClass = "context-no-person";
    }
  } else if (ctx.type === "dayNight") {
    // 🐟 釣魚：白天/晚上
    if (contextValue === "day" && ctx.day) {
      var d = ctx.day;
      if (d.svgFile) {
        result.html =
          '<img src="' +
          d.svgFile +
          '" alt="' +
          d.label +
          '" class="context-indicator-svg" ' +
          "onerror=\"this.style.display='none';this.nextElementSibling.style.display='inline'\" />" +
          '<span class="context-indicator-emoji" style="display:none">' +
          d.emoji +
          "</span>";
      } else {
        result.html =
          '<span class="context-indicator-emoji">' + d.emoji + "</span>";
      }
      result.borderColor = d.borderColor || null;
      result.backgroundGradient = d.backgroundGradient || null;
      result.cssClass = "context-day";
    } else if (contextValue === "night" && ctx.night) {
      var n = ctx.night;
      if (n.svgFile) {
        result.html =
          '<img src="' +
          n.svgFile +
          '" alt="' +
          n.label +
          '" class="context-indicator-svg" ' +
          "onerror=\"this.style.display='none';this.nextElementSibling.style.display='inline'\" />" +
          '<span class="context-indicator-emoji" style="display:none">' +
          n.emoji +
          "</span>";
      } else {
        result.html =
          '<span class="context-indicator-emoji">' + n.emoji + "</span>";
      }
      result.borderColor = n.borderColor || null;
      result.backgroundGradient = n.backgroundGradient || null;
      result.cssClass = "context-night";
    }
  }

  return result;
}

// =========================================
// 語音檔案路徑
// =========================================

/**
 * 取得刺激物語音檔案路徑（男女聲切換）
 *
 * 規則：
 *   - 規則一（單獨）→ 女聲
 *   - 規則二（單獨）→ 女聲
 *   - 混合規則 A 情境 → 女聲
 *   - 混合規則 B 情境 → 男聲
 *
 * @param {string} fieldId      - 'mouse' 或 'fishing'
 * @param {string} stimulusType - 'go' 或 'noGo'
 * @param {string} ruleContext  - 'rule1' | 'rule2' | 'mixed-rule1' | 'mixed-rule2'
 * @returns {string|null} 語音檔路徑，或 null
 */
function getStimulusVoiceFile(fieldId, stimulusType, ruleContext) {
  var fieldStimuli = getFieldStimuli(fieldId);
  if (!fieldStimuli) return null;

  var stim =
    stimulusType === "go" ? fieldStimuli.goStimulus : fieldStimuli.noGoStimulus;
  if (!stim) return null;

  // 決定性別：mixed-rule2（混合規則 B 情境）用男聲，其餘用女聲
  if (ruleContext === "mixed-rule2") {
    return stim.voiceMale || null;
  }
  return stim.voiceFemale || null;
}

/**
 * 根據題目資料取得語音檔路徑（便捷函式）
 *
 * @param {string} fieldId
 * @param {Object} question - 題目物件（含 stimulus, appliedRule?, context?）
 * @param {string} ruleId   - 當前規則 ID
 * @returns {string|null}
 */
function getVoiceFileForQuestion(fieldId, question, ruleId) {
  var fieldStimuli = getFieldStimuli(fieldId);
  if (!fieldStimuli) return null;

  // 判斷 stimulusType
  var stimulusType = "go";
  if (typeof GAME_CONFIG !== "undefined") {
    var field = GAME_CONFIG.FIELDS[fieldId];
    if (field) {
      var goKey = field.rules.rule1.go.stimulus;
      stimulusType = question.stimulus === goKey ? "go" : "noGo";
    }
  }

  // 判斷 ruleContext
  var ruleContext;
  if (ruleId === "mixed" && question.appliedRule === "rule2") {
    ruleContext = "mixed-rule2";
  } else if (ruleId === "mixed") {
    ruleContext = "mixed-rule1";
  } else {
    ruleContext = ruleId; // 'rule1' 或 'rule2'
  }

  return getStimulusVoiceFile(fieldId, stimulusType, ruleContext);
}

// =========================================
// 背景 CSS class
// =========================================

/**
 * 取得指定規則的背景 CSS class
 *
 * @param {string} fieldId
 * @param {string} ruleId - 'rule1', 'rule2', 'mixed'
 * @returns {string} CSS class name
 */
function getBackgroundClass(fieldId, ruleId) {
  var fieldStimuli = getFieldStimuli(fieldId);
  if (!fieldStimuli || !fieldStimuli.backgrounds) return "";
  var bg = fieldStimuli.backgrounds[ruleId];
  return bg ? bg.cssClass || "" : "";
}

// =========================================
// 匯出
// =========================================

if (typeof window !== "undefined") {
  window.renderStimulus = renderStimulus;
  window.renderStimulusByKey = renderStimulusByKey;
  window.renderContext = renderContext;
  window.getStimulusVoiceFile = getStimulusVoiceFile;
  window.getVoiceFileForQuestion = getVoiceFileForQuestion;
  window.getBackgroundClass = getBackgroundClass;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    renderStimulus,
    renderStimulusByKey,
    renderContext,
    getStimulusVoiceFile,
    getVoiceFileForQuestion,
    getBackgroundClass,
  };
}
