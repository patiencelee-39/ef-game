/**
 * 遊戲邏輯核心模組
 * 執行功能訓練遊戲 - DCCS Go/No-Go 範式
 *
 * @module GameLogic
 * @version 1.0.0
 * @date 2026/02/09
 *
 * 遵循規範: NAMING-CONVENTION.md v2.3
 * - 函式: camelCase + 動詞開頭
 * - 變數: camelCase
 * - 布林值: is/has/can/should 前綴
 * - 常數: UPPER_SNAKE_CASE
 *
 * 依賴模組:
 * - game-config.js (CONFIG)
 * - svg-assets.js (SVG_ASSETS)
 * - audio-controller.js (AudioController)
 */

/**
 * 遊戲控制器物件
 * 管理所有遊戲狀態和邏輯
 *
 * @namespace GameLogic
 */
const GameLogic = {
  /**
   * 遊戲狀態物件
   * 存儲所有遊戲進行中的變數
   *
   * @namespace GameLogic.state
   */
  state: {
    /** @type {string} 參與者代號 */
    participantId: "",

    /** @type {number} 當前回合 (1-4) */
    currentRound: 1,

    /** @type {number} 當前試驗編號 */
    currentTrial: 0,

    /** @type {number} 總試驗數 */
    totalTrials: 0,

    /** @type {number} 得分 */
    score: 0,

    /** @type {Array<Object>} 結果記錄陣列 */
    results: [],

    /** @type {boolean} 是否正在遊戲中 */
    isPlaying: false,

    /** @type {boolean} 是否為練習模式 */
    isPractice: false,

    /** @type {boolean} 是否為第二回合練習 */
    isRound2Practice: false,

    /** @type {boolean} 是否為第三回合練習 */
    isRound3Practice: false,

    /** @type {string|null} 當前刺激物類型 */
    currentStimulus: null,

    /** @type {boolean} 是否有人出現 (第二回合) */
    hasPerson: false,

    /** @type {boolean} 是否為晚上 (第四回合) */
    isNightTime: false,

    /** @type {number} 刺激物開始顯示時間戳 */
    startTime: 0,

    /** @type {boolean} 是否已回應 */
    hasResponded: false,

    /** @type {number|null} 計時器 ID */
    timer: null,

    /** @type {boolean} 遊戲是否已初始化 */
    isInitialized: false,

    /** @type {Array<Object>} 預先生成的試驗序列 */
    trialSequence: [],

    /** @type {number} 當前連續答對次數 */
    currentConsecutiveCorrect: 0,

    /** @type {number} 本回合最大連續答對次數 */
    maxConsecutiveCorrect: 0,

    /** @type {Object} 各回合加權分數紀錄 { 1: {...}, 2: {...} } */
    roundScores: {},

    // === 工作記憶測試狀態 (第一回合) ===
    /** @type {Array<string>} 工作記憶正確答案 */
    wmCorrectAnswer: [],

    /** @type {Array<string|null>} 工作記憶玩家答案 */
    wmUserAnswer: [],

    /** @type {number} 工作記憶測試題數 */
    wmTestCount: 0,

    /** @type {number} 工作記憶測試開始時間 */
    wmStartTime: 0,

    /** @type {boolean} 工作記憶測試是否正確 */
    isWmCorrect: false,

    // === 工作記憶測試狀態 (第二回合) ===
    wmCorrectAnswer2: [],
    wmUserAnswer2: [],
    wm2TestCount: 0,
    wmStartTime2: 0,
    isWmCorrect2: false,

    // === 工作記憶測試狀態 (第三回合) ===
    wmCorrectAnswer3: [],
    wmUserAnswer3: [],
    wm3TestCount: 0,
    wmStartTime3: 0,
    isWmCorrect3: false,

    // === 工作記憶測試狀態 (第四回合) ===
    wmCorrectAnswer4: [],
    wmUserAnswer4: [],
    wm4TestCount: 0,
    wmStartTime4: 0,
    isWmCorrect4: false,

    /** @type {Array<boolean>} 四個回合的工作記憶測試逆向狀態 */
    wmReverseStatus: [false, false, false, false],
  },

  /**
   * DOM 元素參照
   * 快取常用的 DOM 元素以提升效能
   *
   * @namespace GameLogic.elements
   */
  elements: {
    screens: {},
    stimulus: null,
    backgroundLayer: null,
    personIndicator: null,
    roundLabel: null,
    trialDisplay: null,
    totalDisplay: null,
    scoreDisplay: null,
    avgTimeDisplay: null,
    btnSpace: null,
    container: null,
  },

  /**
   * 初始化遊戲系統
   * 只在遊戲開始時執行一次
   *
   * @returns {void}
   */
  initializeGame: function () {
    // 避免重複初始化
    if (this.state.isInitialized) {
      return;
    }

    // 快取所有畫面元素
    this.elements.screens = {
      start: document.getElementById("startScreen"),
      intro: document.getElementById("introScreen"),
      practiceEnd: document.getElementById("practiceEndScreen"),
      play: document.getElementById("playScreen"),
      round2Intro: document.getElementById("round2IntroScreen"),
      round2PracticeEnd: document.getElementById("round2PracticeEndScreen"),
      round3Practice: document.getElementById("round3PracticeScreen"),
      round3PracticeEnd: document.getElementById("round3PracticeEndScreen"),
      round3End: document.getElementById("round3EndScreen"),
      round4Practice: document.getElementById("round4PracticeScreen"),
      round4PracticeEnd: document.getElementById("round4PracticeEndScreen"),
      // 工作記憶測試畫面
      roundSummary: document.getElementById("roundSummaryScreen"),
      workingMemory: document.getElementById("workingMemoryScreen"),
      workingMemory2: document.getElementById("workingMemory2Screen"),
      workingMemory3: document.getElementById("workingMemory3Screen"),
      workingMemory4: document.getElementById("workingMemory4Screen"),
      result: document.getElementById("resultScreen"),
    };

    // 快取遊戲畫面元素
    this.elements.stimulus = document.getElementById("stimulus");
    this.elements.backgroundLayer = document.getElementById("backgroundLayer");
    this.elements.personIndicator = document.getElementById("personIndicator");
    this.elements.roundLabel = document.getElementById("roundLabel");
    this.elements.trialDisplay = document.getElementById("trialDisplay");
    this.elements.totalDisplay = document.getElementById("totalDisplay");
    this.elements.scoreDisplay = document.getElementById("scoreDisplay");
    this.elements.avgTimeDisplay = document.getElementById("avgTimeDisplay");
    this.elements.btnSpace = document.getElementById("btnSpace");
    this.elements.container = document.querySelector(".game-area");

    // === 預先生成四個回合的工作記憶測試逆向狀態 ===
    for (let i = 0; i < 4; i++) {
      this.state.wmReverseStatus[i] =
        Math.random() < CONFIG.WM_REVERSE_PROBABILITY;
    }

    if (CONFIG.DEBUG_MODE) {
      Logger.info("🎮 遊戲系統初始化完成");
      Logger.debug(
        "工作記憶測試方向:",
        this.state.wmReverseStatus
          .map((r, i) => `WM${i + 1}: ${r ? "逆向" : "順向"}`)
          .join(", "),
      );
    }

    this.state.isInitialized = true;
  },

  /**
   * 顯示教學說明頁面
   * 從首頁進入時呼叫
   *
   * @returns {void}
   */
  showTutorial: function () {
    const inputElement = document.getElementById("playerId");
    this.state.participantId = inputElement.value.trim() || "NoName";
    this.initializeGame();
    this.showScreen("intro");
  },

  /**
   * 開始練習模式（第一回合）
   *
   * @returns {void}
   */
  startPractice: function () {
    // 恢復音訊上下文
    if (AudioController.ctx.state === "suspended") {
      AudioController.ctx.resume();
    }

    this.state.isPractice = true;
    this.state.currentRound = 1;
    this.state.totalTrials = CONFIG.PRACTICE_TRIALS;

    this.elements.roundLabel.innerText = "練習模式";
    this.elements.roundLabel.className = "round-label round-practice";

    this.initGameSession();
  },

  /**
   * 開始第一回合正式測驗
   * 抑制控制訓練 (Go/No-Go)
   *
   * @returns {void}
   */
  startRound1: function () {
    this.state.isPractice = false;
    this.state.currentRound = 1;
    this.state.totalTrials = CONFIG.ROUND1_TRIALS;
    this.state.results = [];
    this.state.roundScores = {};

    this.elements.roundLabel.innerText = "第一回：抑制控制訓練";
    this.elements.roundLabel.className = "round-label round1-badge";

    this.initGameSession();
  },

  /**
   * 開始第二回合練習
   * DCCS 範式引入 person 條件
   *
   * @returns {void}
   */
  startRound2Practice: function () {
    if (AudioController.ctx.state === "suspended") {
      AudioController.ctx.resume();
    }

    this.state.isPractice = true;
    this.state.isRound2Practice = true;
    this.state.currentRound = 2;
    this.state.totalTrials = CONFIG.ROUND2_PRACTICE_TRIALS;

    this.elements.roundLabel.innerText = "第二回練習：難度升級";
    this.elements.roundLabel.className = "round-label round-practice";

    this.initGameSession();
  },

  /**
   * 開始第二回合正式測驗
   *
   * @returns {void}
   */
  startRound2: function () {
    this.state.isPractice = false;
    this.state.isRound2Practice = false;
    this.state.currentRound = 2;
    this.state.totalTrials = CONFIG.ROUND2_TRIALS;

    this.elements.roundLabel.innerText = "第二回：難度升級";
    this.elements.roundLabel.className = "round-label round2-badge";

    this.initGameSession();
  },

  /**
   * 開始第三回合練習
   * 海洋主題 (fish/shark)
   *
   * @returns {void}
   */
  startRound3Practice: function () {
    if (AudioController.ctx.state === "suspended") {
      AudioController.ctx.resume();
    }

    this.state.isPractice = true;
    this.state.isRound3Practice = true;
    this.state.currentRound = 3;
    this.state.totalTrials = CONFIG.ROUND3_PRACTICE_TRIALS;

    this.elements.roundLabel.innerText = "第三回合練習";
    this.elements.roundLabel.className = "round-label round-practice";

    this.initGameSession();
  },

  /**
   * 開始第三回合正式測驗
   *
   * @returns {void}
   */
  startRound3: function () {
    this.state.isPractice = false;
    this.state.isRound3Practice = false;
    this.state.currentRound = 3;
    this.state.totalTrials = CONFIG.ROUND3_TRIALS;

    this.elements.roundLabel.innerText = "第三回：捕魚遊戲";
    this.elements.roundLabel.className = "round-label round3-badge";

    this.initGameSession();
  },

  /**
   * 開始第四回合練習
   * 引入 night 條件（晚上都不按）
   *
   * @returns {void}
   */
  startRound4Practice: function () {
    if (CONFIG.DEBUG_MODE) {
      Logger.debug("🎮 開始第四回合練習（釣魚+晚上）");
    }

    this.state.currentRound = 4;
    this.state.isPractice = true;
    this.state.isNightTime = false;
    this.state.totalTrials = CONFIG.ROUND4_PRACTICE_TRIALS;
    this.state.currentTrial = 0;
    this.state.score = 0;

    this.elements.roundLabel.className = "round-label round-practice";
    this.elements.roundLabel.textContent = "第四回合練習";

    this.initGameSession();
  },

  /**
   * 開始第四回合正式測驗
   *
   * @returns {void}
   */
  startRound4: function () {
    if (CONFIG.DEBUG_MODE) {
      Logger.debug("🎮 開始第四回合正式測驗（釣魚+晚上）");
    }

    this.state.currentRound = 4;
    this.state.isPractice = false;
    this.state.isNightTime = false;
    this.state.totalTrials = CONFIG.ROUND4_TRIALS;
    this.state.currentTrial = 0;
    this.state.score = 0;

    this.elements.roundLabel.className = "round-label round4-badge";
    this.elements.roundLabel.textContent = "第四回合";

    this.initGameSession();
  },

  /**
   * Fisher-Yates 洗牌演算法
   * 隨機打亂陣列順序
   *
   * @param {Array} array - 要打亂的陣列
   * @returns {Array} 打亂後的陣列（會修改原陣列）
   */
  shuffleArray: function (array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  },

  /**
   * 生成固定數量的試驗序列
   * 用於 'fixed' 機率模式
   *
   * @returns {void}
   */
  generateSequence: function () {
    const count = this.state.totalTrials;
    const isPractice = this.state.isPractice;
    const round = this.state.currentRound;

    // 1. 生成 Go 序列（所有回合都需要）
    const goRatio = isPractice
      ? CONFIG.PRACTICE_GO_RATIO || CONFIG.GO_RATIO
      : CONFIG.GO_RATIO;
    const goCount = Math.round(count * goRatio);
    const goArray = Array(count)
      .fill(false)
      .map((_, i) => i < goCount);
    this.shuffleArray(goArray);

    // 2. 生成 Person 序列（僅第二回合）
    let personArray = Array(count).fill(false);
    if (round === 2) {
      const personRatio = isPractice
        ? CONFIG.PRACTICE_PERSON_RATIO || CONFIG.PERSON_RATIO
        : CONFIG.PERSON_RATIO;
      const personCount = Math.round(count * personRatio);
      personArray = Array(count)
        .fill(false)
        .map((_, i) => i < personCount);
      this.shuffleArray(personArray);
    }

    // 3. 生成 Night 序列（僅第四回合）
    let nightArray = Array(count).fill(false);
    if (round === 4) {
      const nightRatio = isPractice
        ? CONFIG.PRACTICE_NIGHT_RATIO || CONFIG.NIGHT_RATIO
        : CONFIG.NIGHT_RATIO;
      const nightCount = Math.round(count * nightRatio);
      nightArray = Array(count)
        .fill(false)
        .map((_, i) => i < nightCount);
      this.shuffleArray(nightArray);
    }

    // 4. 組合序列
    this.state.trialSequence = [];
    for (let i = 0; i < count; i++) {
      this.state.trialSequence.push({
        isGo: goArray[i],
        hasPerson: personArray[i],
        isNightTime: nightArray[i],
      });
    }

    if (CONFIG.DEBUG_MODE) {
      Logger.debug("📊 生成固定序列:", {
        總數: count,
        Go數量: goCount,
        Person數量: round === 2 ? personArray.filter(Boolean).length : 0,
        Night數量: round === 4 ? nightArray.filter(Boolean).length : 0,
      });
    }
  },

  /**
   * 初始化單一回合
   * 重置狀態並開始遊戲
   *
   * @returns {void}
   */
  initGameSession: function () {
    // 如果是固定模式，預先生成序列
    if (CONFIG.PROBABILITY_MODE === "fixed") {
      this.generateSequence();
    }

    this.state.currentTrial = 0;
    this.state.score = 0;
    this.state.currentConsecutiveCorrect = 0;
    this.state.maxConsecutiveCorrect = 0;
    this.state.isPlaying = true;

    this.elements.totalDisplay.innerText = this.state.totalTrials;
    this.showScreen("play");

    // 設定背景和按鈕文字
    if (this.state.currentRound === 1 || this.state.currentRound === 2) {
      this.elements.backgroundLayer.innerHTML = SVG_ASSETS.mouseHole;
      this.elements.btnSpace.innerHTML =
        '<span class="key-hint">按空白鍵(或點此)</span><span>蒐集起司</span>';
    } else if (this.state.currentRound === 3 || this.state.currentRound === 4) {
      this.elements.backgroundLayer.innerHTML = SVG_ASSETS.oceanBg;
      this.elements.btnSpace.innerHTML =
        '<span class="key-hint">按空白鍵(或點此)</span><span>釣魚</span>';
    }

    this.nextTrial();
  },

  /**
   * 進入下一個試驗
   *
   * @returns {void}
   */
  nextTrial: function () {
    // 檢查是否完成所有試驗
    if (this.state.currentTrial >= this.state.totalTrials) {
      this.endSession();
      return;
    }

    this.state.currentTrial++;
    this.updateUI();

    // 重置刺激物顯示
    this.elements.stimulus.innerHTML = "";
    this.elements.container.className = "game-area";
    this.elements.stimulus.classList.remove(
      "pop",
      "correct-flash",
      "error-flash",
    );

    // 重置 person 指示器
    this.state.hasPerson = false;
    this.elements.personIndicator.style.display = "none";
    this.elements.personIndicator.innerHTML = "";
    this.state.hasResponded = false;

    // 設定背景（第四回合不重置以避免閃爍）
    if (this.state.currentRound === 1 || this.state.currentRound === 2) {
      this.elements.backgroundLayer.innerHTML = SVG_ASSETS.mouseHole;
    } else if (this.state.currentRound === 3) {
      this.elements.backgroundLayer.innerHTML = SVG_ASSETS.oceanBg;
    }

    // ISI (Inter-Stimulus Interval) 隨機延遲
    const delay =
      Math.floor(Math.random() * (CONFIG.ISI_MAX - CONFIG.ISI_MIN + 1)) +
      CONFIG.ISI_MIN;

    setTimeout(() => this.showStimulus(), delay);
  },

  /**
   * 顯示刺激物
   * 核心邏輯：決定顯示什麼刺激物和條件
   *
   * @returns {void}
   */
  showStimulus: function () {
    let isGo, goStimulus, noGoStimulus;

    // 取得固定序列資料（如果是固定模式）
    let fixedData = null;
    if (
      CONFIG.PROBABILITY_MODE === "fixed" &&
      this.state.trialSequence[this.state.currentTrial - 1]
    ) {
      fixedData = this.state.trialSequence[this.state.currentTrial - 1];
    }

    // === 第一回合：純 Go/No-Go ===
    if (this.state.currentRound === 1) {
      this.state.hasPerson = false;

      if (fixedData) {
        isGo = fixedData.isGo;
      } else {
        const ratio = this.state.isPractice
          ? CONFIG.PRACTICE_GO_RATIO || CONFIG.GO_RATIO
          : CONFIG.GO_RATIO;
        isGo = Math.random() < ratio;
      }

      this.state.currentStimulus = isGo ? "cheese" : "cat";
      goStimulus = SVG_ASSETS.cheese;
      noGoStimulus = SVG_ASSETS.cat;
    }
    // === 第二回合：DCCS (person 條件) ===
    else if (this.state.currentRound === 2) {
      if (fixedData) {
        this.state.hasPerson = fixedData.hasPerson;
        isGo = fixedData.isGo;
      } else {
        const personRatio = this.state.isPractice
          ? CONFIG.PRACTICE_PERSON_RATIO || CONFIG.PERSON_RATIO
          : CONFIG.PERSON_RATIO;
        this.state.hasPerson = Math.random() < personRatio;

        const goRatio = this.state.isPractice
          ? CONFIG.PRACTICE_GO_RATIO || CONFIG.GO_RATIO
          : CONFIG.GO_RATIO;
        isGo = Math.random() < goRatio;
      }

      this.state.currentStimulus = isGo ? "cheese" : "cat";
      goStimulus = SVG_ASSETS.cheese;
      noGoStimulus = SVG_ASSETS.cat;

      // 顯示 person 指示器
      if (this.state.hasPerson) {
        this.elements.personIndicator.innerHTML = SVG_ASSETS.person;
        this.elements.personIndicator.style.display = "block";
      }
    }
    // === 第三回合：魚 vs. 鯊魚 ===
    else if (this.state.currentRound === 3) {
      this.state.hasPerson = false;

      if (fixedData) {
        isGo = fixedData.isGo;
      } else {
        const ratio = this.state.isPractice
          ? CONFIG.PRACTICE_GO_RATIO || CONFIG.GO_RATIO
          : CONFIG.GO_RATIO;
        isGo = Math.random() < ratio;
      }

      this.state.currentStimulus = isGo ? "fish" : "shark";
      goStimulus = SVG_ASSETS.fish;
      noGoStimulus = SVG_ASSETS.shark;
    }
    // === 第四回合：釣魚 + night 條件 ===
    else if (this.state.currentRound === 4) {
      // 決定是否為晚上
      if (fixedData) {
        this.state.isNightTime = fixedData.isNightTime;
      } else {
        const nightRatio = this.state.isPractice
          ? CONFIG.PRACTICE_NIGHT_RATIO || CONFIG.NIGHT_RATIO
          : CONFIG.NIGHT_RATIO;
        this.state.isNightTime = Math.random() < nightRatio;
      }

      // 決定刺激物
      if (fixedData) {
        isGo = fixedData.isGo;
      } else {
        const ratio = this.state.isPractice
          ? CONFIG.PRACTICE_GO_RATIO || CONFIG.GO_RATIO
          : CONFIG.GO_RATIO;
        isGo = Math.random() < ratio;
      }

      const stimulus = isGo ? "fish" : "shark";

      // 根據時間設定背景
      if (this.state.isNightTime) {
        this.elements.backgroundLayer.innerHTML = SVG_ASSETS.oceanNight;
        this.elements.personIndicator.style.display = "none";

        if (CONFIG.DEBUG_MODE) {
          Logger.debug(`  🌛 晚上 | 刺激物: ${stimulus} | 正確答案：不按`);
        }
      } else {
        this.elements.backgroundLayer.innerHTML = SVG_ASSETS.oceanBg;
        this.elements.personIndicator.style.display = "none";

        if (CONFIG.DEBUG_MODE) {
          const answer = stimulus === "fish" ? "按" : "不按";
          Logger.debug(`  ☀️ 白天 | 刺激物: ${stimulus} | 正確答案：${answer}`);
        }
      }

      isGo = stimulus === "fish";
      goStimulus = SVG_ASSETS.fish;
      noGoStimulus = SVG_ASSETS.shark;
      this.state.currentStimulus = stimulus;
    }

    // Debug 輸出
    if (CONFIG.DEBUG_MODE) {
      const round = this.state.currentRound;
      const emoji = round === 1 ? (isGo ? "🧀" : "🐈‍⬛") : isGo ? "🐟" : "🦈";
      const personMsg = this.state.hasPerson ? " + 🚶人出現" : "";
      Logger.debug(
        `[第${round}回 試驗${this.state.currentTrial}] 刺激: ${this.state.currentStimulus} ${emoji}${personMsg}`,
      );
    }

    // 顯示刺激物
    this.elements.stimulus.innerHTML = isGo ? goStimulus : noGoStimulus;
    this.elements.stimulus.classList.add("pop");
    this.state.startTime = Date.now();

    // 設定逾時處理
    this.state.timer = setTimeout(() => {
      if (!this.state.hasResponded) {
        this.handleTimeout();
      }
    }, CONFIG.STIMULUS_DURATION);
  },

  /**
   * 處理玩家輸入（按下空白鍵）
   *
   * @param {string} [key] - 按鍵代碼（預設 'Space'）
   * @returns {void}
   */
  handleInput: function (key) {
    if (!this.state.isPlaying || this.state.hasResponded) {
      return;
    }

    clearTimeout(this.state.timer);
    this.state.hasResponded = true;

    const reactionTime = Date.now() - this.state.startTime;
    const isCorrect = this.checkAnswer(true, reactionTime);

    this.triggerFeedback(isCorrect);
    this.recordResult(true, isCorrect, reactionTime);

    setTimeout(() => this.nextTrial(), CONFIG.FEEDBACK_DURATION);
  },

  /**
   * 處理逾時（未按鍵）
   *
   * @returns {void}
   */
  handleTimeout: function () {
    if (this.state.hasResponded) {
      return;
    }

    this.state.hasResponded = true;

    const reactionTime = CONFIG.STIMULUS_DURATION;
    const isCorrect = this.checkAnswer(false, reactionTime);

    this.triggerFeedback(isCorrect);
    this.recordResult(false, isCorrect, reactionTime);

    setTimeout(() => this.nextTrial(), CONFIG.FEEDBACK_DURATION);
  },

  /**
   * 檢查答案是否正確
   *
   * @param {boolean} didPress - 是否按下按鈕
   * @param {number} reactionTime - 反應時間 (ms)
   * @returns {boolean} 是否答對
   */
  checkAnswer: function (didPress, reactionTime) {
    let isCorrect = false;

    // 第一回合：cheese 按，cat 不按
    if (this.state.currentRound === 1) {
      if (this.state.currentStimulus === "cheese") {
        isCorrect = didPress;
      } else {
        isCorrect = !didPress;
      }
    }
    // 第二回合：DCCS 規則
    else if (this.state.currentRound === 2) {
      if (this.state.hasPerson) {
        // 有人：cheese 不按，cat 按
        if (this.state.currentStimulus === "cheese") {
          isCorrect = !didPress;
        } else {
          isCorrect = didPress;
        }
      } else {
        // 沒人：維持第一回合規則
        if (this.state.currentStimulus === "cheese") {
          isCorrect = didPress;
        } else {
          isCorrect = !didPress;
        }
      }
    }
    // 第三回合：fish 按，shark 不按
    else if (this.state.currentRound === 3) {
      if (this.state.currentStimulus === "fish") {
        isCorrect = didPress;
      } else {
        isCorrect = !didPress;
      }
    }
    // 第四回合：晚上都不按，白天 fish 按 shark 不按
    else if (this.state.currentRound === 4) {
      if (this.state.isNightTime) {
        // 晚上：都不按
        isCorrect = !didPress;
      } else {
        // 白天：fish 按，shark 不按
        if (this.state.currentStimulus === "fish") {
          isCorrect = didPress;
        } else {
          isCorrect = !didPress;
        }
      }
    }

    if (isCorrect) {
      this.state.score++;
    }

    return isCorrect;
  },

  /**
   * 觸發視覺和聽覺反饋
   *
   * @param {boolean} isCorrect - 是否答對
   * @returns {void}
   */
  triggerFeedback: function (isCorrect) {
    // 移除舊的回饋樣式
    this.elements.container.classList.remove(
      "feedback-success",
      "feedback-error",
    );
    this.elements.stimulus.classList.remove("correct-flash", "error-flash");

    // 強制重繪以重新觸發動畫
    void this.elements.container.offsetWidth;

    if (isCorrect) {
      this.elements.container.classList.add("feedback-success");
      this.elements.stimulus.classList.add("correct-flash");
      AudioController.playCorrect();
    } else {
      this.elements.container.classList.add("feedback-error");
      this.elements.stimulus.classList.add("error-flash");
      AudioController.playError();
    }
  },

  /**
   * 記錄試驗結果
   *
   * @param {boolean} didPress - 是否按下按鈕
   * @param {boolean} isCorrect - 是否答對
   * @param {number} reactionTime - 反應時間 (ms)
   * @returns {void}
   */
  recordResult: function (didPress, isCorrect, reactionTime) {
    // 更新連續答對次數
    if (isCorrect) {
      this.state.currentConsecutiveCorrect++;
      if (
        this.state.currentConsecutiveCorrect > this.state.maxConsecutiveCorrect
      ) {
        this.state.maxConsecutiveCorrect = this.state.currentConsecutiveCorrect;
      }
    } else {
      this.state.currentConsecutiveCorrect = 0;
    }

    const result = {
      participantId: this.state.participantId,
      round: this.state.currentRound,
      trial: this.state.currentTrial,
      stimulus: this.state.currentStimulus,
      hasPerson: this.state.hasPerson,
      isNightTime: this.state.isNightTime || false,
      input: didPress ? "Space" : "Timeout",
      correct: isCorrect,
      rt: reactionTime,
      timestamp: new Date().toLocaleString("zh-TW", { hour12: false }),
    };

    this.state.results.push(result);

    if (CONFIG.DEBUG_MODE) {
      Logger.debug("📝 記錄結果:", result);
    }
  },

  /**
   * 計算並儲存回合分數 (含加權)
   * 依據 v2.0 需求文件實作
   * @returns {Object|null} 分數詳情，如果是練習模式則回傳 null
   */
  calculateAndSaveScore: function () {
    if (this.state.isPractice) return null;

    const round = this.state.currentRound;
    // 篩選本回合的正式測驗結果
    const roundResults = this.state.results.filter(
      (r) => r.round === round && typeof r.round === "number",
    );

    if (roundResults.length === 0) return null;

    const totalQuestions = roundResults.length;
    const correctCount = roundResults.filter((r) => r.correct === true).length;
    const avgRT =
      Math.round(
        roundResults.reduce((sum, r) => sum + r.rt, 0) / totalQuestions,
      ) || 0;

    // 1. 基礎分數
    let finalScore = correctCount * CONFIG.SCORE_PER_STAR;

    // 讀取歷史紀錄 (localStorage)
    const recordKey = `ef_game_record_r${round}`;
    let history = null;
    try {
      history = JSON.parse(localStorage.getItem(recordKey) || "null");
    } catch (e) {
      Logger.warn("讀取歷史紀錄失敗", e);
    }

    const bonuses = {
      allCorrect: false,
      speedBreakthrough: false,
      perfectPerformance: false,
      firstTime: false,
      progress: false,
    };

    // 2. 判斷加權
    // 🏆 全對獎勵
    if (correctCount === totalQuestions && totalQuestions > 0) {
      finalScore += CONFIG.BONUS_SCORE;
      bonuses.allCorrect = true;
    }

    // 🎯 完美表現 (連續 N 題答對)
    if (this.state.maxConsecutiveCorrect >= CONFIG.PERFECT_STREAK_THRESHOLD) {
      finalScore += CONFIG.BONUS_SCORE;
      bonuses.perfectPerformance = true;
    }

    // 🌟 首次通關
    if (!history) {
      finalScore += CONFIG.BONUS_SCORE;
      bonuses.firstTime = true;
    }

    // ⚡ 速度突破 (比歷史最快還快)
    if (history && avgRT < history.bestAvgRT && avgRT > 0) {
      finalScore += CONFIG.BONUS_SCORE;
      bonuses.speedBreakthrough = true;
    }

    // 3. 判斷進步獎勵 (計算完上述加權後，與歷史最佳分數比較)
    let tempScore = Math.round(finalScore);
    if (history && tempScore > history.bestScore) {
      finalScore += CONFIG.BONUS_SCORE;
      bonuses.progress = true;
    }

    // 4. 最終分數 (四捨五入)
    finalScore = Math.round(finalScore);

    // 5. 更新紀錄
    const newRecord = {
      bestScore: history ? Math.max(history.bestScore, finalScore) : finalScore,
      bestAvgRT:
        history && history.bestAvgRT > 0
          ? Math.min(history.bestAvgRT, avgRT)
          : avgRT,
      lastPlayed: Date.now(),
    };
    localStorage.setItem(recordKey, JSON.stringify(newRecord));

    if (CONFIG.DEBUG_MODE) {
      Logger.debug(`📊 Round ${round} Score:`, {
        base: correctCount,
        final: finalScore,
        bonuses,
      });
    }

    // 儲存到遊戲狀態，供最後結算使用
    this.state.roundScores[round] = {
      finalScore,
      baseScore: correctCount * CONFIG.SCORE_PER_STAR,
      bonuses,
      stats: {
        correctCount,
        totalQuestions,
        avgRT,
        maxStreak: this.state.maxConsecutiveCorrect,
      },
    };

    return {
      baseScore: correctCount * CONFIG.SCORE_PER_STAR,
      finalScore,
      bonuses,
      stats: {
        correctCount,
        totalQuestions,
        avgRT,
        maxStreak: this.state.maxConsecutiveCorrect,
      },
    };
  },

  /**
   * 顯示回合結算畫面
   * @param {Object} scoreData - 從 calculateAndSaveScore 回傳的資料
   * @returns {void}
   */
  showRoundSummary: function (scoreData) {
    if (!scoreData) return;

    // 更新標題
    document.getElementById("summaryRoundTitle").innerText =
      `🎉 場地${this.state.currentRound}完成！`;

    // 更新統計數據
    document.getElementById("summaryCorrectCount").innerText =
      `${scoreData.stats.correctCount} / ${scoreData.stats.totalQuestions}`;
    document.getElementById("summaryAvgRT").innerText =
      `${scoreData.stats.avgRT}ms`;
    document.getElementById("summaryMaxStreak").innerText =
      `${scoreData.stats.maxStreak} 題`;
    document.getElementById("summaryBaseScore").innerText =
      `⭐ × ${scoreData.baseScore}`;

    // 更新分數計算
    document.getElementById("summaryBaseScoreDisplay").innerText =
      `${scoreData.baseScore} 分`;
    document.getElementById("summaryFinalScore").innerText =
      `${scoreData.finalScore} 分`;

    // 更新獎勵列表
    const bonusSection = document.getElementById("summaryBonusSection");
    const bonusList = document.getElementById("summaryBonusList");
    bonusList.innerHTML = "";
    let hasBonus = false;

    const bonusMap = {
      allCorrect: "🏆 全對獎勵",
      speedBreakthrough: "⚡ 速度突破",
      perfectPerformance: "🎯 完美表現",
      firstTime: "🌟 首次通關",
      progress: "📈 進步獎勵",
    };

    for (const key in scoreData.bonuses) {
      if (scoreData.bonuses[key]) {
        hasBonus = true;
        const li = document.createElement("li");
        li.innerText = `${bonusMap[key]} + ${CONFIG.BONUS_SCORE}`;
        bonusList.appendChild(li);
      }
    }

    // 添加 WM 獎勵顯示
    if (scoreData.wmScore !== undefined && scoreData.wmScore > 0) {
      hasBonus = true;
      const wmLi = document.createElement("li");
      wmLi.style.marginTop = "10px";
      wmLi.style.borderTop = "1px solid rgba(255,255,255,0.2)";
      wmLi.style.paddingTop = "10px";
      wmLi.innerHTML = `<strong>🧠 工作記憶獎勵</strong>`;
      bonusList.appendChild(wmLi);

      // 顯示答對位置
      const positionsLi = document.createElement("li");
      positionsLi.style.fontSize = "0.9em";
      positionsLi.style.marginLeft = "20px";
      positionsLi.innerText = `✓ 答對位置: ${scoreData.wmCorrectPositions}/${scoreData.wmTotalPositions} (+${scoreData.wmCorrectPositions * CONFIG.WM_SCORE_PER_POSITION} 分)`;
      bonusList.appendChild(positionsLi);

      // 顯示全對獎勵
      if (scoreData.wmBonuses && scoreData.wmBonuses.allCorrect) {
        const allCorrectLi = document.createElement("li");
        allCorrectLi.style.fontSize = "0.9em";
        allCorrectLi.style.marginLeft = "20px";
        allCorrectLi.innerText = `🏆 全對加權 + ${CONFIG.BONUS_SCORE}`;
        bonusList.appendChild(allCorrectLi);
      }

      // 顯示速度獎勵
      if (scoreData.wmBonuses && scoreData.wmBonuses.speedBonus) {
        const speedLi = document.createElement("li");
        speedLi.style.fontSize = "0.9em";
        speedLi.style.marginLeft = "20px";
        speedLi.innerText = `⚡ 速度最佳 + ${CONFIG.BONUS_SCORE} (${scoreData.wmReactionTime}ms)`;
        bonusList.appendChild(speedLi);
      }

      // 顯示 WM 總分
      const totalWmLi = document.createElement("li");
      totalWmLi.style.fontSize = "0.9em";
      totalWmLi.style.marginLeft = "20px";
      totalWmLi.style.fontWeight = "bold";
      totalWmLi.style.color = "var(--accent-yellow)";
      totalWmLi.innerText = `💡 工作記憶總分: ${scoreData.wmScore} 分`;
      bonusList.appendChild(totalWmLi);
    }

    bonusSection.style.display = hasBonus ? "block" : "none";

    // 更新新紀錄提示
    const newRecordText = document.getElementById("summaryNewRecord");
    newRecordText.style.display =
      scoreData.bonuses.progress || scoreData.bonuses.speedBreakthrough
        ? "block"
        : "none";

    // 更新繼續按鈕的文字
    const continueBtn = document.getElementById("summaryContinueBtn");
    const round = this.state.currentRound;
    let nextAction;

    if (round === 1) {
      continueBtn.innerText = "繼續下一場地";
      nextAction = () => {
        this.showScreen("round2Intro");
      };
    } else if (round === 2) {
      continueBtn.innerText = "繼續下一場地";
      nextAction = () => {
        this.showScreen("round3Practice");
      };
    } else if (round === 3) {
      continueBtn.innerText = "繼續下一場地";
      nextAction = () => {
        this.showScreen("round3End");
      };
    } else {
      continueBtn.innerText = "查看最終結果";
      nextAction = () => this.showFinalResult();
    }

    continueBtn.onclick = nextAction;

    this.showScreen("roundSummary");
  },

  /**
   * 結束當前回合
   * 根據回合數決定進入工作記憶測試或下一回合
   *
   * @returns {void}
   */
  endSession: function () {
    this.state.isPlaying = false;

    // 練習模式結束
    if (this.state.isPractice) {
      if (this.state.currentRound === 1) {
        this.showScreen("practiceEnd");
      } else if (this.state.currentRound === 2) {
        this.showScreen("round2PracticeEnd");
      } else if (this.state.currentRound === 3) {
        this.showScreen("round3PracticeEnd");
      } else if (this.state.currentRound === 4) {
        this.showScreen("round4PracticeEnd");
      }
      return;
    }

    // 計算分數 (正式測驗)
    this.calculateAndSaveScore();

    // 正式測驗結束：進入工作記憶測試
    if (this.state.currentRound === 1) {
      this.prepareWMTest();
      this.showScreen("workingMemory");
    } else if (this.state.currentRound === 2) {
      this.prepareWMTest2();
      this.showScreen("workingMemory2");
    } else if (this.state.currentRound === 3) {
      this.prepareWMTest3();
      this.showScreen("workingMemory3");
    } else if (this.state.currentRound === 4) {
      this.prepareWMTest4();
      this.showScreen("workingMemory4");
    }
  },

  /**
   * 更新 UI 顯示
   *
   * @returns {void}
   */
  updateUI: function () {
    this.elements.trialDisplay.innerText = this.state.currentTrial;

    const progressBar = document.getElementById("progressBar");
    if (progressBar) {
      const progress =
        ((this.state.currentTrial - 1) / this.state.totalTrials) * 100;
      progressBar.style.width = progress + "%";

      if (progress < 30) {
        progressBar.style.background = "#3498db";
      } else if (progress < 70) {
        progressBar.style.background = "#f39c12";
      } else {
        progressBar.style.background = "#2ecc71";
      }
    }
  },

  /**
   * 切換顯示的畫面
   *
   * @param {string} screenName - 畫面名稱
   * @returns {void}
   */
  showScreen: function (screenName) {
    Object.values(this.elements.screens).forEach((element) => {
      if (element) {
        element.classList.add("hidden");
      }
    });
    if (this.elements.screens[screenName]) {
      this.elements.screens[screenName].classList.remove("hidden");
    } else {
      Logger.error(`❌ 找不到畫面: ${screenName}`);
    }
  },

  /**
   * 匯出 CSV 資料
   * 欄位名稱由 GameConstants.CSV_FIELDS 統一管理
   *
   * @returns {void}
   */
  exportData: function () {
    const GC = window.GameConstants || {};
    const F = GC.CSV_FIELDS || {};
    const FO = GC.CSV_FIELD_ORDER || [];
    const CV = GC.CSV_VALUES || {};
    const FN = GC.CSV_FILE_NAMING || {};

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const dateString = `${year}${month}${day}`;
    const timeString = now.toTimeString().slice(0, 8).replace(/:/g, "");
    const participantId = this.state.participantId;

    const sep = FN.SEPARATOR || "_";
    const prefix = FN.DATA_PREFIX || "EF訓練遊戲數據";
    const fileName = `${prefix}${sep}${participantId}${sep}${dateString}${sep}${timeString}.csv`;

    // 使用 CSV_FIELD_ORDER 作為 header，確保與 constants.js 一致
    const headers =
      FO.length > 0
        ? FO
        : [
            "FileName",
            "Participant",
            "SessionId",
            "Mode",
            "FieldId",
            "RuleId",
            "Round",
            "Trial",
            "Stimulus",
            "IsGo",
            "Context",
            "InputKey",
            "Correct",
            "Result",
            "RT(ms)",
            "StimulusDuration",
            "ISI",
            "WMSpan",
            "WMDirection",
            "WMCompletionTime",
            "Timestamp",
          ];
    let csvContent = headers.join(",") + "\n";

    this.state.results.forEach((result) => {
      const row = {};
      row[F.FILE_NAME || "FileName"] = fileName;
      row[F.PARTICIPANT || "Participant"] = result.participantId;
      row[F.SESSION_ID || "SessionId"] = result.sessionId || "";
      row[F.MODE || "Mode"] = result.mode || "multiplayer";
      row[F.FIELD_ID || "FieldId"] = result.fieldId || "";
      row[F.RULE_ID || "RuleId"] = result.ruleId || "";
      row[F.ROUND || "Round"] = result.round;
      row[F.TRIAL || "Trial"] = result.trial;
      row[F.STIMULUS || "Stimulus"] = result.stimulus;
      row[F.IS_GO || "IsGo"] = result.isGo != null ? String(result.isGo) : "";
      row[F.CONTEXT || "Context"] = result.context || "";
      row[F.INPUT_KEY || "InputKey"] = result.input;
      row[F.CORRECT || "Correct"] = result.correct
        ? CV.CORRECT_YES || "yes"
        : CV.CORRECT_NO || "no";
      row[F.RESULT || "Result"] = result.result || "";
      row[F.RT_MS || "RT(ms)"] = result.rt;
      row[F.STIMULUS_DURATION || "StimulusDuration"] =
        result.stimulusDurationMs != null
          ? String(result.stimulusDurationMs)
          : "";
      row[F.ISI || "ISI"] = result.isiMs != null ? String(result.isiMs) : "";
      row[F.WM_SPAN || "WMSpan"] =
        result.wmSpan != null ? String(result.wmSpan) : "";
      row[F.WM_DIRECTION || "WMDirection"] = result.wmDirection || "";
      row[F.WM_COMPLETION_TIME || "WMCompletionTime"] =
        result.wmCompletionTime != null ? String(result.wmCompletionTime) : "";
      row[F.TIMESTAMP || "Timestamp"] = result.timestamp;

      const line = headers
        .map((h) => {
          const val = String(row[h] || "");
          return val.indexOf(",") >= 0 || val.indexOf('"') >= 0
            ? `"${val.replace(/"/g, '""')}"`
            : val;
        })
        .join(",");
      csvContent += line + "\n";
    });

    // 創建下載連結（添加 UTF-8 BOM 以防止 Excel 亂碼）
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (CONFIG.DEBUG_MODE) {
      Logger.info("📥 匯出資料:", fileName);
    }
  },

  // ============================================
  // 工作記憶測試函式（將在下一部分實作）
  // ============================================

  prepareWMTest: function () {
    const round1Trials = this.state.results.filter(
      (r) => r.round === 1 && !r.isPractice,
    );

    let testCount;
    if (CONFIG.WM_TEST_COUNT_MODE === "random") {
      const maxCount = CONFIG.ROUND1_TRIALS || 1;
      testCount = Math.floor(Math.random() * maxCount) + 1;
    } else {
      testCount = CONFIG.WM_TEST_COUNT > 0 ? CONFIG.WM_TEST_COUNT : 1;
    }
    this.state.wmTestCount = testCount;

    const lastN = round1Trials.slice(-testCount).map((r) => r.stimulus);
    const isReverse = this.state.wmReverseStatus[0];
    this.state.wmCorrectAnswer = isReverse ? [...lastN].reverse() : lastN;
    this.state.wmUserAnswer = new Array(testCount).fill(null);
    this.state.wmStartTime = Date.now();
    this.state.isWmCorrect = false;

    if (CONFIG.DEBUG_MODE) {
      Logger.debug(`🧠 第一回合工作記憶測試`);
      Logger.debug(
        `  題數: ${testCount} | 方向: ${isReverse ? "逆向" : "順向"}`,
      );
      Logger.debug(`  正確答案:`, this.state.wmCorrectAnswer);
    }

    this.updateWMQuestion();
    this.generateWMButtons();
  },

  updateWMQuestion: function () {
    const testCount = this.state.wmTestCount;
    const isReverse = this.state.wmReverseStatus[0];
    const questionElement = document.getElementById("wmQuestionText");

    if (questionElement) {
      const countText =
        testCount === 1 ? "最後一個物件" : `最後${testCount}個物件`;
      const orderText = isReverse
        ? "按照<span style='color: var(--error-color);'>逆序</span>"
        : "按照順序";

      questionElement.innerHTML = `${orderText}，<br/>剛才<span style="color: var(--accent-yellow);">${countText}</span>的順序為何？`;
    }
  },

  generateWMButtons: function () {
    const container = document.getElementById("wmPositionButtons");
    const testCount = this.state.wmTestCount;

    container.innerHTML = "";

    for (let i = 0; i < testCount; i++) {
      const button = document.createElement("button");
      button.className = "wm-position-btn";
      button.setAttribute("data-position", i);
      button.onclick = () => this.toggleWMPosition(i);

      button.innerHTML = `
        <div class="wm-position-number">${i + 1}</div>
        <div class="wm-position-icon unknown">❓</div>
      `;

      container.appendChild(button);
    }
  },

  toggleWMPosition: function (position) {
    if (this.state.isWmCorrect) return;

    const currentValue = this.state.wmUserAnswer[position];
    let nextValue;

    if (currentValue === null) {
      nextValue = "cheese";
    } else if (currentValue === "cheese") {
      nextValue = "cat";
    } else {
      nextValue = null;
    }

    this.state.wmUserAnswer[position] = nextValue;
    this.updateWMButtonDisplay(position);
    AudioController.playTone(600, "sine", 0.1);

    if (CONFIG.DEBUG_MODE) {
      Logger.debug(`  位置 ${position + 1} → ${nextValue || "❓"}`);
    }
  },

  updateWMButtonDisplay: function (position) {
    const buttons = document.querySelectorAll(
      "#wmPositionButtons .wm-position-btn",
    );
    const button = buttons[position];
    const iconElement = button.querySelector(".wm-position-icon");
    const value = this.state.wmUserAnswer[position];

    const icons = {
      cheese: "🧀",
      cat: "🐈‍⬛",
      null: "❓",
    };

    iconElement.textContent = icons[value] || icons.null;
    iconElement.className =
      value === null ? "wm-position-icon unknown" : "wm-position-icon";
  },

  resetWMTest: function () {
    const testCount = this.state.wmTestCount;
    this.state.wmUserAnswer = new Array(testCount).fill(null);

    for (let i = 0; i < testCount; i++) {
      this.updateWMButtonDisplay(i);
    }

    if (CONFIG.DEBUG_MODE) {
      Logger.debug("🔄 工作記憶測試已重置");
    }
  },

  checkWMAnswer: function () {
    const hasNull = this.state.wmUserAnswer.includes(null);

    if (hasNull) {
      alert("請完成所有位置的選擇！");
      return;
    }

    const isCorrect =
      JSON.stringify(this.state.wmUserAnswer) ===
      JSON.stringify(this.state.wmCorrectAnswer);

    const reactionTime = Date.now() - this.state.wmStartTime;
    this.state.isWmCorrect = isCorrect;

    // 計算答對的位置數
    let correctPositions = 0;
    for (let i = 0; i < this.state.wmCorrectAnswer.length; i++) {
      if (this.state.wmUserAnswer[i] === this.state.wmCorrectAnswer[i]) {
        correctPositions++;
      }
    }

    // 計算 WM 分數
    let wmScore = correctPositions * CONFIG.WM_SCORE_PER_POSITION;
    const bonuses = {
      allCorrect: isCorrect,
      speedBonus: reactionTime < CONFIG.WM_SPEED_THRESHOLD,
    };

    // 套用加權
    if (bonuses.allCorrect) {
      wmScore += CONFIG.BONUS_SCORE;
    }
    if (bonuses.speedBonus) {
      wmScore += CONFIG.BONUS_SCORE;
    }

    wmScore = Math.round(wmScore);

    // 將 WM 分數加入對應回合
    if (!this.state.roundScores[1]) {
      this.state.roundScores[1] = {
        finalScore: 0,
        baseScore: 0,
        bonuses: {},
        stats: {},
      };
    }
    if (!this.state.roundScores[1].wmScore) {
      this.state.roundScores[1].wmScore = 0;
      this.state.roundScores[1].wmBonuses = {};
    }
    this.state.roundScores[1].wmScore = wmScore;
    this.state.roundScores[1].wmBonuses = bonuses;
    this.state.roundScores[1].wmCorrectPositions = correctPositions;
    this.state.roundScores[1].wmTotalPositions =
      this.state.wmCorrectAnswer.length;
    this.state.roundScores[1].wmReactionTime = reactionTime;

    this.state.results.push({
      participantId: this.state.participantId,
      round: "WM1",
      trial: 1,
      stimulus: this.state.wmCorrectAnswer.join("-"),
      hasPerson: "none",
      isNightTime: "none",
      input: this.state.wmUserAnswer.join("-"),
      correct: isCorrect,
      rt: reactionTime,
      timestamp: new Date().toLocaleString("zh-TW", { hour12: false }),
    });

    this.showWMResult(isCorrect);

    if (CONFIG.DEBUG_MODE) {
      Logger.debug("✓ 工作記憶測試完成");
      Logger.debug(
        `  結果: ${isCorrect ? "正確 ✓" : "錯誤 ✗"} | RT: ${reactionTime}ms`,
      );
      Logger.debug(
        `  答對位置: ${correctPositions}/${this.state.wmCorrectAnswer.length} | WM 分數: ${wmScore}`,
      );
    }
  },

  showWMResult: function (isCorrect) {
    const resultDisplay = document.getElementById("wmResultDisplay");
    const confirmBtn = document.getElementById("wmConfirmBtn");
    const continueBtn = document.getElementById("wmContinueBtn");

    const icons = {
      cheese: "🧀",
      cat: "🐈‍⬛",
    };

    if (isCorrect) {
      resultDisplay.innerHTML = `
        <div class="wm-result correct">
          <div style="font-size: 2em; margin-bottom: 10px;">✓ 答對了！</div>
          <div>你的記憶力真棒！</div>
        </div>
      `;
      AudioController.playCorrect();
    } else {
      let comparisonHTML = '<div class="wm-comparison">';

      // 正確答案
      comparisonHTML += '<div class="wm-comparison-row">';
      comparisonHTML += '<div class="wm-comparison-label">正確答案：</div>';
      comparisonHTML += '<div class="wm-comparison-items">';
      this.state.wmCorrectAnswer.forEach((item, index) => {
        comparisonHTML += `
          <div class="wm-comparison-item">
            <span style="color: var(--accent-yellow);">${index + 1}:</span>
            <span>${icons[item]}</span>
          </div>
        `;
      });
      comparisonHTML += "</div></div>";

      // 玩家答案
      comparisonHTML += '<div class="wm-comparison-row">';
      comparisonHTML += '<div class="wm-comparison-label">你的答案：</div>';
      comparisonHTML += '<div class="wm-comparison-items">';
      this.state.wmUserAnswer.forEach((item, index) => {
        const isItemCorrect = item === this.state.wmCorrectAnswer[index];
        const className = isItemCorrect
          ? "wm-comparison-item correct"
          : "wm-comparison-item incorrect";
        comparisonHTML += `
          <div class="${className}">
            <span style="color: var(--accent-yellow);">${index + 1}:</span>
            <span>${icons[item]}</span>
          </div>
        `;
      });
      comparisonHTML += "</div></div>";
      comparisonHTML += "</div>";

      resultDisplay.innerHTML = `
        <div class="wm-result incorrect">
          <div style="font-size: 2em; margin-bottom: 10px;">✗ 答錯了</div>
          <div style="margin-top: 10px;">請對照下方的答案：</div>
        </div>
        ${comparisonHTML}
      `;
      AudioController.playError();
    }

    resultDisplay.style.display = "block";
    confirmBtn.style.display = "none";
    continueBtn.style.display = "inline-block";
  },

  continueAfterWM: function () {
    // 從 state 取得已計算的分數資料
    const scoreData = this.state.roundScores[1];
    if (!scoreData) {
      Logger.error("❌ 找不到第一回合分數資料");
      return;
    }
    this.showRoundSummary(scoreData);
  },

  // ============================================
  // 第二回合工作記憶測試
  // ============================================

  prepareWMTest2: function () {
    const round2Trials = this.state.results.filter(
      (r) => r.round === 2 && !r.isPractice,
    );

    let testCount;
    if (CONFIG.WM_TEST_COUNT_MODE === "random") {
      const maxCount = CONFIG.ROUND2_TRIALS || 1;
      testCount = Math.floor(Math.random() * maxCount) + 1;
    } else {
      testCount = CONFIG.WM_TEST_COUNT > 0 ? CONFIG.WM_TEST_COUNT : 1;
    }
    this.state.wm2TestCount = testCount;

    const lastN = round2Trials.slice(-testCount).map((r) => {
      return r.hasPerson ? "person_" + r.stimulus : r.stimulus;
    });

    const isReverse = this.state.wmReverseStatus[1];
    this.state.wmCorrectAnswer2 = isReverse ? [...lastN].reverse() : lastN;
    this.state.wmUserAnswer2 = new Array(testCount).fill(null);
    this.state.wmStartTime2 = Date.now();
    this.state.isWmCorrect2 = false;

    if (CONFIG.DEBUG_MODE) {
      Logger.debug(`🧠 第二回合工作記憶測試`);
      Logger.debug(
        `  題數: ${testCount} | 方向: ${isReverse ? "逆向" : "順向"}`,
      );
    }

    this.updateWMQuestion2();
    this.generateWMButtons2();
  },

  updateWMQuestion2: function () {
    const testCount = this.state.wm2TestCount;
    const isReverse = this.state.wmReverseStatus[1];
    const questionElement = document.getElementById("wmQuestion2Text");

    if (questionElement) {
      const countText =
        testCount === 1 ? "最後一個物件" : `最後${testCount}個物件`;
      const orderText = isReverse
        ? "按照<span style='color: var(--error-color);'>逆序</span>"
        : "按照順序";

      questionElement.innerHTML = `${orderText}，<br/>剛才<span style="color: var(--accent-yellow);">${countText}</span>的順序為何？`;
    }
  },

  generateWMButtons2: function () {
    const container = document.getElementById("wmPosition2Buttons");
    container.innerHTML = "";

    for (let i = 0; i < this.state.wm2TestCount; i++) {
      const button = document.createElement("button");
      button.className = "wm-position-btn";
      button.onclick = () => this.toggleWMPosition2(i);
      button.innerHTML = `
        <div class="wm-position-number">${i + 1}</div>
        <div class="wm-position-icon unknown">❓</div>
      `;
      container.appendChild(button);
    }
  },

  toggleWMPosition2: function (position) {
    if (this.state.isWmCorrect2) return;

    const currentValue = this.state.wmUserAnswer2[position];
    let nextValue;

    if (currentValue === null) nextValue = "cheese";
    else if (currentValue === "cheese") nextValue = "cat";
    else if (currentValue === "cat") nextValue = "person_cheese";
    else if (currentValue === "person_cheese") nextValue = "person_cat";
    else nextValue = null;

    this.state.wmUserAnswer2[position] = nextValue;
    this.updateWMButtonDisplay2(position);
    AudioController.playTone(600, "sine", 0.1);
  },

  updateWMButtonDisplay2: function (position) {
    const buttons = document.querySelectorAll(
      "#wmPosition2Buttons .wm-position-btn",
    );
    const iconElement = buttons[position].querySelector(".wm-position-icon");
    const value = this.state.wmUserAnswer2[position];

    const icons = {
      cheese: "🧀",
      cat: "🐈‍⬛",
      person_cheese: "🚶🧀",
      person_cat: "🚶🐈‍⬛",
      null: "❓",
    };

    iconElement.textContent = icons[value] || icons.null;
    iconElement.className =
      value === null ? "wm-position-icon unknown" : "wm-position-icon";
  },

  resetWMTest2: function () {
    this.state.wmUserAnswer2 = new Array(this.state.wm2TestCount).fill(null);
    for (let i = 0; i < this.state.wm2TestCount; i++) {
      this.updateWMButtonDisplay2(i);
    }
  },

  checkWMAnswer2: function () {
    if (this.state.wmUserAnswer2.includes(null)) {
      alert("請完成所有位置的選擇！");
      return;
    }

    const isCorrect =
      JSON.stringify(this.state.wmUserAnswer2) ===
      JSON.stringify(this.state.wmCorrectAnswer2);

    const reactionTime = Date.now() - this.state.wmStartTime2;
    this.state.isWmCorrect2 = isCorrect;

    // 計算答對的位置數
    let correctPositions = 0;
    for (let i = 0; i < this.state.wmCorrectAnswer2.length; i++) {
      if (this.state.wmUserAnswer2[i] === this.state.wmCorrectAnswer2[i]) {
        correctPositions++;
      }
    }

    // 計算 WM 分數
    let wmScore = correctPositions * CONFIG.WM_SCORE_PER_POSITION;
    const bonuses = {
      allCorrect: isCorrect,
      speedBonus: reactionTime < CONFIG.WM_SPEED_THRESHOLD,
    };

    // 套用加權
    if (bonuses.allCorrect) {
      wmScore += CONFIG.BONUS_SCORE;
    }
    if (bonuses.speedBonus) {
      wmScore += CONFIG.BONUS_SCORE;
    }

    wmScore = Math.round(wmScore);

    // 將 WM 分數加入對應回合
    if (!this.state.roundScores[2]) {
      this.state.roundScores[2] = {
        finalScore: 0,
        baseScore: 0,
        bonuses: {},
        stats: {},
      };
    }
    if (!this.state.roundScores[2].wmScore) {
      this.state.roundScores[2].wmScore = 0;
      this.state.roundScores[2].wmBonuses = {};
    }
    this.state.roundScores[2].wmScore = wmScore;
    this.state.roundScores[2].wmBonuses = bonuses;
    this.state.roundScores[2].wmCorrectPositions = correctPositions;
    this.state.roundScores[2].wmTotalPositions =
      this.state.wmCorrectAnswer2.length;
    this.state.roundScores[2].wmReactionTime = reactionTime;

    this.state.results.push({
      participantId: this.state.participantId,
      round: "WM2",
      trial: 1,
      stimulus: this.state.wmCorrectAnswer2.join("-"),
      hasPerson: "none",
      isNightTime: "none",
      input: this.state.wmUserAnswer2.join("-"),
      correct: isCorrect,
      rt: reactionTime,
      timestamp: new Date().toLocaleString("zh-TW", { hour12: false }),
    });

    this.showWMResult2(isCorrect);

    if (CONFIG.DEBUG_MODE) {
      Logger.debug("✓ 第二回合工作記憶測試完成");
      Logger.debug(
        `  結果: ${isCorrect ? "正確 ✓" : "錯誤 ✗"} | RT: ${reactionTime}ms`,
      );
      Logger.debug(
        `  答對位置: ${correctPositions}/${this.state.wmCorrectAnswer2.length} | WM 分數: ${wmScore}`,
      );
    }
  },

  showWMResult2: function (isCorrect) {
    // 實作與 showWMResult 相同，僅更改元素 ID 和圖示
    const resultDisplay = document.getElementById("wmResult2Display");
    const confirmBtn = document.getElementById("wmConfirm2Btn");
    const continueBtn = document.getElementById("wmContinue2Btn");

    const icons = {
      cheese: "🧀",
      cat: "🐈‍⬛",
      person_cheese: "🚶🧀",
      person_cat: "🚶🐈‍⬛",
    };

    if (isCorrect) {
      resultDisplay.innerHTML = `<div class="wm-result correct"><div style="font-size: 2em;">✓ 答對了！</div></div>`;
      AudioController.playCorrect();
    } else {
      // 顯示比對結果（程式碼與第一回合相同）
      let comparisonHTML = '<div class="wm-comparison">';

      // 正確答案
      comparisonHTML += '<div class="wm-comparison-row">';
      comparisonHTML += '<div class="wm-comparison-label">正確答案：</div>';
      comparisonHTML += '<div class="wm-comparison-items">';
      this.state.wmCorrectAnswer2.forEach((item, index) => {
        comparisonHTML += `
          <div class="wm-comparison-item">
            <span style="color: var(--accent-yellow);">${index + 1}:</span>
            <span>${icons[item]}</span>
          </div>
        `;
      });
      comparisonHTML += "</div></div>";

      // 玩家答案
      comparisonHTML += '<div class="wm-comparison-row">';
      comparisonHTML += '<div class="wm-comparison-label">你的答案：</div>';
      comparisonHTML += '<div class="wm-comparison-items">';
      this.state.wmUserAnswer2.forEach((item, index) => {
        const isItemCorrect = item === this.state.wmCorrectAnswer2[index];
        const className = isItemCorrect
          ? "wm-comparison-item correct"
          : "wm-comparison-item incorrect";
        comparisonHTML += `
          <div class="${className}">
            <span style="color: var(--accent-yellow);">${index + 1}:</span>
            <span>${icons[item]}</span>
          </div>
        `;
      });
      comparisonHTML += "</div></div>";
      comparisonHTML += "</div>";

      resultDisplay.innerHTML = `<div class="wm-result incorrect"><div style="font-size: 2em;">✗ 答錯了</div></div>${comparisonHTML}`;
      AudioController.playError();
    }

    resultDisplay.style.display = "block";
    confirmBtn.style.display = "none";
    continueBtn.style.display = "inline-block";
  },

  continueAfterWM2: function () {
    // 從 state 取得已計算的分數資料
    const scoreData = this.state.roundScores[2];
    if (!scoreData) {
      Logger.error("❌ 找不到第二回合分數資料");
      return;
    }
    this.showRoundSummary(scoreData);
  },

  // ============================================
  // 第三回合工作記憶測試 (fish/shark)
  // ============================================

  prepareWMTest3: function () {
    const round3Trials = this.state.results.filter(
      (r) => r.round === 3 && !r.isPractice,
    );

    let testCount;
    if (CONFIG.WM_TEST_COUNT_MODE === "random") {
      const maxCount = CONFIG.ROUND3_TRIALS || 1;
      testCount = Math.floor(Math.random() * maxCount) + 1;
    } else {
      testCount = CONFIG.WM_TEST_COUNT > 0 ? CONFIG.WM_TEST_COUNT : 1;
    }
    this.state.wm3TestCount = testCount;

    const lastN = round3Trials.slice(-testCount).map((r) => r.stimulus);
    const isReverse = this.state.wmReverseStatus[2];
    this.state.wmCorrectAnswer3 = isReverse ? [...lastN].reverse() : lastN;
    this.state.wmUserAnswer3 = new Array(testCount).fill(null);
    this.state.wmStartTime3 = Date.now();
    this.state.isWmCorrect3 = false;

    if (CONFIG.DEBUG_MODE) {
      Logger.debug(`🧠 第三回合工作記憶測試`);
      Logger.debug(
        `  題數: ${testCount} | 方向: ${isReverse ? "逆向" : "順向"}`,
      );
      Logger.debug(`  正確答案:`, this.state.wmCorrectAnswer3);
    }

    this.updateWMQuestion3();
    this.generateWMButtons3();
  },

  updateWMQuestion3: function () {
    const testCount = this.state.wm3TestCount;
    const isReverse = this.state.wmReverseStatus[2];
    const questionElement = document.getElementById("wmQuestion3Text");

    if (questionElement) {
      const countText =
        testCount === 1 ? "最後一個物件" : `最後${testCount}個物件`;
      const orderText = isReverse
        ? "按照<span style='color: var(--error-color);'>逆序</span>"
        : "按照順序";

      questionElement.innerHTML = `${orderText}，<br/>剛才<span style="color: var(--accent-yellow);">${countText}</span>的順序為何？`;
    }
  },

  generateWMButtons3: function () {
    const container = document.getElementById("wmPosition3Buttons");
    container.innerHTML = "";

    for (let i = 0; i < this.state.wm3TestCount; i++) {
      const button = document.createElement("button");
      button.className = "wm-position-btn";
      button.onclick = () => this.toggleWMPosition3(i);
      button.innerHTML = `
        <div class="wm-position-number">${i + 1}</div>
        <div class="wm-position-icon unknown">❓</div>
      `;
      container.appendChild(button);
    }
  },

  toggleWMPosition3: function (position) {
    if (this.state.isWmCorrect3) return;

    const currentValue = this.state.wmUserAnswer3[position];
    let nextValue;

    if (currentValue === null) {
      nextValue = "fish";
    } else if (currentValue === "fish") {
      nextValue = "shark";
    } else {
      nextValue = null;
    }

    this.state.wmUserAnswer3[position] = nextValue;
    this.updateWMButtonDisplay3(position);
    AudioController.playTone(600, "sine", 0.1);

    if (CONFIG.DEBUG_MODE) {
      Logger.debug(`  位置 ${position + 1} → ${nextValue || "❓"}`);
    }
  },

  updateWMButtonDisplay3: function (position) {
    const buttons = document.querySelectorAll(
      "#wmPosition3Buttons .wm-position-btn",
    );
    const button = buttons[position];
    const iconElement = button.querySelector(".wm-position-icon");
    const value = this.state.wmUserAnswer3[position];

    const icons = {
      fish: "🐟",
      shark: "🦈",
      null: "❓",
    };

    iconElement.textContent = icons[value] || icons.null;
    iconElement.className =
      value === null ? "wm-position-icon unknown" : "wm-position-icon";
  },

  resetWMTest3: function () {
    this.state.wmUserAnswer3 = new Array(this.state.wm3TestCount).fill(null);
    for (let i = 0; i < this.state.wm3TestCount; i++) {
      this.updateWMButtonDisplay3(i);
    }

    if (CONFIG.DEBUG_MODE) {
      Logger.debug("🔄 第三回合工作記憶測試已重置");
    }
  },

  checkWMAnswer3: function () {
    if (this.state.wmUserAnswer3.includes(null)) {
      alert("請完成所有位置的選擇！");
      return;
    }

    const isCorrect =
      JSON.stringify(this.state.wmUserAnswer3) ===
      JSON.stringify(this.state.wmCorrectAnswer3);

    const reactionTime = Date.now() - this.state.wmStartTime3;
    this.state.isWmCorrect3 = isCorrect;

    // 計算答對的位置數
    let correctPositions = 0;
    for (let i = 0; i < this.state.wmCorrectAnswer3.length; i++) {
      if (this.state.wmUserAnswer3[i] === this.state.wmCorrectAnswer3[i]) {
        correctPositions++;
      }
    }

    // 計算 WM 分數
    let wmScore = correctPositions * CONFIG.WM_SCORE_PER_POSITION;
    const bonuses = {
      allCorrect: isCorrect,
      speedBonus: reactionTime < CONFIG.WM_SPEED_THRESHOLD,
    };

    // 套用加權
    if (bonuses.allCorrect) {
      wmScore += CONFIG.BONUS_SCORE;
    }
    if (bonuses.speedBonus) {
      wmScore += CONFIG.BONUS_SCORE;
    }

    wmScore = Math.round(wmScore);

    // 將 WM 分數加入對應回合
    if (!this.state.roundScores[3]) {
      this.state.roundScores[3] = {
        finalScore: 0,
        baseScore: 0,
        bonuses: {},
        stats: {},
      };
    }
    if (!this.state.roundScores[3].wmScore) {
      this.state.roundScores[3].wmScore = 0;
      this.state.roundScores[3].wmBonuses = {};
    }
    this.state.roundScores[3].wmScore = wmScore;
    this.state.roundScores[3].wmBonuses = bonuses;
    this.state.roundScores[3].wmCorrectPositions = correctPositions;
    this.state.roundScores[3].wmTotalPositions =
      this.state.wmCorrectAnswer3.length;
    this.state.roundScores[3].wmReactionTime = reactionTime;

    this.state.results.push({
      participantId: this.state.participantId,
      round: "WM3",
      trial: 1,
      stimulus: this.state.wmCorrectAnswer3.join("-"),
      hasPerson: "none",
      isNightTime: "none",
      input: this.state.wmUserAnswer3.join("-"),
      correct: isCorrect,
      rt: reactionTime,
      timestamp: new Date().toLocaleString("zh-TW", { hour12: false }),
    });

    this.showWMResult3(isCorrect);

    if (CONFIG.DEBUG_MODE) {
      Logger.debug("✓ 第三回合工作記憶測試完成");
      Logger.debug(
        `  結果: ${isCorrect ? "正確 ✓" : "錯誤 ✗"} | RT: ${reactionTime}ms`,
      );
    }
  },

  showWMResult3: function (isCorrect) {
    const resultDisplay = document.getElementById("wmResult3Display");
    const confirmBtn = document.getElementById("wmConfirm3Btn");
    const continueBtn = document.getElementById("wmContinue3Btn");

    const icons = {
      fish: "🐟",
      shark: "🦈",
    };

    if (isCorrect) {
      resultDisplay.innerHTML = `
        <div class="wm-result correct">
          <div style="font-size: 2em; margin-bottom: 10px;">✓ 答對了！</div>
          <div>你的記憶力真棒！</div>
        </div>
      `;
      AudioController.playCorrect();
    } else {
      let comparisonHTML = '<div class="wm-comparison">';

      // 正確答案
      comparisonHTML += '<div class="wm-comparison-row">';
      comparisonHTML += '<div class="wm-comparison-label">正確答案：</div>';
      comparisonHTML += '<div class="wm-comparison-items">';
      this.state.wmCorrectAnswer3.forEach((item, index) => {
        comparisonHTML += `
          <div class="wm-comparison-item">
            <span style="color: var(--accent-yellow);">${index + 1}:</span>
            <span>${icons[item]}</span>
          </div>
        `;
      });
      comparisonHTML += "</div></div>";

      // 玩家答案
      comparisonHTML += '<div class="wm-comparison-row">';
      comparisonHTML += '<div class="wm-comparison-label">你的答案：</div>';
      comparisonHTML += '<div class="wm-comparison-items">';
      this.state.wmUserAnswer3.forEach((item, index) => {
        const isItemCorrect = item === this.state.wmCorrectAnswer3[index];
        const className = isItemCorrect
          ? "wm-comparison-item correct"
          : "wm-comparison-item incorrect";
        comparisonHTML += `
          <div class="${className}">
            <span style="color: var(--accent-yellow);">${index + 1}:</span>
            <span>${icons[item]}</span>
          </div>
        `;
      });
      comparisonHTML += "</div></div>";
      comparisonHTML += "</div>";

      resultDisplay.innerHTML = `
        <div class="wm-result incorrect">
          <div style="font-size: 2em; margin-bottom: 10px;">✗ 答錯了</div>
          <div style="margin-top: 10px;">請對照下方的答案：</div>
        </div>
        ${comparisonHTML}
      `;
      AudioController.playError();
    }

    resultDisplay.style.display = "block";
    confirmBtn.style.display = "none";
    continueBtn.style.display = "inline-block";
  },

  continueAfterWM3: function () {
    // 從 state 取得已計算的分數資料
    const scoreData = this.state.roundScores[3];
    if (!scoreData) {
      Logger.error("❌ 找不到第三回合分數資料");
      return;
    }
    this.showRoundSummary(scoreData);
  },

  continueAfterWM4: function () {
    // 從 state 取得已計算的分數資料
    const scoreData = this.state.roundScores[4];
    if (!scoreData) {
      Logger.error("❌ 找不到第四回合分數資料");
      return;
    }
    this.showRoundSummary(scoreData);
  },

  // ============================================
  // 第四回合工作記憶測試 (fish/shark + night)
  // ============================================

  prepareWMTest4: function () {
    const round4Trials = this.state.results.filter(
      (r) => r.round === 4 && !r.isPractice,
    );

    let testCount;
    if (CONFIG.WM_TEST_COUNT_MODE === "random") {
      const maxCount = CONFIG.ROUND4_TRIALS || 1;
      testCount = Math.floor(Math.random() * maxCount) + 1;
    } else {
      testCount = CONFIG.WM_TEST_COUNT > 0 ? CONFIG.WM_TEST_COUNT : 1;
    }
    this.state.wm4TestCount = testCount;

    const lastN = round4Trials.slice(-testCount).map((r) => {
      return r.isNightTime ? "night_" + r.stimulus : r.stimulus;
    });

    const isReverse = this.state.wmReverseStatus[3];
    this.state.wmCorrectAnswer4 = isReverse ? [...lastN].reverse() : lastN;
    this.state.wmUserAnswer4 = new Array(testCount).fill(null);
    this.state.wmStartTime4 = Date.now();
    this.state.isWmCorrect4 = false;

    if (CONFIG.DEBUG_MODE) {
      Logger.debug(`🧠 第四回合工作記憶測試`);
      Logger.debug(
        `  題數: ${testCount} | 方向: ${isReverse ? "逆向" : "順向"}`,
      );
      Logger.debug(`  正確答案:`, this.state.wmCorrectAnswer4);
    }

    this.updateWMQuestion4();
    this.generateWMButtons4();
  },

  updateWMQuestion4: function () {
    const testCount = this.state.wm4TestCount;
    const isReverse = this.state.wmReverseStatus[3];
    const questionElement = document.getElementById("wmQuestion4Text");

    if (questionElement) {
      const countText =
        testCount === 1 ? "最後一個物件" : `最後${testCount}個物件`;
      const orderText = isReverse
        ? "按照<span style='color: var(--error-color);'>逆序</span>"
        : "按照順序";

      questionElement.innerHTML = `${orderText}，<br/>剛才<span style="color: var(--accent-yellow);">${countText}</span>的順序為何？`;
    }
  },

  generateWMButtons4: function () {
    const container = document.getElementById("wmPosition4Buttons");
    container.innerHTML = "";

    for (let i = 0; i < this.state.wm4TestCount; i++) {
      const button = document.createElement("button");
      button.className = "wm-position-btn";
      button.onclick = () => this.toggleWMPosition4(i);
      button.innerHTML = `
        <div class="wm-position-number">${i + 1}</div>
        <div class="wm-position-icon unknown">❓</div>
      `;
      container.appendChild(button);
    }
  },

  toggleWMPosition4: function (position) {
    if (this.state.isWmCorrect4) return;

    const currentValue = this.state.wmUserAnswer4[position];
    let nextValue;

    if (currentValue === null) nextValue = "fish";
    else if (currentValue === "fish") nextValue = "shark";
    else if (currentValue === "shark") nextValue = "night_fish";
    else if (currentValue === "night_fish") nextValue = "night_shark";
    else nextValue = null;

    this.state.wmUserAnswer4[position] = nextValue;
    this.updateWMButtonDisplay4(position);
    AudioController.playTone(600, "sine", 0.1);

    if (CONFIG.DEBUG_MODE) {
      Logger.debug(`  位置 ${position + 1} → ${nextValue || "❓"}`);
    }
  },

  updateWMButtonDisplay4: function (position) {
    const buttons = document.querySelectorAll(
      "#wmPosition4Buttons .wm-position-btn",
    );
    const button = buttons[position];
    const iconElement = button.querySelector(".wm-position-icon");
    const value = this.state.wmUserAnswer4[position];

    const icons = {
      fish: "☀️🐟",
      shark: "☀️🦈",
      night_fish: "🌙🐟",
      night_shark: "🌙🦈",
      null: "❓",
    };

    iconElement.textContent = icons[value] || icons.null;
    iconElement.className =
      value === null ? "wm-position-icon unknown" : "wm-position-icon";
  },

  resetWMTest4: function () {
    this.state.wmUserAnswer4 = new Array(this.state.wm4TestCount).fill(null);
    for (let i = 0; i < this.state.wm4TestCount; i++) {
      this.updateWMButtonDisplay4(i);
    }

    if (CONFIG.DEBUG_MODE) {
      Logger.debug("🔄 第四回合工作記憶測試已重置");
    }
  },

  checkWMAnswer4: function () {
    if (this.state.wmUserAnswer4.includes(null)) {
      alert("請完成所有位置的選擇！");
      return;
    }

    const isCorrect =
      JSON.stringify(this.state.wmUserAnswer4) ===
      JSON.stringify(this.state.wmCorrectAnswer4);

    const reactionTime = Date.now() - this.state.wmStartTime4;
    this.state.isWmCorrect4 = isCorrect;

    // 計算答對的位置數
    let correctPositions = 0;
    for (let i = 0; i < this.state.wmCorrectAnswer4.length; i++) {
      if (this.state.wmUserAnswer4[i] === this.state.wmCorrectAnswer4[i]) {
        correctPositions++;
      }
    }

    // 計算 WM 分數
    let wmScore = correctPositions * CONFIG.WM_SCORE_PER_POSITION;
    const bonuses = {
      allCorrect: isCorrect,
      speedBonus: reactionTime < CONFIG.WM_SPEED_THRESHOLD,
    };

    // 套用加權
    if (bonuses.allCorrect) {
      wmScore += CONFIG.BONUS_SCORE;
    }
    if (bonuses.speedBonus) {
      wmScore += CONFIG.BONUS_SCORE;
    }

    wmScore = Math.round(wmScore);

    // 將 WM 分數加入對應回合
    if (!this.state.roundScores[4]) {
      this.state.roundScores[4] = {
        finalScore: 0,
        baseScore: 0,
        bonuses: {},
        stats: {},
      };
    }
    if (!this.state.roundScores[4].wmScore) {
      this.state.roundScores[4].wmScore = 0;
      this.state.roundScores[4].wmBonuses = {};
    }
    this.state.roundScores[4].wmScore = wmScore;
    this.state.roundScores[4].wmBonuses = bonuses;
    this.state.roundScores[4].wmCorrectPositions = correctPositions;
    this.state.roundScores[4].wmTotalPositions =
      this.state.wmCorrectAnswer4.length;
    this.state.roundScores[4].wmReactionTime = reactionTime;

    this.state.results.push({
      participantId: this.state.participantId,
      round: "WM4",
      trial: 1,
      stimulus: this.state.wmCorrectAnswer4.join("-"),
      hasPerson: "none",
      isNightTime: "none",
      input: this.state.wmUserAnswer4.join("-"),
      correct: isCorrect,
      rt: reactionTime,
      timestamp: new Date().toLocaleString("zh-TW", { hour12: false }),
    });

    this.showWMResult4(isCorrect);

    if (CONFIG.DEBUG_MODE) {
      Logger.debug("✓ 第四回合工作記憶測試完成");
      Logger.debug(
        `  結果: ${isCorrect ? "正確 ✓" : "錯誤 ✗"} | RT: ${reactionTime}ms`,
      );
    }
  },

  showWMResult4: function (isCorrect) {
    const resultDisplay = document.getElementById("wmResult4Display");
    const confirmBtn = document.getElementById("wmConfirm4Btn");
    const continueBtn = document.getElementById("wmContinue4Btn");

    const icons = {
      fish: "☀️🐟",
      shark: "☀️🦈",
      night_fish: "🌙🐟",
      night_shark: "🌙🦈",
    };

    if (isCorrect) {
      resultDisplay.innerHTML = `
        <div class="wm-result correct">
          <div style="font-size: 2em; margin-bottom: 10px;">✓ 答對了！</div>
          <div>你的記憶力真棒！</div>
        </div>
      `;
      AudioController.playCorrect();
    } else {
      let comparisonHTML = '<div class="wm-comparison">';

      // 正確答案
      comparisonHTML += '<div class="wm-comparison-row">';
      comparisonHTML += '<div class="wm-comparison-label">正確答案：</div>';
      comparisonHTML += '<div class="wm-comparison-items">';
      this.state.wmCorrectAnswer4.forEach((item, index) => {
        comparisonHTML += `
          <div class="wm-comparison-item">
            <span style="color: var(--accent-yellow);">${index + 1}:</span>
            <span>${icons[item]}</span>
          </div>
        `;
      });
      comparisonHTML += "</div></div>";

      // 玩家答案
      comparisonHTML += '<div class="wm-comparison-row">';
      comparisonHTML += '<div class="wm-comparison-label">你的答案：</div>';
      comparisonHTML += '<div class="wm-comparison-items">';
      this.state.wmUserAnswer4.forEach((item, index) => {
        const isItemCorrect = item === this.state.wmCorrectAnswer4[index];
        const className = isItemCorrect
          ? "wm-comparison-item correct"
          : "wm-comparison-item incorrect";
        comparisonHTML += `
          <div class="${className}">
            <span style="color: var(--accent-yellow);">${index + 1}:</span>
            <span>${icons[item]}</span>
          </div>
        `;
      });
      comparisonHTML += "</div></div>";
      comparisonHTML += "</div>";

      resultDisplay.innerHTML = `
        <div class="wm-result incorrect">
          <div style="font-size: 2em; margin-bottom: 10px;">✗ 答錯了</div>
          <div style="margin-top: 10px;">請對照下方的答案：</div>
        </div>
        ${comparisonHTML}
      `;
      AudioController.playError();
    }

    resultDisplay.style.display = "block";
    confirmBtn.style.display = "none";
    continueBtn.style.display = "inline-block";
  },

  showFinalResult: function () {
    this.showScreen("result");

    // 計算總加權分數
    let totalScore = 0;
    let totalCorrectCount = 0;

    // 從 roundScores 加總
    Object.values(this.state.roundScores).forEach((roundData) => {
      if (roundData.finalScore) {
        totalScore += roundData.finalScore;
      }
      // 加總工作記憶分數
      if (roundData.wmScore) {
        totalScore += roundData.wmScore;
      }
      // 加總答對題數 (修正讀取位置)
      if (roundData.stats && roundData.stats.correctCount) {
        totalCorrectCount += roundData.stats.correctCount;
      }
    });

    // 計算平均反應時間 (僅計算正確且有效的試驗)
    const validTrials = this.state.results.filter(
      (r) => r.input === "Space" && r.correct === true,
    );
    const avgReactionTime =
      validTrials.length > 0
        ? Math.round(
            validTrials.reduce((sum, r) => sum + r.rt, 0) / validTrials.length,
          )
        : 0;

    this.elements.scoreDisplay.innerText = totalScore;
    this.elements.avgTimeDisplay.innerText = avgReactionTime + "ms";

    if (CONFIG.DEBUG_MODE) {
      Logger.info("🏆 遊戲結束");
      Logger.debug(`  總分: ${totalScore} (答對題數: ${totalCorrectCount})`);
      Logger.debug(`  平均反應時間: ${avgReactionTime}ms`);
    }
  },
};

// 匯出模組
if (typeof module !== "undefined" && module.exports) {
  module.exports = GameLogic;
}
