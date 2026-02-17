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

        function parseRoomInfo() {
          var params = new URLSearchParams(window.location.search);
          _roomCode = params.get("room");
          _playerRole = params.get("role") || "player";

          if (!_roomCode) {
            alert("Missing room code");
            location.href = "../index.html";
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

          console.log(
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
            callbacks: {
              onPlayersUpdate: _updateLiveLeaderboard,
              onAllFinished: _onAllFinished,
              onPlayerDisconnect: function (uid, data) {
                console.log("⚠️ 玩家斷線: " + data.nickname);
              },
              onRoomClosed: function () {
                alert("房間已關閉");
                location.href = "../index.html";
              },
            },
          });

          // 觀戰模式仍需全房間監聽
          if (_playerRole === "spectator") {
            _roomRef.on("value", function (snapshot) {
              _roomData = snapshot.val();
              if (!_roomData) return;
              updateSpectatorDashboard();
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
        }

        /** 即時排行榜渲染 */
        function _updateLiveLeaderboard(playersMap) {
          if (_playerRole === "spectator") return;

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
            html +=
              '<span class="live-lb__name">' + _escHtml(p.nickname) + "</span>";
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

        function recordAnswer(trialRecord) {
          GameSync.recordAnswer(trialRecord);
        }

        function recordFinalScore(resultObj) {
          // 取得暱稱
          try {
            var pd = JSON.parse(localStorage.getItem("currentPlayer") || "{}");
            resultObj.nickname = pd.nickname || "玩家";
          } catch (e) {}

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
            var emoji = avatars[idx % avatars.length];
            var statusText = p.online ? p.currentCombo || "進行中" : "離線";
            var scoreText = p.currentScore || 0;
            var prog = p.currentProgress || 0;

            html += '<div class="spectator-player-card">';
            html += '<div class="avatar">' + emoji + "</div>";
            html += '<div class="info">';
            html +=
              '<div class="name">' + _escHtml(p.nickname || "玩家") + "</div>";
            html +=
              '<div class="status">' + statusText + " · " + prog + "%</div>";
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
          var div = document.createElement("div");
          div.textContent = s || "";
          return div.innerHTML;
        }

        return {
          parseRoomInfo: parseRoomInfo,
          initRoom: initRoom,
          broadcastState: broadcastState,
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
