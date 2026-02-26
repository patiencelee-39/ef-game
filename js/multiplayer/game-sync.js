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

    // 監聽所有玩家即時狀態
    _startPlayersListener();

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
  // 玩家狀態監聽
  // =========================================

  function _startPlayersListener() {
    _playersRef.on("value", function (snapshot) {
      var players = snapshot.val();
      if (!players) return;

      // 計算預期玩家數（只算 non-spectator）
      _expectedPlayerCount = 0;
      _playerSnapshots = {};

      for (var uid in players) {
        if (!players.hasOwnProperty(uid)) continue;
        var p = players[uid];
        // 過濾幽靈條目（沒有 nickname 且沒有 joinedAt 的不是真正玩家）
        if (!p.nickname && !p.joinedAt) continue;
        // 過濾觀戰者（房主觀戰模式）
        if (p.role === "spectator") continue;
        _playerSnapshots[uid] = {
          nickname: p.nickname || "玩家",
          online: p.online !== false,
          currentProgress: p.currentProgress || 0,
          currentScore: p.currentScore || 0,
          currentCombo: p.currentCombo || "",
          lastUpdate: p.lastUpdate || 0,
          isHost: p.isHost || false,
        };
        _expectedPlayerCount++;

        // 偵測場地完成通知（去重：同一 uid+stageName 只通知一次）
        if (p.justCompleted && _callbacks.onStageComplete) {
          var dedupeKey = uid + "_" + p.justCompleted;
          if (!_notifiedCompletions[dedupeKey]) {
            _notifiedCompletions[dedupeKey] = true;
            _callbacks.onStageComplete(
              uid,
              p.nickname || "玩家",
              p.justCompleted,
            );
          }
        }

        // 偵測斷線
        if (p.online === false && _callbacks.onPlayerDisconnect) {
          _callbacks.onPlayerDisconnect(uid, _playerSnapshots[uid]);
        }
      }

      if (_callbacks.onPlayersUpdate) {
        _callbacks.onPlayersUpdate(_playerSnapshots);
      }
    });
  }

  // =========================================
  // 分數完成監聽
  // =========================================

  function _startScoresListener() {
    _scoresRef.on("value", function (snapshot) {
      var scores = snapshot.val();
      if (!scores || _finishedDetected) return;

      var finishedCount = Object.keys(scores).length;

      // 全員完成？
      if (finishedCount >= _expectedPlayerCount && _expectedPlayerCount > 0) {
        _finishedDetected = true;
        Logger.debug(
          "🏁 [GameSync] 全員完成！(" +
            finishedCount +
            "/" +
            _expectedPlayerCount +
            ")",
        );

        // 更新房間狀態
        _roomRef.update({ status: "finished", finishedAt: Date.now() });

        if (_callbacks.onAllFinished) {
          _callbacks.onAllFinished(scores);
        }
      }
    });
  }

  // =========================================
  // 進度廣播（每次答題後呼叫）
  // =========================================

  /**
   * 廣播自己的進度
   * @param {Object} state
   * @param {number} state.progress  — 0~100
   * @param {number} state.score     — 累計分數
   * @param {string} state.comboName — 當前場地
   */
  function broadcastProgress(state) {
    if (!_roomRef || !_playerId) return;
    _roomRef.child("players/" + _playerId).update({
      currentProgress: state.progress || 0,
      currentScore: state.score || 0,
      currentCombo: state.comboName || "",
      online: true,
      lastUpdate: Date.now(),
    });
  }

  /**
   * 廣播場地完成通知
   * @param {string} stageName — 場地名稱
   */
  function broadcastStageComplete(stageName) {
    if (!_roomRef || !_playerId) return;
    _roomRef.child("players/" + _playerId).update({
      justCompleted: stageName,
    });
    // 3 秒後清除
    setTimeout(function () {
      if (_roomRef) {
        _roomRef.child("players/" + _playerId + "/justCompleted").set(null);
      }
    }, 3000);
  }

  // =========================================
  // 記錄答題
  // =========================================

  function recordAnswer(trialRecord) {
    if (!_roomRef || !_playerId) return;
    _roomRef.child("answers/" + _playerId).push({
      stimulus: trialRecord.stimulus || "",
      isCorrect: trialRecord.isCorrect || false,
      rt: trialRecord.rt || null,
      stageId: trialRecord.stageId || null,
      fieldId: trialRecord.fieldId || null,
      ruleId: trialRecord.ruleId || null,
      timestamp: Date.now(),
    });
  }

  // =========================================
  // 記錄最終成績
  // =========================================

  function recordFinalScore(resultObj) {
    if (!_roomRef || !_playerId) return;

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
          trialDetails: resultObj.answers || [],
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
    _roomRef.child("countdownStartAt").on("value", function (snap) {
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
    if (_playersRef) _playersRef.off();
    if (_scoresRef) _scoresRef.off();
    if (_roomRef) {
      _roomRef.child("status").off();
      _roomRef.child("countdownStartAt").off();
    }
    if (_countdownTimer) {
      clearInterval(_countdownTimer);
      _countdownTimer = null;
    }
  }

  function destroy() {
    _cleanup();
    _playerSnapshots = {};
    _finishedDetected = false;
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
    goToResult: goToResult,
    destroy: destroy,
  };
})();
