/**
 * ============================================
 * 計分引擎
 * ============================================
 * 對應需求文件：§3.3, §3.4, Flow-11, Flow-12
 * 說明：Go/No-Go 計分（4 種獎勵）+ WM 計分（全對 Bonus 公式）
 *       純邏輯模組，不碰 DOM
 * 依賴：game-config.js（GAME_CONFIG）
 * ============================================
 */

// =========================================
// Go/No-Go 計分（Flow-11）
// =========================================

/**
 * 計算單一規則的最終得分
 *
 * @param {Object} params
 * @param {Array<{ isCorrect: boolean, isGo: boolean, rt: number|null }>} params.results - 每題結果
 *   rt: 反應時間（ms），No-Go 正確或超時為 null
 * @param {string} params.fieldId   - 'mouse' 或 'fishing'
 * @param {string} params.ruleId    - 'rule1', 'rule2', 'mixed'
 * @param {string} params.mode      - 'singleplayer' 或 'multiplayer'
 * @param {Object} params.records   - 玩家歷史紀錄
 * @param {number|null} params.records.bestAvgRT   - 歷史最快平均 RT（null = 首次）
 * @param {number}      params.records.bestScore   - 歷史最高分
 * @param {boolean}     params.records.firstClear  - 是否可獲得首次通關（true = 尚未首次通關）
 *
 * @returns {{
 *   baseScore: number,
 *   correctCount: number,
 *   totalCount: number,
 *   accuracy: number,
 *   avgRT: number|null,
 *   perfectBonus: number,
 *   speedBonus: number,
 *   firstClearBonus: number,
 *   progressBonus: number,
 *   finalScore: number,
 *   newBestAvgRT: number|null,
 *   isFirstClear: boolean,
 *   isNewBestScore: boolean,
 *   passed: boolean
 * }}
 */
function calculateRuleScore(params) {
  var results = params.results;
  var mode = params.mode || "singleplayer";
  var records = params.records || {
    bestAvgRT: null,
    bestScore: 0,
    firstClear: true,
  };
  var passThreshold = GAME_CONFIG.SCORING.PASS_THRESHOLD; // 0.83

  // === 1. 基礎分 ===
  var correctCount = 0;
  results.forEach(function (r) {
    if (r.isCorrect) correctCount++;
  });
  var totalCount = results.length;
  var baseScore = correctCount * GAME_CONFIG.SCORING.SCORE_PER_CORRECT;
  var accuracy = totalCount > 0 ? correctCount / totalCount : 0;
  var passed = accuracy >= passThreshold;

  // === 計算平均反應時間（僅 Go 正確的 RT）===
  var goCorrectRTs = [];
  results.forEach(function (r) {
    if (r.isGo && r.isCorrect && r.rt !== null && r.rt !== undefined) {
      goCorrectRTs.push(r.rt);
    }
  });
  var avgRT =
    goCorrectRTs.length > 0
      ? goCorrectRTs.reduce(function (sum, rt) {
          return sum + rt;
        }, 0) / goCorrectRTs.length
      : null;

  // === 2. 🏆 全對獎勵 ===
  var perfectBonus = accuracy === 1 ? GAME_CONFIG.SCORING.BONUS_SCORE : 0;

  // === 3. ⚡ 最佳速度獎勵 ===
  var speedBonus = 0;
  var newBestAvgRT = records.bestAvgRT;
  if (avgRT !== null) {
    if (records.bestAvgRT === null) {
      // 首次遊玩 → 自動 +1 分，設定為 bestAvgRT
      speedBonus = GAME_CONFIG.SCORING.BONUS_SCORE;
      newBestAvgRT = avgRT;
    } else if (avgRT < records.bestAvgRT) {
      speedBonus = GAME_CONFIG.SCORING.BONUS_SCORE;
      newBestAvgRT = avgRT;
    }
  }

  // === 多人模式：只有全對 + 速度 ===
  if (mode === "multiplayer") {
    var mpFinalScore = baseScore + perfectBonus + speedBonus;
    return {
      baseScore: baseScore,
      correctCount: correctCount,
      totalCount: totalCount,
      accuracy: accuracy,
      avgRT: avgRT,
      perfectBonus: perfectBonus,
      speedBonus: speedBonus,
      firstClearBonus: 0,
      progressBonus: 0,
      finalScore: mpFinalScore,
      newBestAvgRT: newBestAvgRT,
      isFirstClear: false,
      isNewBestScore: false,
      passed: passed,
    };
  }

  // === 4. 🌟 首次通關獎勵（單人限定）===
  var firstClearBonus = 0;
  var isFirstClear = false;
  if (records.firstClear && passed) {
    firstClearBonus = GAME_CONFIG.SCORING.BONUS_SCORE;
    isFirstClear = true;
  }

  // === 5. 暫時總分 ===
  var subtotal = baseScore + perfectBonus + speedBonus + firstClearBonus;

  // === 6. 📈 進步獎勵（暫時總分 > 歷史最佳）===
  var progressBonus = 0;
  var isNewBestScore = false;
  if (subtotal > (records.bestScore || 0)) {
    progressBonus = GAME_CONFIG.SCORING.BONUS_SCORE;
    isNewBestScore = true;
  }

  // === 7. 最終得分 ===
  var finalScore = subtotal + progressBonus;

  return {
    baseScore: baseScore,
    correctCount: correctCount,
    totalCount: totalCount,
    accuracy: accuracy,
    avgRT: avgRT,
    perfectBonus: perfectBonus,
    speedBonus: speedBonus,
    firstClearBonus: firstClearBonus,
    progressBonus: progressBonus,
    finalScore: finalScore,
    newBestAvgRT: newBestAvgRT,
    isFirstClear: isFirstClear,
    isNewBestScore: isNewBestScore,
    passed: passed,
  };
}

// =========================================
// WM 計分（Flow-12）
// =========================================

/**
 * 計算 WM 全對獎勵（依方向 × 位置數公式）
 *
 * 逆向（Reverse）：n≥2 → bonus = n-1；n=1 → 0
 * 順向（Forward）：n=1 → 0；n=2~6 → 1；n=7~9 → 2；n≥10 → n-7
 *
 * @param {string} direction - 'forward' 或 'reverse'
 * @param {number} n - 位置數量
 * @returns {number}
 */
function getWMBonus(direction, n) {
  if (n <= 1) return 0;

  if (direction === "reverse") {
    return n - 1;
  }

  // forward
  if (n <= 6) return 1;
  if (n <= 9) return 2;
  return n - 7; // n >= 10
}

/**
 * 計算 WM 測驗的最終得分
 *
 * @param {Object} params
 * @param {number} params.correctCount     - 答對的位置數
 * @param {number} params.totalPositions   - 總位置數 n
 * @param {string} params.direction        - 'forward' 或 'reverse'
 * @param {number} params.completionTimeMs - 完成時間（ms）
 * @param {Object} params.records          - 玩家 WM 歷史紀錄
 * @param {number|null} params.records.bestWMTime - 歷史最快完成時間（null = 首次）
 *
 * @returns {{
 *   baseScore: number,
 *   correctCount: number,
 *   totalPositions: number,
 *   accuracy: number,
 *   allCorrectBonus: number,
 *   speedBonus: number,
 *   finalScore: number,
 *   wmPassed: boolean,
 *   wmStar: number,
 *   newBestWMTime: number|null
 * }}
 */
function calculateWMScore(params) {
  var correctCount = params.correctCount;
  var totalPositions = params.totalPositions;
  var direction = params.direction;
  var completionTimeMs = params.completionTimeMs;
  var records = params.records || { bestWMTime: null };
  var passThreshold = GAME_CONFIG.WORKING_MEMORY.PASS_THRESHOLD; // 0.83

  // === 1. 基礎分 ===
  var baseScore = correctCount * GAME_CONFIG.WORKING_MEMORY.SCORE_PER_POSITION;
  var accuracy = totalPositions > 0 ? correctCount / totalPositions : 0;

  // === WM 通過判定 ===
  var wmPassed = accuracy >= passThreshold;
  var wmStar = wmPassed ? GAME_CONFIG.STARS.WM_PASS_STAR : 0;

  // === 2. 全對獎勵 ===
  var allCorrectBonus = 0;
  if (correctCount === totalPositions) {
    allCorrectBonus = getWMBonus(direction, totalPositions);
  }

  // === 3. ⚡ 最佳速度獎勵 ===
  var speedBonus = 0;
  var newBestWMTime = records.bestWMTime;
  if (completionTimeMs !== null && completionTimeMs !== undefined) {
    if (records.bestWMTime === null) {
      // 首次 → 自動 +1
      speedBonus = 1;
      newBestWMTime = completionTimeMs;
    } else if (completionTimeMs < records.bestWMTime) {
      speedBonus = 1;
      newBestWMTime = completionTimeMs;
    }
  }

  // === 最終得分 ===
  var finalScore = baseScore + allCorrectBonus + speedBonus;

  return {
    baseScore: baseScore,
    correctCount: correctCount,
    totalPositions: totalPositions,
    accuracy: accuracy,
    allCorrectBonus: allCorrectBonus,
    speedBonus: speedBonus,
    finalScore: finalScore,
    wmPassed: wmPassed,
    wmStar: wmStar,
    newBestWMTime: newBestWMTime,
  };
}

// =========================================
// 星星計算
// =========================================

/**
 * 計算單一探險點獲得的總星星數
 *
 * @param {Object} ruleResult - calculateRuleScore 的結果
 * @param {Object|null} wmResult - calculateWMScore 的結果（無 WM 則 null）
 * @returns {{ ruleStars: number, wmStars: number, totalStars: number }}
 */
function calculateStars(ruleResult, wmResult) {
  // 規則通過 → +1⭐
  var ruleStars = ruleResult.passed ? GAME_CONFIG.STARS.RULE_PASS_STAR : 0;

  // WM 星星
  var wmStars = 0;
  if (wmResult) {
    wmStars = wmResult.wmStar + wmResult.allCorrectBonus;
  }

  return {
    ruleStars: ruleStars,
    wmStars: wmStars,
    totalStars: ruleStars + wmStars,
  };
}

// =========================================
// 匯出
// =========================================

if (typeof window !== "undefined") {
  window.calculateRuleScore = calculateRuleScore;
  window.calculateWMScore = calculateWMScore;
  window.getWMBonus = getWMBonus;
  window.calculateStars = calculateStars;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    calculateRuleScore,
    calculateWMScore,
    getWMBonus,
    calculateStars,
  };
}
