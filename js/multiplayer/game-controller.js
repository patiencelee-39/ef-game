/**
 * GameController - Multiplayer game flow controller
 * Based on singleplayer GameController IIFE + Firebase sync
 */
var GameController = (function () {
  "use strict";

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
    dom.wmContainer = document.getElementById("wm-container");
    dom.comboTransition = document.getElementById("combo-transition-container");
    dom.pauseOverlay = document.getElementById("pause-overlay");
    dom.btnResume = document.getElementById("btnResume");
    dom.btnQuit = document.getElementById("btnQuit");
    dom.exitOverlay = document.getElementById("exit-confirm-overlay");
    dom.btnExitCancel = document.getElementById("btnExitCancel");
    dom.btnExitConfirm = document.getElementById("btnExitConfirm");
    dom.spectatorScreen = document.getElementById("spectator-screen");
  }

  var _combos = [];
  var _comboIndex = 0;
  var _questions = [];
  var _trialIndex = 0;
  var _trialResults = [];
  var _responded = false;
  var _stimOnTime = 0;
  var _isPlaying = false;
  var _roomCountdownSeconds = null;
  var _displaySettings = {};
  var _isPaused = false;
  var _isiTimerId = null;
  var _stimTimerId = null;
  var _totalCorrect = 0;
  var _totalTrials = 0;
  var _allTrialResults = []; // 跨 combo 累積（修復原 finishGame 僅取最後 combo 的 bug）
  var _comboScores = []; // 每個 combo 的 calculateRuleScore 結果
  var _isRelayMode = false;
  var _isTeamMode = false;

  function showScreen(el) {
    var screens = dom.gameContainer.querySelectorAll(".screen");
    for (var i = 0; i < screens.length; i++) {
      screens[i].classList.remove("active");
    }
    if (el) el.classList.add("active");
  }

  function getActionLabel(fieldId) {
    return fieldId === "mouse"
      ? "🧀 蒐集起司！"
      : fieldId === "fishing"
        ? "🐟 釣魚！"
        : "按！";
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

  function beginCombo() {
    var combo = _combos[_comboIndex];
    _trialIndex = 0;
    _trialResults = [];
    _responded = false;

    // 優先使用 Firebase 預生成題目（確保所有玩家同題 → 公平性）
    if (combo.questions && combo.questions.length > 0) {
      _questions = combo.questions;
    } else {
      var count =
        combo.questionCount ||
        combo.questionsCount ||
        (typeof GAME_CONFIG !== "undefined"
          ? GAME_CONFIG.QUESTIONS.DEFAULT_COUNT
          : 10);
      _questions = generateQuestions(combo.fieldId, combo.ruleId, count);
    }

    // 防呆：題目生成失敗
    if (!_questions || _questions.length === 0) {
      Logger.error("❌ 題目生成失敗:", combo.fieldId, combo.ruleId);
      GameModal.alert("題目生成失敗", "將返回大廳", { icon: "❌" }).then(
        function () {
          location.href = "../index.html";
        },
      );
      return;
    }

    dom.trialTotal.textContent = _questions.length;
    showRuleIntro(combo);
  }

  /** stimulus key → SVG HTML（委派 TrialRenderer） */
  function getSVG(key) {
    return TrialRenderer.svg(key);
  }

  /** 產生單個規則框 HTML（與 SP _boxHTML 一致） */
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

  function showRuleIntro(combo) {
    var field = GAME_CONFIG.FIELDS[combo.fieldId];
    var rule = field.rules[combo.ruleId];

    dom.ruleIntroTitle.textContent = field.icon + " " + rule.name;

    // 規則框
    dom.ruleIntroBoxes.innerHTML = "";

    if (combo.ruleId === "mixed") {
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
        combo.fieldId === "mouse"
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

    dom.btnRuleStart.onclick = function () {
      if (
        typeof AudioPlayer !== "undefined" &&
        AudioPlayer.resumeAudioContext
      ) {
        AudioPlayer.resumeAudioContext();
      }
      beginTrials();
    };
  }

  function beginTrials() {
    var combo = _combos[_comboIndex];
    dom.roundLabel.textContent =
      GAME_CONFIG.FIELDS[combo.fieldId].icon +
      " " +
      GAME_CONFIG.FIELDS[combo.fieldId].rules[combo.ruleId].name;
    dom.btnLabel.textContent = getActionLabel(combo.fieldId);
    dom.progressBar.style.width = "0%";
    dom.trialCurrent.textContent = "0";

    showScreen(dom.playScreen);
    _isPlaying = true;
    dom.btnSpace.disabled = true;

    var _dp = DifficultyProvider.getTrialParams({
      fieldId: combo.fieldId,
      ruleId: combo.ruleId,
    });
    Countdown.start({
      container: dom.gameContainer,
      seconds: _roomCountdownSeconds || _dp.countdownSeconds,
      onComplete: function () {
        nextTrial();
      },
    });
  }

  function nextTrial() {
    if (_trialIndex >= _questions.length) {
      endCombo();
      return;
    }
    if (_isPaused) return;

    var question = _questions[_trialIndex];
    var combo = _combos[_comboIndex];

    dom.trialCurrent.textContent = _trialIndex + 1;
    var progressPct = Math.round(((_trialIndex + 1) / _questions.length) * 100);
    dom.progressBar.style.width = progressPct + "%";
    dom.progressBar.parentElement.setAttribute("aria-valuenow", progressPct);

    var _tp = DifficultyProvider.getTrialParams({
      fieldId: combo.fieldId,
      ruleId: combo.ruleId,
      trialIndex: _trialIndex,
      totalTrials: _questions.length,
      history: _trialResults,
    });

    var isiMs =
      _trialIndex === 0
        ? 200
        : _tp.isiMinMs + Math.random() * (_tp.isiMaxMs - _tp.isiMinMs);

    TrialRenderer.clear(_stimEls());
    dom.btnSpace.disabled = true;
    _responded = false;

    _isiTimerId = setTimeout(function () {
      if (_isPaused) return;
      presentStimulus(question, combo, _tp.stimulusDurationMs);
    }, isiMs);
  }

  function presentStimulus(question, combo, duration) {
    // 委派 TrialRenderer 渲染背景 + 情境指示 + 刺激物
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
    _stimOnTime = Date.now();

    _stimTimerId = setTimeout(function () {
      if (!_responded) {
        _responded = true;
        var isCorrect = !question.isGo;
        var result = question.isGo ? "Miss" : "CR";
        recordTrial(question, "nopress", result, isCorrect, null);
        showFeedback(result);
      }
    }, duration);
  }

  function onPress() {
    if (!_isPlaying || _isPaused || _responded || dom.btnSpace.disabled) return;
    _responded = true;
    clearTimeout(_stimTimerId);

    var question = _questions[_trialIndex];
    var rt = Date.now() - _stimOnTime;
    var isCorrect = question.isGo;
    var result = question.isGo ? "Hit" : "FA";
    recordTrial(question, "press", result, isCorrect, rt);
    showFeedback(result);
  }

  function recordTrial(question, action, result, isCorrect, rt) {
    if (isCorrect) _totalCorrect++;
    _totalTrials++;

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
      stageId: combo ? combo.stageId || null : null,
      fieldId: combo ? combo.fieldId : null,
      ruleId: combo ? combo.ruleId : null,
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
    _allTrialResults.push(record);

    DifficultyProvider.onTrialComplete(record);

    // 更新難度指示器
    _updateDifficultyBadge();

    MultiplayerBridge.recordAnswer(record);
    MultiplayerBridge.broadcastState({
      progress: Math.round(((_trialIndex + 1) / _questions.length) * 100),
      score: _totalCorrect,
      comboName: _combos[_comboIndex] ? _combos[_comboIndex].displayName : "",
    });
  }

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

  function endCombo() {
    _isPlaying = false;
    dom.btnSpace.disabled = true;
    TrialRenderer.clear(_stimEls());

    var completedCombo = _combos[_comboIndex];
    var hasWM = completedCombo.enableWm || completedCombo.hasWM || false;

    if (hasWM) {
      startWMTest(completedCombo);
    } else {
      _processComboEnd(null);
    }
  }

  /** 啟動 WM 測驗 */
  function startWMTest(combo) {
    dom.wmContainer.classList.remove("hidden");

    if (typeof WorkingMemory === "undefined") {
      Logger.warn("⚠️ WorkingMemory 模組未載入，跳過 WM 測驗");
      dom.wmContainer.classList.add("hidden");
      _processComboEnd(null);
      return;
    }

    WorkingMemory.init({
      container: dom.wmContainer,
      templatePath: "../shared/working-memory.html",
    })
      .then(function () {
        return WorkingMemory.start({
          fieldId: combo.fieldId,
          questions: _questions,
          personalBest: null, // MP 不使用 ProgressTracker，無 personalBest
          onResult: function (wmScore) {
            WorkingMemory.hide();
            dom.wmContainer.classList.add("hidden");
            _processComboEnd(wmScore);
          },
        });
      })
      .catch(function (err) {
        Logger.error("❌ WM 測驗錯誤:", err);
        dom.wmContainer.classList.add("hidden");
        _processComboEnd(null);
      });
  }

  /** combo 結算（WM 完成或跳過後呼叫） */
  function _processComboEnd(wmResult) {
    var completedCombo = _combos[_comboIndex];

    var wmData = null;
    if (wmResult) {
      wmData = {
        correctCount: wmResult.correctCount,
        totalPositions: wmResult.total,
        direction: wmResult.direction,
        completionTimeMs: wmResult.completionMs,
      };
    }

    DifficultyProvider.onSessionComplete({
      fieldId: completedCombo.fieldId,
      ruleId: completedCombo.ruleId,
      trialResults: _trialResults,
      wmResult: wmData,
      passed: false,
    });

    // 使用 score-calculator 計算此 combo 的得分
    if (typeof calculateRuleScore === "function") {
      var comboScore = calculateRuleScore({
        results: _trialResults,
        fieldId: completedCombo.fieldId,
        ruleId: completedCombo.ruleId,
        mode: "multiplayer",
      });
      _comboScores.push(comboScore);
    }

    // 廣播場地完成通知（其他玩家會看到）
    if (_displaySettings.showCompletionNotification !== false) {
      MultiplayerBridge.broadcastStageComplete(completedCombo.displayName);
    }

    _comboIndex++;
    if (_comboIndex < _combos.length) {
      showComboTransition(_combos[_comboIndex]);
    } else {
      finishGame();
    }
  }

  // =========================================
  // Combo 過場
  // =========================================

  function showComboTransition(nextCombo) {
    var ctr = dom.comboTransition;
    ctr.classList.remove("hidden");

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "../shared/combo-transition.html", true);
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        // P15: 使用 DOMParser 安全解析，避免直接 innerHTML 注入
        var parser = new DOMParser();
        var doc = parser.parseFromString(xhr.responseText, "text/html");
        var template = doc.querySelector(".combo-transition");
        ctr.innerHTML = "";
        if (template) {
          ctr.appendChild(document.importNode(template, true));
        } else {
          // fallback：若結構不含 .combo-transition 則取整個 body 內容
          var body = doc.body;
          while (body && body.firstChild) {
            ctr.appendChild(document.importNode(body.firstChild, true));
          }
        }
        _fillTransition(ctr, nextCombo);
      } else {
        ctr.classList.add("hidden");
        beginCombo();
      }
    };
    xhr.onerror = function () {
      ctr.classList.add("hidden");
      beginCombo();
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
    if (wmN)
      wmN.style.display = nextCombo.enableWm || nextCombo.hasWM ? "" : "none";

    // 開始按鈕
    var startBtn = ctr.querySelector(".combo-start-btn");
    if (startBtn) {
      startBtn.addEventListener(
        "click",
        function () {
          ctr.classList.add("hidden");
          ctr.innerHTML = "";
          beginCombo();
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
  // 接力模式 — 狀態列 & 棒次閘控
  // =========================================

  function _showRelayStatusBar(roomData) {
    var bar = document.getElementById("relayStatusBar");
    if (!bar) return;
    bar.style.display = "";
    _updateRelayStatusBar(roomData);
  }

  function _updateRelayStatusBar() {
    var badge = document.getElementById("relayTeamBadge");
    var curEl = document.getElementById("relayBatonCurrent");
    var totEl = document.getElementById("relayBatonTotal");
    var dotsEl = document.getElementById("relayProgressDots");
    if (!badge || !window.RelayManager) return;

    var myTeam = RelayManager.getMyTeamId();
    var progress = RelayManager.getBatonProgress();
    if (myTeam && progress) {
      badge.textContent = myTeam;
      curEl.textContent = progress.current + 1;
      totEl.textContent = progress.total;

      // 進度圓點
      var html = "";
      for (var i = 0; i < progress.total; i++) {
        var cls =
          i < progress.current
            ? "relay-dot done"
            : i === progress.current
              ? "relay-dot active"
              : "relay-dot";
        html += '<span class="' + cls + '"></span>';
      }
      if (dotsEl) dotsEl.innerHTML = html;
    }
  }

  function _checkRelayTurn() {
    if (!_isRelayMode || !window.RelayManager) return;
    var overlay = document.getElementById("relayWaitOverlay");
    if (!overlay) return;

    if (RelayManager.isMyTurn()) {
      overlay.style.display = "none";
    } else {
      overlay.style.display = "";
      // 顯示當前跑者名稱
      var runnerEl = document.getElementById("relayCurrentRunnerName");
      var myBatonEl = document.getElementById("relayMyBatonNum");
      var currentUid = RelayManager.getCurrentBatonUid();
      if (runnerEl) {
        runnerEl.textContent = currentUid ? currentUid.slice(0, 6) : "--";
      }
      if (myBatonEl) {
        var progress = RelayManager.getBatonProgress();
        var myTeam = RelayManager.getMyTeamId();
        if (progress && myTeam) {
          // 找到我在棒次中的位置
          var teams = RelayManager._state
            ? RelayManager._state.teams || {}
            : {};
          var team = teams[myTeam] || {};
          var order = team.order || [];
          var myUid = firebase.auth().currentUser
            ? firebase.auth().currentUser.uid
            : null;
          var myIdx = order.indexOf(myUid);
          myBatonEl.textContent = myIdx >= 0 ? myIdx + 1 : "-";
        }
      }
    }
  }

  function finishGame() {
    var accuracy = _totalTrials > 0 ? (_totalCorrect / _totalTrials) * 100 : 0;

    // 計算平均反應時間（使用跨 combo 累積結果）
    var validRTs = _allTrialResults.filter(function (r) {
      return r.rt > 0;
    });
    var avgRT =
      validRTs.length > 0
        ? validRTs.reduce(function (s, r) {
            return s + r.rt;
          }, 0) / validRTs.length
        : 0;

    // 從 score-calculator 結果計算總分（含獎勵）
    var calculatedTotal = 0;
    if (_comboScores.length > 0) {
      for (var si = 0; si < _comboScores.length; si++) {
        calculatedTotal += _comboScores[si].finalScore || 0;
      }
    } else {
      calculatedTotal = _totalCorrect; // fallback
    }

    // 存入 showFinalRanking 設定供 result.html 讀取
    try {
      localStorage.setItem(
        "mp_showFinalRanking",
        _displaySettings.showFinalRanking !== false ? "1" : "0",
      );
    } catch (e) {
      Logger.warn("[MP-Game] localStorage write failed:", e);
    }

    MultiplayerBridge.recordFinalScore({
      totalScore: calculatedTotal,
      totalCorrect: _totalCorrect,
      totalTrials: _totalTrials,
      accuracy: accuracy,
      avgRT: avgRT,
      totalTime: 0,
      answers: _allTrialResults,
      comboScores: _comboScores,
    });

    // 隊伍對抗模式：將個人分數累加到隊伍總分
    if (_isTeamMode && window.RelayManager) {
      var myTeamId = RelayManager.getMyTeamId();
      if (myTeamId) {
        RelayManager.advanceBaton(myTeamId, {
          score: calculatedTotal,
          correct: _totalCorrect,
          trials: _totalTrials,
          accuracy: accuracy,
          avgRT: avgRT,
        })
          .catch(function (err) {
            Logger.warn("[MP-Game] team score update failed:", err);
          })
          .finally(function () {
            MultiplayerBridge.goToResult();
          });
        return;
      }
    }

    // 接力模式：推進棒次（下一位隊友開始遊戲）
    if (_isRelayMode && window.RelayManager) {
      RelayManager.advanceBaton().then(function () {
        MultiplayerBridge.goToResult();
      });
      return;
    }

    MultiplayerBridge.goToResult();
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

  function pause() {
    if (!_isPlaying || _isPaused) return;
    _isPaused = true;
    clearTimeout(_isiTimerId);
    clearTimeout(_stimTimerId);
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

  function init() {
    cacheDom();

    if (!MultiplayerBridge.parseRoomInfo()) return;
    MultiplayerBridge.initRoom();

    // 自適應引擎選擇（優先順序：URL > localStorage > config > default）
    var _engineChoice = (function () {
      var url = new URLSearchParams(window.location.search).get("engine");
      if (url) return url;
      try {
        var ls = localStorage.getItem("ef_engine_choice");
        if (ls) return ls;
      } catch (e) {
        Logger.warn("[MP-Game] engine choice localStorage read failed:", e);
      }
      var cfg = (typeof GAME_CONFIG !== "undefined" && GAME_CONFIG.DEV) || {};
      return cfg.ADAPTIVE_ENGINE || "simple";
    })();

    if (_engineChoice === "irt" && typeof IRTSimpleEngine !== "undefined") {
      DifficultyProvider.setEngine(IRTSimpleEngine);
    } else if (_engineChoice === "static") {
      DifficultyProvider.resetEngine();
    } else if (typeof SimpleAdaptiveEngine !== "undefined") {
      DifficultyProvider.setEngine(SimpleAdaptiveEngine);
    }
    DifficultyProvider.reset();
    Logger.info("🎮 [MP] 使用引擎: " + DifficultyProvider.getEngineName());
    _updateDifficultyBadge(); // 初始渲染難度指示器

    var role = MultiplayerBridge.getRole();

    if (role === "spectator") {
      dom.headerTitle.textContent = "Spectator Mode";
      showScreen(dom.spectatorScreen);
      return;
    }

    dom.headerTitle.textContent = "Multiplayer";

    var roomRef = firebase
      .database()
      .ref("rooms/" + MultiplayerBridge.getRoomCode());
    roomRef.once("value").then(function (snapshot) {
      var roomData = snapshot.val();
      if (!roomData) {
        GameModal.alert("找不到房間", "房間資料不存在", { icon: "❌" }).then(
          function () {
            location.href = "../index.html";
          },
        );
        return;
      }

      var stages = roomData.gameStages || [];
      if (stages.length === 0) {
        _combos = [
          {
            fieldId: "mouse",
            ruleId: "rule1",
            displayName: "Mouse Rule1",
          },
          {
            fieldId: "mouse",
            ruleId: "rule2",
            displayName: "Mouse Rule2",
          },
        ];
      } else {
        _combos = stages.map(function (stage) {
          // Firebase RTDB 可能將 Array 轉為 Object，確保還原
          var qs = stage.questions || null;
          if (qs && !Array.isArray(qs)) qs = Object.values(qs);

          return {
            stageId: stage.id || null,
            fieldId: stage.fieldId || "mouse",
            ruleId: stage.ruleId || "rule1",
            questionCount: stage.questionCount || (qs ? qs.length : 0),
            displayName: (stage.icon || "") + " " + (stage.name || ""),
            enableWm: !!(
              stage.enableWm ||
              stage.hasWM ||
              stage.workingMemoryTest
            ),
            questions: qs,
            workingMemoryTest: stage.workingMemoryTest || null,
          };
        });
      }

      // 讀取房間自訂倒數秒數
      _roomCountdownSeconds = roomData.countdownSeconds || null;

      // 讀取顯示設定
      _displaySettings = roomData.displaySettings || {};

      // ── 接力 / 隊伍對抗模式偵測 ──
      _isRelayMode = roomData.gameMode === "relay";
      _isTeamMode = roomData.gameMode === "team";
      if ((_isRelayMode || _isTeamMode) && window.RelayManager) {
        var myUid = firebase.auth().currentUser
          ? firebase.auth().currentUser.uid
          : null;
        RelayManager.init({
          roomCode: MultiplayerBridge.getRoomCode(),
          playerId: myUid,
          isHost: false,
          callbacks: {
            onBatonChange: function (info) {
              if (_isRelayMode) {
                _updateRelayStatusBar(roomData);
                _checkRelayTurn();
              }
            },
            onTeamFinished: function (teamId) {
              Logger.debug("🏁 隊伍完成:", teamId);
            },
            onAllTeamsFinished: function () {
              Logger.info("🏁 所有隊伍完成");
            },
          },
        });
        if (_isRelayMode) {
          _showRelayStatusBar(roomData);
          _checkRelayTurn();
        }
      }

      beginCombo();
    });

    dom.btnSpace.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      onPress();
    });

    document.addEventListener("keydown", function (e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;
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
          dom.comboTransition &&
          !dom.comboTransition.classList.contains("hidden")
        ) {
          var comboStartBtn =
            dom.comboTransition.querySelector(".combo-start-btn");
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
      if (e.code === "Escape" && _isPlaying && !_isPaused) pause();
    });

    dom.btnPause.addEventListener("click", function () {
      if (_isPlaying) pause();
    });
    dom.btnResume.addEventListener("click", resume);

    // --- 離開確認對話框 ---
    var _exitAction = null;

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
      history.pushState({ efgame: true }, "");
    });

    dom.btnExitConfirm.addEventListener("click", function () {
      _isPlaying = false;
      hideExitConfirm();
      location.href = "../index.html";
    });

    dom.btnQuit.addEventListener("click", function () {
      showExitConfirm("quit");
    });
    dom.btnBack.addEventListener("click", function () {
      if (_isPlaying) {
        showExitConfirm("back");
      } else {
        location.href = "../index.html";
      }
    });

    // --- 瀏覽器返回鍵攔截 ---
    history.pushState({ efgame: true }, "");
    window.addEventListener("popstate", function () {
      if (_isPlaying) {
        showExitConfirm("popstate");
      } else {
        history.back();
      }
    });

    window.addEventListener("beforeunload", function (e) {
      if (_isPlaying) {
        e.preventDefault();
        e.returnValue = "";
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    // 🔊 初始化音訊
    if (typeof AudioPlayer !== "undefined" && AudioPlayer.init) {
      AudioPlayer.init();
    }
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        init();
      }
    });
  });

  return { onPress: onPress, pause: pause, resume: resume };
})();
