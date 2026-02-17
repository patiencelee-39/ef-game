      (function () {
        "use strict";

        // DOM
        var localNickname = document.getElementById("localNickname");
        var localScoreValue = document.getElementById("localScoreValue");
        var localScoreDetail = document.getElementById("localScoreDetail");
        var noDataNotice = document.getElementById("noDataNotice");
        var btnUpload = document.getElementById("btnUpload");
        var uploadStatus = document.getElementById("uploadStatus");
        var worldRankingContainer = document.getElementById(
          "worldRankingContainer",
        );
        var worldStatsContainer = document.getElementById(
          "worldStatsContainer",
        );

        var _bestEntry = null; // 快取找到的最佳紀錄
        var GUEST_NICKNAME = "00NoName";

        // === 初始化 ===
        firebase.auth().onAuthStateChanged(function (user) {
          if (!user) {
            // 自動匿名登入
            firebase
              .auth()
              .signInAnonymously()
              .catch(function (err) {
                console.error("匿名登入失敗", err);
              });
            return;
          }
          _loadLocalScore();
          _loadWorldRanking();
        });

        // === 讀取本地成績 ===
        function _loadLocalScore() {
          try {
            var raw = localStorage.getItem("efgame_leaderboard");
            if (!raw) {
              _showNoData();
              return;
            }
            var data = JSON.parse(raw);
            if (!data || !data.length) {
              _showNoData();
              return;
            }

            // 找最高分（相容 nickname 和 name 兩種欄位）
            var validEntries = data.filter(function (e) {
              return e.nickname || e.name;
            });

            if (validEntries.length === 0) {
              _showNoData();
              return;
            }

            var best = validEntries.reduce(function (a, b) {
              return (b.bestScore || 0) > (a.bestScore || 0) ? b : a;
            }, validEntries[0]);

            _bestEntry = best;
            localNickname.textContent =
              "🏷️ " + (best.nickname || best.name || "匿名");
            localScoreValue.textContent = best.bestScore || 0;

            var details = [];
            if (best.accuracy != null)
              details.push("正確率 " + Math.round(best.accuracy) + "%");
            if (best.avgRT)
              details.push("平均 RT " + Math.round(best.avgRT) + "ms");
            if (best.totalStars != null) details.push("⭐ " + best.totalStars);
            if (best.gamesPlayed)
              details.push("🎮 " + best.gamesPlayed + " 場");
            localScoreDetail.textContent = details.join(" · ");

            noDataNotice.style.display = "none";
            btnUpload.disabled = false;
          } catch (e) {
            _showNoData();
          }
        }

        function _showNoData() {
          localScoreValue.textContent = "無紀錄";
          noDataNotice.style.display = "";
          btnUpload.disabled = true;
        }

        // === 上傳到世界排行榜 ===
        btnUpload.addEventListener("click", function () {
          if (!_bestEntry) return;
          btnUpload.disabled = true;
          btnUpload.textContent = "上傳中…";
          uploadStatus.textContent = "";
          uploadStatus.className = "upload-status";

          var entry = {
            nickname: _bestEntry.nickname || _bestEntry.name || "匿名",
            totalStars: _bestEntry.totalStars || _bestEntry.stars || 0,
            bestScore: _bestEntry.bestScore || 0,
            bestAccuracy: _bestEntry.accuracy || 0,
            bestAvgRT: _bestEntry.avgRT || 0,
            gamesPlayed: _bestEntry.gamesPlayed || 1,
          };

          FirestoreLeaderboard.uploadToWorld(entry)
            .then(function () {
              uploadStatus.textContent =
                "✅ 上傳成功！你的成績已加入世界排行榜";
              uploadStatus.className = "upload-status success";
              _loadWorldRanking();
            })
            .catch(function (err) {
              uploadStatus.textContent = "❌ 上傳失敗：" + err.message;
              uploadStatus.className = "upload-status error";
            })
            .finally(function () {
              btnUpload.disabled = false;
              btnUpload.textContent = "🚀 上傳到世界排行榜";
            });
        });

        // === 載入世界排行 ===
        function _loadWorldRanking() {
          FirestoreLeaderboard.getWorldLeaderboard(100)
            .then(function (entries) {
              RankingRenderer.renderStats(worldStatsContainer, entries);
              var uid = firebase.auth().currentUser
                ? firebase.auth().currentUser.uid
                : null;
              RankingRenderer.render(worldRankingContainer, entries, {
                sortBy: "bestScore",
                showAccuracy: true,
                showRT: true,
                showStars: true,
                highlightUid: uid,
                emptyText: "世界排行榜目前還沒有紀錄，成為第一個上榜的玩家吧！",
                emptyIcon: "🌐",
              });
            })
            .catch(function (err) {
              worldRankingContainer.innerHTML =
                '<div class="ranking-empty"><span class="ranking-empty__icon">⚠️</span><p>載入失敗：' +
                err.message +
                "</p></div>";
            });
        }

        // === 工具 ===
        function _toast(msg) {
          var t = document.getElementById("toast");
          t.textContent = msg;
          t.classList.add("show");
          setTimeout(function () {
            t.classList.remove("show");
          }, 2500);
        }
      })();
