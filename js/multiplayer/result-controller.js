let resultData = null;

// 初始化
window.addEventListener("DOMContentLoaded", () => {
  // 🔊 初始化音訊
  if (typeof AudioPlayer !== "undefined" && AudioPlayer.init) {
    AudioPlayer.init();
  }

  var params = new URLSearchParams(window.location.search);
  var role = params.get("role");

  if (role === "spectator") {
    loadSpectatorResults();
  } else {
    loadResults();
  }
});

// =========================================
// 觀戰者結果頁（只看排行榜）
// =========================================
function loadSpectatorResults() {
  var params = new URLSearchParams(window.location.search);
  var roomCode = params.get("room");
  if (!roomCode) {
    alert("找不到房間資訊");
    window.location.href = "../index.html";
    return;
  }

  // 修改標題
  document.querySelector(".header h1").textContent = "比賽結果";
  document.querySelector(".header p").textContent = "所有玩家的表現總覽";
  document.getElementById("celebration").textContent = "🏆";

  // 隱藏個人成績區塊（觀戰者沒有自己的成績）
  var scoreCard = document.querySelector(".score-card");
  if (scoreCard) scoreCard.style.display = "none";
  var badgesSection = document.getElementById("badgesSection");
  if (badgesSection) badgesSection.style.display = "none";
  var statsGrid = document.querySelector(".stats-grid");
  if (statsGrid) statsGrid.style.display = "none";
  var analysisSections = document.querySelectorAll(".analysis-section");
  for (var i = 0; i < analysisSections.length; i++) {
    analysisSections[i].style.display = "none";
  }

  // 隱藏上傳 / 分享按鈕
  var actions = document.querySelector(".actions");
  if (actions)
    actions.innerHTML =
      '<button class="btn btn-primary" onclick="window.location.href=\'../index.html\'">🏠 返回首頁</button>';

  // 建立排行榜容器
  var container = document.getElementById("main-content");
  var lbSection = document.createElement("div");
  lbSection.className = "analysis-section";
  lbSection.style.display = "block";
  lbSection.innerHTML =
    '<div class="section-title">🏅 玩家排行榜</div>' +
    '<div id="spectatorRanking" style="margin-top:12px;">載入中…</div>';
  // 插在 actions 前面
  var actionsEl = document.querySelector(".actions");
  if (actionsEl) {
    container.insertBefore(lbSection, actionsEl);
  } else {
    container.appendChild(lbSection);
  }

  // 從 Firebase 讀取 scores
  firebase.auth().onAuthStateChanged(function () {
    var scoresRef = firebase.database().ref("rooms/" + roomCode + "/scores");
    scoresRef.on("value", function (snapshot) {
      var scores = snapshot.val();
      var rankEl = document.getElementById("spectatorRanking");
      if (!scores) {
        rankEl.textContent = "等待玩家完成…";
        return;
      }

      var allPlayers = Object.entries(scores)
        .map(function (entry) {
          var uid = entry[0],
            data = entry[1];
          return {
            uid: uid,
            nickname: data.nickname || "玩家",
            score: data.totalScore || 0,
            accuracy: data.accuracy || 0,
            avgRT: data.avgRT || 0,
            totalCorrect: data.totalCorrect || 0,
            totalTrials: data.totalTrials || 0,
            isMe: false,
          };
        })
        .sort(function (a, b) {
          return b.score - a.score;
        });

      // 觀戰者用分指標比較呈現
      _renderSpectatorComparison(rankEl, allPlayers);
    });
  });
}

/** 觀戰者結果：重用 _renderMetricComparison 的邏輯輸出到指定容器 */
function _renderSpectatorComparison(container, players) {
  if (!players.length) {
    container.textContent = "等待玩家完成…";
    return;
  }

  var metrics = [
    { label: "總排名", icon: "🏅", key: "score", fmt: _fmtInt, dir: "desc" },
    { label: "準確率", icon: "🎯", key: "accuracy", fmt: _fmtPct, dir: "desc" },
    {
      label: "平均反應時間",
      icon: "⚡",
      key: "avgRT",
      fmt: _fmtRT,
      dir: "asc",
    },
    {
      label: "答對題數",
      icon: "✅",
      key: "totalCorrect",
      fmt: _fmtFrac,
      dir: "desc",
    },
  ];

  var html = "";
  for (var m = 0; m < metrics.length; m++) {
    var metric = metrics[m];
    var sorted = players.slice().sort(function (a, b) {
      var aVal = a[metric.key] || 0;
      var bVal = b[metric.key] || 0;
      // 無數據（0）排最後
      if (aVal === 0 && bVal === 0) return 0;
      if (aVal === 0) return 1;
      if (bVal === 0) return -1;
      return metric.dir === "asc" ? aVal - bVal : bVal - aVal;
    });

    html += '<div class="mp-metric-group">';
    html +=
      '<div class="mp-metric-title">' +
      metric.icon +
      " " +
      metric.label +
      "</div>";

    for (var p = 0; p < sorted.length; p++) {
      var player = sorted[p];
      var rank = p + 1;
      var medalStr = rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : rank + ".";

      html += '<div class="mp-player-row">';
      html += '<span class="mp-rank">' + medalStr + "</span>";
      html +=
        '<span class="mp-nickname">' + _escHtml(player.nickname) + "</span>";
      html += '<span class="mp-value">' + metric.fmt(player) + "</span>";
      html += "</div>";
    }
    html += "</div>";
  }
  container.innerHTML = html;
}

function _escHtml(s) {
  var div = document.createElement("div");
  div.textContent = s || "";
  return div.innerHTML;
}

function loadResults() {
  // 從 localStorage 獲取結果
  const savedResult = localStorage.getItem("gameResult");
  if (!savedResult) {
    alert("未找到遊戲結果");
    window.location.href = "../index.html";
    return;
  }

  resultData = JSON.parse(savedResult);

  // 寫入排行榜（P0-3 修復：排行榜資料從未被寫入）
  if (typeof LeaderboardWriter !== "undefined") {
    LeaderboardWriter.recordFromMultiplayer(resultData);
  }

  displayResults();

  // 🔊 播放結算音效
  if (typeof AudioPlayer !== "undefined" && AudioPlayer.playSfx) {
    AudioPlayer.playSfx(
      typeof getSoundFile === "function"
        ? getSoundFile("feedback.complete")
        : null,
      { synthPreset: "complete" },
    );
  }
}

function displayResults() {
  // 基本分數
  document.getElementById("finalScore").textContent = resultData.score;
  document.getElementById("accuracyValue").textContent =
    resultData.accuracy.toFixed(1) + "%";
  document.getElementById("correctValue").textContent =
    `${resultData.correctAnswers}/${resultData.totalQuestions}`;
  document.getElementById("totalTimeValue").textContent =
    (resultData.totalTime / 1000).toFixed(1) + "s";

  // 計算平均反應時間（相容 rt / reactionTime 兩種欄位）
  const validRTs = (resultData.answers || []).filter(
    (a) => (a.rt || a.reactionTime) > 0,
  );
  const avgTime =
    validRTs.length > 0
      ? validRTs.reduce((sum, a) => sum + (a.rt || a.reactionTime || 0), 0) /
        validRTs.length
      : 0;
  document.getElementById("avgTimeValue").textContent =
    (avgTime / 1000).toFixed(2) + "s";

  // 準確率進度條動畫
  setTimeout(() => {
    const bar = document.getElementById("accuracyBar");
    bar.style.width = resultData.accuracy + "%";
    bar.textContent = resultData.accuracy.toFixed(1) + "%";
  }, 300);

  // 獲得獎章
  displayBadges();

  // 場地分析
  displayStageBreakdown();

  // 慶祝動畫
  if (resultData.accuracy >= 90) {
    document.getElementById("celebration").textContent = "🏆";
  } else if (resultData.accuracy >= 70) {
    document.getElementById("celebration").textContent = "🎉";
  } else {
    document.getElementById("celebration").textContent = "💪";
  }

  // 計算排名（如果是多人模式）
  calculateRank();
}

function displayBadges() {
  const badges = [];

  // 根據表現給予獎章
  if (resultData.accuracy === 100) {
    badges.push({ text: "🎯 完美表現", class: "badge-gold" });
  } else if (resultData.accuracy >= 90) {
    badges.push({ text: "⭐ 優秀表現", class: "badge-gold" });
  } else if (resultData.accuracy >= 70) {
    badges.push({ text: "👍 良好表現", class: "badge-silver" });
  }

  // 速度獎章
  const validRTs2 = (resultData.answers || []).filter(
    (a) => (a.rt || a.reactionTime) > 0,
  );
  const avgTime =
    validRTs2.length > 0
      ? validRTs2.reduce((sum, a) => sum + (a.rt || a.reactionTime || 0), 0) /
        validRTs2.length
      : 9999;
  if (avgTime < 1000) {
    badges.push({ text: "⚡ 閃電反應", class: "badge-gold" });
  } else if (avgTime < 1500) {
    badges.push({ text: "🚀 快速反應", class: "badge-silver" });
  }

  // 完成獎章
  badges.push({ text: "✅ 挑戰完成", class: "badge-bronze" });

  // 顯示獎章
  const badgesSection = document.getElementById("badgesSection");
  if (badges.length > 0) {
    badges.forEach((badge) => {
      const span = document.createElement("span");
      span.className = `badge ${badge.class}`;
      span.textContent = badge.text;
      badgesSection.appendChild(span);
    });
  }
}

function displayStageBreakdown() {
  // 按場地分組統計
  const stageStats = {};

  (resultData.answers || []).forEach((answer) => {
    // 相容多種資料格式：stageId > fieldId > 'unknown'
    var key = answer.stageId || answer.context || "game";
    if (!stageStats[key]) {
      stageStats[key] = {
        total: 0,
        correct: 0,
      };
    }
    stageStats[key].total++;
    if (answer.isCorrect) {
      stageStats[key].correct++;
    }
  });

  // 場地資訊對應
  const stageInfo = {
    A: { name: "場地A：起司森林", icon: "🧀" },
    B: { name: "場地B：人類村莊", icon: "🧑" },
    C: { name: "場地C：海洋世界", icon: "🐟" },
    D: { name: "場地D：晝夜迷宮", icon: "🌙" },
    E: { name: "場地E：轉換星球", icon: "🔄" },
    F: { name: "場地F：耐力賽道", icon: "💪" },
    G: { name: "場地G：極速挑戰", icon: "⚡" },
    H: { name: "場地H：大師考驗", icon: "👑" },
  };

  const breakdown = document.getElementById("stageBreakdown");
  breakdown.innerHTML = "";

  Object.entries(stageStats).forEach(([stageId, stats]) => {
    const info = stageInfo[stageId] || {
      name: `場地 ${stageId}`,
      icon: "🎯",
    };
    const accuracy = ((stats.correct / stats.total) * 100).toFixed(1);

    const item = document.createElement("div");
    item.className = "stage-item";
    item.innerHTML = `
      <div class="stage-icon-box">${info.icon}</div>
      <div class="stage-details">
        <div class="stage-name">${info.name}</div>
        <div class="stage-progress">
          <div class="mini-bar">
            <div class="mini-bar-fill" style="width: ${accuracy}%"></div>
          </div>
          <span>${accuracy}%</span>
        </div>
      </div>
      <div class="stage-stats">
        ${stats.correct}/${stats.total} 正確
      </div>
    `;
    breakdown.appendChild(item);
  });
}

async function calculateRank() {
  // 檢查是否啟用最終排名
  var showRanking = localStorage.getItem("mp_showFinalRanking");
  if (showRanking === "0") {
    document.getElementById("rankInfo").textContent = "多人模式";
    return;
  }

  // 如果是多人模式，從 Firebase 即時監聽其他玩家成績
  var roomData = localStorage.getItem("currentRoom");
  var urlRoom = new URLSearchParams(window.location.search).get("room");

  if (!roomData && !urlRoom) {
    document.getElementById("rankInfo").textContent = "單人模式";
    return;
  }

  var roomCode = urlRoom;
  if (!roomCode && roomData) {
    try {
      var room = JSON.parse(roomData);
      roomCode = room.code || room.roomCode;
    } catch (e) {}
  }
  if (!roomCode) {
    document.getElementById("rankInfo").textContent = "單人模式";
    return;
  }

  var rankEl = document.getElementById("rankInfo");
  rankEl.textContent = "等待其他玩家完成…";

  var scoresRef = firebase.database().ref("rooms/" + roomCode + "/scores");

  // 即時監聽
  scoresRef.on("value", function (snapshot) {
    var results = snapshot.val();
    if (!results) {
      rankEl.textContent = "等待其他玩家完成…";
      return;
    }

    var myId =
      resultData.playerId ||
      (firebase.auth().currentUser && firebase.auth().currentUser.uid);

    // 組裝所有玩家資料
    var allPlayers = Object.entries(results)
      .map(function (entry) {
        var uid = entry[0],
          d = entry[1];
        return {
          uid: uid,
          nickname: d.nickname || "玩家",
          score: d.totalScore || 0,
          accuracy: d.accuracy || 0,
          avgRT: d.avgRT || 0,
          totalCorrect: d.totalCorrect || 0,
          totalTrials: d.totalTrials || 0,
          isMe: uid === myId,
        };
      })
      .sort(function (a, b) {
        return b.score - a.score;
      });

    // 更新分數卡片排名
    var myRank = 0;
    for (var i = 0; i < allPlayers.length; i++) {
      if (allPlayers[i].isMe) {
        myRank = i + 1;
        break;
      }
    }
    var medals = ["🥇", "🥈", "🥉"];
    if (myRank > 0 && myRank <= 3) {
      rankEl.textContent =
        medals[myRank - 1] +
        " 第 " +
        myRank +
        " 名 / " +
        allPlayers.length +
        " 人";
    } else if (myRank > 0) {
      rankEl.textContent =
        "第 " + myRank + " 名 / " + allPlayers.length + " 人";
    } else {
      rankEl.textContent = "計算中… (" + allPlayers.length + " 人已完成)";
    }

    // 建立分指標比較區塊
    _renderMetricComparison(allPlayers);
  });
}

/** 按指標分組比較所有玩家 */
function _renderMetricComparison(players) {
  var section = document.getElementById("mpRankingSection");
  var container = document.getElementById("mpRankingContent");
  if (!section || !container) return;

  if (players.length < 2) {
    section.style.display = "none";
    return;
  }
  section.style.display = "";

  // 指標定義：label, icon, key, formatter, sortDir(desc/asc), unit
  var metrics = [
    {
      label: "總排名",
      icon: "🏅",
      key: "score",
      fmt: _fmtInt,
      dir: "desc",
      unit: " 分",
    },
    {
      label: "準確率",
      icon: "🎯",
      key: "accuracy",
      fmt: _fmtPct,
      dir: "desc",
      unit: "%",
    },
    {
      label: "平均反應時間",
      icon: "⚡",
      key: "avgRT",
      fmt: _fmtRT,
      dir: "asc",
      unit: "",
    },
    {
      label: "答對題數",
      icon: "✅",
      key: "totalCorrect",
      fmt: _fmtFrac,
      dir: "desc",
      unit: "",
    },
  ];

  var html = "";

  for (var m = 0; m < metrics.length; m++) {
    var metric = metrics[m];

    // 排序（依指標）：無數據（0）排最後
    var sorted = players.slice().sort(function (a, b) {
      var aVal = a[metric.key] || 0;
      var bVal = b[metric.key] || 0;
      if (aVal === 0 && bVal === 0) return 0;
      if (aVal === 0) return 1;
      if (bVal === 0) return -1;
      return metric.dir === "asc" ? aVal - bVal : bVal - aVal;
    });

    html += '<div class="mp-metric-group">';
    html +=
      '<div class="mp-metric-title">' +
      metric.icon +
      " " +
      metric.label +
      "</div>";

    for (var p = 0; p < sorted.length; p++) {
      var player = sorted[p];
      var rank = p + 1;
      var medalStr = rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : rank + ".";
      var meClass = player.isMe ? " mp-row-me" : "";
      var value = metric.fmt(player);

      html += '<div class="mp-player-row' + meClass + '">';
      html += '<span class="mp-rank">' + medalStr + "</span>";
      html +=
        '<span class="mp-nickname">' +
        _escHtml(player.nickname) +
        (player.isMe ? " (你)" : "") +
        "</span>";
      html += '<span class="mp-value">' + value + "</span>";
      html += "</div>";
    }

    html += "</div>";
  }

  container.innerHTML = html;
}

function _fmtInt(p) {
  return p.score;
}
function _fmtPct(p) {
  return p.accuracy.toFixed(1) + "%";
}
function _fmtRT(p) {
  return p.avgRT > 0 ? (p.avgRT / 1000).toFixed(2) + "s" : "—";
}
function _fmtFrac(p) {
  return p.totalCorrect + "/" + p.totalTrials;
}

function shareResult() {
  const shareText = `我在執行功能遊戲中獲得了 ${resultData.score} 分！準確率 ${resultData.accuracy.toFixed(1)}%！快來挑戰看看！`;

  if (navigator.share) {
    navigator
      .share({
        title: "執行功能遊戲 - 我的成績",
        text: shareText,
      })
      .catch(() => {
        // 分享失敗，改用複製
        copyToClipboard(shareText);
      });
  } else {
    copyToClipboard(shareText);
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert("成績已複製到剪貼簿！");
  });
}

function playAgain() {
  // 清除遊戲記錄
  localStorage.removeItem("gameResult");

  // 返回首頁
  window.location.href = "../index.html";
}

// === 上傳至班級排行榜 ===
(function () {
  var btn = document.getElementById("btnUploadClass");
  var codeRow = document.getElementById("uploadCodeRow");
  var codeInput = document.getElementById("uploadCodeInput");
  var codeSubmit = document.getElementById("uploadCodeSubmit");
  var statusMsg = document.getElementById("uploadStatusMsg");
  if (!btn) return;

  btn.addEventListener("click", function () {
    codeRow.style.display = codeRow.style.display === "none" ? "flex" : "none";
    if (codeRow.style.display === "flex") codeInput.focus();
  });
  codeSubmit.addEventListener("click", doUpload);
  codeInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") doUpload();
  });

  function doUpload() {
    var code = codeInput.value.trim().toUpperCase();
    if (!code || code.length < 4) {
      codeInput.style.borderColor = "#e74c3c";
      codeInput.focus();
      return;
    }
    if (typeof FirestoreLeaderboard === "undefined") {
      statusMsg.textContent = "❌ 上傳模組未載入";
      statusMsg.style.color = "#e74c3c";
      return;
    }
    codeSubmit.disabled = true;
    codeSubmit.textContent = "上傳中…";
    statusMsg.textContent = "";
    statusMsg.style.color = "";

    var authP = firebase.auth().currentUser
      ? Promise.resolve()
      : firebase.auth().signInAnonymously();
    authP
      .then(function () {
        return FirestoreLeaderboard.findBoardByCode(code);
      })
      .then(function (board) {
        if (!board) throw new Error("找不到此代碼對應的看板");
        var d = resultData || {};
        var entry = {
          nickname: d.playerName || d.nickname || "玩家",
          score: d.score || 0,
          accuracy: d.accuracy || 0,
          avgRT: d.avgRT || 0,
          stars: 0,
          level: "",
          mode: "multiplayer",
        };
        return FirestoreLeaderboard.uploadToClassBoard(board.boardId, entry);
      })
      .then(function () {
        statusMsg.textContent = "✅ 上傳成功！";
        statusMsg.style.color = "#4caf50";
      })
      .catch(function (err) {
        statusMsg.textContent = "❌ " + err.message;
        statusMsg.style.color = "#e74c3c";
      })
      .finally(function () {
        codeSubmit.disabled = false;
        codeSubmit.textContent = "上傳";
      });
  }
})();

// === 上傳至世界排行榜 ===
(function () {
  var btn = document.getElementById("btnUploadWorld");
  var notice = document.getElementById("worldUploadNotice");
  var statusMsg = document.getElementById("worldUploadStatus");
  if (!btn) return;

  btn.addEventListener("click", function () {
    // 點擊後隱藏原按鈕，顯示確認列（取消 + 上傳）
    btn.style.display = "none";
    notice.style.display = "block";
    // 動態建立確認列
    if (!document.getElementById("worldUploadConfirmRow")) {
      var row = document.createElement("div");
      row.id = "worldUploadConfirmRow";
      row.style.cssText = "display:flex;gap:10px;width:100%;margin-top:8px;";
      var cancelBtn = document.createElement("button");
      cancelBtn.className = "btn";
      cancelBtn.style.cssText =
        "flex:1;background:rgba(255,255,255,0.1);color:#aaa;border:1px solid rgba(255,255,255,0.15);padding:0.6rem;border-radius:10px;font-size:0.95rem;cursor:pointer;";
      cancelBtn.textContent = "取消";
      cancelBtn.addEventListener("click", function () {
        row.style.display = "none";
        notice.style.display = "none";
        btn.style.display = "";
      });
      var confirmBtn = document.createElement("button");
      confirmBtn.className = "btn";
      confirmBtn.style.cssText =
        "flex:1;background:linear-gradient(135deg,#00c9ff,#92fe9d);color:#1a1a2e;font-weight:700;padding:0.6rem;border:none;border-radius:10px;font-size:0.95rem;cursor:pointer;";
      confirmBtn.textContent = "上傳";
      confirmBtn.addEventListener("click", function () {
        // 真正上傳
        if (typeof FirestoreLeaderboard === "undefined") {
          statusMsg.textContent = "❌ 上傳模組未載入";
          statusMsg.style.color = "#e74c3c";
          return;
        }
        confirmBtn.disabled = true;
        confirmBtn.textContent = "上傳中…";
        statusMsg.textContent = "";
        statusMsg.style.color = "";

        var authP = firebase.auth().currentUser
          ? Promise.resolve()
          : firebase.auth().signInAnonymously();
        authP
          .then(function () {
            var d = resultData || {};
            // 計算平均 RT
            var validRTs = (d.answers || []).filter(function (a) {
              return (a.rt || a.reactionTime) > 0;
            });
            var avgRT =
              validRTs.length > 0
                ? validRTs.reduce(function (sum, a) {
                    return sum + (a.rt || a.reactionTime || 0);
                  }, 0) / validRTs.length
                : 0;
            var worldData = {
              nickname: d.playerName || d.nickname || "玩家",
              bestScore: d.score || 0,
              bestAccuracy: Math.round(d.accuracy || 0),
              bestAvgRT: Math.round(avgRT),
              totalCorrect: d.correctAnswers || 0,
              totalTrials: d.totalQuestions || 0,
              mode: "multiplayer",
              totalStars: 0,
              level: "",
              gamesPlayed: 1,
            };
            return FirestoreLeaderboard.uploadToWorld(worldData);
          })
          .then(function () {
            // 上傳成功後查詢世界排名
            return FirestoreLeaderboard.getWorldLeaderboard(200);
          })
          .then(function (entries) {
            var myUid = firebase.auth().currentUser
              ? firebase.auth().currentUser.uid
              : null;
            var myRank = 0;
            var total = entries.length;
            for (var ri = 0; ri < entries.length; ri++) {
              if (entries[ri].docId === myUid) {
                myRank = ri + 1;
                break;
              }
            }
            var rankText =
              myRank > 0
                ? "🌐 世界第 " + myRank + " 名 / " + total + " 人"
                : "✅ 已上傳至世界排行榜！";

            var d = resultData || {};
            var validRTs2 = (d.answers || []).filter(function (a) {
              return (a.rt || a.reactionTime) > 0;
            });
            var avgRT2 =
              validRTs2.length > 0
                ? validRTs2.reduce(function (s, a) {
                    return s + (a.rt || a.reactionTime || 0);
                  }, 0) / validRTs2.length
                : 0;

            statusMsg.innerHTML =
              '<div style="text-align:center;line-height:1.8;">' +
              '<div style="font-size:1.1rem;font-weight:700;color:#4caf50;margin-bottom:4px;">' +
              rankText +
              "</div>" +
              '<div style="font-size:0.85rem;color:#ccc;">' +
              "🎯 準確率 " +
              Math.round(d.accuracy || 0) +
              "% · " +
              "⚡ 平均 RT " +
              (avgRT2 > 0 ? (avgRT2 / 1000).toFixed(2) + "s" : "—") +
              " · " +
              "✅ 答對 " +
              (d.correctAnswers || 0) +
              "/" +
              (d.totalQuestions || 0) +
              " · " +
              "🏷️ 競賽模式" +
              "</div></div>";
            statusMsg.style.color = "";

            row.style.display = "none";
            notice.style.display = "none";
            btn.style.display = "";
            btn.textContent = "🌐 已上傳";
            btn.disabled = true;
            btn.style.opacity = "0.6";
          })
          .catch(function (err) {
            statusMsg.textContent = "❌ " + err.message;
            statusMsg.style.color = "#e74c3c";
            confirmBtn.disabled = false;
            confirmBtn.textContent = "上傳";
          });
      });
      row.appendChild(cancelBtn);
      row.appendChild(confirmBtn);
      notice.parentNode.insertBefore(row, notice.nextSibling);
    }
  });
})();
