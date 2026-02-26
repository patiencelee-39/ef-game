/**
 * ============================================
 * Go/No-Go 規則判定引擎
 * ============================================
 * 對應需求文件：§2.3, Flow-10
 * 說明：純邏輯模組，不碰 DOM / 聲音 / 視覺
 *       輸入：遊戲場 + 規則 + 刺激物 + 情境
 *       輸出：correctAction（press / nopress）
 * 依賴：game-config.js（GAME_CONFIG）
 * ============================================
 */

// =========================================
// 核心判定
// =========================================

/**
 * 判定玩家在當前條件下的正確行為
 *
 * @param {string} fieldId    - 'mouse' 或 'fishing'
 * @param {string} ruleId     - 'rule1', 'rule2', 'mixed'
 * @param {string} stimulus   - 刺激物 key（如 'cheese', 'cat', 'fish', 'shark'）
 * @param {string|null} context - 混合規則的情境 key（如 'noPerson', 'hasPerson', 'day', 'night'）
 *                                規則一/二時傳 null
 * @returns {{ correctAction: string, isGo: boolean, appliedRule: string }}
 *   correctAction: 'press' 或 'nopress'
 *   isGo: 是否為 Go 試題
 *   appliedRule: 實際套用的規則 ID（'rule1' 或 'rule2'）
 */
function judgeAction(fieldId, ruleId, stimulus, context) {
  var field = GAME_CONFIG.FIELDS[fieldId];
  if (!field) {
    Logger.error("❌ 找不到遊戲場：" + fieldId);
    return { correctAction: "nopress", isGo: false, appliedRule: ruleId };
  }

  // 決定實際套用的規則
  var appliedRuleId = getAppliedRule(fieldId, ruleId, context);
  var appliedRule = field.rules[appliedRuleId];

  if (!appliedRule) {
    Logger.error("❌ 找不到規則：" + fieldId + "." + appliedRuleId);
    return {
      correctAction: "nopress",
      isGo: false,
      appliedRule: appliedRuleId,
    };
  }

  // 比對 Go / No-Go
  if (appliedRule.go && appliedRule.go.stimulus === stimulus) {
    return { correctAction: "press", isGo: true, appliedRule: appliedRuleId };
  }
  if (appliedRule.noGo && appliedRule.noGo.stimulus === stimulus) {
    return {
      correctAction: "nopress",
      isGo: false,
      appliedRule: appliedRuleId,
    };
  }

  // 安全回退（不應發生）
  Logger.warn(
    "⚠️ 未知刺激物：" + stimulus + "（" + fieldId + "." + appliedRuleId + "）",
  );
  return { correctAction: "nopress", isGo: false, appliedRule: appliedRuleId };
}

/**
 * 取得混合規則中實際套用的規則 ID
 *
 * @param {string} fieldId - 'mouse' 或 'fishing'
 * @param {string} ruleId  - 'rule1', 'rule2', 'mixed'
 * @param {string|null} context - 情境 key
 * @returns {string} 實際規則 ID（'rule1' 或 'rule2'）
 */
function getAppliedRule(fieldId, ruleId, context) {
  // 規則一 / 規則二 → 直接回傳
  if (ruleId !== "mixed") {
    return ruleId;
  }

  var field = GAME_CONFIG.FIELDS[fieldId];
  var mixedRule = field.rules.mixed;

  // 混合規則：依 context 決定套用規則 A 或 B
  if (context === mixedRule.contextA.key) {
    return mixedRule.contextA.appliesRule; // → 'rule1'
  }
  if (context === mixedRule.contextB.key) {
    return mixedRule.contextB.appliesRule; // → 'rule2'
  }

  // context 不符 → 預設套用規則 A
  Logger.warn("⚠️ 未知情境：" + context + "，預設套用規則 A");
  return mixedRule.contextA.appliesRule;
}

// =========================================
// 輔助查詢 API
// =========================================

/**
 * 取得指定遊戲場的 Go 比例
 * @param {string} fieldId - 'mouse' 或 'fishing'
 * @returns {number} 0.75 或 0.8
 */
function getGoRatio(fieldId) {
  var field = GAME_CONFIG.FIELDS[fieldId];
  return field ? field.goRatio : 0.75;
}

/**
 * 取得混合規則的情境定義
 * @param {string} fieldId
 * @returns {{ contextType, contextA, contextB }|null}
 */
function getMixedContextDef(fieldId) {
  var field = GAME_CONFIG.FIELDS[fieldId];
  if (!field || !field.rules.mixed) return null;
  var mixed = field.rules.mixed;
  return {
    contextType: mixed.contextType,
    contextA: mixed.contextA,
    contextB: mixed.contextB,
  };
}

/**
 * 取得指定遊戲場×規則的 Go/NoGo 刺激物 key
 * @param {string} fieldId
 * @param {string} ruleId - 'rule1' 或 'rule2'
 * @returns {{ goStimulus: string, noGoStimulus: string }}
 */
function getStimulusKeys(fieldId, ruleId) {
  var field = GAME_CONFIG.FIELDS[fieldId];
  if (!field) return { goStimulus: null, noGoStimulus: null };

  var rule = field.rules[ruleId];
  if (!rule || !rule.go) {
    // 混合規則 → 取 rule1 的刺激物 key（刺激物不變，只有 Go/NoGo 角色切換）
    rule = field.rules.rule1;
  }
  return {
    goStimulus: rule.go.stimulus,
    noGoStimulus: rule.noGo.stimulus,
  };
}

/**
 * 判定玩家按鍵是否正確
 * @param {string} fieldId
 * @param {string} ruleId
 * @param {string} stimulus
 * @param {string|null} context
 * @param {boolean} playerPressed - 玩家是否按了空白鍵
 * @returns {{ isCorrect: boolean, correctAction: string, playerAction: string, isGo: boolean, appliedRule: string }}
 */
function evaluateResponse(fieldId, ruleId, stimulus, context, playerPressed) {
  var result = judgeAction(fieldId, ruleId, stimulus, context);
  var playerAction = playerPressed ? "press" : "nopress";
  var isCorrect = playerAction === result.correctAction;

  return {
    isCorrect: isCorrect,
    correctAction: result.correctAction,
    playerAction: playerAction,
    isGo: result.isGo,
    appliedRule: result.appliedRule,
  };
}

// =========================================
// 匯出
// =========================================

if (typeof window !== "undefined") {
  window.judgeAction = judgeAction;
  window.getAppliedRule = getAppliedRule;
  window.getGoRatio = getGoRatio;
  window.getMixedContextDef = getMixedContextDef;
  window.getStimulusKeys = getStimulusKeys;
  window.evaluateResponse = evaluateResponse;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    judgeAction,
    getAppliedRule,
    getGoRatio,
    getMixedContextDef,
    getStimulusKeys,
    evaluateResponse,
  };
}
