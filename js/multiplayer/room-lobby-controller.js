let currentRoom = null;
let currentPlayerId = null;
let isHost = false;
let isReady = false;
let roomRef = null;
let previousHostId = null;

// 初始化
window.addEventListener("DOMContentLoaded", () => {
  initializeLobby();
});

function initializeLobby() {
  // 先嘗試從 URL 獲取房間代碼
  const urlParams = new URLSearchParams(window.location.search);
  const roomCodeFromUrl = urlParams.get("code");

  // 從 localStorage 獲取房間資訊
  let roomData = localStorage.getItem("currentRoom");
  let playerData = localStorage.getItem("currentPlayer");

  // 如果 URL 有房間代碼但 localStorage 沒有，創建基本資訊
  if (roomCodeFromUrl && !roomData) {
    roomData = JSON.stringify({ code: roomCodeFromUrl });
    localStorage.setItem("currentRoom", roomData);
  }

  if (!roomData || !playerData) {
    showToast("未找到房間資訊，請重新加入", "error");
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 2000);
    return;
  }

  currentRoom = JSON.parse(roomData);
  const player = JSON.parse(playerData);
  currentPlayerId = player.id;

  // 調試：顯示玩家資訊
  console.log("📋 LocalStorage 中的玩家資料:", player);
  console.log("🆔 玩家 ID:", currentPlayerId);

  // 設置房間代碼
  document.getElementById("roomCode").textContent = currentRoom.code;

  // 設定最大玩家數
  const maxPlayers = window.GameConstants?.MAX_PLAYERS_PER_ROOM || 8;
  document.getElementById("maxPlayers").textContent = maxPlayers;

  // 監聽房間變化
  roomRef = firebase.database().ref(`rooms/${currentRoom.code}`);

  // 設置斷線自動標記離線
  if (currentPlayerId) {
    roomRef
      .child("players/" + currentPlayerId + "/online")
      .onDisconnect()
      .set(false);
  }

  roomRef.on("value", (snapshot) => {
    const roomData = snapshot.val();
    if (!roomData) {
      showToast("房間已關閉", "error");
      setTimeout(() => {
        window.location.href = "../index.html";
      }, 2000);
      return;
    }

    // 更新 currentRoom 為完整的房間資料
    currentRoom = {
      code: currentRoom.code,
      ...roomData,
    };
    console.log("📦 完整房間資料:", currentRoom);

    // 從 Firebase 確認玩家身份
    const myPlayerData = roomData.players?.[currentPlayerId];
    const player = JSON.parse(localStorage.getItem("currentPlayer"));
    const isSpectator = player?.isSpectator || false;

    if (myPlayerData) {
      isHost = myPlayerData.isHost || false;
      console.log("✅ 從 Firebase 確認身份 - isHost:", isHost);

      // 根據身份顯示不同按鈕
      if (isHost) {
        document.getElementById("startBtn").style.display = "block";
        document.getElementById("readyBtn").style.display = "none";
        document.getElementById("waitingMessage").textContent =
          "等待所有玩家準備就緒...";
      } else {
        document.getElementById("startBtn").style.display = "none";
        document.getElementById("readyBtn").style.display = "block";
        document.getElementById("waitingMessage").textContent =
          "等待房主開始遊戲...";
      }
    } else if (isSpectator && roomData.hostId === currentPlayerId) {
      // 房主觀戰模式：不在 players 列表中，但有管理權限
      isHost = true;
      console.log("✅ 房主觀戰模式");
      document.getElementById("startBtn").style.display = "block";
      document.getElementById("readyBtn").style.display = "none";
      document.getElementById("waitingMessage").textContent =
        "觀戰模式 - 等待所有玩家準備就緒...";
    } else {
      console.error("❌ 在 Firebase 中找不到玩家資料:", currentPlayerId);
    }

    // 檢查房主是否需要轉移（斷線/離開）
    _checkHostTransfer(roomData);

    updateLobby(roomData);
  });
}

function updateLobby(roomData) {
  console.log("🔄 更新大廳資料:", roomData);

  // 更新玩家列表
  const players = roomData.players || {};
  const playersList = Object.entries(players).map(([id, data]) => ({
    id,
    ...data,
  }));

  console.log("👥 玩家列表:", playersList);
  console.log("🏠 是否為房主:", isHost);

  const playersGrid = document.getElementById("playersGrid");
  playersGrid.innerHTML = "";

  playersList.forEach((player, index) => {
    const card = document.createElement("div");
    card.className = `player-card ${player.isHost ? "host" : ""}`;

    const avatarEmojis = ["🐱", "🐶", "🐼", "🦊", "🐨", "🐯", "🦁", "🐮"];
    const emoji = avatarEmojis[index % avatarEmojis.length];

    card.innerHTML = `
            <div class="player-avatar">${emoji}</div>
            <div class="player-info">
              <div class="player-name">${player.nickname || player.name || "未命名玩家"}</div>
              <div class="player-role">${player.isHost ? "👑 房主" : "玩家"}</div>
            </div>
            <div class="player-status ${player.ready ? "ready" : ""}">${
              player.isHost ? "房主" : player.ready ? "✓ 準備" : "等待中"
            }</div>
          `;

    playersGrid.appendChild(card);
  });

  document.getElementById("playerCount").textContent = playersList.length;

  // 更新場地資訊（房間建立時欄位為 gameStages）
  const stages = roomData.gameStages || roomData.stages || [];
  const stagesInfo = document.getElementById("stagesInfo");
  stagesInfo.innerHTML = "";

  if (stages.length === 0) {
    stagesInfo.innerHTML =
      '<div style="text-align:center;color:#999;padding:1rem;">⚠️ 尚無場地資料</div>';
  } else {
    stages.forEach((stage, index) => {
      const stageItem = document.createElement("div");
      stageItem.className = "stage-item";
      stageItem.innerHTML = `
            <div class="stage-icon">${stage.icon}</div>
            <div class="stage-details">
              <div class="stage-name">${index + 1}. ${stage.name}</div>
              <div class="stage-difficulty">難度: ${getDifficultyText(stage.difficulty)}</div>
            </div>
          `;
      stagesInfo.appendChild(stageItem);
    });
  } // end else

  // 檢查是否可以開始遊戲（房主）
  if (isHost) {
    // 詳細檢查每個玩家的狀態
    playersList.forEach((p, index) => {
      console.log(`👤 玩家 ${index + 1}:`, {
        id: p.id,
        nickname: p.nickname,
        isHost: p.isHost,
        ready: p.ready,
        canStart: p.isHost || p.ready,
      });
    });

    const allReady = playersList.every((p) => p.isHost || p.ready);
    const hasEnoughPlayers = playersList.length >= 1;

    console.log("🎮 所有玩家準備好:", allReady);
    console.log("🎮 玩家數量足夠:", hasEnoughPlayers);
    console.log("🎮 按鈕應該啟用:", allReady && hasEnoughPlayers);

    const startBtn = document.getElementById("startBtn");
    startBtn.disabled = !allReady || !hasEnoughPlayers;

    console.log("🎮 按鈕實際狀態 disabled:", startBtn.disabled);
  }

  // 檢查遊戲是否已開始
  if (roomData.status === "playing") {
    // 跳轉到遊戲頁面
    const player = JSON.parse(localStorage.getItem("currentPlayer") || "{}");
    const role = player.isSpectator ? "spectator" : "player";
    window.location.href = `game.html?room=${currentRoom.code}&role=${role}`;
  }
}

function getDifficultyText(difficulty) {
  const map = {
    easy: "簡單 ⭐",
    medium: "中等 ⭐⭐",
    hard: "困難 ⭐⭐⭐",
  };
  return map[difficulty] || difficulty;
}

function copyRoomCode() {
  const code = document.getElementById("roomCode").textContent;
  navigator.clipboard.writeText(code).then(() => {
    showToast("代碼已複製！", "success");
  });
}

function toggleReady() {
  isReady = !isReady;
  const btn = document.getElementById("readyBtn");

  if (isReady) {
    btn.textContent = "取消準備";
    btn.classList.add("active");
  } else {
    btn.textContent = "準備好了！";
    btn.classList.remove("active");
  }

  // 更新 Firebase
  roomRef.child(`players/${currentPlayerId}/ready`).set(isReady);
}

async function startGame() {
  if (!isHost) return;

  try {
    console.log("🎮 準備開始遊戲...");

    // 從 currentRoom 讀取 stages（已經在 Firebase 監聽中更新）
    const stages = currentRoom.gameStages || [];

    if (stages.length === 0) {
      console.error("❌ 沒有遊戲場地資料");
      showToast("遊戲場地資料錯誤，無法開始遊戲", "error");
      return;
    }

    console.log("✅ 遊戲場地資料:", stages);

    // 更新房間狀態
    await roomRef.update({
      status: "playing",
      startTime: Date.now(),
    });

    console.log("✅ 房間狀態已更新為 playing");
    showToast("遊戲開始！", "success");

    // 延遲一下再跳轉，確保 Firebase 更新完成
    setTimeout(() => {
      // 根據房主是否參與遊戲決定角色
      const player = JSON.parse(localStorage.getItem("currentPlayer") || "{}");
      const role = player.isSpectator ? "spectator" : "player";
      window.location.href = `game.html?room=${currentRoom.code}&role=${role}`;
    }, 500);
  } catch (error) {
    console.error("❌ 開始遊戲失敗:", error);
    showToast("開始遊戲失敗：" + error.message, "error");
  }
}

/**
 * 檢查房主是否需要轉移（斷線/離開）
 * 偵測房主離線後，自動將房主轉移給最早加入的在線玩家
 */
function _checkHostTransfer(roomData) {
  if (!roomData || !roomData.hostId || !currentPlayerId) return;

  // 遊戲已開始不處理
  if (roomData.status === "playing" || roomData.status === "finished") return;

  var players = roomData.players || {};
  var hostPlayer = players[roomData.hostId];

  // 房主在線 或 不在玩家列表中（觀戰者）→ 不需轉移
  if (!hostPlayer || hostPlayer.online !== false) {
    // 偵測房主變更：如果 hostId 變成自己，顯示通知
    if (
      previousHostId &&
      previousHostId !== roomData.hostId &&
      roomData.hostId === currentPlayerId
    ) {
      showToast("🏠 房主已離開，你現在是房主！", "success");
    }
    previousHostId = roomData.hostId;
    return;
  }

  // 房主離線 → 尋找接手人選
  var candidates = [];
  for (var uid in players) {
    if (!players.hasOwnProperty(uid)) continue;
    if (uid === roomData.hostId) continue;
    if (players[uid].online === false) continue;
    candidates.push({ uid: uid, joinedAt: players[uid].joinedAt || 0 });
  }

  if (candidates.length === 0) {
    previousHostId = roomData.hostId;
    return;
  }

  // 按加入時間排序（最早加入者接手），同時間用 UID 排序確保一致
  candidates.sort(function (a, b) {
    var diff = a.joinedAt - b.joinedAt;
    return diff !== 0 ? diff : a.uid.localeCompare(b.uid);
  });

  var newHostUid = candidates[0].uid;

  // 只有被選中的玩家執行寫入（避免多人同時寫入競爭）
  if (newHostUid === currentPlayerId) {
    console.log("🏠 房主離線，自動接手房主");
    var updates = {};
    updates["hostId"] = currentPlayerId;
    updates["players/" + currentPlayerId + "/isHost"] = true;
    updates["players/" + roomData.hostId + "/isHost"] = false;
    roomRef.update(updates);
  }

  previousHostId = roomData.hostId;
}

function leaveRoom() {
  if (!confirm("確定要離開房間嗎？")) return;

  // 取消 onDisconnect（避免移除後還寫入 online:false 造成殘留）
  if (roomRef && currentPlayerId) {
    roomRef
      .child("players/" + currentPlayerId + "/online")
      .onDisconnect()
      .cancel();
  }

  var leavePromise = Promise.resolve();

  if (roomRef && currentPlayerId) {
    if (isHost) {
      // 房主離開：轉移房主給其他在線玩家
      leavePromise = roomRef.once("value").then(function (snapshot) {
        var data = snapshot.val();
        var players = data ? data.players || {} : {};
        var others = Object.entries(players)
          .filter(function (entry) {
            return entry[0] !== currentPlayerId && entry[1].online !== false;
          })
          .sort(function (a, b) {
            var diff = (a[1].joinedAt || 0) - (b[1].joinedAt || 0);
            return diff !== 0 ? diff : a[0].localeCompare(b[0]);
          });

        if (others.length > 0) {
          // 轉移房主給最早加入的在線玩家
          var newHostId = others[0][0];
          console.log("🏠 房主離開，轉移給:", newHostId);
          var updates = {};
          updates["hostId"] = newHostId;
          updates["players/" + newHostId + "/isHost"] = true;
          return roomRef.update(updates).then(function () {
            return roomRef.child("players/" + currentPlayerId).remove();
          });
        } else {
          // 沒有其他在線玩家，刪除房間
          console.log("🏠 房主離開且無其他玩家，刪除房間");
          return roomRef.remove();
        }
      });
    } else {
      // 一般玩家離開
      console.log("👤 玩家離開，移除玩家資料");
      leavePromise = roomRef.child("players/" + currentPlayerId).remove();
    }
  }

  leavePromise
    .catch(function (err) {
      console.warn("離開房間時發生錯誤:", err);
    })
    .finally(function () {
      // 清除本地儲存
      localStorage.removeItem("currentRoom");
      localStorage.removeItem("currentPlayer");
      localStorage.removeItem("currentRoomCode");
      localStorage.removeItem("currentPlayerId");
      localStorage.removeItem("currentPlayerName");

      // 返回首頁
      window.location.href = "../index.html";
    });
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast ${type} show`;

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// 離開頁面時清理
window.addEventListener("beforeunload", () => {
  if (roomRef) {
    roomRef.off();
  }
});
