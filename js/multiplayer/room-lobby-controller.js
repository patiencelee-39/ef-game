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
  Logger.debug("📋 LocalStorage 中的玩家資料:", player);
  Logger.debug("🆔 玩家 ID:", currentPlayerId);

  // 設置房間代碼
  document.getElementById("roomCode").textContent = currentRoom.code;

  // 設定最大玩家數（優先使用房間建立時設定的值）
  const maxPlayers =
    currentRoom.maxPlayers || window.GameConstants?.MAX_PLAYERS_PER_ROOM || 8;
  document.getElementById("maxPlayers").textContent = maxPlayers;

  // 監聽房間變化
  roomRef = firebase.database().ref(`rooms/${currentRoom.code}`);

  // 設置斷線自動標記離線 & 重新標記上線
  // （從 room-create / room-join 導航到此頁時，舊頁面的 onDisconnect
  //   可能已觸發並把 online 設為 false，必須在此重新寫入 true）
  if (currentPlayerId) {
    var onlineRef = roomRef.child("players/" + currentPlayerId + "/online");
    onlineRef.onDisconnect().set(false);

    // 非觀戰者：確保 online 欄位為 true（修正頁面導航造成的 stale disconnect）
    if (!player.isSpectator) {
      onlineRef.set(true);
    }
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
    Logger.debug("📦 完整房間資料:", currentRoom);

    // 從 Firebase 確認玩家身份
    const myPlayerData = roomData.players?.[currentPlayerId];
    const player = JSON.parse(localStorage.getItem("currentPlayer"));
    const isSpectator = player?.isSpectator || false;

    if (myPlayerData) {
      isHost = myPlayerData.isHost || false;
      Logger.debug("✅ 從 Firebase 確認身份 - isHost:", isHost);

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
      Logger.debug("✅ 房主觀戰模式");
      document.getElementById("startBtn").style.display = "block";
      document.getElementById("readyBtn").style.display = "none";
      document.getElementById("waitingMessage").textContent =
        "觀戰模式 - 等待所有玩家準備就緒...";
    } else {
      Logger.error("❌ 在 Firebase 中找不到玩家資料:", currentPlayerId);
    }

    // 檢查房主是否需要轉移（斷線/離開）
    _checkHostTransfer(roomData);

    updateLobby(roomData);
  });
}

function updateLobby(roomData) {
  Logger.debug("🔄 更新大廳資料:", roomData);

  // 更新玩家列表
  const players = roomData.players || {};
  const playersList = Object.entries(players).map(([id, data]) => ({
    id,
    ...data,
  }));

  Logger.debug("👥 玩家列表:", playersList);
  Logger.debug("🏠 是否為房主:", isHost);

  const playersGrid = document.getElementById("playersGrid");
  playersGrid.innerHTML = "";

  playersList.forEach((player, index) => {
    const card = document.createElement("div");
    const isMe = player.id === currentPlayerId;
    card.className = `player-card ${player.isHost ? "host" : ""} ${isMe ? "is-me" : ""}`;

    const avatarEmojis = ["🐱", "🐶", "🐼", "🦊", "🐨", "🐯", "🦁", "🐮"];
    const emoji = avatarEmojis[index % avatarEmojis.length];

    card.innerHTML = `
            <div class="player-avatar">${emoji}</div>
            <div class="player-info">
              <div class="player-name">${player.nickname || player.name || "未命名玩家"}${isMe ? " (你)" : ""}</div>
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

  // 接力模式：隊伍面板
  _updateRelayPanel(roomData, playersList);

  // 隊伍對抗模式：隊伍面板
  _updateTeamBattlePanel(roomData, playersList);

  // 檢查是否可以開始遊戲（房主）
  if (isHost) {
    // 詳細檢查每個玩家的狀態
    playersList.forEach((p, index) => {
      Logger.debug(`👤 玩家 ${index + 1}:`, {
        id: p.id,
        nickname: p.nickname,
        isHost: p.isHost,
        ready: p.ready,
        canStart: p.isHost || p.ready,
      });
    });

    const allReady = playersList.every((p) => p.isHost || p.ready);
    const hasEnoughPlayers = playersList.length >= 1;

    Logger.debug("🎮 所有玩家準備好:", allReady);
    Logger.debug("🎮 玩家數量足夠:", hasEnoughPlayers);
    Logger.debug("🎮 按鈕應該啟用:", allReady && hasEnoughPlayers);

    const startBtn = document.getElementById("startBtn");
    startBtn.disabled = !allReady || !hasEnoughPlayers;

    Logger.debug("🎮 按鈕實際狀態 disabled:", startBtn.disabled);
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
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        showToast("代碼已複製！", "success");
      })
      .catch(() => {
        _fallbackCopy(code);
      });
  } else {
    _fallbackCopy(code);
  }
}

function _fallbackCopy(text) {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast("代碼已複製！", "success");
  } catch (e) {
    showToast("請手動複製代碼：" + text, "info");
  }
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
    Logger.debug("🎮 準備開始遊戲...");

    // 從 currentRoom 讀取 stages（已經在 Firebase 監聽中更新）
    const stages = currentRoom.gameStages || [];

    if (stages.length === 0) {
      Logger.error("❌ 沒有遊戲場地資料");
      showToast("遊戲場地資料錯誤，無法開始遊戲", "error");
      return;
    }

    Logger.debug("✅ 遊戲場地資料:", stages);

    // 隊伍對抗模式：若為「隨機分隊」且尚未分隊，自動分配
    if (
      currentRoom.gameMode === "team" &&
      currentRoom.teamAssignment === "random" &&
      window.RelayManager
    ) {
      var existingTeams = currentRoom.teams || {};
      var hasMembers = false;
      for (var k in existingTeams) {
        if (
          existingTeams.hasOwnProperty(k) &&
          existingTeams[k].members &&
          Object.keys(existingTeams[k].members).length > 0
        ) {
          hasMembers = true;
          break;
        }
      }
      if (!hasMembers) {
        var teamPlayersList = Object.entries(currentRoom.players || {}).map(
          function (entry) {
            return { id: entry[0], nickname: entry[1].nickname || "玩家" };
          },
        );
        await RelayManager.autoAssignTeams(
          teamPlayersList,
          currentRoom.teamCount || 2,
        );
        Logger.info("✅ 隊伍對抗：已自動隨機分隊");
      }
    }

    // 接力賽：random 模式自動分隊
    if (
      currentRoom.gameMode === "relay" &&
      currentRoom.teamAssignment === "random" &&
      window.RelayManager
    ) {
      var relayExistingTeams = currentRoom.teams || {};
      var relayHasMembers = false;
      for (var rk in relayExistingTeams) {
        if (
          relayExistingTeams.hasOwnProperty(rk) &&
          relayExistingTeams[rk].members &&
          Object.keys(relayExistingTeams[rk].members).length > 0
        ) {
          relayHasMembers = true;
          break;
        }
      }
      if (!relayHasMembers) {
        var relayPlayersList = Object.entries(currentRoom.players || {}).map(
          function (entry) {
            return { id: entry[0], nickname: entry[1].nickname || "玩家" };
          },
        );
        await RelayManager.autoAssignTeams(
          relayPlayersList,
          currentRoom.teamCount || 2,
        );
        Logger.info("✅ 接力賽：已自動隨機分隊");
      }
    }

    // selfSelect / manual 模式：檢查是否所有玩家都已分配隊伍
    if (
      (currentRoom.gameMode === "team" || currentRoom.gameMode === "relay") &&
      (currentRoom.teamAssignment === "selfSelect" ||
        currentRoom.teamAssignment === "manual")
    ) {
      var allPlayerIds = Object.keys(currentRoom.players || {});
      var assignedIds = {};
      var selfTeams = currentRoom.teams || {};
      for (var stid in selfTeams) {
        if (!selfTeams.hasOwnProperty(stid)) continue;
        var stMembers = selfTeams[stid].members || {};
        for (var suid in stMembers) {
          if (stMembers.hasOwnProperty(suid)) assignedIds[suid] = true;
        }
      }
      var unassigned = allPlayerIds.filter(function (id) {
        return !assignedIds[id];
      });
      if (unassigned.length > 0) {
        showToast(
          "⚠️ 還有 " + unassigned.length + " 位玩家尚未分配隊伍",
          "error",
        );
        return;
      }
    }

    // 隊長選擇：若為「random」，遊戲開始前隨機指派各隊隊長
    if (
      (currentRoom.gameMode === "team" || currentRoom.gameMode === "relay") &&
      currentRoom.captainSelection === "random" &&
      window.RelayManager
    ) {
      var capTeams = currentRoom.teams || {};
      var captainUpdates = {};
      for (var ctid in capTeams) {
        if (!capTeams.hasOwnProperty(ctid)) continue;
        var capMembers = capTeams[ctid].members || {};
        var capOrder = capTeams[ctid].order || Object.keys(capMembers);
        if (capOrder.length > 0) {
          var randomIdx = Math.floor(Math.random() * capOrder.length);
          captainUpdates["teams/" + ctid + "/captainId"] = capOrder[randomIdx];
        }
      }
      if (Object.keys(captainUpdates).length > 0) {
        await roomRef.update(captainUpdates);
        Logger.info("✅ 已隨機指派各隊隊長");
      }
    }

    // 接力賽：batonOrderMode === "random" 時自動隨機排列棒次
    if (
      currentRoom.gameMode === "relay" &&
      currentRoom.batonOrderMode === "random" &&
      window.RelayManager
    ) {
      var batonTeams = currentRoom.teams || {};
      var batonPromises = [];
      for (var btid in batonTeams) {
        if (batonTeams.hasOwnProperty(btid)) {
          batonPromises.push(RelayManager.randomizeBatonOrder(btid));
        }
      }
      if (batonPromises.length > 0) {
        await Promise.all(batonPromises);
        Logger.info("✅ 接力賽：已自動隨機排列棒次");
      }
    }

    // 觀戲資訊已透過 URL 參數 role=spectator 及 localStorage 傳遞，
    // 不寫入 players 節點（觀戰房主不在 players 列表中，寫入會違反 validate 規則）

    // 更新房間狀態
    await roomRef.update({
      status: "playing",
      startTime: Date.now(),
    });

    Logger.info("✅ 房間狀態已更新為 playing");
    showToast("遊戲開始！", "success");

    // 延遲一下再跳轉，確保 Firebase 更新完成
    setTimeout(() => {
      // 根據房主是否參與遊戲決定角色
      const player = JSON.parse(localStorage.getItem("currentPlayer") || "{}");
      const role = player.isSpectator ? "spectator" : "player";
      window.location.href = `game.html?room=${currentRoom.code}&role=${role}`;
    }, 500);
  } catch (error) {
    Logger.error("❌ 開始遊戲失敗:", error);
    showToast("開始遊戲失敗：" + error.message, "error");
  }
}

// =========================================
// 隊伍對抗模式面板
// =========================================

var _teamBattleInited = false;

function _updateTeamBattlePanel(roomData, playersList) {
  var panel = document.getElementById("teamBattlePanel");
  if (!panel) return;

  if (roomData.gameMode !== "team") {
    panel.style.display = "none";
    return;
  }
  panel.style.display = "";

  var teamCount = roomData.teamCount || 2;
  var teamAssignment = roomData.teamAssignment || "random";

  // 首次初始化 RelayManager（team mode 也複用 RelayManager 的隊伍管理功能）
  if (!_teamBattleInited && window.RelayManager) {
    _teamBattleInited = true;

    RelayManager.init({
      roomCode: currentRoom.code,
      playerId: currentPlayerId,
      isHost: isHost,
      callbacks: {
        onTeamsUpdate: function () {
          // teams 變更時 roomRef.on("value") 會自動觸發 updateLobby
        },
      },
    });

    // selfSelect / manual 模式：首次自動建立空隊伍
    if ((teamAssignment === "selfSelect" || teamAssignment === "manual") && isHost) {
      var existingTeams = roomData.teams || {};
      if (Object.keys(existingTeams).length === 0) {
        RelayManager.createEmptyTeams(teamCount);
      }
    }

    // 綁定按鈕（僅房主可操作）
    var autoBtn = document.getElementById("teamBattleAutoBtn");
    if (autoBtn) {
      autoBtn.addEventListener("click", function () {
        var tc = currentRoom.teamCount || 2;
        RelayManager.autoAssignTeams(playersList, tc);
        showToast("🔀 已自動分配隊伍", "success");
      });
    }
  }

  // 操作按鈕：只在 random 模式且是房主時顯示「自動分隊」
  var actionsDiv = document.getElementById("teamBattleActions");
  if (actionsDiv) {
    actionsDiv.style.display =
      isHost && teamAssignment === "random" ? "" : "none";
  }

  // 讀取 Firebase 中的 teams 資料
  var teamsData = roomData.teams || {};

  // 找到自己所在的隊伍
  var myTeamId = null;
  for (var tid in teamsData) {
    if (!teamsData.hasOwnProperty(tid)) continue;
    var members = teamsData[tid].members || {};
    if (members[currentPlayerId]) {
      myTeamId = tid;
      break;
    }
  }

  // 顯示「你在 X 隊」
  var myTeamBadge = document.getElementById("myTeamBadge");
  if (myTeamBadge) {
    if (myTeamId && teamsData[myTeamId]) {
      var team = teamsData[myTeamId];
      myTeamBadge.innerHTML =
        '<span class="my-team-indicator" style="background:' +
        (team.color || "#667eea") +
        '">' +
        (team.emoji || "⚪") +
        " 你在 " +
        (team.name || myTeamId) +
        "</span>";
      myTeamBadge.style.display = "";
    } else if (Object.keys(teamsData).length > 0) {
      myTeamBadge.innerHTML =
        '<span class="my-team-indicator" style="background:#636e72">⚠️ 尚未分配隊伍</span>';
      myTeamBadge.style.display = "";
    } else {
      myTeamBadge.style.display = "none";
    }
  }

  _renderTeamBattleCards(teamsData, playersList, teamCount, teamAssignment);
}

function _renderTeamBattleCards(teamsData, playersList, teamCount, teamAssignment) {
  var grid = document.getElementById("teamBattleGrid");
  if (!grid) return;

  var presets = window.RelayManager
    ? RelayManager.TEAM_PRESETS
    : [
        { name: "紅隊", color: "#e74c3c", emoji: "🔴" },
        { name: "藍隊", color: "#3498db", emoji: "🔵" },
      ];

  grid.innerHTML = "";

  // 建立 uid → player 查找表
  var playerMap = {};
  playersList.forEach(function (p) {
    playerMap[p.id] = p;
  });

  for (var i = 0; i < teamCount; i++) {
    var preset = presets[i] || {
      name: "隊伍" + (i + 1),
      color: "#999",
      emoji: "⚪",
    };
    var teamId = "team" + (i + 1);
    var teamData = teamsData[teamId] || {};
    var members = teamData.members || {};
    var memberUids = Object.keys(members);
    var teamName = teamData.name || preset.name;
    var teamColor = teamData.color || preset.color;
    var teamEmoji = teamData.emoji || preset.emoji;
    var captainId = teamData.captainId || null;

    var card = document.createElement("div");
    card.className = "team-battle-card";
    card.style.borderColor = teamColor;

    // header with editable team name
    var headerHTML =
      '<div class="team-battle-header" style="background:' +
      teamColor +
      '">' +
      "<span>" +
      teamEmoji +
      " " +
      '<span class="team-name-text" data-team-id="' +
      teamId +
      '">' +
      _escTeamHtml(teamName) +
      "</span>";

    // "隊長/房主" 可以編輯隊名
    if (isHost || captainId === currentPlayerId) {
      headerHTML +=
        '<button class="team-rename-btn" data-team-id="' +
        teamId +
        '" title="更改隊名">✏️</button>';
    }

    headerHTML +=
      "</span>" +
      '<span class="team-battle-count">' +
      memberUids.length +
      " 人</span>" +
      "</div>";

    var bodyHTML = '<div class="team-battle-members">';
    if (memberUids.length === 0) {
      bodyHTML += '<div class="team-empty-hint">尚未分配成員</div>';
    } else {
      memberUids.forEach(function (uid) {
        var p = playerMap[uid] || members[uid] || {};
        var name = p.nickname || p.name || uid.slice(0, 6);
        var isCaptain = captainId === uid;
        var isMe = uid === currentPlayerId;

        bodyHTML +=
          '<div class="team-battle-member' +
          (isMe ? " is-me" : "") +
          '">' +
          '<span class="team-member-name">' +
          _escTeamHtml(name) +
          "</span>" +
          (isMe ? '<span class="team-me-badge">← 你</span>' : "");

        bodyHTML += "</div>";
      });
    }
    bodyHTML += "</div>";

    // 所有玩家皆可換隊（selfSelect / manual / random 皆顯示）
    var iAmInThisTeam = members[currentPlayerId] ? true : false;
    if (iAmInThisTeam) {
      bodyHTML +=
        '<div class="team-join-row">' +
        '<span class="team-joined-badge">✅ 已加入</span>' +
        "</div>";
    } else {
      bodyHTML +=
        '<div class="team-join-row">' +
        '<button class="btn btn-sm team-join-btn" data-team-id="' +
        teamId +
        '">🙋 加入此隊</button>' +
        "</div>";
    }

    card.innerHTML = headerHTML + bodyHTML;
    grid.appendChild(card);
  }

  // 綁定改名按鈕
  grid.querySelectorAll(".team-rename-btn").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var teamId = btn.getAttribute("data-team-id");
      _showRenameDialog(teamId);
    });
  });

  // 綁定「加入此隊」按鈕（selfSelect 模式）
  grid.querySelectorAll(".team-join-btn").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var teamId = btn.getAttribute("data-team-id");
      if (!window.RelayManager) return;

      var localPlayer = JSON.parse(
        localStorage.getItem("currentPlayer") || "{}",
      );
      var nickname = localPlayer.nickname || "玩家";

      RelayManager.joinTeam(teamId, nickname)
        .then(function () {
          showToast(
            "✅ 已加入" +
              (btn.closest(".team-battle-card").querySelector(".team-name-text")
                ?.textContent || teamId),
            "success",
          );
        })
        .catch(function (err) {
          showToast("❌ 加入失敗：" + err.message, "error");
        });
    });
  });

  // === 未分配玩家區 ===
  var unassignedDiv = document.getElementById("teamBattleUnassigned");
  var unassignedList = document.getElementById("teamBattleUnassignedList");
  if (unassignedDiv && unassignedList) {
    // 找出所有尚未分配隊伍的玩家
    var assignedUids = {};
    for (var checkTid in teamsData) {
      if (!teamsData.hasOwnProperty(checkTid)) continue;
      var checkMembers = teamsData[checkTid].members || {};
      for (var checkUid in checkMembers) {
        if (checkMembers.hasOwnProperty(checkUid)) assignedUids[checkUid] = true;
      }
    }
    var unassignedPlayers = playersList.filter(function (p) {
      return !assignedUids[p.id];
    });

    if (unassignedPlayers.length > 0 && teamAssignment !== "random") {
      unassignedDiv.style.display = "";
      unassignedList.innerHTML = "";
      unassignedPlayers.forEach(function (p) {
        var row = document.createElement("div");
        row.className = "unassigned-player";
        row.textContent = p.nickname || p.name || "玩家";
        unassignedList.appendChild(row);
      });
    } else {
      unassignedDiv.style.display = "none";
    }
  }
}

function _showRenameDialog(teamId) {
  GameModal.prompt("更改隊名", "輸入新的隊名（最多 12 字）", {
    icon: "✏️",
    placeholder: "例如：無敵戰隊",
    maxLength: 12,
  }).then(function (newName) {
    if (!newName || !newName.trim()) return;
    if (window.RelayManager) {
      RelayManager.renameTeam(teamId, newName.trim()).catch(function (err) {
        showToast("❌ " + err.message, "error");
      });
    } else {
      // fallback: 直接寫 Firebase
      roomRef
        .child("teams/" + teamId + "/name")
        .set(newName.trim().substring(0, 12));
    }
  });
}

function _escTeamHtml(s) {
  var div = document.createElement("div");
  div.textContent = s || "";
  return div.innerHTML;
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
    // 偵測房主變更：通知所有玩家
    if (previousHostId && previousHostId !== roomData.hostId) {
      if (roomData.hostId === currentPlayerId) {
        showToast("🏠 房主已離開，你現在是房主！", "success");
      } else {
        var newHostPlayer = players[roomData.hostId];
        var newHostName = newHostPlayer
          ? newHostPlayer.nickname || "其他玩家"
          : "其他玩家";
        showToast("🏠 房主已變更為 " + newHostName, "info");
      }
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
    Logger.info("🏠 房主離線，自動接手房主");
    var updates = {};
    updates["hostId"] = currentPlayerId;
    updates["players/" + currentPlayerId + "/isHost"] = true;
    updates["players/" + roomData.hostId + "/isHost"] = false;
    roomRef.update(updates);
  }

  previousHostId = roomData.hostId;
}

function leaveRoom() {
  GameModal.confirm("離開房間", "確定要離開房間嗎？", { icon: "🚪" }).then(
    function (ok) {
      if (!ok) return;

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
                return (
                  entry[0] !== currentPlayerId && entry[1].online !== false
                );
              })
              .sort(function (a, b) {
                var diff = (a[1].joinedAt || 0) - (b[1].joinedAt || 0);
                return diff !== 0 ? diff : a[0].localeCompare(b[0]);
              });

            if (others.length > 0) {
              // 轉移房主給最早加入的在線玩家
              var newHostId = others[0][0];
              Logger.info("🏠 房主離開，轉移給:", newHostId);
              var updates = {};
              updates["hostId"] = newHostId;
              updates["players/" + newHostId + "/isHost"] = true;
              return roomRef.update(updates).then(function () {
                return roomRef.child("players/" + currentPlayerId).remove();
              });
            } else {
              // 沒有其他在線玩家，刪除房間
              Logger.info("🏠 房主離開且無其他玩家，刪除房間");
              return roomRef.remove();
            }
          });
        } else {
          // 一般玩家離開
          Logger.debug("👤 玩家離開，移除玩家資料");
          leavePromise = roomRef.child("players/" + currentPlayerId).remove();
        }
      }

      leavePromise
        .catch(function (err) {
          Logger.warn("離開房間時發生錯誤:", err);
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
    },
  ); // GameModal.confirm .then
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast ${type} show`;

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// =========================================
// 接力賽隊伍面板
// =========================================

var _relayInited = false;

function _updateRelayPanel(roomData, playersList) {
  var panel = document.getElementById("relayTeamPanel");
  if (!panel) return;

  if (roomData.gameMode !== "relay") {
    panel.style.display = "none";
    return;
  }
  panel.style.display = "";

  var teamCount = roomData.teamCount || 2;
  var teamAssignment = roomData.teamAssignment || "random";
  var batonOrderMode = roomData.batonOrderMode || "captainAssign";

  // 首次初始化 RelayManager + 按鈕事件
  if (!_relayInited && window.RelayManager) {
    _relayInited = true;

    RelayManager.init({
      roomCode: currentRoom.code,
      playerId: currentPlayerId,
      isHost: isHost,
      callbacks: {
        onTeamsUpdate: function () {
          // teams 變更時 roomRef.on("value") 會自動觸發 updateLobby
        },
      },
    });

    // selfSelect / manual 模式：首次自動建立空隊伍
    if (
      (teamAssignment === "selfSelect" || teamAssignment === "manual") &&
      isHost
    ) {
      var existingTeams = roomData.teams || {};
      if (Object.keys(existingTeams).length === 0) {
        RelayManager.createEmptyTeams(teamCount);
      }
    }

    // 綁定按鈕
    var autoBtn = document.getElementById("autoAssignBtn");
    var shuffleBtn = document.getElementById("shuffleBatonBtn");

    if (autoBtn) {
      autoBtn.addEventListener("click", function () {
        var tc = currentRoom.teamCount || 2;
        RelayManager.autoAssignTeams(playersList, tc);
        showToast("🔀 已自動分配隊伍", "success");
      });
    }
    if (shuffleBtn) {
      shuffleBtn.addEventListener("click", function () {
        // 對所有隊伍隨機排列棒次
        var teams = currentRoom.teams || {};
        var promises = [];
        for (var tid in teams) {
          if (teams.hasOwnProperty(tid)) {
            promises.push(RelayManager.randomizeBatonOrder(tid));
          }
        }
        Promise.all(promises).then(function () {
          showToast("🎲 已隨機排列所有隊伍棒次", "success");
        });
      });
    }
  }

  // 操作按鈕顯隱：
  // - 自動分隊：random 模式 + 房主
  // - 隨機棒次：batonOrderMode === "random" + 房主
  var actionsDiv = document.getElementById("relayTeamActions");
  if (actionsDiv) {
    var autoBtn2 = document.getElementById("autoAssignBtn");
    var shuffleBtn2 = document.getElementById("shuffleBatonBtn");
    if (autoBtn2) {
      autoBtn2.style.display =
        isHost && teamAssignment === "random" ? "" : "none";
    }
    if (shuffleBtn2) {
      shuffleBtn2.style.display =
        isHost && batonOrderMode === "random" ? "" : "none";
    }
    // 如果兩個都隱藏，整個 actions 也隱藏
    var anyVisible =
      (autoBtn2 && autoBtn2.style.display !== "none") ||
      (shuffleBtn2 && shuffleBtn2.style.display !== "none");
    actionsDiv.style.display = anyVisible ? "" : "none";
  }

  var teamsData = roomData.teams || {};

  _renderRelayTeams(
    teamsData,
    playersList,
    teamCount,
    teamAssignment,
    batonOrderMode,
    roomData.captainSelection || "hostAssign",
  );
}

function _renderRelayTeams(
  teamsData,
  playersList,
  teamCount,
  teamAssignment,
  batonOrderMode,
  captainSelection,
) {
  var grid = document.getElementById("relayTeamsGrid");
  if (!grid) return;

  var presets = window.RelayManager
    ? RelayManager.TEAM_PRESETS
    : [
        { name: "紅隊", color: "#e74c3c", emoji: "🔴" },
        { name: "藍隊", color: "#3498db", emoji: "🔵" },
      ];

  grid.innerHTML = "";

  // uid → player 查找表
  var playerMap = {};
  playersList.forEach(function (p) {
    playerMap[p.id] = p;
  });

  // 判斷我是否為隊長（任一隊）
  var myTeamId = null;
  var iAmCaptain = false;
  for (var checkTid in teamsData) {
    if (!teamsData.hasOwnProperty(checkTid)) continue;
    var checkMembers = teamsData[checkTid].members || {};
    if (checkMembers[currentPlayerId]) {
      myTeamId = checkTid;
      if (teamsData[checkTid].captainId === currentPlayerId) {
        iAmCaptain = true;
      }
      break;
    }
  }

  for (var i = 0; i < teamCount; i++) {
    var preset = presets[i] || {
      name: "隊伍" + (i + 1),
      color: "#999",
      emoji: "⚪",
    };
    var teamId = "team" + (i + 1);
    var teamData = teamsData[teamId] || {};
    var members = teamData.members || {};
    var order = teamData.order || Object.keys(members);
    var teamName = teamData.name || preset.name;
    var teamColor = teamData.color || preset.color;
    var teamEmoji = teamData.emoji || preset.emoji;
    var captainId = teamData.captainId || null;

    var card = document.createElement("div");
    card.className = "relay-team-card";
    card.style.borderColor = teamColor;

    // === header ===
    var headerHTML =
      '<div class="relay-team-header" style="background:' +
      teamColor +
      '">' +
      "<span>" +
      teamEmoji +
      " " +
      '<span class="team-name-text" data-team-id="' +
      teamId +
      '">' +
      _escTeamHtml(teamName) +
      "</span>";

    // 隊長或房主可改名
    if (isHost || captainId === currentPlayerId) {
      headerHTML +=
        '<button class="team-rename-btn" data-team-id="' +
        teamId +
        '" title="更改隊名">✏️ </button>';
    }

    headerHTML +=
      "</span>" +
      '<span class="relay-team-count">' +
      Object.keys(members).length +
      " 人</span>" +
      "</div>";

    // === body：成員列表（依棒次排序） ===
    var bodyHTML = '<div class="relay-team-members" data-team-id="' + teamId + '">';
    if (order.length === 0) {
      bodyHTML += '<div class="relay-empty-hint">尚未分配成員</div>';
    } else {
      // 判斷是否允許棒次拖曳
      // batonOrderMode === "captainAssign" 時：隊長 or 房主可拖曳
      var canDragBaton =
        batonOrderMode === "captainAssign" &&
        (isHost || (captainId === currentPlayerId && teamId === myTeamId));

      order.forEach(function (uid, idx) {
        var p = playerMap[uid] || members[uid] || {};
        var name = p.nickname || p.name || uid.slice(0, 6);
        var isCaptain = captainId === uid;
        var isMe = uid === currentPlayerId;

        bodyHTML +=
          '<div class="relay-member-row' +
          (isMe ? " is-me" : "") +
          '"' +
          (canDragBaton ? ' draggable="true"' : "") +
          ' data-uid="' +
          uid +
          '" data-team-id="' +
          teamId +
          '">' +
          '<span class="relay-baton-num">' +
          (idx + 1) +
          "</span>" +
          (canDragBaton ? '<span class="drag-handle">⠿</span>' : "") +
          '<span class="relay-member-name">' +
          _escTeamHtml(name) +
          "</span>" +
          (isCaptain ? '<span class="relay-captain-badge">👑</span>' : "") +
          (isMe ? '<span class="team-me-badge">← 你</span>' : "");

        // 設定隊長按鈕（hostAssign 模式，房主可操作）
        if (
          isHost &&
          captainSelection === "hostAssign" &&
          !isCaptain
        ) {
          bodyHTML +=
            '<button class="set-captain-btn" data-team-id="' +
            teamId +
            '" data-uid="' +
            uid +
            '" title="設為隊長">👑</button>';
        }

        bodyHTML += "</div>";
      });
    }
    bodyHTML += "</div>";

    // === 所有人可換隊按鈕 ===
    var iAmInThisTeam = members[currentPlayerId] ? true : false;
    if (iAmInThisTeam) {
      bodyHTML +=
        '<div class="team-join-row">' +
        '<span class="team-joined-badge">✅ 已加入</span>' +
        "</div>";
    } else {
      bodyHTML +=
        '<div class="team-join-row">' +
        '<button class="btn btn-sm team-join-btn" data-team-id="' +
        teamId +
        '">🙋 加入此隊</button>' +
        "</div>";
    }

    card.innerHTML = headerHTML + bodyHTML;
    grid.appendChild(card);
  }

  // === 事件綁定 ===

  // 改名按鈕
  grid.querySelectorAll(".team-rename-btn").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      _showRenameDialog(btn.getAttribute("data-team-id"));
    });
  });

  // 加入此隊按鈕
  grid.querySelectorAll(".team-join-btn").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var tid = btn.getAttribute("data-team-id");
      if (!window.RelayManager) return;

      var localPlayer = JSON.parse(
        localStorage.getItem("currentPlayer") || "{}",
      );
      var nickname = localPlayer.nickname || "玩家";

      RelayManager.joinTeam(tid, nickname)
        .then(function () {
          showToast("✅ 已加入" + (teamsData[tid]?.name || tid), "success");
        })
        .catch(function (err) {
          showToast("❌ 加入失敗：" + err.message, "error");
        });
    });
  });

  // 設為隊長按鈕
  grid.querySelectorAll(".set-captain-btn").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var tid = btn.getAttribute("data-team-id");
      var uid = btn.getAttribute("data-uid");
      if (!window.RelayManager) return;

      RelayManager.setCaptain(tid, uid)
        .then(function () {
          showToast("👑 已設定為隊長", "success");
        })
        .catch(function (err) {
          showToast("❌ " + err.message, "error");
        });
    });
  });

  // === 棒次拖曳排序（batonOrderMode === "captainAssign"） ===
  if (batonOrderMode === "captainAssign") {
    _attachBatonDragEvents(grid);
  }

  // === 未分配玩家區 ===
  var unassignedDiv = document.getElementById("relayUnassigned");
  var unassignedList = document.getElementById("relayUnassignedList");
  if (unassignedDiv && unassignedList) {
    var assignedUids = {};
    for (var auTid in teamsData) {
      if (!teamsData.hasOwnProperty(auTid)) continue;
      var auMembers = teamsData[auTid].members || {};
      for (var auUid in auMembers) {
        if (auMembers.hasOwnProperty(auUid)) assignedUids[auUid] = true;
      }
    }
    var unassignedPlayers = playersList.filter(function (p) {
      return !assignedUids[p.id];
    });

    if (unassignedPlayers.length > 0 && teamAssignment !== "random") {
      unassignedDiv.style.display = "";
      unassignedList.innerHTML = "";
      unassignedPlayers.forEach(function (p) {
        var row = document.createElement("div");
        row.className = "unassigned-player";
        row.textContent = p.nickname || p.name || "玩家";
        unassignedList.appendChild(row);
      });
    } else {
      unassignedDiv.style.display = "none";
    }
  }
}

// =========================================
// 棒次拖曳排序（桌面 Drag & Drop + 行動觸控）
// =========================================

var _batonDragUid = null;
var _batonDragTeamId = null;

function _attachBatonDragEvents(grid) {
  // === 桌面 Drag & Drop ===
  grid.addEventListener("dragstart", function (e) {
    var row = e.target.closest(".relay-member-row[draggable]");
    if (!row) return;
    _batonDragUid = row.getAttribute("data-uid");
    _batonDragTeamId = row.getAttribute("data-team-id");
    row.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
  });

  grid.addEventListener("dragover", function (e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    var row = e.target.closest(".relay-member-row");
    if (row) row.classList.add("drag-over");
  });

  grid.addEventListener("dragleave", function (e) {
    var row = e.target.closest(".relay-member-row");
    if (row) row.classList.remove("drag-over");
  });

  grid.addEventListener("drop", function (e) {
    e.preventDefault();
    grid.querySelectorAll(".drag-over").forEach(function (el) {
      el.classList.remove("drag-over");
    });

    var targetRow = e.target.closest(".relay-member-row");
    if (!targetRow || !_batonDragUid) return;

    var targetTeamId = targetRow.getAttribute("data-team-id");

    // 只允許同隊伍內拖曳排序
    if (targetTeamId !== _batonDragTeamId) {
      _batonDragUid = null;
      _batonDragTeamId = null;
      return;
    }

    // 計算新順序
    var teamMembers = grid.querySelectorAll(
      '.relay-member-row[data-team-id="' + targetTeamId + '"]',
    );
    var newOrder = [];
    teamMembers.forEach(function (row) {
      newOrder.push(row.getAttribute("data-uid"));
    });

    // 從 newOrder 中移除被拖曳的 uid，插入到目標位置
    var fromIdx = newOrder.indexOf(_batonDragUid);
    var toIdx = newOrder.indexOf(targetRow.getAttribute("data-uid"));
    if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
      newOrder.splice(fromIdx, 1);
      newOrder.splice(toIdx, 0, _batonDragUid);

      // 寫入 Firebase
      if (window.RelayManager) {
        RelayManager.setBatonOrder(targetTeamId, newOrder)
          .then(function () {
            showToast("✅ 棒次已更新", "success");
          })
          .catch(function (err) {
            showToast("❌ " + err.message, "error");
          });
      }
    }

    _batonDragUid = null;
    _batonDragTeamId = null;
  });

  grid.addEventListener("dragend", function () {
    _batonDragUid = null;
    _batonDragTeamId = null;
    grid.querySelectorAll(".dragging,.drag-over").forEach(function (el) {
      el.classList.remove("dragging", "drag-over");
    });
  });

  // === 行動觸控拖曳 ===
  grid.querySelectorAll(".relay-member-row[draggable]").forEach(function (row) {
    var startY = 0;

    row.addEventListener(
      "touchstart",
      function (e) {
        _batonDragUid = row.getAttribute("data-uid");
        _batonDragTeamId = row.getAttribute("data-team-id");
        startY = e.touches[0].clientY;
        row.classList.add("dragging");
      },
      { passive: true },
    );

    row.addEventListener(
      "touchmove",
      function (e) {
        e.preventDefault();
      },
      { passive: false },
    );

    row.addEventListener("touchend", function (e) {
      row.classList.remove("dragging");
      if (!_batonDragUid || !_batonDragTeamId) return;

      var endY = e.changedTouches[0].clientY;
      var sameTeamRows = grid.querySelectorAll(
        '.relay-member-row[data-team-id="' + _batonDragTeamId + '"]',
      );

      // 找到放下位置對應的 row
      var targetIdx = -1;
      for (var ri = 0; ri < sameTeamRows.length; ri++) {
        var rect = sameTeamRows[ri].getBoundingClientRect();
        if (endY >= rect.top && endY <= rect.bottom) {
          targetIdx = ri;
          break;
        }
      }

      if (targetIdx === -1) {
        _batonDragUid = null;
        _batonDragTeamId = null;
        return;
      }

      // 計算新順序
      var newOrder = [];
      sameTeamRows.forEach(function (r) {
        newOrder.push(r.getAttribute("data-uid"));
      });
      var fromIdx = newOrder.indexOf(_batonDragUid);
      if (fromIdx !== -1 && fromIdx !== targetIdx) {
        newOrder.splice(fromIdx, 1);
        newOrder.splice(targetIdx, 0, _batonDragUid);

        if (window.RelayManager) {
          RelayManager.setBatonOrder(_batonDragTeamId, newOrder)
            .then(function () {
              showToast("✅ 棒次已更新", "success");
            })
            .catch(function (err) {
              showToast("❌ " + err.message, "error");
            });
        }
      }

      _batonDragUid = null;
      _batonDragTeamId = null;
    });
  });
}

// 離開頁面時清理
window.addEventListener("beforeunload", () => {
  if (roomRef) {
    roomRef.off();
  }
  if (window.RelayManager && typeof RelayManager.destroy === "function") {
    RelayManager.destroy();
  }
});
