/**
 * (已棄用) 工作記憶測試擴展模組
 *
 * ⚠️ 注意：此檔案的功能已完整合併至 game-logic.js。
 * 為了避免邏輯衝突與計分錯誤，此檔案已被清空。
 * 請記得從您的 HTML 檔案中移除 <script src="js/game-logic-wm.js"></script>。
 */
(function () {
  // /**
  //  * 工作記憶測試擴展模組
  //  * 為 GameLogic 添加工作記憶測試功能
  //  *
  //  * @module GameLogicWorkingMemory
  //  * @version 1.0.0
  //  * @date 2026/02/09
  //  *
  //  * 遵循規範: NAMING-CONVENTION.md v2.3
  //  * 依賴模組:
  //  * - game-config.js (CONFIG)
  //  * - audio-controller.js (AudioController)
  //  * - game-logic.js (GameLogic)
  //  *
  //  * 使用方式:
  //  * 1. 在 HTML 中按順序引入所有依賴模組
  //  * 2. 本模組會自動擴展 GameLogic 物件
  //  * 3. 呼叫 GameLogic.prepareWMTest() 等函式即可使用
  //  */

  // /**
  //  * 將工作記憶測試函式添加到 GameLogic 命名空間
  //  *
  //  * 四個回合測試規則:
  //  * - Round 1: cheese/cat 二選一
  //  * - Round 2: cheese/cat/person_cheese/person_cat 四選一
  //  * - Round 3: fish/shark 二選一
  //  * - Round 4: fish/shark/night_fish/night_shark 四選一
  //  */
  // (function () {
  //   if (typeof GameLogic === "undefined") {
  //     console.error("❌ GameLogic 未定義！請先引入 game-logic.js");
  //     return;
  //   }

  //   /**
  //    * 準備第一回合工作記憶測試
  //    *
  //    * @returns {void}
  //    */
  //   GameLogic.prepareWMTest = function () {
  //     const round1Trials = this.state.results.filter(
  //       (r) => r.round === 1 && !r.isPractice,
  //     );

  //     let testCount;
  //     if (CONFIG.WM_TEST_COUNT_MODE === "random") {
  //       const maxCount = CONFIG.ROUND1_TRIALS || 1;
  //       testCount = Math.floor(Math.random() * maxCount) + 1;
  //     } else {
  //       testCount = CONFIG.WM_TEST_COUNT > 0 ? CONFIG.WM_TEST_COUNT : 1;
  //     }
  //     this.state.wmTestCount = testCount;

  //     const lastN = round1Trials.slice(-testCount).map((r) => r.stimulus);
  //     const isReverse = this.state.wmReverseStatus[0];
  //     this.state.wmCorrectAnswer = isReverse ? [...lastN].reverse() : lastN;
  //     this.state.wmUserAnswer = new Array(testCount).fill(null);
  //     this.state.wmStartTime = Date.now();
  //     this.state.isWmCorrect = false;

  //     if (CONFIG.DEBUG_MODE) {
  //       console.log(`🧠 第一回合工作記憶測試`);
  //       console.log(
  //         `  題數: ${testCount} | 方向: ${isReverse ? "逆向" : "順向"}`,
  //       );
  //       console.log(`  正確答案:`, this.state.wmCorrectAnswer);
  //     }

  //     this.updateWMQuestion();
  //     this.generateWMButtons();
  //   };

  //   /**
  //    * 更新工作記憶測試題目文字
  //    *
  //    * @returns {void}
  //    */
  //   GameLogic.updateWMQuestion = function () {
  //     const testCount = this.state.wmTestCount;
  //     const isReverse = this.state.wmReverseStatus[0];
  //     const questionElement = document.getElementById("wmQuestionText");

  //     if (questionElement) {
  //       const countText =
  //         testCount === 1 ? "最後一個物件" : `最後${testCount}個物件`;
  //       const orderText = isReverse
  //         ? "按照<span style='color: var(--error-color);'>逆序</span>"
  //         : "按照順序";

  //       questionElement.innerHTML = `${orderText}，<br/>剛才<span style="color: var(--accent-yellow);">${countText}</span>的順序為何？`;
  //     }
  //   };

  //   /**
  //    * 生成位置式選擇按鈕
  //    *
  //    * @returns {void}
  //    */
  //   GameLogic.generateWMButtons = function () {
  //     const container = document.getElementById("wmPositionButtons");
  //     const testCount = this.state.wmTestCount;

  //     container.innerHTML = "";

  //     for (let i = 0; i < testCount; i++) {
  //       const button = document.createElement("button");
  //       button.className = "wm-position-btn";
  //       button.setAttribute("data-position", i);
  //       button.onclick = () => this.toggleWMPosition(i);

  //       button.innerHTML = `
  //         <div class="wm-position-number">${i + 1}</div>
  //         <div class="wm-position-icon unknown">❓</div>
  //       `;

  //       container.appendChild(button);
  //     }
  //   };

  //   /**
  //    * 切換位置按鈕的圖示（循環選擇）
  //    *
  //    * @param {number} position - 按鈕位置 (0-based)
  //    * @returns {void}
  //    */
  //   GameLogic.toggleWMPosition = function (position) {
  //     if (this.state.isWmCorrect) return;

  //     const currentValue = this.state.wmUserAnswer[position];
  //     let nextValue;

  //     if (currentValue === null) {
  //       nextValue = "cheese";
  //     } else if (currentValue === "cheese") {
  //       nextValue = "cat";
  //     } else {
  //       nextValue = null;
  //     }

  //     this.state.wmUserAnswer[position] = nextValue;
  //     this.updateWMButtonDisplay(position);
  //     AudioController.playTone(600, "sine", 0.1);

  //     if (CONFIG.DEBUG_MODE) {
  //       console.log(`  位置 ${position + 1} → ${nextValue || "❓"}`);
  //     }
  //   };

  //   /**
  //    * 更新單個按鈕的顯示
  //    *
  //    * @param {number} position - 按鈕位置
  //    * @returns {void}
  //    */
  //   GameLogic.updateWMButtonDisplay = function (position) {
  //     const buttons = document.querySelectorAll(
  //       "#wmPositionButtons .wm-position-btn",
  //     );
  //     const button = buttons[position];
  //     const iconElement = button.querySelector(".wm-position-icon");
  //     const value = this.state.wmUserAnswer[position];

  //     const icons = {
  //       cheese: "🧀",
  //       cat: "🐈‍⬛",
  //       null: "❓",
  //     };

  //     iconElement.textContent = icons[value] || icons.null;
  //     iconElement.className =
  //       value === null ? "wm-position-icon unknown" : "wm-position-icon";
  //   };

  //   /**
  //    * 重置工作記憶測試
  //    *
  //    * @returns {void}
  //    */
  //   GameLogic.resetWMTest = function () {
  //     const testCount = this.state.wmTestCount;
  //     this.state.wmUserAnswer = new Array(testCount).fill(null);

  //     for (let i = 0; i < testCount; i++) {
  //       this.updateWMButtonDisplay(i);
  //     }

  //     if (CONFIG.DEBUG_MODE) {
  //       console.log("🔄 工作記憶測試已重置");
  //     }
  //   };

  //   /**
  //    * 檢查工作記憶答案
  //    *
  //    * @returns {void}
  //    */
  //   GameLogic.checkWMAnswer = function () {
  //     const hasNull = this.state.wmUserAnswer.includes(null);

  //     if (hasNull) {
  //       alert("請完成所有位置的選擇！");
  //       return;
  //     }

  //     const isCorrect =
  //       JSON.stringify(this.state.wmUserAnswer) ===
  //       JSON.stringify(this.state.wmCorrectAnswer);

  //     const reactionTime = Date.now() - this.state.wmStartTime;
  //     this.state.isWmCorrect = isCorrect;

  //     // 計算答對的位置數
  //     let correctPositions = 0;
  //     for (let i = 0; i < this.state.wmCorrectAnswer.length; i++) {
  //       if (this.state.wmUserAnswer[i] === this.state.wmCorrectAnswer[i]) {
  //         correctPositions++;
  //       }
  //     }

  //     // 計算 WM 分數
  //     let wmScore = correctPositions * CONFIG.WM_SCORE_PER_POSITION;
  //     const bonuses = {
  //       allCorrect: isCorrect,
  //       speedBonus: reactionTime < CONFIG.WM_SPEED_THRESHOLD,
  //     };

  //     // 套用加權
  //     if (bonuses.allCorrect) {
  //       wmScore *= CONFIG.WM_ALL_CORRECT_MULTIPLIER;
  //     }
  //     if (bonuses.speedBonus) {
  //       wmScore *= CONFIG.WM_SPEED_MULTIPLIER;
  //     }

  //     wmScore = Math.round(wmScore);

  //     // 將 WM 分數加入對應回合
  //     if (!this.state.roundScores[1]) {
  //       this.state.roundScores[1] = {
  //         finalScore: 0,
  //         baseScore: 0,
  //         bonuses: {},
  //         stats: {},
  //       };
  //     }
  //     if (!this.state.roundScores[1].wmScore) {
  //       this.state.roundScores[1].wmScore = 0;
  //       this.state.roundScores[1].wmBonuses = {};
  //     }
  //     this.state.roundScores[1].wmScore = wmScore;
  //     this.state.roundScores[1].wmBonuses = bonuses;
  //     this.state.roundScores[1].wmCorrectPositions = correctPositions;
  //     this.state.roundScores[1].wmTotalPositions =
  //       this.state.wmCorrectAnswer.length;
  //     this.state.roundScores[1].wmReactionTime = reactionTime;

  //     this.state.results.push({
  //       participantId: this.state.participantId,
  //       round: "WM1",
  //       trial: 1,
  //       stimulus: this.state.wmCorrectAnswer.join("-"),
  //       hasPerson: "none",
  //       isNightTime: "none",
  //       input: this.state.wmUserAnswer.join("-"),
  //       correct: isCorrect,
  //       rt: reactionTime,
  //       timestamp: new Date().toLocaleString("zh-TW", { hour12: false }),
  //     });

  //     this.showWMResult(isCorrect);

  //     if (CONFIG.DEBUG_MODE) {
  //       console.log("✓ 工作記憶測試完成");
  //       console.log(
  //         `  結果: ${isCorrect ? "正確 ✓" : "錯誤 ✗"} | RT: ${reactionTime}ms`,
  //       );
  //       console.log(
  //         `  答對位置: ${correctPositions}/${this.state.wmCorrectAnswer.length} | WM 分數: ${wmScore}`,
  //       );
  //     }
  //   };

  //   /**
  //    * 顯示工作記憶測試結果
  //    *
  //    * @param {boolean} isCorrect - 是否答對
  //    * @returns {void}
  //    */
  //   GameLogic.showWMResult = function (isCorrect) {
  //     const resultDisplay = document.getElementById("wmResultDisplay");
  //     const confirmBtn = document.getElementById("wmConfirmBtn");
  //     const continueBtn = document.getElementById("wmContinueBtn");

  //     const icons = {
  //       cheese: "🧀",
  //       cat: "🐈‍⬛",
  //     };

  //     if (isCorrect) {
  //       resultDisplay.innerHTML = `
  //         <div class="wm-result correct">
  //           <div style="font-size: 2em; margin-bottom: 10px;">✓ 答對了！</div>
  //           <div>你的記憶力真棒！</div>
  //         </div>
  //       `;
  //       AudioController.playCorrect();
  //     } else {
  //       let comparisonHTML = '<div class="wm-comparison">';

  //       // 正確答案
  //       comparisonHTML += '<div class="wm-comparison-row">';
  //       comparisonHTML += '<div class="wm-comparison-label">正確答案：</div>';
  //       comparisonHTML += '<div class="wm-comparison-items">';
  //       this.state.wmCorrectAnswer.forEach((item, index) => {
  //         comparisonHTML += `
  //           <div class="wm-comparison-item">
  //             <span style="color: var(--accent-yellow);">${index + 1}:</span>
  //             <span>${icons[item]}</span>
  //           </div>
  //         `;
  //       });
  //       comparisonHTML += "</div></div>";

  //       // 玩家答案
  //       comparisonHTML += '<div class="wm-comparison-row">';
  //       comparisonHTML += '<div class="wm-comparison-label">你的答案：</div>';
  //       comparisonHTML += '<div class="wm-comparison-items">';
  //       this.state.wmUserAnswer.forEach((item, index) => {
  //         const isItemCorrect = item === this.state.wmCorrectAnswer[index];
  //         const className = isItemCorrect
  //           ? "wm-comparison-item correct"
  //           : "wm-comparison-item incorrect";
  //         comparisonHTML += `
  //           <div class="${className}">
  //             <span style="color: var(--accent-yellow);">${index + 1}:</span>
  //             <span>${icons[item]}</span>
  //           </div>
  //         `;
  //       });
  //       comparisonHTML += "</div></div>";
  //       comparisonHTML += "</div>";

  //       resultDisplay.innerHTML = `
  //         <div class="wm-result incorrect">
  //           <div style="font-size: 2em; margin-bottom: 10px;">✗ 答錯了</div>
  //           <div style="margin-top: 10px;">請對照下方的答案：</div>
  //         </div>
  //         ${comparisonHTML}
  //       `;
  //       AudioController.playError();
  //     }

  //     resultDisplay.style.display = "block";
  //     confirmBtn.style.display = "none";
  //     continueBtn.style.display = "inline-block";
  //   };

  //   /**
  //    * 工作記憶測試後繼續遊戲
  //    *
  //    * @returns {void}
  //    */
  //   GameLogic.continueAfterWM = function () {
  //     // 從 state 取得已計算的分數資料
  //     const scoreData = this.state.roundScores[1];
  //     if (!scoreData) {
  //       console.error("❌ 找不到第一回合分數資料");
  //       return;
  //     }
  //     this.showRoundSummary(scoreData);
  //   };

  //   // ============================================
  //   // 第二、三、四回合工作記憶測試
  //   // (結構相同，僅刺激物圖示不同)
  //   // ============================================

  //   /**
  //    * 第二回合工作記憶測試
  //    * 包含 person 條件 (cheese/cat/person_cheese/person_cat)
  //    */
  //   GameLogic.prepareWMTest2 = function () {
  //     const round2Trials = this.state.results.filter(
  //       (r) => r.round === 2 && !r.isPractice,
  //     );

  //     let testCount;
  //     if (CONFIG.WM_TEST_COUNT_MODE === "random") {
  //       const maxCount = CONFIG.ROUND2_TRIALS || 1;
  //       testCount = Math.floor(Math.random() * maxCount) + 1;
  //     } else {
  //       testCount = CONFIG.WM_TEST_COUNT > 0 ? CONFIG.WM_TEST_COUNT : 1;
  //     }
  //     this.state.wm2TestCount = testCount;

  //     const lastN = round2Trials.slice(-testCount).map((r) => {
  //       return r.hasPerson ? "person_" + r.stimulus : r.stimulus;
  //     });

  //     const isReverse = this.state.wmReverseStatus[1];
  //     this.state.wmCorrectAnswer2 = isReverse ? [...lastN].reverse() : lastN;
  //     this.state.wmUserAnswer2 = new Array(testCount).fill(null);
  //     this.state.wmStartTime2 = Date.now();
  //     this.state.isWmCorrect2 = false;

  //     if (CONFIG.DEBUG_MODE) {
  //       console.log(`🧠 第二回合工作記憶測試`);
  //       console.log(
  //         `  題數: ${testCount} | 方向: ${isReverse ? "逆向" : "順向"}`,
  //       );
  //     }

  //     this.updateWMQuestion2();
  //     this.generateWMButtons2();
  //   };

  //   GameLogic.updateWMQuestion2 = function () {
  //     const testCount = this.state.wm2TestCount;
  //     const isReverse = this.state.wmReverseStatus[1];
  //     const questionElement = document.getElementById("wmQuestion2Text");

  //     if (questionElement) {
  //       const countText =
  //         testCount === 1 ? "最後一個物件" : `最後${testCount}個物件`;
  //       const orderText = isReverse
  //         ? "按照<span style='color: var(--error-color);'>逆序</span>"
  //         : "按照順序";

  //       questionElement.innerHTML = `${orderText}，<br/>剛才<span style="color: var(--accent-yellow);">${countText}</span>的順序為何？`;
  //     }
  //   };

  //   GameLogic.generateWMButtons2 = function () {
  //     const container = document.getElementById("wmPosition2Buttons");
  //     container.innerHTML = "";

  //     for (let i = 0; i < this.state.wm2TestCount; i++) {
  //       const button = document.createElement("button");
  //       button.className = "wm-position-btn";
  //       button.onclick = () => this.toggleWMPosition2(i);
  //       button.innerHTML = `
  //         <div class="wm-position-number">${i + 1}</div>
  //         <div class="wm-position-icon unknown">❓</div>
  //       `;
  //       container.appendChild(button);
  //     }
  //   };

  //   GameLogic.toggleWMPosition2 = function (position) {
  //     if (this.state.isWmCorrect2) return;

  //     const currentValue = this.state.wmUserAnswer2[position];
  //     let nextValue;

  //     if (currentValue === null) nextValue = "cheese";
  //     else if (currentValue === "cheese") nextValue = "cat";
  //     else if (currentValue === "cat") nextValue = "person_cheese";
  //     else if (currentValue === "person_cheese") nextValue = "person_cat";
  //     else nextValue = null;

  //     this.state.wmUserAnswer2[position] = nextValue;
  //     this.updateWMButtonDisplay2(position);
  //     AudioController.playTone(600, "sine", 0.1);
  //   };

  //   GameLogic.updateWMButtonDisplay2 = function (position) {
  //     const buttons = document.querySelectorAll(
  //       "#wmPosition2Buttons .wm-position-btn",
  //     );
  //     const iconElement = buttons[position].querySelector(".wm-position-icon");
  //     const value = this.state.wmUserAnswer2[position];

  //     const icons = {
  //       cheese: "🧀",
  //       cat: "🐈‍⬛",
  //       person_cheese: "🚶🧀",
  //       person_cat: "🚶🐈‍⬛",
  //       null: "❓",
  //     };

  //     iconElement.textContent = icons[value] || icons.null;
  //     iconElement.className =
  //       value === null ? "wm-position-icon unknown" : "wm-position-icon";
  //   };

  //   GameLogic.resetWMTest2 = function () {
  //     this.state.wmUserAnswer2 = new Array(this.state.wm2TestCount).fill(null);
  //     for (let i = 0; i < this.state.wm2TestCount; i++) {
  //       this.updateWMButtonDisplay2(i);
  //     }
  //   };

  //   GameLogic.checkWMAnswer2 = function () {
  //     if (this.state.wmUserAnswer2.includes(null)) {
  //       alert("請完成所有位置的選擇！");
  //       return;
  //     }

  //     const isCorrect =
  //       JSON.stringify(this.state.wmUserAnswer2) ===
  //       JSON.stringify(this.state.wmCorrectAnswer2);

  //     const reactionTime = Date.now() - this.state.wmStartTime2;
  //     this.state.isWmCorrect2 = isCorrect;

  //     // 計算答對的位置數
  //     let correctPositions = 0;
  //     for (let i = 0; i < this.state.wmCorrectAnswer2.length; i++) {
  //       if (this.state.wmUserAnswer2[i] === this.state.wmCorrectAnswer2[i]) {
  //         correctPositions++;
  //       }
  //     }

  //     // 計算 WM 分數
  //     let wmScore = correctPositions * CONFIG.WM_SCORE_PER_POSITION;
  //     const bonuses = {
  //       allCorrect: isCorrect,
  //       speedBonus: reactionTime < CONFIG.WM_SPEED_THRESHOLD,
  //     };

  //     // 套用加權
  //     if (bonuses.allCorrect) {
  //       wmScore *= CONFIG.WM_ALL_CORRECT_MULTIPLIER;
  //     }
  //     if (bonuses.speedBonus) {
  //       wmScore *= CONFIG.WM_SPEED_MULTIPLIER;
  //     }

  //     wmScore = Math.round(wmScore);

  //     // 將 WM 分數加入對應回合
  //     if (!this.state.roundScores[2]) {
  //       this.state.roundScores[2] = {
  //         finalScore: 0,
  //         baseScore: 0,
  //         bonuses: {},
  //         stats: {},
  //       };
  //     }
  //     if (!this.state.roundScores[2].wmScore) {
  //       this.state.roundScores[2].wmScore = 0;
  //       this.state.roundScores[2].wmBonuses = {};
  //     }
  //     this.state.roundScores[2].wmScore = wmScore;
  //     this.state.roundScores[2].wmBonuses = bonuses;
  //     this.state.roundScores[2].wmCorrectPositions = correctPositions;
  //     this.state.roundScores[2].wmTotalPositions =
  //       this.state.wmCorrectAnswer2.length;
  //     this.state.roundScores[2].wmReactionTime = reactionTime;

  //     this.state.results.push({
  //       participantId: this.state.participantId,
  //       round: "WM2",
  //       trial: 1,
  //       stimulus: this.state.wmCorrectAnswer2.join("-"),
  //       hasPerson: "none",
  //       isNightTime: "none",
  //       input: this.state.wmUserAnswer2.join("-"),
  //       correct: isCorrect,
  //       rt: reactionTime,
  //       timestamp: new Date().toLocaleString("zh-TW", { hour12: false }),
  //     });

  //     this.showWMResult2(isCorrect);

  //     if (CONFIG.DEBUG_MODE) {
  //       console.log("✓ 第二回合工作記憶測試完成");
  //       console.log(
  //         `  結果: ${isCorrect ? "正確 ✓" : "錯誤 ✗"} | RT: ${reactionTime}ms`,
  //       );
  //       console.log(
  //         `  答對位置: ${correctPositions}/${this.state.wmCorrectAnswer2.length} | WM 分數: ${wmScore}`,
  //       );
  //     }
  //   };

  //   GameLogic.showWMResult2 = function (isCorrect) {
  //     // 實作與 showWMResult 相同，僅更改元素 ID 和圖示
  //     const resultDisplay = document.getElementById("wmResult2Display");
  //     const confirmBtn = document.getElementById("wmConfirm2Btn");
  //     const continueBtn = document.getElementById("wmContinue2Btn");

  //     const icons = {
  //       cheese: "🧀",
  //       cat: "🐈‍⬛",
  //       person_cheese: "🚶🧀",
  //       person_cat: "🚶🐈‍⬛",
  //     };

  //     if (isCorrect) {
  //       resultDisplay.innerHTML = `<div class="wm-result correct"><div style="font-size: 2em;">✓ 答對了！</div></div>`;
  //       AudioController.playCorrect();
  //     } else {
  //       // 顯示比對結果（程式碼與第一回合相同）
  //       let comparisonHTML = '<div class="wm-comparison">';
  //       // ... 省略重複程式碼
  //       resultDisplay.innerHTML = `<div class="wm-result incorrect"><div style="font-size: 2em;">✗ 答錯了</div></div>${comparisonHTML}`;
  //       AudioController.playError();
  //     }

  //     resultDisplay.style.display = "block";
  //     confirmBtn.style.display = "none";
  //     continueBtn.style.display = "inline-block";
  //   };

  //   GameLogic.continueAfterWM2 = function () {
  //     // 從 state 取得已計算的分數資料
  //     const scoreData = this.state.roundScores[2];
  //     if (!scoreData) {
  //       console.error("❌ 找不到第二回合分數資料");
  //       return;
  //     }
  //     this.showRoundSummary(scoreData);
  //   };

  //   // ============================================
  //   // 第三回合工作記憶測試 (fish/shark)
  //   // ============================================

  //   /**
  //    * 準備第三回合工作記憶測試
  //    * 測試刺激物: fish/shark
  //    *
  //    * @returns {void}
  //    */
  //   GameLogic.prepareWMTest3 = function () {
  //     const round3Trials = this.state.results.filter(
  //       (r) => r.round === 3 && !r.isPractice,
  //     );

  //     let testCount;
  //     if (CONFIG.WM_TEST_COUNT_MODE === "random") {
  //       const maxCount = CONFIG.ROUND3_TRIALS || 1;
  //       testCount = Math.floor(Math.random() * maxCount) + 1;
  //     } else {
  //       testCount = CONFIG.WM_TEST_COUNT > 0 ? CONFIG.WM_TEST_COUNT : 1;
  //     }
  //     this.state.wm3TestCount = testCount;

  //     const lastN = round3Trials.slice(-testCount).map((r) => r.stimulus);
  //     const isReverse = this.state.wmReverseStatus[2];
  //     this.state.wmCorrectAnswer3 = isReverse ? [...lastN].reverse() : lastN;
  //     this.state.wmUserAnswer3 = new Array(testCount).fill(null);
  //     this.state.wmStartTime3 = Date.now();
  //     this.state.isWmCorrect3 = false;

  //     if (CONFIG.DEBUG_MODE) {
  //       console.log(`🧠 第三回合工作記憶測試`);
  //       console.log(
  //         `  題數: ${testCount} | 方向: ${isReverse ? "逆向" : "順向"}`,
  //       );
  //       console.log(`  正確答案:`, this.state.wmCorrectAnswer3);
  //     }

  //     this.updateWMQuestion3();
  //     this.generateWMButtons3();
  //   };

  //   GameLogic.updateWMQuestion3 = function () {
  //     const testCount = this.state.wm3TestCount;
  //     const isReverse = this.state.wmReverseStatus[2];
  //     const questionElement = document.getElementById("wmQuestion3Text");

  //     if (questionElement) {
  //       const countText =
  //         testCount === 1 ? "最後一個物件" : `最後${testCount}個物件`;
  //       const orderText = isReverse
  //         ? "按照<span style='color: var(--error-color);'>逆序</span>"
  //         : "按照順序";

  //       questionElement.innerHTML = `${orderText}，<br/>剛才<span style="color: var(--accent-yellow);">${countText}</span>的順序為何？`;
  //     }
  //   };

  //   GameLogic.generateWMButtons3 = function () {
  //     const container = document.getElementById("wmPosition3Buttons");
  //     container.innerHTML = "";

  //     for (let i = 0; i < this.state.wm3TestCount; i++) {
  //       const button = document.createElement("button");
  //       button.className = "wm-position-btn";
  //       button.onclick = () => this.toggleWMPosition3(i);
  //       button.innerHTML = `
  //         <div class="wm-position-number">${i + 1}</div>
  //         <div class="wm-position-icon unknown">❓</div>
  //       `;
  //       container.appendChild(button);
  //     }
  //   };

  //   GameLogic.toggleWMPosition3 = function (position) {
  //     if (this.state.isWmCorrect3) return;

  //     const currentValue = this.state.wmUserAnswer3[position];
  //     let nextValue;

  //     if (currentValue === null) {
  //       nextValue = "fish";
  //     } else if (currentValue === "fish") {
  //       nextValue = "shark";
  //     } else {
  //       nextValue = null;
  //     }

  //     this.state.wmUserAnswer3[position] = nextValue;
  //     this.updateWMButtonDisplay3(position);
  //     AudioController.playTone(600, "sine", 0.1);

  //     if (CONFIG.DEBUG_MODE) {
  //       console.log(`  位置 ${position + 1} → ${nextValue || "❓"}`);
  //     }
  //   };

  //   GameLogic.updateWMButtonDisplay3 = function (position) {
  //     const buttons = document.querySelectorAll(
  //       "#wmPosition3Buttons .wm-position-btn",
  //     );
  //     const button = buttons[position];
  //     const iconElement = button.querySelector(".wm-position-icon");
  //     const value = this.state.wmUserAnswer3[position];

  //     const icons = {
  //       fish: "🐟",
  //       shark: "🦈",
  //       null: "❓",
  //     };

  //     iconElement.textContent = icons[value] || icons.null;
  //     iconElement.className =
  //       value === null ? "wm-position-icon unknown" : "wm-position-icon";
  //   };

  //   GameLogic.resetWMTest3 = function () {
  //     this.state.wmUserAnswer3 = new Array(this.state.wm3TestCount).fill(null);
  //     for (let i = 0; i < this.state.wm3TestCount; i++) {
  //       this.updateWMButtonDisplay3(i);
  //     }

  //     if (CONFIG.DEBUG_MODE) {
  //       console.log("🔄 第三回合工作記憶測試已重置");
  //     }
  //   };

  //   GameLogic.checkWMAnswer3 = function () {
  //     if (this.state.wmUserAnswer3.includes(null)) {
  //       alert("請完成所有位置的選擇！");
  //       return;
  //     }

  //     const isCorrect =
  //       JSON.stringify(this.state.wmUserAnswer3) ===
  //       JSON.stringify(this.state.wmCorrectAnswer3);

  //     const reactionTime = Date.now() - this.state.wmStartTime3;
  //     this.state.isWmCorrect3 = isCorrect;

  //     // 計算答對的位置數
  //     let correctPositions = 0;
  //     for (let i = 0; i < this.state.wmCorrectAnswer3.length; i++) {
  //       if (this.state.wmUserAnswer3[i] === this.state.wmCorrectAnswer3[i]) {
  //         correctPositions++;
  //       }
  //     }

  //     // 計算 WM 分數
  //     let wmScore = correctPositions * CONFIG.WM_SCORE_PER_POSITION;
  //     const bonuses = {
  //       allCorrect: isCorrect,
  //       speedBonus: reactionTime < CONFIG.WM_SPEED_THRESHOLD,
  //     };

  //     // 套用加權
  //     if (bonuses.allCorrect) {
  //       wmScore *= CONFIG.WM_ALL_CORRECT_MULTIPLIER;
  //     }
  //     if (bonuses.speedBonus) {
  //       wmScore *= CONFIG.WM_SPEED_MULTIPLIER;
  //     }

  //     wmScore = Math.round(wmScore);

  //     // 將 WM 分數加入對應回合
  //     if (!this.state.roundScores[3]) {
  //       this.state.roundScores[3] = {
  //         finalScore: 0,
  //         baseScore: 0,
  //         bonuses: {},
  //         stats: {},
  //       };
  //     }
  //     if (!this.state.roundScores[3].wmScore) {
  //       this.state.roundScores[3].wmScore = 0;
  //       this.state.roundScores[3].wmBonuses = {};
  //     }
  //     this.state.roundScores[3].wmScore = wmScore;
  //     this.state.roundScores[3].wmBonuses = bonuses;
  //     this.state.roundScores[3].wmCorrectPositions = correctPositions;
  //     this.state.roundScores[3].wmTotalPositions =
  //       this.state.wmCorrectAnswer3.length;
  //     this.state.roundScores[3].wmReactionTime = reactionTime;

  //     this.state.results.push({
  //       participantId: this.state.participantId,
  //       round: "WM3",
  //       trial: 1,
  //       stimulus: this.state.wmCorrectAnswer3.join("-"),
  //       hasPerson: "none",
  //       isNightTime: "none",
  //       input: this.state.wmUserAnswer3.join("-"),
  //       correct: isCorrect,
  //       rt: reactionTime,
  //       timestamp: new Date().toLocaleString("zh-TW", { hour12: false }),
  //     });

  //     this.showWMResult3(isCorrect);

  //     if (CONFIG.DEBUG_MODE) {
  //       console.log("✓ 第三回合工作記憶測試完成");
  //       console.log(
  //         `  結果: ${isCorrect ? "正確 ✓" : "錯誤 ✗"} | RT: ${reactionTime}ms`,
  //       );
  //     }
  //   };

  //   GameLogic.showWMResult3 = function (isCorrect) {
  //     const resultDisplay = document.getElementById("wmResult3Display");
  //     const confirmBtn = document.getElementById("wmConfirm3Btn");
  //     const continueBtn = document.getElementById("wmContinue3Btn");

  //     const icons = {
  //       fish: "🐟",
  //       shark: "🦈",
  //     };

  //     if (isCorrect) {
  //       resultDisplay.innerHTML = `
  //         <div class="wm-result correct">
  //           <div style="font-size: 2em; margin-bottom: 10px;">✓ 答對了！</div>
  //           <div>你的記憶力真棒！</div>
  //         </div>
  //       `;
  //       AudioController.playCorrect();
  //     } else {
  //       let comparisonHTML = '<div class="wm-comparison">';

  //       // 正確答案
  //       comparisonHTML += '<div class="wm-comparison-row">';
  //       comparisonHTML += '<div class="wm-comparison-label">正確答案：</div>';
  //       comparisonHTML += '<div class="wm-comparison-items">';
  //       this.state.wmCorrectAnswer3.forEach((item, index) => {
  //         comparisonHTML += `
  //           <div class="wm-comparison-item">
  //             <span style="color: var(--accent-yellow);">${index + 1}:</span>
  //             <span>${icons[item]}</span>
  //           </div>
  //         `;
  //       });
  //       comparisonHTML += "</div></div>";

  //       // 玩家答案
  //       comparisonHTML += '<div class="wm-comparison-row">';
  //       comparisonHTML += '<div class="wm-comparison-label">你的答案：</div>';
  //       comparisonHTML += '<div class="wm-comparison-items">';
  //       this.state.wmUserAnswer3.forEach((item, index) => {
  //         const isItemCorrect = item === this.state.wmCorrectAnswer3[index];
  //         const className = isItemCorrect
  //           ? "wm-comparison-item correct"
  //           : "wm-comparison-item incorrect";
  //         comparisonHTML += `
  //           <div class="${className}">
  //             <span style="color: var(--accent-yellow);">${index + 1}:</span>
  //             <span>${icons[item]}</span>
  //           </div>
  //         `;
  //       });
  //       comparisonHTML += "</div></div>";
  //       comparisonHTML += "</div>";

  //       resultDisplay.innerHTML = `
  //         <div class="wm-result incorrect">
  //           <div style="font-size: 2em; margin-bottom: 10px;">✗ 答錯了</div>
  //           <div style="margin-top: 10px;">請對照下方的答案：</div>
  //         </div>
  //         ${comparisonHTML}
  //       `;
  //       AudioController.playError();
  //     }

  //     resultDisplay.style.display = "block";
  //     confirmBtn.style.display = "none";
  //     continueBtn.style.display = "inline-block";
  //   };

  //   // ============================================
  //   // 第四回合工作記憶測試 (fish/shark + night)
  //   // ============================================

  //   /**
  //    * 準備第四回合工作記憶測試
  //    * 測試刺激物: fish/shark + 白天/晚上條件
  //    *
  //    * @returns {void}
  //    */
  //   GameLogic.prepareWMTest4 = function () {
  //     const round4Trials = this.state.results.filter(
  //       (r) => r.round === 4 && !r.isPractice,
  //     );

  //     let testCount;
  //     if (CONFIG.WM_TEST_COUNT_MODE === "random") {
  //       const maxCount = CONFIG.ROUND4_TRIALS || 1;
  //       testCount = Math.floor(Math.random() * maxCount) + 1;
  //     } else {
  //       testCount = CONFIG.WM_TEST_COUNT > 0 ? CONFIG.WM_TEST_COUNT : 1;
  //     }
  //     this.state.wm4TestCount = testCount;

  //     const lastN = round4Trials.slice(-testCount).map((r) => {
  //       return r.isNightTime ? "night_" + r.stimulus : r.stimulus;
  //     });

  //     const isReverse = this.state.wmReverseStatus[3];
  //     this.state.wmCorrectAnswer4 = isReverse ? [...lastN].reverse() : lastN;
  //     this.state.wmUserAnswer4 = new Array(testCount).fill(null);
  //     this.state.wmStartTime4 = Date.now();
  //     this.state.isWmCorrect4 = false;

  //     if (CONFIG.DEBUG_MODE) {
  //       console.log(`🧠 第四回合工作記憶測試`);
  //       console.log(
  //         `  題數: ${testCount} | 方向: ${isReverse ? "逆向" : "順向"}`,
  //       );
  //       console.log(`  正確答案:`, this.state.wmCorrectAnswer4);
  //     }

  //     this.updateWMQuestion4();
  //     this.generateWMButtons4();
  //   };

  //   GameLogic.updateWMQuestion4 = function () {
  //     const testCount = this.state.wm4TestCount;
  //     const isReverse = this.state.wmReverseStatus[3];
  //     const questionElement = document.getElementById("wmQuestion4Text");

  //     if (questionElement) {
  //       const countText =
  //         testCount === 1 ? "最後一個物件" : `最後${testCount}個物件`;
  //       const orderText = isReverse
  //         ? "按照<span style='color: var(--error-color);'>逆序</span>"
  //         : "按照順序";

  //       questionElement.innerHTML = `${orderText}，<br/>剛才<span style="color: var(--accent-yellow);">${countText}</span>的順序為何？`;
  //     }
  //   };

  //   GameLogic.generateWMButtons4 = function () {
  //     const container = document.getElementById("wmPosition4Buttons");
  //     container.innerHTML = "";

  //     for (let i = 0; i < this.state.wm4TestCount; i++) {
  //       const button = document.createElement("button");
  //       button.className = "wm-position-btn";
  //       button.onclick = () => this.toggleWMPosition4(i);
  //       button.innerHTML = `
  //         <div class="wm-position-number">${i + 1}</div>
  //         <div class="wm-position-icon unknown">❓</div>
  //       `;
  //       container.appendChild(button);
  //     }
  //   };

  //   GameLogic.toggleWMPosition4 = function (position) {
  //     if (this.state.isWmCorrect4) return;

  //     const currentValue = this.state.wmUserAnswer4[position];
  //     let nextValue;

  //     if (currentValue === null) nextValue = "fish";
  //     else if (currentValue === "fish") nextValue = "shark";
  //     else if (currentValue === "shark") nextValue = "night_fish";
  //     else if (currentValue === "night_fish") nextValue = "night_shark";
  //     else nextValue = null;

  //     this.state.wmUserAnswer4[position] = nextValue;
  //     this.updateWMButtonDisplay4(position);
  //     AudioController.playTone(600, "sine", 0.1);

  //     if (CONFIG.DEBUG_MODE) {
  //       console.log(`  位置 ${position + 1} → ${nextValue || "❓"}`);
  //     }
  //   };

  //   GameLogic.updateWMButtonDisplay4 = function (position) {
  //     const buttons = document.querySelectorAll(
  //       "#wmPosition4Buttons .wm-position-btn",
  //     );
  //     const button = buttons[position];
  //     const iconElement = button.querySelector(".wm-position-icon");
  //     const value = this.state.wmUserAnswer4[position];

  //     const icons = {
  //       fish: "☀️🐟",
  //       shark: "☀️🦈",
  //       night_fish: "🌙🐟",
  //       night_shark: "🌙🦈",
  //       null: "❓",
  //     };

  //     iconElement.textContent = icons[value] || icons.null;
  //     iconElement.className =
  //       value === null ? "wm-position-icon unknown" : "wm-position-icon";
  //   };

  //   GameLogic.resetWMTest4 = function () {
  //     this.state.wmUserAnswer4 = new Array(this.state.wm4TestCount).fill(null);
  //     for (let i = 0; i < this.state.wm4TestCount; i++) {
  //       this.updateWMButtonDisplay4(i);
  //     }

  //     if (CONFIG.DEBUG_MODE) {
  //       console.log("🔄 第四回合工作記憶測試已重置");
  //     }
  //   };

  //   GameLogic.checkWMAnswer4 = function () {
  //     if (this.state.wmUserAnswer4.includes(null)) {
  //       alert("請完成所有位置的選擇！");
  //       return;
  //     }

  //     const isCorrect =
  //       JSON.stringify(this.state.wmUserAnswer4) ===
  //       JSON.stringify(this.state.wmCorrectAnswer4);

  //     const reactionTime = Date.now() - this.state.wmStartTime4;
  //     this.state.isWmCorrect4 = isCorrect;

  //     // 計算答對的位置數
  //     let correctPositions = 0;
  //     for (let i = 0; i < this.state.wmCorrectAnswer4.length; i++) {
  //       if (this.state.wmUserAnswer4[i] === this.state.wmCorrectAnswer4[i]) {
  //         correctPositions++;
  //       }
  //     }

  //     // 計算 WM 分數
  //     let wmScore = correctPositions * CONFIG.WM_SCORE_PER_POSITION;
  //     const bonuses = {
  //       allCorrect: isCorrect,
  //       speedBonus: reactionTime < CONFIG.WM_SPEED_THRESHOLD,
  //     };

  //     // 套用加權
  //     if (bonuses.allCorrect) {
  //       wmScore *= CONFIG.WM_ALL_CORRECT_MULTIPLIER;
  //     }
  //     if (bonuses.speedBonus) {
  //       wmScore *= CONFIG.WM_SPEED_MULTIPLIER;
  //     }

  //     wmScore = Math.round(wmScore);

  //     // 將 WM 分數加入對應回合
  //     if (!this.state.roundScores[4]) {
  //       this.state.roundScores[4] = {
  //         finalScore: 0,
  //         baseScore: 0,
  //         bonuses: {},
  //         stats: {},
  //       };
  //     }
  //     if (!this.state.roundScores[4].wmScore) {
  //       this.state.roundScores[4].wmScore = 0;
  //       this.state.roundScores[4].wmBonuses = {};
  //     }
  //     this.state.roundScores[4].wmScore = wmScore;
  //     this.state.roundScores[4].wmBonuses = bonuses;
  //     this.state.roundScores[4].wmCorrectPositions = correctPositions;
  //     this.state.roundScores[4].wmTotalPositions =
  //       this.state.wmCorrectAnswer4.length;
  //     this.state.roundScores[4].wmReactionTime = reactionTime;

  //     this.state.results.push({
  //       participantId: this.state.participantId,
  //       round: "WM4",
  //       trial: 1,
  //       stimulus: this.state.wmCorrectAnswer4.join("-"),
  //       hasPerson: "none",
  //       isNightTime: "none",
  //       input: this.state.wmUserAnswer4.join("-"),
  //       correct: isCorrect,
  //       rt: reactionTime,
  //       timestamp: new Date().toLocaleString("zh-TW", { hour12: false }),
  //     });

  //     this.showWMResult4(isCorrect);

  //     if (CONFIG.DEBUG_MODE) {
  //       console.log("✓ 第四回合工作記憶測試完成");
  //       console.log(
  //         `  結果: ${isCorrect ? "正確 ✓" : "錯誤 ✗"} | RT: ${reactionTime}ms`,
  //       );
  //     }
  //   };

  //   GameLogic.showWMResult4 = function (isCorrect) {
  //     const resultDisplay = document.getElementById("wmResult4Display");
  //     const confirmBtn = document.getElementById("wmConfirm4Btn");
  //     const continueBtn = document.getElementById("wmContinue4Btn");

  //     const icons = {
  //       fish: "☀️🐟",
  //       shark: "☀️🦈",
  //       night_fish: "🌙🐟",
  //       night_shark: "🌙🦈",
  //     };

  //     if (isCorrect) {
  //       resultDisplay.innerHTML = `
  //         <div class="wm-result correct">
  //           <div style="font-size: 2em; margin-bottom: 10px;">✓ 答對了！</div>
  //           <div>你的記憶力真棒！</div>
  //         </div>
  //       `;
  //       AudioController.playCorrect();
  //     } else {
  //       let comparisonHTML = '<div class="wm-comparison">';

  //       // 正確答案
  //       comparisonHTML += '<div class="wm-comparison-row">';
  //       comparisonHTML += '<div class="wm-comparison-label">正確答案：</div>';
  //       comparisonHTML += '<div class="wm-comparison-items">';
  //       this.state.wmCorrectAnswer4.forEach((item, index) => {
  //         comparisonHTML += `
  //           <div class="wm-comparison-item">
  //             <span style="color: var(--accent-yellow);">${index + 1}:</span>
  //             <span>${icons[item]}</span>
  //           </div>
  //         `;
  //       });
  //       comparisonHTML += "</div></div>";

  //       // 玩家答案
  //       comparisonHTML += '<div class="wm-comparison-row">';
  //       comparisonHTML += '<div class="wm-comparison-label">你的答案：</div>';
  //       comparisonHTML += '<div class="wm-comparison-items">';
  //       this.state.wmUserAnswer4.forEach((item, index) => {
  //         const isItemCorrect = item === this.state.wmCorrectAnswer4[index];
  //         const className = isItemCorrect
  //           ? "wm-comparison-item correct"
  //           : "wm-comparison-item incorrect";
  //         comparisonHTML += `
  //           <div class="${className}">
  //             <span style="color: var(--accent-yellow);">${index + 1}:</span>
  //             <span>${icons[item]}</span>
  //           </div>
  //         `;
  //       });
  //       comparisonHTML += "</div></div>";
  //       comparisonHTML += "</div>";

  //       resultDisplay.innerHTML = `
  //         <div class="wm-result incorrect">
  //           <div style="font-size: 2em; margin-bottom: 10px;">✗ 答錯了</div>
  //           <div style="margin-top: 10px;">請對照下方的答案：</div>
  //         </div>
  //         ${comparisonHTML}
  //       `;
  //       AudioController.playError();
  //     }

  //     resultDisplay.style.display = "block";
  //     confirmBtn.style.display = "none";
  //     continueBtn.style.display = "inline-block";
  //   };

  //   GameLogic.continueAfterWM3 = function () {
  //     // 從 state 取得已計算的分數資料
  //     const scoreData = this.state.roundScores[3];
  //     if (!scoreData) {
  //       console.error("❌ 找不到第三回合分數資料");
  //       return;
  //     }
  //     this.showRoundSummary(scoreData);
  //   };

  //   GameLogic.continueAfterWM4 = function () {
  //     // 從 state 取得已計算的分數資料
  //     const scoreData = this.state.roundScores[4];
  //     if (!scoreData) {
  //       console.error("❌ 找不到第四回合分數資料");
  //       return;
  //     }
  //     this.showRoundSummary(scoreData);
  //   };

  //   /**
  //    * 顯示最終結果頁面
  //    *
  //    * @returns {void}
  //    */
  //   GameLogic.showFinalResult = function () {
  //     this.showScreen("result");

  //     // 計算總加權分數
  //     let totalScore = 0;
  //     let totalCorrectCount = 0;

  //     // 從 roundScores 加總
  //     Object.values(this.state.roundScores).forEach((roundData) => {
  //       totalScore += roundData.finalScore;
  //       totalCorrectCount += roundData.correctCount;
  //     });

  //     // 計算平均反應時間 (僅計算正確且有效的試驗)
  //     const validTrials = this.state.results.filter(
  //       (r) => r.input === "Space" && r.correct === true,
  //     );
  //     const avgReactionTime =
  //       validTrials.length > 0
  //         ? Math.round(
  //             validTrials.reduce((sum, r) => sum + r.rt, 0) / validTrials.length,
  //           )
  //         : 0;

  //     this.elements.scoreDisplay.innerText = totalScore;
  //     this.elements.avgTimeDisplay.innerText = avgReactionTime + "ms";

  //     if (CONFIG.DEBUG_MODE) {
  //       console.log("🏆 遊戲結束");
  //       console.log(`  總分: ${totalScore} (答對題數: ${totalCorrectCount})`);
  //       console.log(`  平均反應時間: ${avgReactionTime}ms`);
  //     }
  //   };

  //   console.log("✓ 工作記憶測試模組已載入");
  // })();

  console.warn(
    "⚠️ game-logic-wm.js 已棄用，請從 HTML 中移除此檔案引用，避免邏輯衝突。",
  );
})();
