(function () {
  "use strict";

  // DOM
  var localNickname = document.getElementById("localNickname");
  var localScoreValue = document.getElementById("localScoreValue");
  var localScoreDetail = document.getElementById("localScoreDetail");
  var noDataNotice = document.getElementById("noDataNotice");
  var btnUpload = document.getElementById("btnUpload");
  var uploadStatus = document.getElementById("uploadStatus");
  var worldRankingContainer = document.getElementById("worldRankingContainer");
  var worldStatsContainer = document.getElementById("worldStatsContainer");
  var ruleTabs = document.getElementById("ruleTabs");

  var _bestEntry = null; // 快取找到的最佳紀錄
  var _allEntries = []; // 快取全部世界排行資料
  var _currentRule = "all"; // 當前篩選規則
  var GUEST_NICKNAME = "00NoName";

  // ─── 分頁按鈕 ───
  if (ruleTabs) {
    ruleTabs.addEventListener("click", function (e) {
      var tab = e.target.closest(".rule-tab");
      if (!tab) return;
      var rule = tab.dataset.rule;
      if (rule === _currentRule) return;

      _currentRule = rule;

      // 更新 active 狀態
      ruleTabs.querySelectorAll(".rule-tab").forEach(function (t) {
        var isActive = t.dataset.rule === rule;
        t.classList.toggle("active", isActive);
        t.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      // 用快取資料重新渲染
      _renderFiltered(_allEntries);
    });
  }

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
      if (best.avgRT) details.push("平均 RT " + Math.round(best.avgRT) + "ms");
      if (best.totalStars != null) details.push("⭐ " + best.totalStars);
      if (best.gamesPlayed) details.push("🎮 " + best.gamesPlayed + " 場");
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
      totalCorrect: _bestEntry.totalCorrect || _bestEntry.bestScore || 0,
      totalTrials: _bestEntry.totalTrials || 0,
      mode: _bestEntry.mode || "adventure",
      gamesPlayed: _bestEntry.gamesPlayed || 1,
      fieldId: _bestEntry.fieldId || "",
      ruleId: _bestEntry.ruleId || "",
    };

    FirestoreLeaderboard.uploadToWorld(entry)
      .then(function () {
        // 上傳成功後查詢世界排名
        return FirestoreLeaderboard.getWorldLeaderboard(200);
      })
      .then(function (entries) {
        _allEntries = entries;
        var myUid = firebase.auth().currentUser
          ? firebase.auth().currentUser.uid
          : null;
        var myRank = 0;
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].uid === myUid || entries[i].docId === myUid) {
            myRank = i + 1;
            break;
          }
        }
        var rankText =
          myRank > 0
            ? "🌐 世界第 " + myRank + " 名 / " + entries.length + " 人"
            : "✅ 上傳成功！";

        var b = _bestEntry;
        uploadStatus.innerHTML =
          '<div style="text-align:center;line-height:1.8;">' +
          '<div style="font-size:1.1rem;font-weight:700;color:#4caf50;margin-bottom:4px;">' +
          rankText +
          "</div>" +
          '<div style="font-size:0.85rem;color:#ccc;">' +
          "🎯 " +
          Math.round(b.accuracy || 0) +
          "% · " +
          "⚡ " +
          (b.avgRT ? Math.round(b.avgRT) + "ms" : "—") +
          " · " +
          "✅ " +
          (b.totalCorrect || b.bestScore || 0) +
          "/" +
          (b.totalTrials || "—") +
          "</div></div>";
        uploadStatus.className = "upload-status success";
        _renderFiltered(entries);
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
    FirestoreLeaderboard.getWorldLeaderboard(200)
      .then(function (entries) {
        _allEntries = entries;
        _renderFiltered(entries);
      })
      .catch(function (err) {
        worldRankingContainer.innerHTML =
          '<div class="ranking-empty"><span class="ranking-empty__icon">⚠️</span><p>載入失敗：' +
          err.message +
          "</p></div>";
      });
  }

  // === 依規則篩選並渲染 ===
  function _renderFiltered(entries) {
    var filtered = entries;
    if (_currentRule !== "all") {
      filtered = entries.filter(function (e) {
        return e.ruleId === _currentRule;
      });
    }

    RankingRenderer.renderStats(worldStatsContainer, filtered);
    var uid = firebase.auth().currentUser
      ? firebase.auth().currentUser.uid
      : null;

    // 準備遊戲場/規則名稱對照
    var ruleLabel = {
      rule1: "規則一",
      rule2: "規則二",
      mixed: "混合規則",
    };

    // 在每筆資料加上可讀規則標籤（用於 showMode 顯示）
    var displayEntries = filtered.map(function (e) {
      var copy = {};
      for (var k in e) copy[k] = e[k];
      if (e.fieldId || e.ruleId) {
        var fName = e.fieldId || "";
        var rName = ruleLabel[e.ruleId] || e.ruleId || "";
        copy.mode = fName + (rName ? " · " + rName : "");
      }
      return copy;
    });

    RankingRenderer.render(worldRankingContainer, displayEntries, {
      sortBy: "bestScore",
      showAccuracy: true,
      showRT: true,
      showCorrect: true,
      showMode: true,
      showStars: true,
      highlightUid: uid,
      emptyText:
        _currentRule === "all"
          ? "世界排行榜目前還沒有紀錄，成為第一個上榜的玩家吧！"
          : "此規則目前尚無排行紀錄",
      emptyIcon: "🌐",
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
