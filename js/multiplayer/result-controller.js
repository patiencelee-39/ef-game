let resultData = null;

// 初始化
window.addEventListener("DOMContentLoaded", () => {
  // 🔊 初始化音訊
  if (typeof AudioPlayer !== "undefined" && AudioPlayer.init) {
    AudioPlayer.init();
  }
  loadResults();
});

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
      ? validRTs.reduce(
          (sum, a) => sum + (a.rt || a.reactionTime || 0),
          0,
        ) / validRTs.length
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
      ? validRTs2.reduce(
          (sum, a) => sum + (a.rt || a.reactionTime || 0),
          0,
        ) / validRTs2.length
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
  // 如果是多人模式，從 Firebase 即時監聽其他玩家成績
  const roomData = localStorage.getItem("currentRoom");
  const urlRoom = new URLSearchParams(window.location.search).get("room");

  if (!roomData && !urlRoom) {
    document.getElementById("rankInfo").textContent = "單人模式";
    return;
  }

  let roomCode = urlRoom;
  if (!roomCode && roomData) {
    try {
      const room = JSON.parse(roomData);
      roomCode = room.code || room.roomCode;
    } catch (e) {}
  }
  if (!roomCode) {
    document.getElementById("rankInfo").textContent = "單人模式";
    return;
  }

  const rankEl = document.getElementById("rankInfo");
  rankEl.textContent = "等待其他玩家完成…";

  const roomRef = firebase
    .database()
    .ref("rooms/" + roomCode + "/scores");

  // 即時監聽（而非 .once）
  roomRef.on("value", function (snapshot) {
    const results = snapshot.val();
    if (!results) {
      rankEl.textContent = "等待其他玩家完成…";
      return;
    }

    const allResults = Object.entries(results)
      .map(([uid, data]) => ({
        playerId: uid,
        score: data.totalScore || 0,
        nickname: data.nickname || "玩家",
      }))
      .sort((a, b) => b.score - a.score);

    const myId =
      resultData.playerId ||
      (firebase.auth().currentUser && firebase.auth().currentUser.uid);
    const myRank = allResults.findIndex((r) => r.playerId === myId) + 1;
    const totalPlayers = allResults.length;

    let rankText = "";
    if (myRank === 1) {
      rankText = "🥇 第 1 名 / " + totalPlayers + " 人";
    } else if (myRank === 2) {
      rankText = "🥈 第 2 名 / " + totalPlayers + " 人";
    } else if (myRank === 3) {
      rankText = "🥉 第 3 名 / " + totalPlayers + " 人";
    } else if (myRank > 0) {
      rankText = "第 " + myRank + " 名 / " + totalPlayers + " 人";
    } else {
      rankText = "計算中… (" + totalPlayers + " 人已完成)";
    }

    rankEl.textContent = rankText;
  });
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
    codeRow.style.display =
      codeRow.style.display === "none" ? "flex" : "none";
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
        return FirestoreLeaderboard.uploadToClassBoard(
          board.boardId,
          entry,
        );
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
      row.style.cssText =
        "display:flex;gap:10px;width:100%;margin-top:8px;";
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
              totalStars: 0,
              level: "",
              gamesPlayed: 1,
            };
            return FirestoreLeaderboard.uploadToWorld(worldData);
          })
          .then(function () {
            statusMsg.textContent = "✅ 已上傳至世界排行榜！";
            statusMsg.style.color = "#4caf50";
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
