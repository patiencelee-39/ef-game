/**
 * GameController — 遊戲流程控制器（IIFE）
 * 管理 Go/No-Go 試驗迴圈、WM 測驗整合、雙模式支援
 * 對應需求文件：§3.1b, §3.4, Flow-9, Flow-12
 */
var GameController = (function () {
  "use strict";

  // =========================================
  // DOM 快取
  // =========================================
  var dom = {};

  function cacheDom() {
    dom.headerTitle = document.getElementById("headerTitle");
    dom.btnBack = document.getElementById("btnBack");
    dom.btnPause = document.getElementById("btnPause");
    dom.ruleIntroScreen = document.getElementById("rule-intro-screen");
    dom.ruleIntroTitle = document.getElementById("ruleIntroTitle");
    dom.ruleIntroMnemonic = document.getElementById("ruleIntroMnemonic");
    dom.ruleIntroBoxes = document.getElementById("ruleIntroBoxes");
    dom.ruleIntroPageIndicator = document.getElementById(
      "ruleIntroPageIndicator",
    );
    dom.rulePageDot1 = document.getElementById("rulePageDot1");
    dom.rulePageDot2 = document.getElementById("rulePageDot2");
    dom.ruleIntroContext = document.getElementById("ruleIntroContext");
    dom.ruleIntroWM = document.getElementById("ruleIntroWM");
    dom.btnRuleNext = document.getElementById("btnRuleNext");
    dom.btnRuleStart = document.getElementById("btnRuleStart");
    dom.playScreen = document.getElementById("play-screen");
    dom.roundLabel = document.getElementById("roundLabel");
    dom.trialCurrent = document.getElementById("trialCurrent");
    dom.trialTotal = document.getElementById("trialTotal");
    dom.progressBar = document.getElementById("progressBar");
    dom.stimContainer = document.getElementById("stimulusContainer");
    dom.bgLayer = document.getElementById("backgroundLayer");
    dom.ctxIndicator = document.getElementById("contextIndicator");
    dom.stimulus = document.getElementById("stimulus");
    dom.btnSpace = document.getElementById("btnSpace");
    dom.btnLabel = document.getElementById("btnLabel");
    dom.gameContainer = document.getElementById("gameContainer");
    dom.pauseOverlay = document.getElementById("pause-overlay");
    dom.btnResume = document.getElementById("btnResume");
    dom.btnQuit = document.getElementById("btnQuit");
    dom.exitOverlay = document.getElementById("exit-confirm-overlay");
    dom.btnExitCancel = document.getElementById("btnExitCancel");
    dom.btnExitConfirm = document.getElementById("btnExitConfirm");
    dom.wmContainer = document.getElementById("wm-container");
    dom.comboTransCtr = document.getElementById("combo-transition-container");
    // Practice (Plan D) — 與正式遊戲結構一致
    dom.demoPracticeScreen = document.getElementById("demoPracticeScreen");
    dom.practiceRoundLabel = document.getElementById("practiceRoundLabel");
    dom.practiceCurrent = document.getElementById("practiceCurrent");
    dom.practiceTotal = document.getElementById("practiceTotal");
    dom.practiceProgressBar = document.getElementById("practiceProgressBar");
    dom.demoStimulusContainer = document.getElementById(
      "demoStimulusContainer",
    );
    dom.demoBackgroundLayer = document.getElementById("demoBackgroundLayer");
    dom.demoContextIndicator = document.getElementById("demoContextIndicator");
    dom.demoStimulus = document.getElementById("demoStimulus");
    dom.demoFeedback = document.getElementById("demoFeedback");
    dom.btnDemoSpace = document.getElementById("btnDemoSpace");
    dom.btnDemoLabel = document.getElementById("btnDemoLabel");
    dom.demoBtnArea = document.getElementById("demoBtnArea");
    dom.practiceResult = document.getElementById("practiceResult");
    dom.btnSkipPractice = document.getElementById("btnSkipPractice");
    // Guide Animation (Plan C iframe)
    dom.guideAnimScreen = document.getElementById("guideAnimScreen");
    dom.guideIframe = document.getElementById("guideIframe");
    dom.wmTransitionScreen = document.getElementById("wmTransitionScreen");
    dom.btnWmTransitionReady = document.getElementById("btnWmTransitionReady");
    // Stage Transition（三階段過場提示）
    dom.stageTransScreen = document.getElementById("stageTransitionScreen");
    dom.stageTransIcon = document.getElementById("stageTransIcon");
    dom.stageTransTitle = document.getElementById("stageTransTitle");
    dom.stageTransSubtitle = document.getElementById("stageTransSubtitle");
    dom.stageTransBar = document.getElementById("stageTransBar");
  }

  // =========================================
  // 遊戲狀態
  // =========================================
  var _mode = "adventure"; // 'adventure' | 'free-select'
  var _session = null; // sessionStorage 中的 session
  var _combos = []; // 所有 combo 定義
  var _comboIndex = 0; // 目前 combo 索引
  var _questions = []; // 目前 combo 的題目序列

  // Demo 跳過狀態
  var _demoSkipped = false;
  var _trialIndex = 0; // 目前試驗索引
  var _trialResults = []; // 本 combo 的逐題紀錄
  var _allComboResults = []; // 所有 combo 結果（自由選擇用）
  var _isPlaying = false; // 遊戲迴圈是否運行中
  var _isPaused = false; // 是否暫停
  var _responded = false; // 本題是否已回應
  var _stimTimerId = null; // 刺激物到期 timer
  var _isiTimerId = null; // ISI delay timer
  var _stimShownAt = 0; // 刺激物顯示時間戳

  // CSV 新增欄位用
  var _sessionId = ""; // 本次遊戲 session ID
  var _currentStimulusDuration = 0; // 本題刺激物顯示時間 (ms)
  var _currentISI = 0; // 本題 ISI (ms)

  // =========================================
  // 刺激物渲染（委派 TrialRenderer 共用模組）
  // =========================================

  /**
   * 刺激物 key → 幼兒可理解的顯示名稱
   * @type {Object.<string, string>}
   */
  var STIMULUS_NAMES = {
    cheese: "🧀 起司",
    cat: "😺 貓咪",
    fish: "🐟 魚",
    shark: "🦈 鯊魚",
  };

  /** 規則動畫 HTML 檔案路徑對照（Plan C） */
  var GUIDE_ANIM_PATHS = {
    mouse: {
      rule1: "guides/mouse/demo-mouse-rule1-slow-v2.html",
      rule2: "guides/mouse/demo-mouse-rule2-slow.html",
      mixed: "guides/mouse/demo-mouse-mixed-slow.html",
    },
    fishing: {
      rule1: "guides/ocean/demo-ocean-rule1-slow.html",
      rule2: "guides/ocean/demo-ocean-rule2-slow.html",
      mixed: "guides/ocean/demo-ocean-mixed-slow.html",
    },
  };

  /** stimulus key → SVG HTML（委派 TrialRenderer） */
  function getSVG(key) {
    return TrialRenderer.svg(key);
  }

  /** 快速組裝渲染所需 DOM 元素 */
  function _stimEls() {
    return {
      stimContainer: dom.stimContainer,
      bgLayer: dom.bgLayer,
      ctxIndicator: dom.ctxIndicator,
      stimulus: dom.stimulus,
    };
  }

  /** 遊戲場 → 回應按鈕文字 */
  function getActionLabel(fieldId) {
    return fieldId === "mouse"
      ? "🧀 蒐集起司！"
      : fieldId === "fishing"
        ? "🐟 釣魚！"
        : "按！";
  }

  // renderStimulus / clearStimulus 已遷移至 TrialRenderer 共用模組

  // =========================================
  // 畫面管理
  // =========================================

  /** 切換顯示畫面（.screen.active） */
  function showScreen(el) {
    var all = dom.gameContainer.querySelectorAll(".screen");
    for (var i = 0; i < all.length; i++) all[i].classList.remove("active");
    if (el) el.classList.add("active");
    // 確保鍵盤焦點回到主文件（避免 iframe 搶走焦點）
    if (el !== dom.guideAnimScreen) {
      try {
        document.body.focus();
      } catch (_) {
        /* ignore */
      }
    }
  }

  // =========================================
  // 規則說明畫面（Plan B 改善版：大圖 + 動畫 + 口訣 + 混合分頁）
  // =========================================

  var _mixedPage = 0; // 混合規則分頁 (0=page1, 1=page2)
  var _mixedRuleData = null; // 暫存混合規則資料供分頁使用

  /**
   * 顯示規則說明畫面（Plan B 改善版）
   * 包含大圖動畫、口訣顯示、混合規則分頁
   * @param {Object} combo - combo 定義 { fieldId, ruleId, enableWm, hasWM, ... }
   * @returns {void}
   */
  function showRuleIntro(combo) {
    var fieldId = combo.fieldId;
    var ruleId = combo.ruleId;
    var field = GAME_CONFIG.FIELDS[fieldId];
    var rule = field.rules[ruleId];

    // 標題
    dom.ruleIntroTitle.textContent = field.icon + " " + (rule.name || ruleId);

    // === Plan C：口訣顯示 ===
    var pointId = _getPointId(fieldId, ruleId, combo);
    var dialogue =
      typeof STORY_CONFIG !== "undefined" && STORY_CONFIG.getDialogue
        ? STORY_CONFIG.getDialogue(pointId)
        : null;
    if (dialogue && dialogue.opening && dialogue.opening.mnemonic) {
      dom.ruleIntroMnemonic.textContent = dialogue.opening.mnemonic;
      dom.ruleIntroMnemonic.classList.remove("hidden");
    } else {
      dom.ruleIntroMnemonic.classList.add("hidden");
    }

    // === Plan B：規則框 ===
    dom.ruleIntroBoxes.innerHTML = "";
    _mixedPage = 0;
    _mixedRuleData = null;

    if (ruleId === "mixed") {
      // 混合規則：分頁顯示（先顯示第 1 頁）
      var ruleA = field.rules[rule.contextA.appliesRule];
      var ruleB = field.rules[rule.contextB.appliesRule];
      _mixedRuleData = {
        rule: rule,
        ruleA: ruleA,
        ruleB: ruleB,
        fieldId: fieldId,
      };

      _showMixedPage(0);
      dom.ruleIntroPageIndicator.classList.remove("hidden");
      dom.btnRuleNext.classList.remove("hidden");
      dom.btnRuleStart.classList.add("hidden");
      dom.ruleIntroContext.classList.remove("hidden");
      dom.ruleIntroContext.textContent =
        fieldId === "mouse"
          ? "👤 有人出現時規則會改變！注意畫面右上角"
          : "🌛 晚上時規則會改變！注意背景顏色";
    } else {
      dom.ruleIntroBoxes.innerHTML =
        _boxHTML(rule.go.stimulus, "按按按！", true) +
        _boxHTML(rule.noGo.stimulus, "不要按！", false);
      dom.ruleIntroPageIndicator.classList.add("hidden");
      dom.btnRuleNext.classList.add("hidden");
      dom.btnRuleStart.classList.remove("hidden");
      dom.ruleIntroContext.classList.add("hidden");
    }

    // WM 提示
    var hasWM = combo.enableWm || combo.hasWM;
    dom.ruleIntroWM.classList.toggle("hidden", !hasWM);

    showScreen(dom.ruleIntroScreen);
  }

  /**
   * 混合規則分頁切換：情境A（多數）和情境B（少數）分開顯示
   * @param {number} page - 0=第一頁, 1=第二頁
   * @returns {void}
   */
  function _showMixedPage(page) {
    if (!_mixedRuleData) return;
    _mixedPage = page;
    var d = _mixedRuleData;

    if (page === 0) {
      // 第 1 頁：情境 A（多數情境）
      dom.ruleIntroBoxes.innerHTML =
        '<p class="rule-page-label">' +
        d.rule.contextA.label +
        "（多數情境）</p>" +
        _boxHTML(d.ruleA.go.stimulus, "按按按！", true) +
        _boxHTML(d.ruleA.noGo.stimulus, "不要按！", false);
      dom.rulePageDot1.classList.add("active");
      dom.rulePageDot2.classList.remove("active");
      dom.btnRuleNext.classList.remove("hidden");
      dom.btnRuleStart.classList.add("hidden");
    } else {
      // 第 2 頁：情境 B（少數情境 ⚠️）
      dom.ruleIntroBoxes.innerHTML =
        '<p class="rule-page-label" style="color:#f39c12;">⚠️ ' +
        d.rule.contextB.label +
        "（少數情境）</p>" +
        _boxHTML(d.ruleB.go.stimulus, "按按按！", true) +
        _boxHTML(d.ruleB.noGo.stimulus, "不要按！", false);
      dom.rulePageDot1.classList.remove("active");
      dom.rulePageDot2.classList.add("active");
      dom.btnRuleNext.classList.add("hidden");
      dom.btnRuleStart.classList.remove("hidden");
    }
    // 加入淡入動畫
    dom.ruleIntroBoxes.style.animation = "none";
    void dom.ruleIntroBoxes.offsetWidth;
    dom.ruleIntroBoxes.style.animation = "fade-in 0.4s ease-out";
  }

  /**
   * 產生單個規則框 HTML（Plan B：大 SVG + 動畫手指/X 圖示）
   * @param {string} stimKey - SVG_ASSETS 中的刺激物 key
   * @param {string} actionText - 動作文字（如「按按按！」）
   * @param {boolean} isGo - 是否為 Go 規則
   * @returns {string} HTML 字串
   */
  function _boxHTML(stimKey, actionText, isGo) {
    var cls = isGo ? "rule-box rule-box--go" : "rule-box rule-box--nogo";
    var txtCls = isGo
      ? "rule-action-text rule-action-text--go"
      : "rule-action-text rule-action-text--nogo";
    var iconCls = isGo
      ? "rule-action-icon rule-action-icon--go"
      : "rule-action-icon rule-action-icon--nogo";
    var actionIcon = isGo ? "👆" : "🚫";
    return (
      '<div class="' +
      cls +
      '">' +
      '<span class="rule-stim-icon">' +
      getSVG(stimKey) +
      "</span>" +
      '<span class="' +
      iconCls +
      '">' +
      actionIcon +
      "</span>" +
      '<span class="' +
      txtCls +
      '">' +
      actionText +
      "</span>" +
      "</div>"
    );
  }

  /**
   * 從 combo 推導對應的 story pointId（供口訣查詢用）
   * @param {string} fieldId - 'mouse' | 'fishing'
   * @param {string} ruleId - 'rule1' | 'rule2' | 'mixed'
   * @param {Object} combo - combo 定義
   * @returns {string} pointId（如 'mouse_r1', 'fishing_mixed_wm'）
   */
  function _getPointId(fieldId, ruleId, combo) {
    // e.g. mouse + rule1 -> mouse_r1, mouse + rule1 + hasWM -> mouse_r1_wm
    var hasWM = combo.enableWm || combo.hasWM;
    var base = fieldId + "_" + ruleId.replace("rule", "r");
    if (ruleId === "mixed") base = fieldId + "_mixed";
    return hasWM ? base + "_wm" : base;
  }

  // =========================================
  // 階段過場提示（規則/練習/正式 三階段共用）
  // =========================================

  var _stageTransTimerId = null;
  var _stageTransSkipHandler = null;

  /**
   * 顯示階段過場提示畫面
   * @param {Object} opts
   * @param {string} opts.icon - 大 emoji（如 "👀"）
   * @param {string} opts.title - 主標題
   * @param {string} opts.subtitle - 副標題
   * @param {number} [opts.duration=2500] - 自動前進毫秒數
   * @param {Function} opts.onDone - 結束回調
   */
  function showStageTransition(opts) {
    var duration = opts.duration || 2500;

    // 填入內容
    dom.stageTransIcon.textContent = opts.icon || "";
    dom.stageTransTitle.textContent = opts.title || "";
    dom.stageTransSubtitle.textContent = opts.subtitle || "";

    // 重設進度條（先歸零再啟動動畫）
    dom.stageTransBar.style.transition = "none";
    dom.stageTransBar.style.width = "0%";
    // force reflow
    void dom.stageTransBar.offsetWidth;
    dom.stageTransBar.style.transition = "width " + duration + "ms linear";
    dom.stageTransBar.style.width = "100%";

    showScreen(dom.stageTransScreen);

    // 清除舊的
    if (_stageTransTimerId) clearTimeout(_stageTransTimerId);
    if (_stageTransSkipHandler) {
      document.removeEventListener("click", _stageTransSkipHandler);
      document.removeEventListener("keydown", _stageTransSkipHandler);
      _stageTransSkipHandler = null;
    }

    var done = false;
    function finish() {
      if (done) return;
      done = true;
      clearTimeout(_stageTransTimerId);
      _stageTransTimerId = null;
      if (_stageTransSkipHandler) {
        document.removeEventListener("click", _stageTransSkipHandler);
        document.removeEventListener("keydown", _stageTransSkipHandler);
        _stageTransSkipHandler = null;
      }
      if (opts.onDone) opts.onDone();
    }

    // 自動前進
    _stageTransTimerId = setTimeout(finish, duration);

    // 點擊/空白鍵跳過
    _stageTransSkipHandler = function (e) {
      if (e.type === "keydown" && e.code !== "Space") return;
      e.preventDefault();
      finish();
    };
    // 延遲 300ms 才加監聽，避免前一步點擊穿透
    setTimeout(function () {
      if (!done) {
        document.addEventListener("click", _stageTransSkipHandler);
        document.addEventListener("keydown", _stageTransSkipHandler);
      }
    }, 300);
  }

  // =========================================
  // Plan C：規則動畫示範（iframe 嵌入）
  // =========================================

  var _guideReadyCallback = null;

  /**
   * 顯示規則動畫（iframe 方式）
   * @param {Object} combo - combo 定義
   * @param {Function} onReady - 動畫結束（或跳過）後的回調
   */
  function showGuideAnimation(combo, onReady) {
    var fieldId = combo.fieldId;
    var ruleId = combo.ruleId;
    var paths = GUIDE_ANIM_PATHS[fieldId];
    var path = paths && paths[ruleId];

    if (!path) {
      // 沒有對應動畫，直接回調
      onReady();
      return;
    }

    // 取得口訣
    var pointId = _getPointId(fieldId, ruleId, combo);
    var dialogue =
      typeof STORY_CONFIG !== "undefined" && STORY_CONFIG.getDialogue
        ? STORY_CONFIG.getDialogue(pointId)
        : null;
    var mnemonic =
      dialogue && dialogue.opening && dialogue.opening.mnemonic
        ? dialogue.opening.mnemonic
        : "";

    // 設定回調
    _guideReadyCallback = onReady;

    // 載入 iframe
    dom.guideIframe.src = path;
    showScreen(dom.guideAnimScreen);

    dom.guideIframe.onload = function () {
      try {
        dom.guideIframe.contentWindow.postMessage(
          { type: "init", mnemonic: mnemonic },
          "*",
        );
      } catch (err) {
        console.warn("[GuideAnim] postMessage failed:", err);
      }
    };
  }

  /** 動畫結束後：直接進入練習 */
  function _afterGuideReady(combo) {
    _practiceRetryCount = 0;
    if (typeof AudioPlayer !== "undefined" && AudioPlayer.resumeAudioContext) {
      AudioPlayer.resumeAudioContext();
    }

    // ★ 階段過場 2：練習
    showStageTransition({
      icon: "🎯",
      title: "練習時間！",
      subtitle: "先練習 " + PRACTICE_TRIAL_COUNT + " 題，答錯可以再試喔！",
      duration: 2500,
      onDone: function () {
        // Plan D：跑練習（完成後經 WM 判斷再進入正式）
        runPracticeTrials(combo, function () {
          _beforeBeginTrials(combo);
        });
      },
    });
  }

  /**
   * 練習完成 → 若有 WM 顯示提醒 → 正式開始
   * @param {Object} combo
   */
  function _beforeBeginTrials(combo) {
    var hasWM = combo.enableWm || combo.hasWM;
    if (hasWM) {
      showScreen(dom.wmTransitionScreen);
      // btnWmTransitionReady 事件已在 bindEvents 中綁定，會呼叫 beginTrials()
    } else {
      beginTrials();
    }
  }

  // =========================================
  // Plan A：互動式示範（系統演示 2-3 個範例試驗）— 保留備用
  // =========================================

  /**
   * 取得 Demo/Practice 用的 DOM 元素集合（對應 TrialRenderer 的 els 參數格式）
   * @returns {{ stimContainer: HTMLElement, bgLayer: HTMLElement, ctxIndicator: HTMLElement, stimulus: HTMLElement }}
   */
  function _demoStimulusElements() {
    return {
      stimContainer: dom.demoStimulusContainer,
      bgLayer: dom.demoBackgroundLayer,
      ctxIndicator: dom.demoContextIndicator,
      stimulus: dom.demoStimulus,
    };
  }

  /**
   * 重置示範/練習畫面的所有視覺狀態
   * @returns {void}
   */
  function _resetDemoVisuals() {
    dom.demoFeedback.classList.add("hidden");
    dom.demoFeedback.className = "practice-feedback hidden";
    dom.btnDemoSpace.classList.remove(
      "demo-go-pulse",
      "demo-btn-pressed",
      "demo-nogo-dim",
    );
  }

  /**
   * [已棄用] 互動式示範 — Plan C 以 iframe 動畫取代。
   * 保留函式簽名供舊流程相容，直接跳過呼叫 onComplete。
   */
  function runDemo(combo, onComplete) {
    if (onComplete) onComplete();
  }

  // =========================================
  // Plan D：練習回合（3-4 題，即時回饋，必須全對才能進入正式）
  // =========================================

  var _practiceQuestions = [];
  var _practiceIdx = 0;
  var _practiceCorrect = 0;
  var _practiceResponded = false;
  var _practiceTimerId = null;
  var _practiceStimShownAt = 0;
  var _practiceRetryCount = 0;
  var PRACTICE_TRIAL_COUNT = 3;
  var PRACTICE_PASS_THRESHOLD = 1.0; // 全對才通過

  /**
   * 執行練習回合
   * @param {Object} combo
   * @param {Function} onComplete - 練習通過後回調
   */
  function runPracticeTrials(combo, onComplete) {
    var fieldId = combo.fieldId;
    var ruleId = combo.ruleId;

    _practiceQuestions = generatePracticeQuestions(
      fieldId,
      ruleId,
      PRACTICE_TRIAL_COUNT,
    );
    _practiceIdx = 0;
    _practiceCorrect = 0;

    // 設定練習資訊列（與正式遊戲一致）
    var field = GAME_CONFIG.FIELDS[fieldId];
    var ruleName =
      field && field.rules[ruleId] ? field.rules[ruleId].name : ruleId;
    dom.practiceRoundLabel.textContent =
      "🎯 練習 · " + field.icon + " " + ruleName;
    dom.practiceTotal.textContent = _practiceQuestions.length;
    dom.practiceCurrent.textContent = "0";
    dom.practiceProgressBar.style.width = "0%";
    dom.btnDemoSpace.disabled = true;
    dom.btnDemoLabel.textContent = getActionLabel(fieldId);
    dom.demoBtnArea.style.display = "flex";
    dom.demoBtnArea.style.justifyContent = "center";
    dom.practiceResult.classList.add("hidden");
    _resetDemoVisuals();

    showScreen(dom.demoPracticeScreen);

    // 定義練習事件處理
    _practiceOnComplete = onComplete;
    _practiceCombo = combo;

    _startNextPracticeTrial();
  }

  var _practiceOnComplete = null;
  var _practiceCombo = null;

  /**
   * 啟動下一道練習題：清除畫面 → ISI → 顯示刺激物 → 等待回應
   * @returns {void}
   */
  function _startNextPracticeTrial() {
    if (_practiceIdx >= _practiceQuestions.length) {
      _evaluatePractice();
      return;
    }

    var q = _practiceQuestions[_practiceIdx];
    var combo = _practiceCombo;

    // 更新練習進度（與正式遊戲資訊列一致）
    dom.practiceCurrent.textContent = _practiceIdx + 1;
    var pPct = Math.round(
      ((_practiceIdx + 1) / _practiceQuestions.length) * 100,
    );
    dom.practiceProgressBar.style.width = pPct + "%";
    _resetDemoVisuals();
    _practiceResponded = false;

    // ISI
    TrialRenderer.clear(_demoStimulusElements());
    dom.btnDemoSpace.disabled = true;

    setTimeout(function () {
      TrialRenderer.render(
        _demoStimulusElements(),
        q,
        combo.fieldId,
        combo.ruleId,
      );

      // 🔊 練習時也播放刺激物語音（與正式遊戲一致）
      if (
        typeof AudioPlayer !== "undefined" &&
        AudioPlayer.playVoice &&
        typeof getVoiceFileForQuestion === "function"
      ) {
        var voicePath = getVoiceFileForQuestion(combo.fieldId, q, combo.ruleId);
        if (voicePath) {
          AudioPlayer.playVoice(voicePath, {
            text: q.stimulus || "",
            gender:
              combo.ruleId === "mixed" && q.appliedRule === "rule2"
                ? "male"
                : "female",
          });
        }
      }

      dom.btnDemoSpace.disabled = false;
      _practiceStimShownAt = Date.now();

      // 刺激物到期（使用較長時間 3 秒）
      _practiceTimerId = setTimeout(function () {
        if (!_practiceResponded) {
          // 沒按 → NoGo 才正確
          _handlePracticeResponse(!q.isGo, q);
        }
      }, 3000);
    }, 600);
  }

  /**
   * 練習模式按鍵回應處理：判斷按壓是否正確（Go 題按下才正確）
   * @returns {void}
   */
  function _onPracticePress() {
    if (_practiceResponded || dom.btnDemoSpace.disabled) return;
    _practiceResponded = true;
    clearTimeout(_practiceTimerId);
    dom.btnDemoSpace.disabled = true;

    var q = _practiceQuestions[_practiceIdx];
    var isCorrect = q.isGo; // 按了 → Go 才正確
    _handlePracticeResponse(isCorrect, q);
  }

  /**
   * 處理練習回應（timeout 或 press），顯示即時回饋
   * @param {boolean} isCorrect - 本題是否答對
   * @param {Object} question - 當前題目物件
   * @returns {void}
   */
  function _handlePracticeResponse(isCorrect, question) {
    _practiceResponded = true;
    clearTimeout(_practiceTimerId);
    dom.btnDemoSpace.disabled = true;

    if (isCorrect) _practiceCorrect++;

    // 顯示回饋
    dom.demoFeedback.classList.remove("hidden");
    if (isCorrect) {
      dom.demoFeedback.className = "demo-feedback correct";
      dom.demoFeedback.className = "practice-feedback correct";
      dom.demoFeedback.textContent = "✅ 答對了！";
    } else {
      dom.demoFeedback.className = "practice-feedback incorrect";
      // 用具體刺激物名稱顯示正確做法
      var stimName = STIMULUS_NAMES[question.stimulus] || question.stimulus;
      var correctHint = question.isGo
        ? "看到" + stimName + "要按按按！👆"
        : "看到" + stimName + "不要按！🚫";
      dom.demoFeedback.innerHTML = "❌ " + correctHint;
    }

    // 延遲後下一題（錯誤時顯示久一點）
    var delay = isCorrect ? 1200 : 2200;
    setTimeout(function () {
      _practiceIdx++;
      _startNextPracticeTrial();
    }, delay);
  }

  /**
   * 評估練習結果：全對通過，否則重試（最多 3 次）
   * @returns {void}
   */
  function _evaluatePractice() {
    TrialRenderer.clear(_demoStimulusElements());
    _resetDemoVisuals();
    dom.btnDemoSpace.disabled = true;

    var accuracy = _practiceCorrect / _practiceQuestions.length;
    var passed = accuracy >= PRACTICE_PASS_THRESHOLD;

    dom.practiceResult.classList.remove("hidden");
    if (passed) {
      dom.practiceResult.className = "practice-result-overlay pass";
      dom.practiceResult.innerHTML =
        "🎉 全部答對！準備好了！<br>馬上開始正式挑戰！";

      setTimeout(function () {
        if (_practiceOnComplete) _practiceOnComplete();
      }, 1500);
    } else {
      _practiceRetryCount++;
      dom.practiceResult.className = "practice-result-overlay retry";

      if (_practiceRetryCount >= 3) {
        // 最多重試 3 次，之後直接進入正式
        dom.practiceResult.innerHTML =
          "💪 練習了 " +
          _practiceRetryCount +
          " 次，你很棒！<br>準備開始正式挑戰吧！";
        setTimeout(function () {
          if (_practiceOnComplete) _practiceOnComplete();
        }, 2000);
      } else {
        dom.practiceResult.innerHTML =
          "答對 " +
          _practiceCorrect +
          "/" +
          _practiceQuestions.length +
          "！再練習一次，加油！💪";

        setTimeout(function () {
          runPracticeTrials(_practiceCombo, _practiceOnComplete);
        }, 2000);
      }
    }
  }

  /**
   * 跳過練習，直接進入正式試驗
   */
  function _skipPractice() {
    // 清除練習中的計時器
    clearTimeout(_practiceTimerId);
    _practiceTimerId = null;
    _practiceResponded = true;
    dom.btnDemoSpace.disabled = true;

    // 直接呼叫練習完成回調
    if (_practiceOnComplete) {
      _practiceOnComplete();
    }
  }

  // =========================================
  // 試驗迴圈核心（§3.1b, Flow-9）
  // =========================================

  /** 開始本 combo 的試驗 */
  function beginTrials() {
    var combo = _combos[_comboIndex];
    _trialIndex = 0;
    _trialResults = [];

    // 生成題目
    var count =
      combo.questionCount ||
      combo.questionsCount ||
      GAME_CONFIG.QUESTIONS.DEFAULT_COUNT;
    _questions = generateQuestions(combo.fieldId, combo.ruleId, count);

    // 防呆：題目生成失敗
    if (!_questions || _questions.length === 0) {
      Logger.error("❌ 題目生成失敗:", combo.fieldId, combo.ruleId);
      GameModal.alert("題目生成失敗", "將返回地圖", { icon: "❌" }).then(
        function () {
          ModeController.goToAdventureMap();
        },
      );
      return;
    }

    // ★ 階段過場 3：正式挑戰
    showStageTransition({
      icon: "🏆",
      title: "正式挑戰開始！",
      subtitle: "加油！盡力做到最好就好 💪",
      duration: 2500,
      onDone: function () {
        _beginTrialsAfterTransition(combo);
      },
    });
  }

  /** 正式試驗（過場結束後實際啟動） */
  function _beginTrialsAfterTransition(combo) {
    // UI 更新
    dom.trialTotal.textContent = _questions.length;
    dom.roundLabel.textContent =
      combo.displayName ||
      GAME_CONFIG.FIELDS[combo.fieldId].icon +
        " " +
        GAME_CONFIG.FIELDS[combo.fieldId].rules[combo.ruleId].name;
    dom.btnLabel.textContent = getActionLabel(combo.fieldId);
    dom.progressBar.style.width = "0%";
    dom.trialCurrent.textContent = "0";

    showScreen(dom.playScreen);
    _isPlaying = true;
    dom.btnSpace.disabled = true;

    // 3-2-1 倒數
    var _dp = DifficultyProvider.getTrialParams({
      fieldId: _combos[_comboIndex].fieldId,
      ruleId: _combos[_comboIndex].ruleId,
    });
    Countdown.start({
      container: dom.gameContainer,
      seconds: _dp.countdownSeconds,
      onComplete: function () {
        nextTrial();
      },
    });
  }

  /** 執行下一道試驗（ISI → 刺激物 → 等待回應 → 回饋） */
  function nextTrial() {
    if (_trialIndex >= _questions.length) {
      endCombo();
      return;
    }
    if (_isPaused) return;

    var question = _questions[_trialIndex];
    var combo = _combos[_comboIndex];

    // 更新進度
    dom.trialCurrent.textContent = _trialIndex + 1;
    var progressPct = Math.round(((_trialIndex + 1) / _questions.length) * 100);
    dom.progressBar.style.width = progressPct + "%";
    dom.progressBar.parentElement.setAttribute("aria-valuenow", progressPct);

    // 透過 DifficultyProvider 取得本題的時間參數
    var _tp = DifficultyProvider.getTrialParams({
      fieldId: combo.fieldId,
      ruleId: combo.ruleId,
      trialIndex: _trialIndex,
      totalTrials: _questions.length,
      history: _trialResults,
    });

    // ISI（首題短暫延遲 200ms，其餘依 provider 提供）
    var isiMs =
      _trialIndex === 0
        ? 200
        : _tp.isiMinMs + Math.random() * (_tp.isiMaxMs - _tp.isiMinMs);

    // 儲存本題時間參數供 recordTrial 使用
    _currentStimulusDuration = _tp.stimulusDurationMs;
    _currentISI = Math.round(isiMs);

    TrialRenderer.clear(_stimEls());
    dom.btnSpace.disabled = true;
    _responded = false;

    _isiTimerId = setTimeout(function () {
      if (_isPaused) return;

      // 呈現刺激物
      TrialRenderer.render(_stimEls(), question, combo.fieldId, combo.ruleId);

      // 🔊 播放刺激物語音
      if (
        typeof AudioPlayer !== "undefined" &&
        AudioPlayer.playVoice &&
        typeof getVoiceFileForQuestion === "function"
      ) {
        var voicePath = getVoiceFileForQuestion(
          combo.fieldId,
          question,
          combo.ruleId,
        );
        if (voicePath) {
          AudioPlayer.playVoice(voicePath, {
            text: question.stimulus || "",
            gender:
              combo.ruleId === "mixed" && question.appliedRule === "rule2"
                ? "male"
                : "female",
          });
        }
      }

      dom.btnSpace.disabled = false;
      _stimShownAt = Date.now();
      _responded = false;

      // 刺激物到期（未回應 → timeout）
      _stimTimerId = setTimeout(function () {
        if (!_responded && _isPlaying) {
          onTimeout(question);
        }
      }, _tp.stimulusDurationMs);
    }, isiMs);
  }

  /** 玩家按下回應 */
  function onPress() {
    if (!_isPlaying || _isPaused || _responded || dom.btnSpace.disabled) return;

    _responded = true;
    clearTimeout(_stimTimerId);
    dom.btnSpace.disabled = true;

    var rt = Date.now() - _stimShownAt;
    var q = _questions[_trialIndex];
    var isCorrect = q.isGo; // 按了 → Go 正確 / NoGo 錯誤
    var result = q.isGo ? "Hit" : "FA";

    recordTrial(q, "press", result, isCorrect, rt);
    showFeedback(result);
  }

  /** 刺激物到期未回應 */
  function onTimeout(question) {
    if (_responded) return;
    _responded = true;
    dom.btnSpace.disabled = true;

    var isCorrect = !question.isGo; // 沒按 → NoGo 正確 / Go 錯誤
    var result = question.isGo ? "Miss" : "CR";

    recordTrial(question, "nopress", result, isCorrect, null);
    showFeedback(result);
  }

  /** 紀錄試驗資料 */
  function recordTrial(question, action, result, isCorrect, rt) {
    var combo = _combos[_comboIndex];
    var record = {
      trialIndex: _trialIndex,
      stimulus: question.stimulus,
      context: question.context || null,
      isGo: question.isGo,
      correctAction: question.correctAction,
      playerAction: action,
      result: result,
      isCorrect: isCorrect,
      rt: rt,
      timestamp: Date.now(),
      fieldId: combo ? combo.fieldId : null,
      ruleId: combo ? combo.ruleId : null,
      // CSV 新增欄位
      sessionId: _sessionId,
      mode: _mode,
      stimulusDurationMs: _currentStimulusDuration,
      isiMs: _currentISI,
      // v4.7 自適應難度欄位
      adaptiveEngine:
        typeof DifficultyProvider !== "undefined"
          ? DifficultyProvider.getEngineName()
          : "",
      difficultyLevel: (function () {
        var en =
          typeof DifficultyProvider !== "undefined"
            ? DifficultyProvider.getEngineName()
            : "";
        if (en === "IRTSimpleEngine" && typeof IRTSimpleEngine !== "undefined")
          return IRTSimpleEngine.getCurrentLevel();
        if (typeof SimpleAdaptiveEngine !== "undefined")
          return SimpleAdaptiveEngine.getCurrentLevel();
        return "";
      })(),
      theta: (function () {
        var en =
          typeof DifficultyProvider !== "undefined"
            ? DifficultyProvider.getEngineName()
            : "";
        if (
          en === "IRTSimpleEngine" &&
          typeof IRTSimpleEngine !== "undefined"
        ) {
          var s = IRTSimpleEngine.getIRTState();
          return s && s.theta != null ? Math.round(s.theta * 1000) / 1000 : "";
        }
        return "";
      })(),
    };
    _trialResults.push(record);

    // 通知難度引擎（供未來 IRT/DA 更新能力估計）
    DifficultyProvider.onTrialComplete(record);

    // 更新難度指示器
    _updateDifficultyBadge();
  }

  /** 顯示回饋，結束後進入下一題 */
  function showFeedback(result) {
    var combo = _combos[_comboIndex];
    var _fp = DifficultyProvider.getTrialParams({
      fieldId: combo.fieldId,
      ruleId: combo.ruleId,
    });
    FeedbackOverlay.show({
      gameContainer: dom.stimContainer,
      stimulusEl: dom.stimulus,
      result: result,
      duration: _fp.feedbackDurationMs,
      onComplete: function () {
        _trialIndex++;
        nextTrial();
      },
    });
  }

  // =========================================
  // Combo 結束 → WM → 結算
  // =========================================

  /** 試驗全部結束 */
  function endCombo() {
    _isPlaying = false;
    dom.btnSpace.disabled = true;
    TrialRenderer.clear(_stimEls());

    var combo = _combos[_comboIndex];
    var hasWM = combo.enableWm || combo.hasWM || false;

    if (hasWM) {
      startWMTest(combo);
    } else {
      processResult(null);
    }
  }

  /** 啟動 WM 測驗（§3.4, Flow-12） */
  function startWMTest(combo) {
    dom.wmContainer.classList.remove("hidden");

    // 讀取歷史最快完成時間（personalBest）
    var personalBest = null;
    try {
      if (_mode === "adventure") {
        // 探險模式：從當前探險點讀取 bestTime
        var current = ProgressTracker.getCurrentPoint
          ? ProgressTracker.getCurrentPoint()
          : null;
        if (current && current.pointRecord) {
          personalBest = current.pointRecord.bestTime || null;
        }
      } else {
        // 自由選擇：根據 combo 資訊查詢對應探險點
        var progress =
          typeof getAdventureProgress === "function"
            ? getAdventureProgress()
            : null;
        if (progress && progress.maps) {
          var targetId =
            combo.fieldId +
            "_" +
            (combo.ruleId === "mixed"
              ? "mix"
              : combo.ruleId.replace("rule", "r")) +
            "_wm";
          for (var mi = 0; mi < progress.maps.length; mi++) {
            var pts = progress.maps[mi].points;
            for (var pi = 0; pi < pts.length; pi++) {
              if (pts[pi].id === targetId && pts[pi].bestTime !== null) {
                personalBest = pts[pi].bestTime;
                break;
              }
            }
            if (personalBest !== null) break;
          }
        }
      }
    } catch (e) {
      Logger.warn("⚠️ 讀取 WM personalBest 失敗:", e);
    }

    // 安全逾時保護：若 WM 模組於 60 秒內仍未完成初始化，自動跳過
    var _wmTimedOut = false;
    var _wmCompleted = false;
    var _wmSafetyTimer = setTimeout(function () {
      if (!_wmCompleted) {
        _wmTimedOut = true;
        Logger.error("⏱️ WM 測驗逾時（60s），自動跳過");
        try {
          if (typeof WorkingMemory !== "undefined" && WorkingMemory.destroy) {
            WorkingMemory.destroy();
          }
        } catch (destroyErr) {
          Logger.warn("⚠️ WM destroy 失敗:", destroyErr);
        }
        dom.wmContainer.classList.add("hidden");
        processResult(null);
      }
    }, 60000);

    function _wmDone() {
      _wmCompleted = true;
      clearTimeout(_wmSafetyTimer);
    }

    WorkingMemory.init({
      container: dom.wmContainer,
      templatePath: "../shared/working-memory.html",
    })
      .then(function () {
        if (_wmTimedOut) return; // 已逾時跳過
        return WorkingMemory.start({
          fieldId: combo.fieldId,
          questions: _questions,
          personalBest: personalBest,
          onResult: function (wmScore) {
            if (_wmTimedOut) return; // 已逾時跳過
            _wmDone();
            // WM 模組內部已等待使用者按「繼續」才呼叫此回呼
            WorkingMemory.hide();
            dom.wmContainer.classList.add("hidden");
            processResult(wmScore);
          },
        });
      })
      .catch(function (err) {
        if (_wmTimedOut) return; // 已逾時跳過
        _wmDone();
        Logger.error("❌ WM 測驗錯誤:", err);
        dom.wmContainer.classList.add("hidden");
        processResult(null);
      });
  }

  /** 處理結算（探險 vs 自由選擇） */
  function processResult(wmResult) {
    try {
      var combo = _combos[_comboIndex];

      // 轉換為 ProgressTracker 格式
      var ruleResults = _trialResults.map(function (t) {
        return { isCorrect: t.isCorrect, isGo: t.isGo, rt: t.rt };
      });

      var wmData = null;
      if (wmResult) {
        wmData = {
          correctCount: wmResult.correctCount,
          totalPositions: wmResult.total,
          direction: wmResult.direction,
          completionTimeMs: wmResult.completionMs,
        };

        // 將 WM 結果追加為合成試驗列，讓 CSV 能匯出 WM 欄位
        // 從 details 組合逐位置的正確答案與玩家答案（dash-separated）
        var _wmExpectedSeq = "WM";
        var _wmPlayerSeq = "";
        if (wmResult.details && wmResult.details.length > 0) {
          _wmExpectedSeq = wmResult.details
            .map(function (d) {
              return d.expected;
            })
            .join("-");
          _wmPlayerSeq = wmResult.details
            .map(function (d) {
              return d.actual;
            })
            .join("-");
        }
        _trialResults.push({
          trialIndex: _trialResults.length,
          stimulus: _wmExpectedSeq,
          context: null,
          isGo: null,
          correctAction: null,
          playerAction: _wmPlayerSeq,
          result: wmResult.passed ? "WM-Pass" : "WM-Fail",
          isCorrect: wmResult.passed || false,
          rt: wmResult.completionMs || null,
          timestamp: Date.now(),
          fieldId: combo ? combo.fieldId : null,
          ruleId: combo ? combo.ruleId : null,
          sessionId: _sessionId,
          mode: _mode,
          stimulusDurationMs: null,
          isiMs: null,
          // WM 專屬欄位
          wmSpan: wmResult.total || wmResult.n || 0,
          wmDirection: wmResult.direction || "",
          wmCompletionTime: wmResult.completionMs || 0,
          _isWmSummary: true, // 內部標記，不輸出到 CSV
        });
      }

      // 通知難度引擎本局結束（供未來 IRT/DA 更新能力估計）
      DifficultyProvider.onSessionComplete({
        fieldId: combo.fieldId,
        ruleId: combo.ruleId,
        trialResults: _trialResults,
        wmResult: wmData,
        passed: false, // 下方結算後會再次確認
      });

      if (_mode === "adventure") {
        var advResult = ProgressTracker.processAdventureResult({
          ruleResults: ruleResults,
          wmData: wmData,
          isRetrySuccess: (_session && _session.isRetry) || false,
          // 傳遞 session 中實際遊玩的探險點，避免重玩時誤用 getCurrentPoint
          sessionPoint: _session
            ? {
                mapIndex: _session.mapIndex,
                pointIndex: _session.pointIndex,
                pointId: _session.pointId,
              }
            : null,
        });

        // === 故事系統：儲存事件供返回地圖時播放對話 ===
        if (
          advResult &&
          advResult.pointDef &&
          typeof StoryDialogue !== "undefined"
        ) {
          StoryDialogue.saveStoryEvent(
            advResult.pointDef.id,
            advResult.pointPassed,
          );
        }

        if (advResult && advResult.pointPassed) {
          CompletionNotify.show({
            message: "✅ " + (combo.displayName || "") + " 通過！",
            type: "normal",
          });
        }

        ModeController.goToResult({
          mode: "adventure",
          comboResult: advResult,
          trialDetails: _trialResults,
        });
      } else {
        // === 自由選擇 ===
        var fsResult = ProgressTracker.processFreeSelectResult({
          fieldId: combo.fieldId,
          ruleId: combo.ruleId,
          hasWM: combo.enableWm || combo.hasWM || false,
          ruleResults: ruleResults,
          wmData: wmData,
          isRetrySuccess: false,
        });

        _allComboResults.push({
          combo: combo,
          result: fsResult,
          trialDetails: _trialResults,
        });

        // 推進 combo 索引
        var advance = ModeController.advanceToNextCombo({
          comboResult: fsResult,
          trialDetails: _trialResults,
        });

        if (advance.hasNext) {
          _comboIndex++;
          showComboTransition(advance.nextCombo);
        } else {
          CompletionNotify.show({
            message: "🎉 全部組合完成！",
            type: "allComplete",
          });
          ModeController.goToResult({
            mode: "free-select",
            allComboResults: _allComboResults,
          });
        }
      }
    } catch (err) {
      Logger.error("❌ processResult 運行錯誤:", err);
      GameModal.alert("結算錯誤", "結算過程發生錯誤，將返回地圖", {
        icon: "❌",
      }).then(function () {
        ModeController.goToAdventureMap();
      });
    }
  }
  // =========================================
  // Combo 過場（自由選擇模式 — §2.8）
  // =========================================

  function showComboTransition(nextCombo) {
    var ctr = dom.comboTransCtr;
    ctr.classList.remove("hidden");

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "../shared/combo-transition.html", true);
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        // P15: DOMParser 安全解析，避免直接 innerHTML 注入
        var parser = new DOMParser();
        var doc = parser.parseFromString(xhr.responseText, "text/html");
        var tpl = doc.querySelector(".combo-transition");
        ctr.innerHTML = "";
        if (tpl) {
          ctr.appendChild(document.importNode(tpl, true));
        } else {
          var body = doc.body;
          while (body && body.firstChild) {
            ctr.appendChild(document.importNode(body.firstChild, true));
          }
        }
        _fillTransition(ctr, nextCombo);
      } else {
        ctr.classList.add("hidden");
        startCombo();
      }
    };
    xhr.onerror = function () {
      ctr.classList.add("hidden");
      startCombo();
    };
    xhr.send();
  }

  /** 填充過場 DOM */
  function _fillTransition(ctr, nextCombo) {
    var prevCombo = _comboIndex > 0 ? _combos[_comboIndex - 1] : _combos[0];
    var field = GAME_CONFIG.FIELDS[nextCombo.fieldId];
    var rule = field.rules[nextCombo.ruleId];

    // 上一組合名稱
    var prev = ctr.querySelector(".prev-combo-name");
    if (prev) prev.textContent = prevCombo.displayName || "";

    // 下一組合資訊
    var nIcon = ctr.querySelector(".next-field-icon");
    var nName = ctr.querySelector(".next-field-name");
    var nRule = ctr.querySelector(".next-rule-name");
    if (nIcon) nIcon.textContent = field.icon;
    if (nName) nName.textContent = field.name;
    if (nRule) nRule.textContent = rule.name || nextCombo.ruleId;

    // Go / NoGo 規則展示（非混合）
    if (nextCombo.ruleId !== "mixed") {
      var goSI = ctr.querySelector(".go-stimulus-icon");
      var goSL = ctr.querySelector(".go-stimulus-label");
      var goA = ctr.querySelector(".go-action");
      var ngSI = ctr.querySelector(".nogo-stimulus-icon");
      var ngSL = ctr.querySelector(".nogo-stimulus-label");
      var ngA = ctr.querySelector(".nogo-action");

      if (goSI) goSI.innerHTML = getSVG(rule.go.stimulus);
      if (goSL) goSL.textContent = rule.go.stimulus;
      if (goA) goA.textContent = "按空白鍵！";
      if (ngSI) ngSI.innerHTML = getSVG(rule.noGo.stimulus);
      if (ngSL) ngSL.textContent = rule.noGo.stimulus;
      if (ngA) ngA.textContent = "不要按！";
    }

    // WM 提示
    var wmN = ctr.querySelector(".combo-wm-notice");
    if (wmN) wmN.style.display = nextCombo.enableWm ? "" : "none";

    // 規則反轉提示（同場地不同規則時）
    if (_comboIndex > 0) {
      var prevField = prevCombo.fieldId;
      var prevRule = prevCombo.ruleId;
      if (
        prevField === nextCombo.fieldId &&
        prevRule !== nextCombo.ruleId &&
        nextCombo.ruleId !== "mixed"
      ) {
        var reverseNotice = document.createElement("div");
        reverseNotice.style.cssText =
          "text-align:center;padding:10px 16px;margin:12px auto;max-width:320px;background:rgba(255,107,107,0.15);border:1px solid rgba(255,107,107,0.4);border-radius:12px;font-size:0.95rem;color:#ff6b6b;font-weight:600;animation:pulse 1.5s ease-in-out infinite;";
        reverseNotice.innerHTML =
          "⚠️ 注意！同樣的圖片，<br>但 Go / NoGo <u>規則相反了</u>！";
        var startBtn2 = ctr.querySelector(".combo-start-btn");
        if (startBtn2 && startBtn2.parentNode) {
          startBtn2.parentNode.insertBefore(reverseNotice, startBtn2);
        }
      }
    }

    // 開始按鈕
    var startBtn = ctr.querySelector(".combo-start-btn");
    if (startBtn) {
      startBtn.addEventListener(
        "click",
        function () {
          ctr.classList.add("hidden");
          ctr.innerHTML = "";
          startCombo();
        },
        { once: true },
      );
    }

    // 聽規則按鈕
    var listenBtn = ctr.querySelector(".combo-listen-btn");
    if (listenBtn) {
      listenBtn.addEventListener("click", function () {
        if (typeof AudioPlayer !== "undefined" && AudioPlayer.playSfx) {
          AudioPlayer.playSfx("audio/sfx/click.mp3", {
            synthPreset: "click",
          });
        }
      });
    }
  }

  // =========================================
  // 暫停 / 繼續
  // =========================================

  function pause() {
    if (!_isPlaying || _isPaused) return;
    _isPaused = true;
    clearTimeout(_stimTimerId);
    clearTimeout(_isiTimerId);
    dom.pauseOverlay.classList.add("active");
    FocusTrap.activate(dom.pauseOverlay);
  }

  function resume() {
    if (!_isPaused) return;
    _isPaused = false;
    dom.pauseOverlay.classList.remove("active");
    FocusTrap.deactivate();
    if (_isPlaying) nextTrial();
  }

  // =========================================
  // 難度指示器 UI
  // =========================================

  var _prevDiffLevel = 0;

  function _updateDifficultyBadge() {
    // 相容多引擎：優先用 IRT，其次 Simple
    var level;
    var engineName =
      typeof DifficultyProvider !== "undefined"
        ? DifficultyProvider.getEngineName()
        : "";
    if (
      engineName === "IRTSimpleEngine" &&
      typeof IRTSimpleEngine !== "undefined"
    ) {
      level = IRTSimpleEngine.getCurrentLevel();
    } else if (typeof SimpleAdaptiveEngine !== "undefined") {
      level = SimpleAdaptiveEngine.getCurrentLevel();
    } else {
      return;
    }
    var badge = document.getElementById("diffBadge");
    var dotsEl = document.getElementById("diffDots");
    if (!badge || !dotsEl) return;

    // 渲染 5 個圓點
    var html = "";
    for (var i = 1; i <= 5; i++) {
      html +=
        '<span class="diff-dot' + (i <= level ? " active" : "") + '"></span>';
    }
    dotsEl.innerHTML = html;
    badge.setAttribute("aria-label", "目前難度 " + level + " / 5");

    // 升降動畫
    if (_prevDiffLevel > 0 && level !== _prevDiffLevel) {
      badge.classList.remove("level-up", "level-down");
      void badge.offsetWidth; // reflow
      badge.classList.add(level > _prevDiffLevel ? "level-up" : "level-down");
    }
    _prevDiffLevel = level;
  }

  // =========================================
  // 初始化
  // =========================================

  function init() {
    cacheDom();

    // 自適應引擎選擇（優先順序：URL > localStorage > config > default）
    var _engineChoice = (function () {
      var url = new URLSearchParams(window.location.search).get("engine");
      if (url) return url;
      try {
        var ls = localStorage.getItem("ef_engine_choice");
        if (ls) return ls;
      } catch (e) {
        Logger.warn("[Game] engine choice localStorage read failed:", e);
      }
      var cfg = (typeof GAME_CONFIG !== "undefined" && GAME_CONFIG.DEV) || {};
      return cfg.ADAPTIVE_ENGINE || "simple";
    })();

    if (_engineChoice === "irt" && typeof IRTSimpleEngine !== "undefined") {
      DifficultyProvider.setEngine(IRTSimpleEngine);
    } else if (_engineChoice === "static") {
      DifficultyProvider.resetEngine(); // 回到內建 StaticEngine
    } else if (typeof SimpleAdaptiveEngine !== "undefined") {
      DifficultyProvider.setEngine(SimpleAdaptiveEngine);
    }
    DifficultyProvider.reset();
    Logger.info("🎮 [SP] 使用引擎: " + DifficultyProvider.getEngineName());
    _updateDifficultyBadge(); // 初始渲染難度指示器

    _mode = ModeController.getCurrentMode();
    _session = ModeController.getSession();

    // 產生本次遊戲的唯一 SessionId
    _sessionId =
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).substring(2, 8);

    if (!_session) {
      Logger.error("❌ 無有效 session，返回首頁");
      ModeController.goToHome();
      return;
    }

    // === 建立 combo 列表 ===
    if (_mode === "adventure") {
      var f = GAME_CONFIG.FIELDS[_session.field];
      if (!f || !f.rules || !f.rules[_session.rule]) {
        Logger.error("❌ 無效的場地/規則:", _session.field, _session.rule);
        GameModal.alert("遊戲設定錯誤", "將返回地圖", { icon: "❌" }).then(
          function () {
            ModeController.goToAdventureMap();
          },
        );
        return;
      }
      _combos = [
        {
          fieldId: _session.field,
          ruleId: _session.rule,
          questionCount: _session.questionsCount,
          hasWM: _session.hasWM,
          enableWm: _session.hasWM,
          displayName: f.icon + " " + f.rules[_session.rule].name,
        },
      ];
      dom.headerTitle.textContent = "🗺️ 探險模式";
    } else {
      _combos = _session.combos || [];
      dom.headerTitle.textContent = "🎯 自由選擇";
    }

    _comboIndex = 0;
    _allComboResults = [];

    // 初始化音訊
    if (typeof AudioPlayer !== "undefined" && AudioPlayer.init) {
      AudioPlayer.init();
    }

    bindEvents();
    startCombo();
  }

  /** 啟動指定 combo 的規則動畫 → WM 提示 → 練習 → 正式 */
  function startCombo() {
    if (_comboIndex >= _combos.length) {
      ModeController.goToResult({
        mode: _mode,
        allComboResults: _allComboResults,
      });
      return;
    }
    var combo = _combos[_comboIndex];

    // ★ 詢問是否需要示範＋練習
    GameModal.confirm("會玩嗎？", "要先觀看示範和做練習嗎？", {
      icon: "🤔",
      okText: "觀看示範與練習",
      cancelText: "跳過，直接開始",
    }).then(function (wantGuide) {
      if (!wantGuide) {
        // 跳過示範＋練習 → WM 判斷後進入正式
        _beforeBeginTrials(combo);
        return;
      }
      // ★ 階段過場 1：規則學習
      showStageTransition({
        icon: "👀",
        title: "先看看規則！",
        subtitle: "注意看動畫怎麼玩喔",
        duration: 2500,
        onDone: function () {
          // Plan C：播放規則動畫
          showGuideAnimation(combo, function () {
            _afterGuideReady(combo);
          });
        },
      });
    });
  }

  // =========================================
  // 事件綁定
  // =========================================

  function bindEvents() {
    // 混合規則「下一頁」按鈕 (Plan B)
    dom.btnRuleNext.addEventListener("click", function () {
      _showMixedPage(1);
    });

    // Plan C：WM 提示「我知道了」按鈕 → 進入正式試驗
    dom.btnWmTransitionReady.addEventListener("click", function () {
      if (
        typeof AudioPlayer !== "undefined" &&
        AudioPlayer.resumeAudioContext
      ) {
        AudioPlayer.resumeAudioContext();
      }
      beginTrials();
    });

    // Plan C：監聯 iframe guide-ready postMessage
    window.addEventListener("message", function (e) {
      if (!e.data || e.data.type !== "guide-ready") return;
      if (_guideReadyCallback) {
        var cb = _guideReadyCallback;
        _guideReadyCallback = null;
        // 清理 iframe & 將鍵盤焦點搶回主頁面
        try {
          dom.guideIframe.src = "about:blank";
        } catch (err) {
          /* ignore */
        }
        // ★ iframe 裡的按鈕搶走了焦點，必須還給主文件才能接收鍵盤事件
        try {
          dom.guideIframe.blur();
        } catch (err) {
          /* ignore */
        }
        document.body.focus();
        cb();
      }
    });

    // 規則說明 → 示範 → 練習 → 正式 (Plan A/B/D 整合流程)
    dom.btnRuleStart.addEventListener("click", function () {
      if (
        typeof AudioPlayer !== "undefined" &&
        AudioPlayer.resumeAudioContext
      ) {
        AudioPlayer.resumeAudioContext();
      }
      var combo = _combos[_comboIndex];
      _practiceRetryCount = 0;

      // Plan A：先跑互動式示範
      runDemo(combo, function () {
        // Plan D：示範結束後跑練習
        runPracticeTrials(combo, function () {
          // 練習通過後進入正式試驗
          beginTrials();
        });
      });
    });

    // 回應按鈕
    dom.btnSpace.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      onPress();
    });

    // 練習模式回應按鈕 (Plan D)
    dom.btnDemoSpace.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      _onPracticePress();
    });

    // 練習跳過按鈕
    dom.btnSkipPractice.addEventListener("click", function () {
      _skipPractice();
    });

    // 鍵盤
    document.addEventListener("keydown", function (e) {
      if (e.code === "Space") {
        e.preventDefault();
        // 0. 混合規則分頁 → 下一頁
        if (
          dom.ruleIntroScreen.classList.contains("active") &&
          !dom.btnRuleNext.classList.contains("hidden")
        ) {
          dom.btnRuleNext.click();
          return;
        }
        // 1. 規則說明頁 → 開始（含示範/練習流程）
        if (
          dom.ruleIntroScreen.classList.contains("active") &&
          !dom.btnRuleStart.classList.contains("hidden")
        ) {
          dom.btnRuleStart.click();
          return;
        }
        // 1.1 WM 提示過場 → 我知道了 (Plan C)
        if (
          dom.wmTransitionScreen &&
          dom.wmTransitionScreen.classList.contains("active")
        ) {
          dom.btnWmTransitionReady.click();
          return;
        }
        // 1.5 練習/示範畫面 → 練習按鍵回應
        if (
          dom.demoPracticeScreen &&
          dom.demoPracticeScreen.classList.contains("active")
        ) {
          _onPracticePress();
          return;
        }
        // 2. 暫停中 → 繼續
        if (_isPaused) {
          resume();
          return;
        }
        // 3. Combo 過場 → 點擊開始按鈕
        if (
          dom.comboTransCtr &&
          !dom.comboTransCtr.classList.contains("hidden")
        ) {
          var comboStartBtn =
            dom.comboTransCtr.querySelector(".combo-start-btn");
          if (comboStartBtn) {
            comboStartBtn.click();
            return;
          }
        }
        // 4. WM 測驗作答中 → 點擊確認按鈕
        if (dom.wmContainer && !dom.wmContainer.classList.contains("hidden")) {
          var wmConfirmBtn = dom.wmContainer.querySelector(".wm-confirm-btn");
          if (wmConfirmBtn && !wmConfirmBtn.disabled) {
            wmConfirmBtn.click();
            return;
          }
        }
        // 5. 遊戲進行中 → 按鍵回應
        if (_isPlaying && !_responded) onPress();
      }
      if (e.code === "Escape" && _isPlaying && !_isPaused) {
        pause();
      }
    });

    // 暫停 / 繼續 / 結束 / 返回
    dom.btnPause.addEventListener("click", function () {
      if (_isPlaying) pause();
    });
    dom.btnResume.addEventListener("click", resume);

    // --- 離開確認對話框 ---
    var _exitAction = null; // 記錄確認後的動作

    function showExitConfirm(action) {
      _exitAction = action;
      if (_isPlaying && !_isPaused) pause();
      dom.exitOverlay.classList.add("active");
      FocusTrap.activate(dom.exitOverlay);
    }

    function hideExitConfirm() {
      dom.exitOverlay.classList.remove("active");
      FocusTrap.deactivate();
      _exitAction = null;
    }

    dom.btnExitCancel.addEventListener("click", function () {
      hideExitConfirm();
      // 重新推入 history 項，讓下次返回鍵仍可攔截
      history.pushState({ efgame: true }, "");
    });

    dom.btnExitConfirm.addEventListener("click", function () {
      _isPlaying = false;
      hideExitConfirm();
      if (_exitAction === "quit") {
        // 從暫停選單結束
        if (_mode === "adventure") ModeController.goToAdventureMap();
        else ModeController.goToFreeSelect();
      } else {
        // 從返回鍵 / 瀏覽器返回
        if (_mode === "adventure") ModeController.goToAdventureMap();
        else ModeController.goToFreeSelect();
      }
    });

    // 結束遊戲按鈕（暫停選單內）
    dom.btnQuit.addEventListener("click", function () {
      showExitConfirm("quit");
    });

    dom.btnBack.addEventListener("click", function () {
      if (_isPlaying) {
        showExitConfirm("back");
      } else {
        if (_mode === "adventure") ModeController.goToAdventureMap();
        else ModeController.goToFreeSelect();
      }
    });

    // --- 瀏覽器返回鍵攔截 ---
    history.pushState({ efgame: true }, "");
    window.addEventListener("popstate", function () {
      if (_isPlaying) {
        showExitConfirm("popstate");
      } else {
        // 遊戲尚未開始或已結束，正常返回
        history.back();
      }
    });

    // 防止意外離開
    window.addEventListener("beforeunload", function (e) {
      if (_isPlaying) {
        e.preventDefault();
        e.returnValue = "";
      }
    });
  }

  // =========================================
  // DOMContentLoaded → 啟動
  // =========================================
  document.addEventListener("DOMContentLoaded", function () {
    // 訪客模式：離開頁面時清除本機資料（但保留 session 與結算資料供結算頁使用）
    if (typeof isGuestPlayer === "function" && isGuestPlayer()) {
      window.addEventListener("pagehide", function () {
        // 只在真正關閉分頁（而非導航到結算頁）時清除
        // 使用 _navigatingToResult 旗標（由 goToResult 設定）
        if (!window._efgameNavigating) {
          if (typeof clearGuestData === "function") clearGuestData();
        }
      });
    }
    init();
  });

  // 公開（除錯用）
  return { onPress: onPress, pause: pause, resume: resume };
})();
