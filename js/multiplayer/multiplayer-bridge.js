/**
 * MultiplayerBridge - 使用 GameSync 的同步層（v2）
 * 加入：即時排行榜、等待其他玩家、同步倒數
 */
var MultiplayerBridge = (function () {
  "use strict";

  var _roomCode = null;
  var _playerRole = null;
  var _playerId = null;
  var _roomRef = null;
  var _roomData = null;
  var _waitingForOthers = false;
  var _lbCollapsed = false;

  // 排行榜渲染節流
  var _lbRenderTimer = null;
  var _lbPendingMap = null;
  var LB_RENDER_THROTTLE_MS = 2000; // 🔧 OOM Fix: 放寬到 2 秒降低 DOM 重建頻率

  function parseRoomInfo() {
    var params = new URLSearchParams(window.location.search);
    _roomCode = params.get("room");
    _playerRole = params.get("role") || "player";

    if (!_roomCode) {
      GameModal.alert("缺少房間代碼", "將返回首頁", { icon: "❌" }).then(
        function () {
          location.href = "../index.html";
        },
      );
      return false;
    }

    try {
      var playerData = JSON.parse(
        localStorage.getItem("currentPlayer") || "{}",
      );
      _playerId = playerData.id || null;
    } catch (e) {
      _playerId = null;
    }

    var user = firebase.auth().currentUser;
    if (user) {
      _playerId = user.uid;
    }

    Logger.debug(
      "Multiplayer: room=" +
        _roomCode +
        " role=" +
        _playerRole +
        " id=" +
        _playerId,
    );
    return true;
  }

  function initRoom() {
    _roomRef = firebase.database().ref("rooms/" + _roomCode);

    // 初始化 GameSync
    GameSync.init({
      roomCode: _roomCode,
      playerId: _playerId,
      isHost: false,
      role: _playerRole,
      callbacks: {
        onPlayersUpdate: _updateLiveLeaderboard,
        onAllFinished: _onAllFinished,
        onPlayerDisconnect: function (uid, data) {
          Logger.debug("⚠️ 玩家斷線: " + data.nickname);
        },
        onRoomClosed: function () {
          GameModal.alert("房間已關閉", "將返回首頁", { icon: "🚪" }).then(
            function () {
              location.href = "../index.html";
            },
          );
        },
        onStageComplete: function (uid, nickname, stageName) {
          // 其他玩家完成場地時顯示通知
          if (uid !== _playerId && typeof CompletionNotify !== "undefined") {
            CompletionNotify.show({
              message: "✅ " + nickname + " 完成了 " + stageName + "！",
              type: "normal",
            });
          }
        },
      },
    });

    // 🔧 OOM 核心修復：初始化後立即切換到最小監聽模式
    // 在遊戲全程中默認不監聽其他玩家的即時更新，大幅降低 Firebase SDK 原生記憶體壓力
    if (_playerRole !== "spectator" && GameSync.setListeningMode) {
      GameSync.setListeningMode("minimal");
    }

    // 觀戰模式：只監聯 players 子節點（🔧 OOM Fix: 加 2 秒節流避免狂刷 DOM）
    if (_playerRole === "spectator") {
      var _spectatorThrottleTimer = null;
      var _pendingSpectatorPlayers = null;
      _roomRef.child("players").on("value", function (snapshot) {
        _pendingSpectatorPlayers = snapshot.val();
        if (!_spectatorThrottleTimer) {
          _spectatorThrottleTimer = setTimeout(function () {
            _spectatorThrottleTimer = null;
            if (_pendingSpectatorPlayers) {
              _roomData = _roomData || {};
              _roomData.players = _pendingSpectatorPlayers;
              updateSpectatorDashboard();
            }
          }, 2000);
        }
      });
    }

    // 即時排行榜 toggle
    var lbToggle = document.getElementById("lbToggle");
    var btnLbToggle = document.getElementById("btnLbToggle");
    if (lbToggle) {
      lbToggle.addEventListener("click", function () {
        _lbCollapsed = !_lbCollapsed;
        var lb = document.getElementById("liveLeaderboard");
        lb.classList.toggle("collapsed", _lbCollapsed);
        btnLbToggle.textContent = _lbCollapsed ? "▶" : "◀";
      });
    }

    // 跳過等待
    var btnSkip = document.getElementById("btnSkipWait");
    if (btnSkip) {
      btnSkip.addEventListener("click", function () {
        GameSync.goToResult();
      });
    }

    // 頁面離開時全面清理，避免 Firebase 監聽器和音訊記憶體殘留
    window.addEventListener("beforeunload", function () {
      // 清理所有 Firebase 監聽器
      GameSync.destroy();
      if (_lbRenderTimer) {
        clearTimeout(_lbRenderTimer);
        _lbRenderTimer = null;
      }
      if (_roomRef && _playerRole === "spectator") {
        _roomRef.child("players").off();
      }
      // 釋放 AudioBuffer 快取，減少記憶體壓力
      if (window.AudioPlayer && AudioPlayer.clearBufferCache) {
        AudioPlayer.clearBufferCache();
      }
    });
  }

  /** 即時排行榜渲染（節流，最多 1 秒更新一次 DOM） */
  function _updateLiveLeaderboard(playersMap) {
    if (_playerRole === "spectator") return;
    _lbPendingMap = playersMap;
    if (!_lbRenderTimer) {
      _lbRenderTimer = setTimeout(_renderLeaderboardNow, LB_RENDER_THROTTLE_MS);
    }
  }

  function _renderLeaderboardNow() {
    _lbRenderTimer = null;

    var lb = document.getElementById("liveLeaderboard");
    var body = document.getElementById("liveLeaderboardBody");
    if (!lb || !body) return;

    var ranking = GameSync.getLiveRanking();
    if (ranking.length <= 1) {
      lb.style.display = "none";
      return;
    }

    lb.style.display = "";
    var html = "";
    var medals = ["🥇", "🥈", "🥉"];

    for (var i = 0; i < ranking.length; i++) {
      var p = ranking[i];
      var rankText = i < 3 ? medals[i] : String(i + 1);
      var rowClass = "live-lb__row";
      if (p.isMe) rowClass += " is-me";
      if (!p.online) rowClass += " live-lb__offline";

      html += '<div class="' + rowClass + '">';
      html += '<span class="live-lb__rank">' + rankText + "</span>";
      html += '<span class="live-lb__name">' + _escHtml(p.nickname) + "</span>";
      html += '<span class="live-lb__score">' + p.score + "</span>";
      html += "</div>";
      html +=
        '<div class="live-lb__bar"><div class="live-lb__bar-fill" style="width:' +
        p.progress +
        '%"></div></div>';
    }
    body.innerHTML = html;

    // 更新等待中的計數
    if (_waitingForOthers) {
      _updateWaitingCount();
    }
  }

  function _onAllFinished(scoresMap) {
    // 隱藏等待覆蓋，導向結果
    var overlay = document.getElementById("waiting-overlay");
    if (overlay) overlay.classList.remove("active");
    setTimeout(function () {
      GameSync.goToResult();
    }, 800);
  }

  function _updateWaitingCount() {
    var el = document.getElementById("waitingCount");
    if (!el) return;
    // 數已完成（progress=100）的玩家
    var ranking = GameSync.getLiveRanking();
    var total = ranking.length;
    var done = 0;
    for (var i = 0; i < ranking.length; i++) {
      if (ranking[i].progress >= 100) done++;
    }
    el.textContent = done + " / " + total + " 位玩家已完成";
  }

  function broadcastState(stateObj) {
    GameSync.broadcastProgress(stateObj);
  }

  function broadcastStageComplete(stageName) {
    GameSync.broadcastStageComplete(stageName);
  }

  function recordAnswer(trialRecord) {
    GameSync.recordAnswer(trialRecord);
  }

  function recordFinalScore(resultObj) {
    // 取得暱稱
    try {
      var pd = JSON.parse(localStorage.getItem("currentPlayer") || "{}");
      resultObj.nickname = pd.nickname || "玩家";
    } catch (e) {
      Logger.warn("[Bridge] currentPlayer parse failed:", e);
    }

    GameSync.recordFinalScore(resultObj);
  }

  function updateSpectatorDashboard() {
    if (!_roomData || !_roomData.players) return;
    var listEl = document.getElementById("spectatorPlayerList");
    if (!listEl) return;

    var avatars = ["🐱", "🐶", "🐼", "🦊", "🐨", "🐯", "🦁", "🐮"];
    var players = _roomData.players;
    var html = "";
    var idx = 0;

    for (var uid in players) {
      if (!players.hasOwnProperty(uid)) continue;
      var p = players[uid];
      // 過濾幽靈條目：沒有 nickname 且沒有 joinedAt 的不是真正玩家
      if (!p.nickname && !p.joinedAt) continue;
      // 過濾觀戰者（房主觀戰模式）
      if (p.role === "spectator") continue;
      var emoji = avatars[idx % avatars.length];
      var statusText = p.online ? p.currentCombo || "進行中" : "離線";
      var scoreText = p.currentScore || 0;
      var prog = p.currentProgress || 0;

      html += '<div class="spectator-player-card">';
      html += '<div class="avatar">' + emoji + "</div>";
      html += '<div class="info">';
      html += '<div class="name">' + _escHtml(p.nickname || "玩家") + "</div>";
      html += '<div class="status">' + statusText + " · " + prog + "%</div>";
      html += "</div>";
      html += '<div class="score">' + scoreText + " ⭐</div>";
      html += "</div>";
      idx++;
    }

    if (html === "") {
      html =
        '<p style="text-align:center;color:var(--text-light);">等待玩家中…</p>';
    }
    listEl.innerHTML = html;
  }

  function goToResult() {
    // 顯示等待覆蓋，等其他玩家完成
    _waitingForOthers = true;
    var overlay = document.getElementById("waiting-overlay");
    if (overlay) {
      overlay.classList.add("active");
      _updateWaitingCount();
    }

    // 10 秒後自動跳轉（即使還有人沒完成）
    setTimeout(function () {
      if (_waitingForOthers) {
        GameSync.goToResult();
      }
    }, 10000);
  }

  function _escHtml(s) {
    if (!s) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  return {
    parseRoomInfo: parseRoomInfo,
    initRoom: initRoom,
    broadcastState: broadcastState,
    broadcastStageComplete: broadcastStageComplete,
    recordAnswer: recordAnswer,
    recordFinalScore: recordFinalScore,
    goToResult: goToResult,
    getRole: function () {
      return _playerRole;
    },
    getRoomCode: function () {
      return _roomCode;
    },
    getPlayerId: function () {
      return _playerId;
    },
  };
})();
