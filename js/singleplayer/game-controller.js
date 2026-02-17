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
    dom.ruleIntroBoxes = document.getElementById("ruleIntroBoxes");
    dom.ruleIntroContext = document.getElementById("ruleIntroContext");
    dom.ruleIntroWM = document.getElementById("ruleIntroWM");
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
  }

  // =========================================
  // 遊戲狀態
  // =========================================
  var _mode = "adventure"; // 'adventure' | 'free-select'
  var _session = null; // sessionStorage 中的 session
  var _combos = []; // 所有 combo 定義
  var _comboIndex = 0; // 目前 combo 索引
  var _questions = []; // 目前 combo 的題目序列
  var _trialIndex = 0; // 目前試驗索引
  var _trialResults = []; // 本 combo 的逐題紀錄
  var _allComboResults = []; // 所有 combo 結果（自由選擇用）
  var _isPlaying = false; // 遊戲迴圈是否運行中
  var _isPaused = false; // 是否暫停
  var _responded = false; // 本題是否已回應
  var _stimTimerId = null; // 刺激物到期 timer
  var _isiTimerId = null; // ISI delay timer
  var _stimShownAt = 0; // 刺激物顯示時間戳

  // =========================================
  // 刺激物渲染
  // =========================================

  /** stimulus key → SVG HTML */
  function getSVG(key) {
    return (typeof SVG_ASSETS !== "undefined" && SVG_ASSETS[key]) || "";
  }

  /** 遊戲場 → 回應按鈕文字 */
  function getActionLabel(fieldId) {
    return fieldId === "mouse"
      ? "🧀 蒐集起司！"
      : fieldId === "fishing"
        ? "🐟 釣魚！"
        : "按！";
  }

  /**
   * 渲染單題視覺：背景 + 情境指示 + 刺激物
   */
  function renderStimulus(question, fieldId, ruleId) {
    // 重置
    dom.stimContainer.className = "stimulus-container";
    dom.ctxIndicator.style.display = "none";
    dom.ctxIndicator.innerHTML = "";

    // === 背景 ===
    if (fieldId === "mouse") {
      dom.bgLayer.innerHTML = getSVG("mouseHole");
    } else if (fieldId === "fishing") {
      var isNight = ruleId === "mixed" && question.context === "night";
      dom.bgLayer.innerHTML = isNight
        ? getSVG("oceanNight")
        : getSVG("oceanBg");
    }

    // === 混合規則情境指示 ===
    if (ruleId === "mixed" && question.context) {
      switch (question.context) {
        case "hasPerson":
          dom.ctxIndicator.innerHTML = getSVG("person");
          dom.ctxIndicator.style.display = "block";
          dom.stimContainer.classList.add("context-has-person");
          break;
        case "noPerson":
          dom.stimContainer.classList.add("context-no-person");
          break;
        case "day":
          dom.ctxIndicator.innerHTML = getSVG("sun");
          dom.ctxIndicator.style.display = "block";
          dom.stimContainer.classList.add("context-day");
          break;
        case "night":
          dom.ctxIndicator.innerHTML = getSVG("moon");
          dom.ctxIndicator.style.display = "block";
          dom.stimContainer.classList.add("context-night");
          break;
      }
    }

    // === 刺激物 ===
    dom.stimulus.innerHTML = getSVG(question.stimulus);
  }

  /** 清空刺激物舞台 */
  function clearStimulus() {
    dom.stimulus.innerHTML = "";
    dom.ctxIndicator.style.display = "none";
    dom.stimContainer.className = "stimulus-container";
  }

  // =========================================
  // 畫面管理
  // =========================================

  /** 切換顯示畫面（.screen.active） */
  function showScreen(el) {
    var all = dom.gameContainer.querySelectorAll(".screen");
    for (var i = 0; i < all.length; i++) all[i].classList.remove("active");
    if (el) el.classList.add("active");
  }

  // =========================================
  // 規則說明畫面（Flow-5 / Flow-7）
  // =========================================

  function showRuleIntro(combo) {
    var fieldId = combo.fieldId;
    var ruleId = combo.ruleId;
    var field = GAME_CONFIG.FIELDS[fieldId];
    var rule = field.rules[ruleId];

    // 標題
    dom.ruleIntroTitle.textContent = field.icon + " " + (rule.name || ruleId);

    // 規則框
    dom.ruleIntroBoxes.innerHTML = "";

    if (ruleId === "mixed") {
      var ruleA = field.rules[rule.contextA.appliesRule];
      var ruleB = field.rules[rule.contextB.appliesRule];

      dom.ruleIntroBoxes.innerHTML =
        '<p style="font-weight:700;color:var(--text-white);margin-bottom:8px;">' +
        rule.contextA.label +
        "（多數情境）：</p>" +
        _boxHTML(ruleA.go.stimulus, "按空白鍵！", true) +
        _boxHTML(ruleA.noGo.stimulus, "不要按！", false) +
        '<p style="font-weight:700;color:#f39c12;margin:12px 0 8px;">⚠️ ' +
        rule.contextB.label +
        "（少數情境）：</p>" +
        _boxHTML(ruleB.go.stimulus, "按空白鍵！", true) +
        _boxHTML(ruleB.noGo.stimulus, "不要按！", false);

      dom.ruleIntroContext.classList.remove("hidden");
      dom.ruleIntroContext.textContent =
        fieldId === "mouse"
          ? "👤 有人出現時規則會改變！注意畫面右上角"
          : "🌛 晚上時規則會改變！注意背景顏色";
    } else {
      dom.ruleIntroBoxes.innerHTML =
        _boxHTML(rule.go.stimulus, "按空白鍵！", true) +
        _boxHTML(rule.noGo.stimulus, "不要按！", false);
      dom.ruleIntroContext.classList.add("hidden");
    }

    // WM 提示
    var hasWM = combo.enableWm || combo.hasWM;
    dom.ruleIntroWM.classList.toggle("hidden", !hasWM);

    showScreen(dom.ruleIntroScreen);
  }

  /** 產生單個規則框 HTML */
  function _boxHTML(stimKey, actionText, isGo) {
    var cls = isGo ? "rule-box rule-box--go" : "rule-box rule-box--nogo";
    var txtCls = isGo
      ? "rule-action-text rule-action-text--go"
      : "rule-action-text rule-action-text--nogo";
    return (
      '<div class="' +
      cls +
      '">' +
      '<span class="rule-stim-icon">' +
      getSVG(stimKey) +
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
      console.error("❌ 題目生成失敗:", combo.fieldId, combo.ruleId);
      alert("題目生成失敗，將返回地圖");
      ModeController.goToAdventureMap();
      return;
    }

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

    clearStimulus();
    dom.btnSpace.disabled = true;
    _responded = false;

    _isiTimerId = setTimeout(function () {
      if (_isPaused) return;

      // 呈現刺激物
      renderStimulus(question, combo.fieldId, combo.ruleId);
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
    clearStimulus();

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
      console.warn("⚠️ 讀取 WM personalBest 失敗:", e);
    }

    WorkingMemory.init({
      container: dom.wmContainer,
      templatePath: "../shared/working-memory.html",
    })
      .then(function () {
        return WorkingMemory.start({
          fieldId: combo.fieldId,
          questions: _questions,
          personalBest: personalBest,
          onResult: function (wmScore) {
            // WM 模組內部已等待使用者按「繼續」才呼叫此回呼
            WorkingMemory.hide();
            dom.wmContainer.classList.add("hidden");
            processResult(wmScore);
          },
        });
      })
      .catch(function (err) {
        console.error("❌ WM 測驗錯誤:", err);
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
        });

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
      console.error("❌ processResult 運行錯誤:", err);
      alert("結算過程發生錯誤，將返回地圖");
      ModeController.goToAdventureMap();
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
        ctr.innerHTML = xhr.responseText;
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
    if (typeof SimpleAdaptiveEngine === "undefined") return;
    var level = SimpleAdaptiveEngine.getCurrentLevel();
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

    // 啟用簡化版自適應引擎（連對2題升難度、連錯2題降難度）
    if (typeof SimpleAdaptiveEngine !== "undefined") {
      DifficultyProvider.setEngine(SimpleAdaptiveEngine);
    }
    DifficultyProvider.reset();
    _updateDifficultyBadge(); // 初始渲染難度指示器

    _mode = ModeController.getCurrentMode();
    _session = ModeController.getSession();

    if (!_session) {
      console.error("❌ 無有效 session，返回首頁");
      ModeController.goToHome();
      return;
    }

    // === 建立 combo 列表 ===
    if (_mode === "adventure") {
      var f = GAME_CONFIG.FIELDS[_session.field];
      if (!f || !f.rules || !f.rules[_session.rule]) {
        console.error("❌ 無效的場地/規則:", _session.field, _session.rule);
        alert("遊戲設定錯誤，將返回地圖");
        ModeController.goToAdventureMap();
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

  /** 啟動指定 combo 的規則說明 */
  function startCombo() {
    if (_comboIndex >= _combos.length) {
      ModeController.goToResult({
        mode: _mode,
        allComboResults: _allComboResults,
      });
      return;
    }
    showRuleIntro(_combos[_comboIndex]);
  }

  // =========================================
  // 事件綁定
  // =========================================

  function bindEvents() {
    // 規則說明 → 開始
    dom.btnRuleStart.addEventListener("click", function () {
      if (
        typeof AudioPlayer !== "undefined" &&
        AudioPlayer.resumeAudioContext
      ) {
        AudioPlayer.resumeAudioContext();
      }
      beginTrials();
    });

    // 回應按鈕
    dom.btnSpace.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      onPress();
    });

    // 鍵盤
    document.addEventListener("keydown", function (e) {
      if (e.code === "Space") {
        e.preventDefault();
        // 1. 規則說明頁 → 開始
        if (dom.ruleIntroScreen.classList.contains("active")) {
          dom.btnRuleStart.click();
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
    // 訪客模式：離開頁面時清除所有本機資料
    if (typeof isGuestPlayer === "function" && isGuestPlayer()) {
      window.addEventListener("beforeunload", function () {
        clearGuestData();
      });
    }
    init();
  });

  // 公開（除錯用）
  return { onPress: onPress, pause: pause, resume: resume };
})();
