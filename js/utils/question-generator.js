/**
 * ============================================
 * 題目生成器 v4.5（完全重寫）
 * ============================================
 * 對應需求文件：§2.4, Flow-14
 * 說明：生成 Go/No-Go 題目序列 + 混合規則雙層結構 + WM 參數
 * 依賴：game-config.js（GAME_CONFIG）
 *
 * v3.0 → v4.5 變更：
 *   - 場地 A~H → field × rule（遊戲場 × 規則）
 *   - 新增混合規則 context + stimulus 雙層結構
 *   - 精確比例：🐭 75:25 / 🐟 80:20
 *   - 混合規則情境 80:20 + 每情境內遊戲場 Go:NoGo 比例
 *   - WM 參數生成（方向 + 位置數），n≥2 才有逆向
 *   - 偽隨機洗牌，避免連續 3+ 同類型
 * ============================================
 */

// =========================================
// 工具函式
// =========================================

/**
 * Fisher-Yates 洗牌
 * @param {Array} arr
 * @returns {Array} 洗好的新陣列
 */
function shuffle(arr) {
  var result = arr.slice(); // 不改原陣列
  for (var i = result.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * 檢查陣列中是否有連續 maxRun 個以上的同值
 * @param {Array} arr
 * @param {Function} keyFn - 取值函式
 * @param {number} maxRun - 最大連續數
 * @returns {boolean} true = 有違規
 */
function hasLongRun(arr, keyFn, maxRun) {
  var count = 1;
  for (var i = 1; i < arr.length; i++) {
    if (keyFn(arr[i]) === keyFn(arr[i - 1])) {
      count++;
      if (count > maxRun) return true;
    } else {
      count = 1;
    }
  }
  return false;
}

/**
 * 洗牌直到不違規（最多嘗試 maxAttempts 次）
 * @param {Array} arr
 * @param {Function} keyFn
 * @param {number} maxRun
 * @param {number} maxAttempts
 * @returns {Array}
 */
function shuffleWithConstraint(arr, keyFn, maxRun, maxAttempts) {
  maxAttempts = maxAttempts || 100;
  for (var attempt = 0; attempt < maxAttempts; attempt++) {
    var result = shuffle(arr);
    if (!hasLongRun(result, keyFn, maxRun)) {
      return result;
    }
  }
  // 超過嘗試次數，回傳最後一次結果
  Logger.warn("⚠️ shuffleWithConstraint: 達到最大嘗試次數，使用最後結果");
  return shuffle(arr);
}

/**
 * 依比例分配數量（保證至少各 1 個）
 * @param {number} total - 總數
 * @param {number} ratio - 第一類比例（0~1）
 * @returns {{ countA: number, countB: number }}
 */
function distributeByRatio(total, ratio) {
  if (total < 2) {
    return { countA: 1, countB: 0 };
  }
  var countA = Math.round(total * ratio);
  // 保證至少各 1 個
  if (countA < 1) countA = 1;
  if (countA >= total) countA = total - 1;
  return { countA: countA, countB: total - countA };
}

// =========================================
// 規則一 / 規則二 題目生成
// =========================================

/**
 * 生成單一規則（規則一 或 規則二）的題目序列
 *
 * @param {string} fieldId - 'mouse' 或 'fishing'
 * @param {string} ruleId  - 'rule1' 或 'rule2'
 * @param {number} count   - 題數
 * @returns {Array<{ stimulus: string, correctAction: string, isGo: boolean }>}
 */
function generateSimpleQuestions(fieldId, ruleId, count) {
  var field = GAME_CONFIG.FIELDS[fieldId];
  var rule = field.rules[ruleId];
  var goRatio = field.goRatio;

  // 分配 Go / No-Go 數量
  var dist = distributeByRatio(count, goRatio);

  // 建立題目池
  var questions = [];
  for (var i = 0; i < dist.countA; i++) {
    questions.push({
      stimulus: rule.go.stimulus,
      correctAction: "press",
      isGo: true,
    });
  }
  for (var j = 0; j < dist.countB; j++) {
    questions.push({
      stimulus: rule.noGo.stimulus,
      correctAction: "nopress",
      isGo: false,
    });
  }

  // 偽隨機洗牌（不連續 3+ 同類型）
  return shuffleWithConstraint(
    questions,
    function (q) {
      return q.isGo;
    },
    3,
  );
}

// =========================================
// 混合規則題目生成
// =========================================

/**
 * 生成混合規則的題目序列
 * 每題包含雙層結構：context（情境）+ stimulus（刺激物）
 *
 * @param {string} fieldId - 'mouse' 或 'fishing'
 * @param {number} count   - 題數（注意：混合規則已由呼叫端 ×2）
 * @returns {Array<{ context: string, stimulus: string, correctAction: string, isGo: boolean, appliedRule: string }>}
 */
function generateMixedQuestions(fieldId, count) {
  var field = GAME_CONFIG.FIELDS[fieldId];
  var mixed = field.rules.mixed;
  var goRatio = field.goRatio;
  var contextARatio = GAME_CONFIG.RATIOS.MIXED_CONTEXT_A; // 0.8

  // Step 1: 分配情境數量（80:20）
  var contextDist = distributeByRatio(count, contextARatio);

  // Step 2: 為每個情境分配刺激物（沿用遊戲場 Go:NoGo 比例）
  var questions = [];

  // 情境 A（如「沒人」「白天」）→ 套用 rule1
  var rule1 = field.rules[mixed.contextA.appliesRule];
  var goDistA = distributeByRatio(contextDist.countA, goRatio);
  for (var i = 0; i < goDistA.countA; i++) {
    questions.push({
      context: mixed.contextA.key,
      stimulus: rule1.go.stimulus,
      correctAction: "press",
      isGo: true,
      appliedRule: mixed.contextA.appliesRule,
    });
  }
  for (var j = 0; j < goDistA.countB; j++) {
    questions.push({
      context: mixed.contextA.key,
      stimulus: rule1.noGo.stimulus,
      correctAction: "nopress",
      isGo: false,
      appliedRule: mixed.contextA.appliesRule,
    });
  }

  // 情境 B（如「有人」「晚上」）→ 套用 rule2
  var rule2 = field.rules[mixed.contextB.appliesRule];
  var goDistB = distributeByRatio(contextDist.countB, goRatio);
  for (var k = 0; k < goDistB.countA; k++) {
    questions.push({
      context: mixed.contextB.key,
      stimulus: rule2.go.stimulus,
      correctAction: "press",
      isGo: true,
      appliedRule: mixed.contextB.appliesRule,
    });
  }
  for (var l = 0; l < goDistB.countB; l++) {
    questions.push({
      context: mixed.contextB.key,
      stimulus: rule2.noGo.stimulus,
      correctAction: "nopress",
      isGo: false,
      appliedRule: mixed.contextB.appliesRule,
    });
  }

  // Step 3: 偽隨機洗牌（不連續 3+ 同情境）
  return shuffleWithConstraint(
    questions,
    function (q) {
      return q.context;
    },
    3,
  );
}

// =========================================
// 統一入口
// =========================================

/**
 * 生成指定遊戲場×規則的題目序列
 *
 * @param {string} fieldId - 'mouse' 或 'fishing'
 * @param {string} ruleId  - 'rule1', 'rule2', 'mixed'
 * @param {number} [count] - 題數（預設讀取 GAME_CONFIG，混合自動 ×2）
 * @returns {Array} 題目序列
 */
function generateQuestions(fieldId, ruleId, count) {
  // 預設題數
  if (!count) {
    count = GAME_CONFIG.QUESTIONS.DEFAULT_COUNT;
  }

  if (ruleId === "mixed") {
    // 混合規則：直接使用傳入的 count（上游已處理乘數）
    return generateMixedQuestions(fieldId, count);
  }

  return generateSimpleQuestions(fieldId, ruleId, count);
}

// =========================================
// 練習模式題目生成
// =========================================

/**
 * 生成練習模式題目（50:50 比例）
 *
 * @param {string} fieldId
 * @param {string} ruleId - 'rule1', 'rule2', 'mixed'
 * @param {number} [count] - 預設 PRACTICE_COUNT
 * @returns {Array}
 */
function generatePracticeQuestions(fieldId, ruleId, count) {
  count = count || GAME_CONFIG.QUESTIONS.PRACTICE_COUNT;
  var field = GAME_CONFIG.FIELDS[fieldId];

  if (ruleId === "mixed") {
    // 練習混合：50:50 情境
    var mixed = field.rules.mixed;
    var rule1 = field.rules[mixed.contextA.appliesRule];
    var rule2 = field.rules[mixed.contextB.appliesRule];
    var half = Math.floor(count / 2);
    var questions = [];

    // 情境 A
    for (var i = 0; i < half; i++) {
      var stim = i % 2 === 0 ? rule1.go : rule1.noGo;
      questions.push({
        context: mixed.contextA.key,
        stimulus: stim.stimulus,
        correctAction: stim.action,
        isGo: stim.action === "press",
        appliedRule: mixed.contextA.appliesRule,
      });
    }
    // 情境 B
    for (var j = 0; j < count - half; j++) {
      var stim2 = j % 2 === 0 ? rule2.go : rule2.noGo;
      questions.push({
        context: mixed.contextB.key,
        stimulus: stim2.stimulus,
        correctAction: stim2.action,
        isGo: stim2.action === "press",
        appliedRule: mixed.contextB.appliesRule,
      });
    }
    return shuffle(questions);
  }

  // 規則一 / 二練習：50:50 Go/NoGo
  var rule = field.rules[ruleId];
  var questions2 = [];
  var goCount = Math.floor(count / 2);
  for (var k = 0; k < goCount; k++) {
    questions2.push({
      stimulus: rule.go.stimulus,
      correctAction: "press",
      isGo: true,
    });
  }
  for (var l = 0; l < count - goCount; l++) {
    questions2.push({
      stimulus: rule.noGo.stimulus,
      correctAction: "nopress",
      isGo: false,
    });
  }
  return shuffle(questions2);
}

// =========================================
// WM（工作記憶）參數生成
// =========================================

/**
 * 生成 WM 測驗參數
 *
 * @param {number} ruleQuestionCount - 該輪規則的總題數（用於決定最大位置數）
 * @returns {{ direction: string, positions: number }}
 *   direction: 'forward' 或 'reverse'
 *   positions: 位置數量（2 ~ min(ruleQuestionCount, MAX_POSITIONS)）
 */
function generateWMParams(ruleQuestionCount) {
  var wmConfig = GAME_CONFIG.WORKING_MEMORY;
  var minPos = wmConfig.MIN_POSITIONS; // 2
  var maxPos = Math.min(ruleQuestionCount, wmConfig.MAX_POSITIONS); // 上限 6

  // 位置數量：隨機 min ~ max
  if (maxPos < minPos) maxPos = minPos;
  var positions = Math.floor(Math.random() * (maxPos - minPos + 1)) + minPos;

  // 方向：隨機（但 n < 2 時強制順向 — 由用戶確認 n≥2 才有逆向）
  var direction;
  if (positions < 2) {
    direction = "forward";
  } else {
    direction =
      Math.random() < wmConfig.REVERSE_PROBABILITY ? "reverse" : "forward";
  }

  return {
    direction: direction,
    positions: positions,
  };
}

// =========================================
// 完整組合生成（供多人模式使用）
// =========================================

/**
 * 一次性生成多個遊戲組合的題目 + WM 參數
 * 用於多人模式房主建立房間時
 *
 * @param {Array<{ fieldId: string, ruleId: string, hasWM: boolean, questionCount?: number }>} combos
 * @returns {Array<{ fieldId, ruleId, questions, workingMemoryTest? }>}
 */
function generateGameCombos(combos) {
  return combos.map(function (combo) {
    var count = combo.questionCount || GAME_CONFIG.QUESTIONS.DEFAULT_COUNT;
    var questions = generateQuestions(combo.fieldId, combo.ruleId, count);

    var result = {
      fieldId: combo.fieldId,
      ruleId: combo.ruleId,
      questionCount: count,
      questions: questions,
    };

    if (combo.hasWM) {
      result.workingMemoryTest = generateWMParams(questions.length);
    }

    return result;
  });
}

// =========================================
// 匯出
// =========================================

if (typeof window !== "undefined") {
  window.generateQuestions = generateQuestions;
  window.generateSimpleQuestions = generateSimpleQuestions;
  window.generateMixedQuestions = generateMixedQuestions;
  window.generatePracticeQuestions = generatePracticeQuestions;
  window.generateWMParams = generateWMParams;
  window.generateGameCombos = generateGameCombos;
  // 工具函式（供測試）
  window.shuffle = shuffle;
  window.distributeByRatio = distributeByRatio;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    generateQuestions,
    generateSimpleQuestions,
    generateMixedQuestions,
    generatePracticeQuestions,
    generateWMParams,
    generateGameCombos,
    shuffle,
    distributeByRatio,
  };
}
