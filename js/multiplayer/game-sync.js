/**
 * ============================================
 * 多人遊戲即時同步模組 — GameSync
 * ============================================
 * 職責：
 *   1. 統一倒數計時同步（3-2-1 全員同時開始）
 *   2. 即時進度廣播 + 其他玩家進度監聽
 *   3. 即時計分板（浮動 mini leaderboard）
 *   4. 全員完成偵測 → 自動導向結果頁
 *   5. 斷線重連標記
 *   6. 房間狀態管理（playing → finished）
 *
 * 低耦合設計：
 *   - 本模組只認識 Firebase RTDB 路徑
 *   - 不認識 DOM（UI 由 callback/event 驅動）
 *   - game.html 透過 GameSync API 溝通
 *
 * 依賴：firebase-app-compat + firebase-database-compat（已在頁面載入）
 *
 * 匯出：window.GameSync
 * ============================================
 */

var GameSync = (function () {
  "use strict";

  // =========================================
  // 內部狀態
  // =========================================
  var _roomCode = null;
  var _playerId = null;
  var _isHost = false;
  var _roomRef = null;
  var _playersRef = null;
  var _scoresRef = null;

  /** 所有玩家的即時狀態快照 */
  var _playerSnapshots = {};

  /** 回呼 */
  var _callbacks = {
    onPlayersUpdate: null, // (playersMap) → 即時玩家進度更新
    onAllFinished: null, // (scoresMap) → 全員完成
    onPlayerDisconnect: null, // (playerId, playerData) → 某玩家斷線
    onRoomClosed: null, // () → 房間被關閉
    onCountdownSync: null, // (secondsLeft) → 同步倒數
    onStageComplete: null, // (uid, nickname, stageName) → 某玩家完成場地
  };

  /** 全員完成偵測 */
  var _expectedPlayerCount = 0;
  var _finishedDetected = false;

  /** justCompleted 去重（避免同一事件重複觸發 callback） */
  var _notifiedCompletions = {};

  /** 倒數同步 */
  var _countdownTimer = null;

  /** 監聽模式：'active' = 全部監聽 | 'minimal' = 只保留 status + scores */
  var _listeningMode = "active";
  var _playersListenersActive = false;
  var _notificationsListenersActive = false;

  // =========================================
  // 初始化
  // =========================================

  /**
   * 初始化同步模組
   * @param {Object} config
   * @param {string} config.roomCode       — 房間代碼
   * @param {string} config.playerId       — 自己的 UID
   * @param {boolean} [config.isHost]      — 是否房主
   * @param {Object} [config.callbacks]    — 回呼函式
   */
  function init(config) {
    _roomCode = config.roomCode;
    _playerId = config.playerId;
    _isHost = config.isHost || false;
    _finishedDetected = false;
    _playerSnapshots = {};
    _notifiedCompletions = {};

    if (config.callbacks) {
      for (var key in config.callbacks) {
        if (_callbacks.hasOwnProperty(key)) {
          _callbacks[key] = config.callbacks[key];
        }
      }
    }

    var db = firebase.database();
    _roomRef = db.ref("rooms/" + _roomCode);
    _playersRef = _roomRef.child("players");
    _scoresRef = _roomRef.child("scores");

    // 標記自己上線（觀戰者不寫入 players）
    var _role = config.role || "player";
    if (_playerId && _role !== "spectator") {
      _roomRef
        .child("players/" + _playerId + "/online")
        .onDisconnect()
        .set(false);
      _roomRef.child("players/" + _playerId).update({
        online: true,
        lastUpdate: Date.now(),
      });
    }

    // 監聯所有玩家即時狀態
    _startPlayersListener();

    // 監聽 notifications 節點（場地完成通知，獨立於 players 避免快照風暴）
    _startNotificationsListener();

    // 監聽 scores 節點（偵測全員完成）
    _startScoresListener();

    // 監聽房間是否被刪除（只監聽 status 而非整個房間樹，避免 OOM）
    _roomRef.child("status").on("value", function (snap) {
      if (snap.val() === null) {
        _cleanup();
        if (_callbacks.onRoomClosed) _callbacks.onRoomClosed();
      }
    });

    Logger.debug("🔗 [GameSync] 初始化完成 room=" + _roomCode);
  }

  // =========================================
  // 玩家狀態監聽（改用 child 級事件，避免 N² 全量快照風暴）
  // =========================================

  /** 防抖 — 累積 child 級更新後一次性回呼 UI */
  var _playersUpdateTimer = null;
  var PLAYERS_UPDATE_DEBOUNCE_MS = 600;
  var _initialLoadDone = false;

  function _schedulePlayersCallback() {
    if (_playersUpdateTimer) return; // 已排程
    _playersUpdateTimer = setTimeout(
      function () {
        _playersUpdateTimer = null;
        // 重算 expectedPlayerCount
        _expectedPlayerCount = 0;
        for (var uid in _playerSnapshots) {
          if (_playerSnapshots.hasOwnProperty(uid)) _expectedPlayerCount++;
        }
        if (_callbacks.onPlayersUpdate) {
          _callbacks.onPlayersUpdate(_playerSnapshots);
        }
      },
      _initialLoadDone ? PLAYERS_UPDATE_DEBOUNCE_MS : 100,
    );
  }

  function _processPlayerData(uid, p) {
    if (!p) return;
    // 過濾幽靈條目
    if (!p.nickname && !p.joinedAt) return;
    // 過濾觀戰者
    if (p.role === "spectator") return;
    _playerSnapshots[uid] = {
      nickname: p.nickname || "玩家",
      online: p.online !== false,
      currentProgress: p.currentProgress || 0,
      currentScore: p.currentScore || 0,
      currentCombo: p.currentCombo || "",
      lastUpdate: p.lastUpdate || 0,
      isHost: p.isHost || false,
    };
    // 偵測斷線
    if (p.online === false && _callbacks.onPlayerDisconnect) {
      _callbacks.onPlayerDisconnect(uid, _playerSnapshots[uid]);
    }
  }

  function _startPlayersListener() {
    if (_playersListenersActive) return; // 防止重複綁定
    _playersListenersActive = true;
    // 使用 child 級事件，每次只下載單一玩家資料，大幅減少記憶體分配
    _playersRef.on("child_added", function (snap) {
      _processPlayerData(snap.key, snap.val());
      _schedulePlayersCallback();
    });
    _playersRef.on("child_changed", function (snap) {
      _processPlayerData(snap.key, snap.val());
      _schedulePlayersCallback();
    });
    _playersRef.on("child_removed", function (snap) {
      delete _playerSnapshots[snap.key];
      _schedulePlayersCallback();
    });
    // 標記初始載入完成
    setTimeout(function () {
      _initialLoadDone = true;
    }, 2000);
  }

  function _stopPlayersListener() {
    if (!_playersListenersActive) return;
    _playersListenersActive = false;
    if (_playersRef) _playersRef.off();
    if (_playersUpdateTimer) {
      clearTimeout(_playersUpdateTimer);
      _playersUpdateTimer = null;
    }
  }

  // =========================================
  // 場地完成通知監聽（獨立 notifications 節點，不觸發 players 全量快照）
  // =========================================

  var _notificationsRef = null;

  function _startNotificationsListener() {
    if (_notificationsListenersActive) return; // 防止重複綁定
    _notificationsListenersActive = true;
    if (!_notificationsRef) {
      _notificationsRef = _roomRef.child("notifications");
    }
    _notificationsRef.on("child_added", function (snap) {
      var uid = snap.key;
      var data = snap.val();
      if (!data || !data.justCompleted || uid === _playerId) return;
      if (!_callbacks.onStageComplete) return;
      var dedupeKey = uid + "_" + data.justCompleted;
      if (!_notifiedCompletions[dedupeKey]) {
        _notifiedCompletions[dedupeKey] = true;
        // 從 _playerSnapshots 取暱稱
        var nickname =
          (_playerSnapshots[uid] && _playerSnapshots[uid].nickname) || "玩家";
        _callbacks.onStageComplete(uid, nickname, data.justCompleted);
      }
    });
    _notificationsRef.on("child_changed", function (snap) {
      var uid = snap.key;
      var data = snap.val();
      if (!data || !data.justCompleted || uid === _playerId) return;
      if (!_callbacks.onStageComplete) return;
      var dedupeKey = uid + "_" + data.justCompleted;
      if (!_notifiedCompletions[dedupeKey]) {
        _notifiedCompletions[dedupeKey] = true;
        var nickname =
          (_playerSnapshots[uid] && _playerSnapshots[uid].nickname) || "玩家";
        _callbacks.onStageComplete(uid, nickname, data.justCompleted);
      }
    });
  }

  function _stopNotificationsListener() {
    if (!_notificationsListenersActive) return;
    _notificationsListenersActive = false;
    if (_notificationsRef) _notificationsRef.off();
  }

  // =========================================
  // 監聽模式切換（試驗中暫停非必要監聽，大幅減少 Firebase SDK 原生記憶體壓力）
  // =========================================

  /**
   * 切換監聽模式
   * @param {'active'|'minimal'} mode
   *   - 'active': 監聽 players + notifications + scores + status（過場/等待時使用）
   *   - 'minimal': 只保留 scores + status（試驗進行中使用，減少 90%+ Firebase 流量）
   */
  function setListeningMode(mode) {
    if (mode === _listeningMode) return;
    _listeningMode = mode;

    if (mode === "minimal") {
      _stopPlayersListener();
      _stopNotificationsListener();
      // 清除待發送的進度廣播
      if (_broadcastTimer) {
        clearTimeout(_broadcastTimer);
        _broadcastTimer = null;
      }
      _pendingBroadcast = null;
      Logger.debug("⏸️ [GameSync] 切換到最小監聽模式（試驗中）");
    } else {
      _startPlayersListener();
      _startNotificationsListener();
      Logger.debug("▶️ [GameSync] 切換到完整監聽模式");
    }
  }

  // =========================================
  // 分數完成監聽
  // =========================================

  /** 已完成的分數快照（使用 child 級監聽避免全量下載） */
  var _recordedScores = {};

  function _startScoresListener() {
    // 🔧 OOM Fix: 改用 child_added/child_changed 避免 12 人每次全量下載 scores
    _scoresRef.on("child_added", function (snap) {
      _recordedScores[snap.key] = snap.val();
      _checkAllFinished();
    });
    _scoresRef.on("child_changed", function (snap) {
      _recordedScores[snap.key] = snap.val();
      _checkAllFinished();
    });
  }

  function _checkAllFinished() {
    if (_finishedDetected) return;
    var finishedCount = Object.keys(_recordedScores).length;
    console.log("🔧 [DEBUG] _checkAllFinished: finishedCount=" + finishedCount + ", _expectedPlayerCount=" + _expectedPlayerCount);
    if (finishedCount >= _expectedPlayerCount && _expectedPlayerCount > 0) {
      _finishedDetected = true;
      Logger.debug(
        "🏁 [GameSync] 全員完成！(" +
          finishedCount +
          "/" +
          _expectedPlayerCount +
          ")",
      );
      _roomRef.update({ status: "finished", finishedAt: Date.now() });
      if (_callbacks.onAllFinished) {
        _callbacks.onAllFinished(_recordedScores);
      }
    }
  }

  // =========================================
  // 進度廣播（每次答題後呼叫，節流 2 秒避免 OOM）
  // =========================================

  var _broadcastTimer = null;
  var _pendingBroadcast = null;
  var BROADCAST_THROTTLE_MS = 4000; // 🔧 OOM Fix: 12 人場景放寬到 4 秒

  /**
   * 廣播自己的進度（節流：最多每 2 秒寫入 Firebase 一次）
   * progress === 100 時立即發送（最後一筆不可遺漏）
   * @param {Object} state
   * @param {number} state.progress  — 0~100
   * @param {number} state.score     — 累計分數
   * @param {string} state.comboName — 當前場地
   */
  function broadcastProgress(state) {
    if (!_roomRef || !_playerId) return;

    // 🔧 OOM核心修復：最小模式下跳過所有中間進度廣播
    // 12人×每題廣播 = 每秒數次 child_changed，是 OOM 的根本原因
    if (_listeningMode === "minimal") {
      // 只在 combo 完成（progress=100）時才發送
      if (state.progress < 100) return;
    }

    _pendingBroadcast = state;

    // progress === 100 → 加隨機延遲發送（避免 12 人同時完成 burst）
    if (state.progress >= 100) {
      setTimeout(_flushBroadcast, Math.floor(Math.random() * 800));
      return;
    }

    if (!_broadcastTimer) {
      _broadcastTimer = setTimeout(function () {
        _broadcastTimer = null;
        _flushBroadcast();
      }, BROADCAST_THROTTLE_MS);
    }
  }

  function _flushBroadcast() {
    if (!_pendingBroadcast || !_roomRef || !_playerId) return;
    var s = _pendingBroadcast;
    _pendingBroadcast = null;
    if (_broadcastTimer) {
      clearTimeout(_broadcastTimer);
      _broadcastTimer = null;
    }
    _roomRef.child("players/" + _playerId).update({
      currentProgress: s.progress || 0,
      currentScore: s.score || 0,
      currentCombo: s.comboName || "",
      online: true,
      lastUpdate: Date.now(),
    });
  }

  /**
   * 廣播場地完成通知
   * 改用獨立 notifications 節點，避免寫入 players/ 觸發全量快照
   * @param {string} stageName — 場地名稱
   */
  function broadcastStageComplete(stageName) {
    if (!_roomRef || !_playerId) return;
    // 🔧 OOM Fix: minimal 模式下跳過通知寫入，減少 Firebase SDK 記憶體分配
    if (_listeningMode === "minimal") return;
    var notifRef = _roomRef.child("notifications/" + _playerId);
    notifRef.set({ justCompleted: stageName, ts: Date.now() });
    // 3 秒後清除
    setTimeout(function () {
      if (_roomRef) {
        notifRef.set(null);
      }
    }, 3000);
  }

  // =========================================
  // 記錄答題（本地暫存，遊戲結束批次上傳避免 OOM）
  // =========================================

  var _localAnswers = [];

  function recordAnswer(trialRecord) {
    if (!_playerId) return;
    _localAnswers.push({
      stimulus: trialRecord.stimulus || "",
      isCorrect: trialRecord.isCorrect || false,
      rt: trialRecord.rt || null,
      stageId: trialRecord.stageId || null,
      fieldId: trialRecord.fieldId || null,
      ruleId: trialRecord.ruleId || null,
      timestamp: Date.now(),
    });
  }

  /** 將本地暫存的答題紀錄批次寫入 Firebase（使用子路徑避免 root sync tree 膨脹） */
  function _flushAnswers() {
    if (!_roomRef || !_playerId || _localAnswers.length === 0) return;
    var answersRef = _roomRef.child("answers/" + _playerId);
    var updates = {};
    for (var i = 0; i < _localAnswers.length; i++) {
      var key = answersRef.push().key;
      updates[key] = _localAnswers[i];
    }
    answersRef.update(updates);
    _localAnswers = [];
  }

  // =========================================
  // 記錄最終成績
  // =========================================

  function recordFinalScore(resultObj) {
    if (!_roomRef || !_playerId) return;

    // 遊戲結束：批次上傳所有暫存答題紀錄
    _flushBroadcast();
    _flushAnswers();

    var scoreData = {
      totalScore: resultObj.totalScore || 0,
      totalCorrect: resultObj.totalCorrect || 0,
      totalTrials: resultObj.totalTrials || 0,
      accuracy: resultObj.accuracy || 0,
      avgRT: resultObj.avgRT || 0,
      finishedAt: Date.now(),
      nickname: resultObj.nickname || "玩家",
    };

    _roomRef.child("scores/" + _playerId).set(scoreData);

    // 從答題紀錄提取 fieldId / ruleId（供 result.html + 排行榜使用）
    var _firstAns = (resultObj.answers || [])[0] || {};
    var _fieldId = _firstAns.fieldId || _firstAns.stageId || "";
    var _ruleId = _firstAns.ruleId || "";

    // 同時存 localStorage 給 result.html 讀取
    try {
      localStorage.setItem(
        "gameResult",
        JSON.stringify({
          score: scoreData.totalScore,
          accuracy: scoreData.accuracy,
          avgRT: scoreData.avgRT,
          correctAnswers: scoreData.totalCorrect,
          totalQuestions: scoreData.totalTrials,
          totalTime: resultObj.totalTime || 0,
          answers: resultObj.answers || [],
          comboScores: resultObj.comboScores || [],
          playerId: _playerId,
          nickname: scoreData.nickname,
          fieldId: _fieldId,
          ruleId: _ruleId,
        }),
      );
    } catch (e) {
      Logger.warn("[GameSync] localStorage 寫入失敗", e);
    }
  }

  // =========================================
  // 同步倒數
  // =========================================

  /**
   * 房主發起倒數（寫入 Firebase 供所有玩家讀取）
   * @param {number} seconds — 倒數秒數（預設 3）
   */
  function startSyncCountdown(seconds) {
    seconds = seconds || 3;

    // 房主寫入倒數起始時間
    _roomRef.update({
      countdownStartAt: firebase.database.ServerValue.TIMESTAMP,
      countdownSeconds: seconds,
    });
  }

  /**
   * 所有玩家監聽倒數並本地同步
   * @param {Function} onTick   — (secondsLeft) → 每秒回呼
   * @param {Function} onDone   — () → 倒數結束
   */
  function listenCountdown(onTick, onDone) {
    // 🔧 OOM Fix: 改用 .once() — 倒數只需觸發一次
    _roomRef.child("countdownStartAt").once("value", function (snap) {
      var startAt = snap.val();
      if (!startAt) return;

      _roomRef.child("countdownSeconds").once("value", function (secSnap) {
        var totalSec = secSnap.val() || 3;

        if (_countdownTimer) clearInterval(_countdownTimer);

        _countdownTimer = setInterval(function () {
          var elapsed = (Date.now() - startAt) / 1000;
          var left = Math.ceil(totalSec - elapsed);

          if (left <= 0) {
            clearInterval(_countdownTimer);
            _countdownTimer = null;
            if (onDone) onDone();
          } else {
            if (onTick) onTick(left);
          }
        }, 200); // 200ms 精度
      });
    });
  }

  // =========================================
  // 取得排行（即時快照排序）
  // =========================================

  /**
   * 取得目前即時排行
   * @returns {Array} [ { playerId, nickname, score, progress, online }, ... ] 按分數降序
   */
  function getLiveRanking() {
    var ranking = [];
    for (var uid in _playerSnapshots) {
      if (!_playerSnapshots.hasOwnProperty(uid)) continue;
      var p = _playerSnapshots[uid];
      ranking.push({
        playerId: uid,
        nickname: p.nickname,
        score: p.currentScore,
        progress: p.currentProgress,
        online: p.online,
        isMe: uid === _playerId,
      });
    }
    ranking.sort(function (a, b) {
      return b.score - a.score;
    });
    return ranking;
  }

  // =========================================
  // 清理
  // =========================================

  function _cleanup() {
    _stopPlayersListener();
    _stopNotificationsListener();
    if (_scoresRef) _scoresRef.off();
    if (_roomRef) {
      _roomRef.child("status").off();
      // countdownStartAt 已改用 .once()，不需 .off()
    }
    if (_countdownTimer) {
      clearInterval(_countdownTimer);
      _countdownTimer = null;
    }
    if (_broadcastTimer) {
      clearTimeout(_broadcastTimer);
      _broadcastTimer = null;
    }
    if (_playersUpdateTimer) {
      clearTimeout(_playersUpdateTimer);
      _playersUpdateTimer = null;
    }
  }

  function destroy() {
    _cleanup();
    _playerSnapshots = {};
    _finishedDetected = false;
    _localAnswers = [];
    _pendingBroadcast = null;
    _recordedScores = {};
    _listeningMode = "active";
    _playersListenersActive = false;
    _notificationsListenersActive = false;
    Logger.debug("🔌 [GameSync] 已斷開");
  }

  // =========================================
  // 導向結果頁
  // =========================================

  function goToResult() {
    _cleanup();
    // 保留 URL 上的 role 參數（觀戰者需帶 role=spectator）
    var params = new URLSearchParams(window.location.search);
    var role = params.get("role");
    var url = "result.html?room=" + _roomCode;
    if (role) url += "&role=" + role;
    location.href = url;
  }

  // =========================================
  // 公開 API
  // =========================================

  return {
    init: init,
    broadcastProgress: broadcastProgress,
    broadcastStageComplete: broadcastStageComplete,
    recordAnswer: recordAnswer,
    recordFinalScore: recordFinalScore,
    startSyncCountdown: startSyncCountdown,
    listenCountdown: listenCountdown,
    getLiveRanking: getLiveRanking,
    getPlayerSnapshots: function () {
      return _playerSnapshots;
    },
    getPlayerId: function () {
      return _playerId;
    },
    getRoomCode: function () {
      return _roomCode;
    },
    setListeningMode: setListeningMode,
    goToResult: goToResult,
    destroy: destroy,
  };
})();
