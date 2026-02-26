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
    GameModal.alert("找不到房間", "找不到房間資訊", { icon: "❌" }).then(
      function () {
        window.location.href = "../index.html";
      },
    );
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
    GameModal.alert("無結果", "未找到遊戲結果", { icon: "❌" }).then(
      function () {
        window.location.href = "../index.html";
      },
    );
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

  // 計算平均反應時間（相容 rt / reactionTime 兩種欄位，fallback 到已存 avgRT）
  const validRTs = (resultData.answers || []).filter(
    (a) => (a.rt || a.reactionTime) > 0,
  );
  const avgTime =
    validRTs.length > 0
      ? validRTs.reduce((sum, a) => sum + (a.rt || a.reactionTime || 0), 0) /
        validRTs.length
      : resultData.avgRT || 0;
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

  // SDT 信號偵測理論
  displaySDT();

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

function displaySDT() {
  var section = document.getElementById("sdtSection");
  var container = document.getElementById("sdtContent");
  if (!section || !container) return;

  // 確認 CsvReport 可用
  if (typeof CsvReport === "undefined" || !CsvReport.calculateSDT) return;

  var answers = resultData.answers || [];
  if (answers.length === 0) return;

  var sdt = CsvReport.calculateSDT(answers);
  if (!sdt || sdt.dPrime == null) return;

  // d' 解讀
  var dClass = "";
  var dNote = "";
  if (sdt.dPrime >= 2.0) {
    dClass = "stat-value--good";
    dNote = "優秀的辨別力！";
  } else if (sdt.dPrime >= 1.0) {
    dClass = "";
    dNote = "不錯的辨別力";
  } else {
    dClass = "stat-value--bad";
    dNote = "還需加強辨別力";
  }

  // c 解讀
  var cNote = "";
  if (sdt.criterion > 0.3) {
    cNote = "偏保守（傾向不按）";
  } else if (sdt.criterion < -0.3) {
    cNote = "偏冒險（傾向按）";
  } else {
    cNote = "策略平衡";
  }

  var html = '<div class="sdt-card" style="padding:16px;">';

  // 核心指標 grid
  html += '<div class="stat-grid">';
  html += _sdtStatItem(sdt.dPrime.toFixed(2), "d\u2032 敏感度", dClass);
  html += _sdtStatItem(sdt.criterion.toFixed(2), "c 反應偏向", "");
  html += _sdtStatItem(sdt.beta.toFixed(2), "\u03B2 決策權重", "");
  html += _sdtStatItem(
    Math.round(sdt.hitRate * 100) + "%",
    "Hit Rate 命中率",
    sdt.hitRate >= 0.8 ? "stat-value--good" : "",
  );
  html += "</div>";

  // 計數 pills
  html += '<div class="sdt-detail-row">';
  html +=
    '<span class="sdt-count sdt-hit">Hit ' +
    sdt.hits +
    "</span>" +
    '<span class="sdt-count sdt-miss">Miss ' +
    sdt.misses +
    "</span>" +
    '<span class="sdt-count sdt-fa">FA ' +
    sdt.fa +
    "</span>" +
    '<span class="sdt-count sdt-cr">CR ' +
    sdt.cr +
    "</span>";
  html += "</div>";

  // 解讀
  html += '<div class="sdt-notes">';
  html += "<div>" + dNote + "</div>";
  html += "<div>" + cNote + "</div>";
  html += "</div>";

  html += "</div>";

  container.innerHTML = html;
  section.style.display = "";
}

function _sdtStatItem(value, label, extraClass) {
  return (
    '<div class="stat-item" style="text-align:center;">' +
    '<div class="stat-value ' +
    (extraClass || "") +
    '" style="font-size:1.5rem;font-weight:700;">' +
    value +
    "</div>" +
    '<div class="stat-label" style="font-size:0.75rem;color:#aaa;margin-top:2px;">' +
    label +
    "</div></div>"
  );
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

  // 場地資訊從 ComboSelector 共用模組取得
  const getStageDisplay = function (stageId) {
    if (typeof ComboSelector !== "undefined") {
      return ComboSelector.getDisplayInfo(stageId);
    }
    return { name: "場地 " + stageId, icon: "🎮" };
  };

  const breakdown = document.getElementById("stageBreakdown");
  breakdown.innerHTML = "";

  Object.entries(stageStats).forEach(([stageId, stats]) => {
    const info = getStageDisplay(stageId);
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
    } catch (e) {
      Logger.warn("[MP-Result] roomData parse failed:", e);
    }
  }
  if (!roomCode) {
    document.getElementById("rankInfo").textContent = "單人模式";
    return;
  }

  var rankEl = document.getElementById("rankInfo");
  rankEl.textContent = "等待其他玩家完成…";

  // 接力模式：顯示團隊排名
  _loadRelayTeamRanking(roomCode);

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

// =========================================
// 接力賽團隊排名
// =========================================

function _loadRelayTeamRanking(roomCode) {
  var section = document.getElementById("relayResultSection");
  var container = document.getElementById("relayTeamRanking");
  if (!section || !container) return;

  var roomRef = firebase.database().ref("rooms/" + roomCode);
  roomRef.once("value").then(function (snapshot) {
    var roomData = snapshot.val();
    if (
      !roomData ||
      (roomData.gameMode !== "relay" && roomData.gameMode !== "team")
    )
      return;

    var teams = roomData.teams || {};
    var scores = roomData.scores || {};
    var myUid = firebase.auth().currentUser
      ? firebase.auth().currentUser.uid
      : null;

    // 組裝隊伍排名資料
    var teamList = [];

    for (var teamId in teams) {
      if (!teams.hasOwnProperty(teamId)) continue;
      var team = teams[teamId];
      var members = team.members || {};
      var order = team.order || Object.keys(members);
      // 使用 Firebase 中存儲的隊名/顏色/emoji，自帶 fallback
      var preset = {
        name: team.name || teamId,
        emoji: team.emoji || "⚪",
        color: team.color || "#999",
      };

      var totalScore = 0;
      var memberDetails = [];
      var maxScore = 0;
      var mvpUid = null;

      order.forEach(function (uid) {
        var ps = scores[uid] || {};
        var memberScore = ps.totalScore || 0;
        totalScore += memberScore;
        memberDetails.push({
          uid: uid,
          nickname:
            ps.nickname ||
            (members[uid] && members[uid].nickname) ||
            uid.slice(0, 6),
          score: memberScore,
          accuracy: ps.accuracy || 0,
          isMe: uid === myUid,
        });
        if (memberScore > maxScore) {
          maxScore = memberScore;
          mvpUid = uid;
        }
      });

      teamList.push({
        teamId: teamId,
        name: preset.name,
        emoji: preset.emoji,
        color: preset.color,
        totalScore: totalScore,
        members: memberDetails,
        mvpUid: mvpUid,
      });
    }

    // 按總分排名
    teamList.sort(function (a, b) {
      return b.totalScore - a.totalScore;
    });

    if (teamList.length === 0) return;

    section.style.display = "";
    var html = "";

    teamList.forEach(function (team, rank) {
      var medals = ["🥇", "🥈", "🥉"];
      var medal = rank < 3 ? medals[rank] : "#" + (rank + 1);

      html +=
        '<div class="team-rank-card" style="border-left:4px solid ' +
        team.color +
        '">' +
        '<div class="team-rank-header">' +
        '<span class="team-rank-medal">' +
        medal +
        "</span>" +
        '<span class="team-rank-name">' +
        team.emoji +
        " " +
        team.name +
        "</span>" +
        '<span class="team-rank-score">' +
        team.totalScore +
        " 分</span>" +
        "</div>" +
        '<div class="team-rank-members">';

      var maxMemberScore = Math.max.apply(
        null,
        team.members.map(function (m) {
          return m.score;
        }),
      );

      team.members.forEach(function (m) {
        var pct =
          maxMemberScore > 0 ? Math.round((m.score / maxMemberScore) * 100) : 0;
        var isMvp = m.uid === team.mvpUid;
        html +=
          '<div class="member-contribution' +
          (m.isMe ? " is-me" : "") +
          '">' +
          '<span class="member-name">' +
          _escHtml(m.nickname) +
          (isMvp ? ' <span class="mvp-badge">MVP</span>' : "") +
          "</span>" +
          '<div class="contribution-bar-track">' +
          '<div class="contribution-bar-fill" style="width:' +
          pct +
          "%;background:" +
          team.color +
          '"></div>' +
          "</div>" +
          '<span class="member-score">' +
          m.score +
          "</span>" +
          "</div>";
      });

      html += "</div></div>";
    });

    container.innerHTML = html;
  });
}



function playAgain() {
  // 清除遊戲記錄
  localStorage.removeItem("gameResult");

  // 嘗試清理 Firebase 房間（遊戲已結束，房間不再需要）
  try {
    var params = new URLSearchParams(window.location.search);
    var roomCode = params.get("room");
    if (roomCode && typeof firebase !== "undefined") {
      var user = firebase.auth().currentUser;
      if (user) {
        var roomRef = firebase.database().ref("rooms/" + roomCode);
        roomRef.child("hostId").once("value").then(function (snap) {
          if (snap.val() === user.uid) {
            // 房主：直接刪除房間
            roomRef.remove().then(function () {
              console.log("🗑️ 遊戲結束，房間已清理:", roomCode);
            });
          }
        }).catch(function () { /* 忽略錯誤，不影響導航 */ });
      }
    }
  } catch (e) { /* 靜默失敗 */ }

  // 返回首頁
  window.location.href = "../index.html";
}

/**
 * 匯出多人模式 CSV 報告
 */
function exportMultiplayerCsv() {
  var trials = (resultData && (resultData.trialDetails || resultData.answers)) || [];
  if (trials.length === 0) {
    GameModal.alert("⚠️ 無資料", "此次遊戲沒有可匯出的試驗資料。", {
      icon: "⚠️",
    });
    return;
  }
  if (
    typeof CsvReport !== "undefined" &&
    CsvReport.exportCsv &&
    CsvReport.convertTrialsToCsvData
  ) {
    var nick = resultData.nickname || resultData.playerName || "player";
    var csvRows = CsvReport.convertTrialsToCsvData(trials, nick);
    if (csvRows && csvRows.length > 0) {
      var parsedData = CsvReport.parseRawData(csvRows);
      var safeNick = nick.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, "_");
      CsvReport.exportCsv(parsedData, "EFGame_MP_" + safeNick + ".csv");
    } else {
      GameModal.alert("⚠️ 無資料", "試驗資料轉換失敗，無法匯出。", {
        icon: "⚠️",
      });
    }
  } else {
    GameModal.alert("⚠️ 模組未載入", "CSV 報告模組未載入。", { icon: "⚠️" });
  }
}

// === 分析報告 toggle + PDF + 截圖 ===

var _reportVisible = false;
var _reportParsed = null;

/**
 * 確保報告已渲染，回傳 parsedData
 */
function _ensureReportRendered() {
  // 相容 trialDetails 和 answers 兩種欄位名
  var trials = (resultData && (resultData.trialDetails || resultData.answers)) || [];
  if (trials.length === 0) {
    GameModal.alert("⚠️ 無資料", "此次遊戲沒有可匯出的試驗資料。", {
      icon: "⚠️",
    });
    return null;
  }
  if (typeof CsvReport === "undefined" || !CsvReport.renderReport) {
    GameModal.alert("⚠️ 模組未載入", "分析報告模組未載入。", { icon: "⚠️" });
    return null;
  }
  if (!_reportParsed) {
    var nick = resultData.nickname || resultData.playerName || "player";
    var csvRows = CsvReport.convertTrialsToCsvData(trials, nick);
    if (!csvRows || csvRows.length === 0) {
      GameModal.alert("⚠️ 無資料", "試驗資料轉換失敗。", { icon: "⚠️" });
      return null;
    }
    _reportParsed = CsvReport.parseRawData(csvRows);
    CsvReport.renderReport(
      document.getElementById("reportContent"),
      _reportParsed,
      { mode: "multiplayer" },
    );
  }
  return _reportParsed;
}

/**
 * 展開 / 收合分析報告
 */
function toggleMultiplayerReport() {
  var container = document.getElementById("reportContainer");
  var btn = document.getElementById("btnToggleReport");
  if (_reportVisible) {
    container.style.display = "none";
    if (btn) btn.textContent = "📊 展開分析報告";
    _reportVisible = false;
    return;
  }
  var parsed = _ensureReportRendered();
  if (!parsed) return;
  container.style.display = "block";
  if (btn) btn.textContent = "📊 收合分析報告";
  _reportVisible = true;
  container.scrollIntoView({ behavior: "smooth" });
}

/**
 * 匯出 PDF
 */
function exportMultiplayerPdf() {
  var trials = (resultData && (resultData.trialDetails || resultData.answers)) || [];
  if (trials.length === 0) {
    GameModal.alert("⚠️ 無資料", "此次遊戲沒有可匯出的試驗資料。", {
      icon: "⚠️",
    });
    return;
  }

  var container = document.getElementById("reportContainer");
  var wasHidden = container.style.display === "none";
  // Chart.js 需要可見 DOM 才能正確繪製 canvas
  container.style.display = "block";

  var needsFirstRender = !_reportParsed;
  var parsed = _ensureReportRendered();
  if (!parsed) {
    if (wasHidden) container.style.display = "none";
    return;
  }

  var btn = document.getElementById("btnExportPdf");
  if (btn) {
    btn.textContent = "⏳ 產生中…";
    btn.disabled = true;
  }

  // 首次渲染需等 Chart.js 完成繪圖
  var delay = needsFirstRender ? 1200 : 300;
  setTimeout(function () {
    var content = document.getElementById("reportContent");
    CsvReport.exportPdf(content, parsed)
      .then(function () {
        if (btn) {
          btn.textContent = "📄 匯出 PDF";
          btn.disabled = false;
        }
        if (wasHidden && !_reportVisible) container.style.display = "none";
      })
      .catch(function () {
        if (btn) {
          btn.textContent = "📄 匯出 PDF";
          btn.disabled = false;
        }
        if (wasHidden && !_reportVisible) container.style.display = "none";
      });
  }, delay);
}

/**
 * 匯出長截圖
 */
function exportMultiplayerScreenshot() {
  var trials = (resultData && (resultData.trialDetails || resultData.answers)) || [];
  if (trials.length === 0) {
    GameModal.alert("⚠️ 無資料", "此次遊戲沒有可匯出的試驗資料。", {
      icon: "⚠️",
    });
    return;
  }

  var container = document.getElementById("reportContainer");
  var wasHidden = container.style.display === "none";
  container.style.display = "block";

  var needsFirstRender = !_reportParsed;
  var parsed = _ensureReportRendered();
  if (!parsed) {
    if (wasHidden) container.style.display = "none";
    return;
  }

  var btn = document.getElementById("btnExportScreenshot");
  if (btn) {
    btn.textContent = "⏳ 擷取中…";
    btn.disabled = true;
  }

  var delay = needsFirstRender ? 1200 : 300;
  setTimeout(function () {
    var content = document.getElementById("reportContent");
    CsvReport.exportScreenshot(content)
      .then(function () {
        if (btn) {
          btn.textContent = "📸 匯出長截圖";
          btn.disabled = false;
        }
        if (wasHidden && !_reportVisible) container.style.display = "none";
      })
      .catch(function () {
        if (btn) {
          btn.textContent = "📸 匯出長截圖";
          btn.disabled = false;
        }
        if (wasHidden && !_reportVisible) container.style.display = "none";
      });
  }, delay);
}

// 綁定報告區域內的匯出按鈕
(function _bindReportBtns() {
  function bind() {
    var csvBtn = document.getElementById("btnExportCsvFromReport");
    var pdfBtn = document.getElementById("btnExportPdf");
    var ssBtn = document.getElementById("btnExportScreenshot");
    if (csvBtn) csvBtn.addEventListener("click", exportMultiplayerCsv);
    if (pdfBtn) pdfBtn.addEventListener("click", exportMultiplayerPdf);
    if (ssBtn) ssBtn.addEventListener("click", exportMultiplayerScreenshot);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();

// === 上傳至排行榜（委託 ResultUpload 共用模組）===
(function () {
  // 班級排行榜
  ResultUpload.bindClassUpload({
    btn: document.getElementById("btnUploadClass"),
    codeRow: document.getElementById("uploadCodeRow"),
    codeInput: document.getElementById("uploadCodeInput"),
    codeSubmit: document.getElementById("uploadCodeSubmit"),
    statusMsg: document.getElementById("uploadStatusMsg"),
    getEntry: function () {
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
      // 附加 SDT
      if (typeof CsvReport !== "undefined" && CsvReport.calculateSDT) {
        var sdt = CsvReport.calculateSDT(d.answers || []);
        if (sdt && sdt.dPrime != null) {
          entry.dPrime = Math.round(sdt.dPrime * 100) / 100;
          entry.criterion = Math.round(sdt.criterion * 100) / 100;
          entry.beta = Math.round(sdt.beta * 100) / 100;
        }
      }
      // v4.7 自適應難度欄位
      entry.engineName =
        typeof DifficultyProvider !== "undefined"
          ? DifficultyProvider.getEngineName()
          : "";
      entry.finalLevel = (function () {
        var en = entry.engineName;
        if (en === "IRTSimpleEngine" && typeof IRTSimpleEngine !== "undefined")
          return IRTSimpleEngine.getCurrentLevel();
        if (typeof SimpleAdaptiveEngine !== "undefined")
          return SimpleAdaptiveEngine.getCurrentLevel();
        return "";
      })();
      entry.finalTheta = (function () {
        var en = entry.engineName;
        if (
          en === "IRTSimpleEngine" &&
          typeof IRTSimpleEngine !== "undefined"
        ) {
          var s = IRTSimpleEngine.getIRTState();
          return s && s.theta != null
            ? Math.round(s.theta * 1000) / 1000
            : null;
        }
        return null;
      })();
      return entry;
    },
  });

  // 世界排行榜（確認列由共用模組動態建立）
  ResultUpload.bindWorldUpload({
    btn: document.getElementById("btnUploadWorld"),
    statusMsg: document.getElementById("worldUploadStatus"),
    noticeEl: document.getElementById("worldUploadNotice"),
    getEntries: function () {
      var d = resultData || {};
      var validRTs = (d.answers || []).filter(function (a) {
        return (a.rt || a.reactionTime) > 0;
      });
      var avgRT =
        validRTs.length > 0
          ? validRTs.reduce(function (sum, a) {
              return sum + (a.rt || a.reactionTime || 0);
            }, 0) / validRTs.length
          : d.avgRT || 0;
      // 從答題紀錄提取 fieldId / ruleId
      var firstAns = (d.answers || [])[0] || {};
      var detectedFieldId = d.fieldId || firstAns.fieldId || firstAns.stageId || "";
      var detectedRuleId = d.ruleId || firstAns.ruleId || "";
      return [
        {
          nickname: d.playerName || d.nickname || "玩家",
          bestScore: d.score || 0,
          bestAccuracy: Math.round(d.accuracy || 0),
          bestAvgRT: Math.round(avgRT),
          totalCorrect: d.correctAnswers || 0,
          totalTrials: d.totalQuestions || 0,
          fieldId: detectedFieldId,
          ruleId: detectedRuleId,
          mode: "multiplayer",
          totalStars: 0,
          level: "",
          gamesPlayed: 1,
          // v4.7 自適應難度欄位
          engineName:
            typeof DifficultyProvider !== "undefined"
              ? DifficultyProvider.getEngineName()
              : "",
          finalLevel: (function () {
            var en =
              typeof DifficultyProvider !== "undefined"
                ? DifficultyProvider.getEngineName()
                : "";
            if (
              en === "IRTSimpleEngine" &&
              typeof IRTSimpleEngine !== "undefined"
            )
              return IRTSimpleEngine.getCurrentLevel();
            if (typeof SimpleAdaptiveEngine !== "undefined")
              return SimpleAdaptiveEngine.getCurrentLevel();
            return "";
          })(),
          finalTheta: (function () {
            var en =
              typeof DifficultyProvider !== "undefined"
                ? DifficultyProvider.getEngineName()
                : "";
            if (
              en === "IRTSimpleEngine" &&
              typeof IRTSimpleEngine !== "undefined"
            ) {
              var s = IRTSimpleEngine.getIRTState();
              return s && s.theta != null
                ? Math.round(s.theta * 1000) / 1000
                : null;
            }
            return null;
          })(),
        },
      ];
    },
    onSuccess: function () {
      // 上傳成功後查詢世界排名
      FirestoreLeaderboard.getWorldLeaderboard(200)
        .then(function (entries) {
          var myUid = firebase.auth().currentUser
            ? firebase.auth().currentUser.uid
            : null;
          var myRank = 0;
          var total = entries.length;
          for (var ri = 0; ri < entries.length; ri++) {
            if (entries[ri].uid === myUid || entries[ri].docId === myUid) {
              myRank = ri + 1;
              break;
            }
          }
          var rankText =
            myRank > 0
              ? "🌐 世界第 " + myRank + " 名 / " + total + " 人"
              : "✅ 已上傳至世界排行榜！";

          var d = resultData || {};
          var validRTs = (d.answers || []).filter(function (a) {
            return (a.rt || a.reactionTime) > 0;
          });
          var avgRT =
            validRTs.length > 0
              ? validRTs.reduce(function (s, a) {
                  return s + (a.rt || a.reactionTime || 0);
                }, 0) / validRTs.length
              : 0;

          var worldStatus = document.getElementById("worldUploadStatus");
          if (worldStatus) {
            worldStatus.innerHTML =
              '<div style="text-align:center;line-height:1.8;">' +
              '<div style="font-size:1.1rem;font-weight:700;color:#4caf50;margin-bottom:4px;">' +
              rankText +
              "</div>" +
              '<div style="font-size:0.85rem;color:#ccc;">' +
              "🎯 準確率 " +
              Math.round(d.accuracy || 0) +
              "% · " +
              "⚡ 平均 RT " +
              (avgRT > 0 ? (avgRT / 1000).toFixed(2) + "s" : "—") +
              " · " +
              "✅ 答對 " +
              (d.correctAnswers || 0) +
              "/" +
              (d.totalQuestions || 0) +
              " · " +
              "🏷️ 競賽模式" +
              "</div></div>";
            worldStatus.className = "upload-status-msg success";
          }
        })
        .catch(function () {
          var worldStatus = document.getElementById("worldUploadStatus");
          if (worldStatus) {
            worldStatus.textContent = "✅ 已上傳至世界排行榜！";
            worldStatus.className = "upload-status-msg success";
          }
        });
    },
  });
})();
