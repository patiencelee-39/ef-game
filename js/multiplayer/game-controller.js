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
  var _isPaused = false;
  var _isiTimerId = null;
  var _stimTimerId = null;
  var _totalCorrect = 0;
  var _totalTrials = 0;

  function showScreen(el) {
    var screens = dom.gameContainer.querySelectorAll(".screen");
    for (var i = 0; i < screens.length; i++) {
      screens[i].classList.remove("active");
    }
    if (el) el.classList.add("active");
  }

  function getActionLabel(fieldId) {
    return fieldId === "fishing"
      ? "\uD83C\uDFA3 Pull!"
      : "\uD83D\uDDB1\uFE0F Catch!";
  }

  function clearStimulus() {
    dom.stimulus.innerHTML = "";
    dom.bgLayer.innerHTML = "";
    dom.ctxIndicator.style.display = "none";
  }

  function beginCombo() {
    var combo = _combos[_comboIndex];
    _trialIndex = 0;
    _trialResults = [];
    _responded = false;

    var count =
      combo.questionCount ||
      combo.questionsCount ||
      (typeof GAME_CONFIG !== "undefined"
        ? GAME_CONFIG.QUESTIONS.DEFAULT_COUNT
        : 10);
    _questions = generateQuestions(combo.fieldId, combo.ruleId, count);

    dom.trialTotal.textContent = _questions.length;
    showRuleIntro(combo);
  }

  /** stimulus key → SVG HTML (same as singleplayer) */
  function getSVG(key) {
    return (typeof SVG_ASSETS !== "undefined" && SVG_ASSETS[key]) || "";
  }

  function showRuleIntro(combo) {
    var field = GAME_CONFIG.FIELDS[combo.fieldId];
    var rule = field.rules[combo.ruleId];

    dom.ruleIntroTitle.textContent = field.icon + " " + rule.name;

    var boxesHtml = "";
    if (combo.ruleId === "mixed") {
      boxesHtml = '<div class="rule-box rule-box--go">Mixed rules</div>';
      dom.ruleIntroContext.textContent =
        "Context A: " +
        rule.contextA.label +
        " | Context B: " +
        rule.contextB.label;
      dom.ruleIntroContext.classList.remove("hidden");
    } else {
      var goStim = rule.go.stimulus;
      var nogoStim = rule.noGo.stimulus;
      var goSvg = getSVG(goStim) || goStim;
      var nogoSvg = getSVG(nogoStim) || nogoStim;

      boxesHtml =
        '<div class="rule-box rule-box--go">' +
        '<div class="rule-stim-icon">' +
        goSvg +
        "</div>" +
        '<span class="rule-action-text rule-action-text--go">\u2192 ' +
        getActionLabel(combo.fieldId) +
        "</span>" +
        "</div>" +
        '<div class="rule-box rule-box--nogo">' +
        '<div class="rule-stim-icon">' +
        nogoSvg +
        "</div>" +
        '<span class="rule-action-text rule-action-text--nogo">\u2192 \u270B Don\'t press</span>' +
        "</div>";
      dom.ruleIntroContext.classList.add("hidden");
    }
    dom.ruleIntroBoxes.innerHTML = boxesHtml;
    dom.ruleIntroWM.classList.add("hidden");

    showScreen(dom.ruleIntroScreen);

    dom.btnRuleStart.onclick = function () {
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

    clearStimulus();
    dom.btnSpace.disabled = true;
    _responded = false;

    _isiTimerId = setTimeout(function () {
      if (_isPaused) return;
      presentStimulus(question, combo, _tp.stimulusDurationMs);
    }, isiMs);
  }

  function presentStimulus(question, combo, duration) {
    // === 背景（對齊 singleplayer renderStimulus）===
    if (combo.fieldId === "mouse") {
      dom.bgLayer.innerHTML = getSVG("mouseHole");
    } else if (combo.fieldId === "fishing") {
      var isNight = combo.ruleId === "mixed" && question.context === "night";
      dom.bgLayer.innerHTML = isNight
        ? getSVG("oceanNight")
        : getSVG("oceanBg");
    }

    // === 混合規則情境指示 ===
    if (question.context) {
      dom.ctxIndicator.style.display = "block";
      switch (question.context) {
        case "hasPerson":
          dom.ctxIndicator.innerHTML = getSVG("person");
          break;
        case "day":
          dom.ctxIndicator.innerHTML = getSVG("sun");
          break;
        case "night":
          dom.ctxIndicator.innerHTML = getSVG("moon");
          break;
        default:
          dom.ctxIndicator.style.display = "none";
      }
    }

    // === 刺激物 ===
    dom.stimulus.innerHTML =
      getSVG(question.stimulus) || question.stimulus || "?";

    dom.btnSpace.disabled = false;
    _stimOnTime = Date.now();

    _stimTimerId = setTimeout(function () {
      if (!_responded) {
        _responded = true;
        var result = question.isGo ? "Miss" : "CR";
        recordTrial(question, result, null);
        showFeedback(result);
      }
    }, duration);
  }

  function onPress() {
    if (_responded) return;
    _responded = true;
    clearTimeout(_stimTimerId);

    var question = _questions[_trialIndex];
    var rt = Date.now() - _stimOnTime;
    var result = question.isGo ? "Hit" : "FA";
    recordTrial(question, result, rt);
    showFeedback(result);
  }

  function recordTrial(question, result, rt) {
    var isCorrect = result === "Hit" || result === "CR";
    if (isCorrect) _totalCorrect++;
    _totalTrials++;

    var record = {
      trialIndex: _trialIndex,
      stimulus: question.stimulus,
      context: question.context || null,
      isGo: question.isGo,
      correctAction: question.correctAction,
      result: result,
      isCorrect: isCorrect,
      rt: rt,
      timestamp: Date.now(),
    };
    _trialResults.push(record);

    DifficultyProvider.onTrialComplete(record);

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

    DifficultyProvider.onSessionComplete({
      fieldId: _combos[_comboIndex].fieldId,
      ruleId: _combos[_comboIndex].ruleId,
      trialResults: _trialResults,
      wmResult: null,
      passed: false,
    });

    _comboIndex++;
    if (_comboIndex < _combos.length) {
      beginCombo();
    } else {
      finishGame();
    }
  }

  function finishGame() {
    var accuracy = _totalTrials > 0 ? (_totalCorrect / _totalTrials) * 100 : 0;

    MultiplayerBridge.recordFinalScore({
      totalScore: _totalCorrect,
      totalCorrect: _totalCorrect,
      totalTrials: _totalTrials,
      accuracy: accuracy,
      totalTime: 0,
      answers: _trialResults,
    });

    MultiplayerBridge.goToResult();
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

    if (typeof SimpleAdaptiveEngine !== "undefined") {
      DifficultyProvider.setEngine(SimpleAdaptiveEngine);
    }
    DifficultyProvider.reset();

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
        alert("Room data not found");
        location.href = "../index.html";
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
          var fieldId =
            stage.id === "A" || stage.id === "B" ? "mouse" : "fishing";
          var ruleId =
            stage.id === "A" || stage.id === "C"
              ? "rule1"
              : stage.id === "B" || stage.id === "D"
                ? "rule2"
                : "mixed";
          return {
            fieldId: fieldId,
            ruleId: ruleId,
            questionCount: stage.questionCount || 0,
            displayName: (stage.icon || "") + " " + (stage.name || ""),
          };
        });
      }

      // 讀取房間自訂倒數秒數
      _roomCountdownSeconds = roomData.countdownSeconds || null;

      beginCombo();
    });

    dom.btnSpace.addEventListener("click", function () {
      if (_isPlaying && !_responded) onPress();
    });

    document.addEventListener("keydown", function (e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;
      if (e.code === "Space") {
        e.preventDefault();
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
