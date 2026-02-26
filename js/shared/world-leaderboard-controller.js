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
  var fieldTabs = document.getElementById("fieldTabs");

  var _latestEntry = null; // 快取找到的最新紀錄
  var _allEntries = []; // 快取全部世界排行資料
  var _currentRule = "all"; // 當前篩選規則
  var _currentField = "all"; // 當前篩選遊戲場
  var GUEST_NICKNAME = "00NoName";

  // 遊戲場名稱對照
  var FIELD_LABELS = { mouse: "小老鼠", fishing: "釣魚" };
  var RULE_LABELS = { rule1: "規則一", rule2: "規則二", mixed: "混合規則" };

  // ─── 遊戲場分頁按鈕 ───
  if (fieldTabs) {
    fieldTabs.addEventListener("click", function (e) {
      var tab = e.target.closest(".field-tab");
      if (!tab) return;
      var field = tab.dataset.field;
      if (field === _currentField) return;

      _currentField = field;
      fieldTabs.querySelectorAll(".field-tab").forEach(function (t) {
        var isActive = t.dataset.field === field;
        t.classList.toggle("active", isActive);
        t.setAttribute("aria-selected", isActive ? "true" : "false");
      });
      _renderFiltered(_allEntries);
    });
  }

  // ─── 規則分頁按鈕 ───
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
          Logger.error("匿名登入失敗", err);
        });
      return;
    }
    _loadLocalScore();
    _loadWorldRanking();
  });

  // === 讀取本地成績（最新一場）===
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

      // 找有 latestGame 的紀錄中最新的
      var withLatest = data.filter(function (e) {
        return e.latestGame && (e.nickname || e.name || e.latestGame);
      });

      var entry = null;
      if (withLatest.length > 0) {
        // 按 latestGame.playedAt 排序，取最新
        entry = withLatest.reduce(function (a, b) {
          var aTime =
            a.latestGame && a.latestGame.playedAt
              ? new Date(a.latestGame.playedAt).getTime()
              : 0;
          var bTime =
            b.latestGame && b.latestGame.playedAt
              ? new Date(b.latestGame.playedAt).getTime()
              : 0;
          return bTime > aTime ? b : a;
        }, withLatest[0]);
      } else {
        // Fallback: 找 lastPlayed 最新的
        var validEntries = data.filter(function (e) {
          return e.nickname || e.name;
        });
        if (validEntries.length === 0) {
          _showNoData();
          return;
        }
        entry = validEntries.reduce(function (a, b) {
          var aTime = a.lastPlayed ? new Date(a.lastPlayed).getTime() : 0;
          var bTime = b.lastPlayed ? new Date(b.lastPlayed).getTime() : 0;
          return bTime > aTime ? b : a;
        }, validEntries[0]);
      }

      _latestEntry = entry;
      var latest = entry.latestGame || {};

      localNickname.textContent =
        "🏷️ " + (entry.nickname || entry.name || "匿名");
      localScoreValue.textContent =
        latest.score != null ? latest.score : entry.bestScore || 0;

      var details = [];
      var fieldLabel = FIELD_LABELS[latest.fieldId] || latest.fieldId || "";
      var ruleLabel = RULE_LABELS[latest.ruleId] || latest.ruleId || "";
      if (fieldLabel || ruleLabel) details.push(fieldLabel + " · " + ruleLabel);
      var acc = latest.accuracy != null ? latest.accuracy : entry.accuracy;
      if (acc != null) details.push("正確率 " + Math.round(acc) + "%");
      if (latest.avgRT)
        details.push("平均 RT " + Math.round(latest.avgRT) + "ms");
      if (latest.totalStars) details.push("⭐ " + latest.totalStars);
      if (latest.hasWM) details.push("🧠 WM");
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
    if (!_latestEntry) return;
    btnUpload.disabled = true;
    btnUpload.textContent = "上傳中…";
    uploadStatus.textContent = "";
    uploadStatus.className = "upload-status";

    var latest = _latestEntry.latestGame || {};
    var entry = {
      nickname: _latestEntry.nickname || _latestEntry.name || "匿名",
      totalStars: latest.totalStars || 0,
      bestScore:
        latest.score != null ? latest.score : _latestEntry.bestScore || 0,
      bestAccuracy:
        latest.accuracy != null ? latest.accuracy : _latestEntry.accuracy || 0,
      bestAvgRT: latest.avgRT || 0,
      totalCorrect: latest.totalCorrect || latest.score || 0,
      totalTrials: latest.totalTrials || 0,
      mode: latest.mode || "adventure",
      gamesPlayed: _latestEntry.gamesPlayed || 1,
      fieldId: latest.fieldId || "",
      ruleId: latest.ruleId || "",
      hasWM: latest.hasWM || false,
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

        uploadStatus.innerHTML =
          '<div style="text-align:center;line-height:1.8;">' +
          '<div style="font-size:1.1rem;font-weight:700;color:#4caf50;margin-bottom:4px;">' +
          rankText +
          "</div>" +
          '<div style="font-size:0.85rem;color:#ccc;">' +
          "🎯 " +
          Math.round(entry.bestAccuracy || 0) +
          "% · " +
          "⚡ " +
          (entry.bestAvgRT ? Math.round(entry.bestAvgRT) + "ms" : "—") +
          " · " +
          "✅ " +
          (entry.totalCorrect || 0) +
          "/" +
          (entry.totalTrials || "—") +
          (entry.hasWM ? " · 🧠 WM" : "") +
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

  // === 依遊戲場+規則篩選並渲染 ===
  function _renderFiltered(entries) {
    var filtered = entries;

    // 遊戲場篩選
    if (_currentField !== "all") {
      filtered = filtered.filter(function (e) {
        return e.fieldId === _currentField;
      });
    }

    // 規則篩選
    if (_currentRule !== "all") {
      filtered = filtered.filter(function (e) {
        return e.ruleId === _currentRule;
      });
    }

    RankingRenderer.renderStats(worldStatsContainer, filtered);
    var uid = firebase.auth().currentUser
      ? firebase.auth().currentUser.uid
      : null;

    // 在每筆資料加上可讀標籤
    var displayEntries = filtered.map(function (e) {
      var copy = {};
      for (var k in e) copy[k] = e[k];
      var fName = FIELD_LABELS[e.fieldId] || e.fieldId || "";
      var rName = RULE_LABELS[e.ruleId] || e.ruleId || "";
      copy.mode = fName + (rName ? " · " + rName : "");
      // WM 標示
      copy._hasWM = e.hasWM || false;
      return copy;
    });

    RankingRenderer.render(worldRankingContainer, displayEntries, {
      sortBy: "bestScore",
      showAccuracy: true,
      showRT: true,
      showCorrect: true,
      showMode: true,
      showStars: true,
      showGameEndTime: true,
      highlightUid: uid,
      emptyText:
        _currentField === "all" && _currentRule === "all"
          ? "世界排行榜目前還沒有紀錄，成為第一個上榜的玩家吧！"
          : "此篩選條件尚無排行紀錄",
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
