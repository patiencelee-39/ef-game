// 頁面初始化
document.addEventListener("DOMContentLoaded", async () => {
  // 確保 Firebase 初始化完成
  if (!firebase.apps.length) {
    console.error("Firebase 未初始化");
    alert("系統初始化失敗，請重新整理頁面");
    return;
  }

  // 匿名登入 Firebase
  try {
    await firebase.auth().signInAnonymously();
    console.log("✅ Firebase 登入成功");
  } catch (error) {
    console.error("❌ Firebase 登入失敗:", error);
    alert("登入失敗，請重新整理頁面");
    return;
  }

  // 生成房間代碼
  try {
    // 確保 RoomCodeUtils 已載入
    if (!window.RoomCodeUtils) {
      throw new Error("RoomCodeUtils 未載入");
    }

    const roomCode = await window.RoomCodeUtils.generateUnique();
    const formattedCode = window.RoomCodeUtils.format(roomCode);
    document.getElementById("roomCode").value = formattedCode;
    console.log("✅ 房間代碼生成成功:", formattedCode);
  } catch (error) {
    console.error("❌ 生成房間代碼失敗:", error);
    // 如果自動生成失敗，使用備用方案
    const fallbackCode = "ABCDE";
    document.getElementById("roomCode").value =
      window.RoomCodeUtils?.format(fallbackCode) || fallbackCode;
    console.warn("⚠️ 使用備用代碼:", fallbackCode);
  }

  // 密碼開關
  document.getElementById("hasPassword").addEventListener("change", (e) => {
    document.getElementById("passwordGroup").style.display = e.target.checked
      ? "block"
      : "none";
  });

  // 重新生成代碼
  document
    .getElementById("regenerateCode")
    .addEventListener("click", async () => {
      try {
        const newCode = await window.RoomCodeUtils.generateUnique();
        document.getElementById("roomCode").value =
          window.RoomCodeUtils.format(newCode);
      } catch (error) {
        alert("生成代碼失敗: " + error.message);
      }
    });

  // 遊戲場選擇邏輯
  initStageSelector();

  // 表單提交
  document
    .getElementById("createRoomForm")
    .addEventListener("submit", handleFormSubmit);
});

// 遊戲場選擇器初始化
let selectedStages = [];

// 場地資訊定義（只保留 A-D 四個場地）
const stageInfo = {
  A: { id: "A", name: "場地A：起司森林", icon: "🧀", difficulty: "easy" },
  B: {
    id: "B",
    name: "場地B：人類村莊",
    icon: "🧑",
    difficulty: "medium",
  },
  C: {
    id: "C",
    name: "場地C：海洋世界",
    icon: "🐟",
    difficulty: "medium",
  },
  D: { id: "D", name: "場地D：晝夜迷宮", icon: "🌙", difficulty: "hard" },
};

function initStageSelector() {
  const availableStages = document.getElementById("availableStages");
  const selectedStagesContainer = document.getElementById("selectedStages");

  // 點擊可選場地
  availableStages.addEventListener("click", (e) => {
    const card = e.target.closest(".stage-card");
    if (!card || card.classList.contains("disabled")) return;

    const stageId = card.dataset.stage;
    addStage(stageId);
  });
}

function addStage(stageId) {
  if (selectedStages.length >= 4) {
    alert("最多只能選擇4個遊戲場");
    return;
  }

  if (selectedStages.includes(stageId)) {
    alert("此遊戲場已選擇");
    return;
  }

  selectedStages.push(stageId);
  updateStageDisplay();
}

function removeStage(stageId) {
  selectedStages = selectedStages.filter((id) => id !== stageId);
  updateStageDisplay();
}

// 拖曳功能
let draggedStageId = null;

function handleDragStart(e) {
  draggedStageId = e.target.closest(".stage-chip").dataset.stage;
  e.dataTransfer.effectAllowed = "move";
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  return false;
}

function handleDrop(e) {
  e.preventDefault();
  const targetStageId = e.target.closest(".stage-chip")?.dataset.stage;

  if (!targetStageId || draggedStageId === targetStageId) return;

  const draggedIndex = selectedStages.indexOf(draggedStageId);
  const targetIndex = selectedStages.indexOf(targetStageId);

  selectedStages.splice(draggedIndex, 1);
  selectedStages.splice(targetIndex, 0, draggedStageId);

  updateStageDisplay();
  draggedStageId = null;
}

function updateStageDisplay() {
  const container = document.getElementById("selectedStages");

  if (selectedStages.length === 0) {
    container.innerHTML =
      '<div class="selected-stages-empty">👆 請從下方選擇遊戲場（最多4個）</div>';
  } else {
    container.innerHTML = selectedStages
      .map((stageId) => {
        const stage = stageInfo[stageId];
        return `
                        <div class="stage-chip" draggable="true" data-stage="${stageId}" ondragstart="handleDragStart(event)" ondragover="handleDragOver(event)" ondrop="handleDrop(event)">
                            <span class="emoji">${stage.icon}</span>
                            <span>${stage.name}</span>
                            <button type="button" class="remove-btn" onclick="removeStage('${stageId}')">✕</button>
                        </div>
                    `;
      })
      .join("");
  }

  // 更新可選場地狀態
  document.querySelectorAll(".stage-card").forEach((card) => {
    const stageId = card.dataset.stage;
    if (selectedStages.includes(stageId)) {
      card.classList.add("disabled");
    } else {
      card.classList.remove("disabled");
    }
  });
}

// 表單提交處理
async function handleFormSubmit(e) {
  e.preventDefault();

  if (selectedStages.length === 0) {
    alert("請至少選擇一個遊戲場");
    return;
  }

  const button = e.target.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = "建立中...";

  try {
    const roomData = collectFormData();
    const roomCode = await window.RoomManager.createRoom(roomData);

    // 保存房間資訊到 localStorage
    const currentUser = firebase.auth().currentUser;
    localStorage.setItem(
      "currentRoom",
      JSON.stringify({
        code: roomCode,
        name: roomData.roomName,
        hostId: currentUser.uid,
      }),
    );

    // 只有房主參與遊戲時才保存 currentPlayer
    if (roomData.hostJoinsGame) {
      localStorage.setItem(
        "currentPlayer",
        JSON.stringify({
          id: currentUser.uid,
          isHost: true,
          nickname: "房主",
        }),
      );
    } else {
      // 房主不參與遊戲，但仍需要記錄身份用於管理
      localStorage.setItem(
        "currentPlayer",
        JSON.stringify({
          id: currentUser.uid,
          isHost: true,
          isSpectator: true,
          nickname: "房主（觀戰）",
        }),
      );
    }

    // 跳轉到房間大廳
    window.location.href = `room-lobby.html?code=${roomCode}`;
  } catch (error) {
    alert("建立房間失敗: " + error.message);
    button.disabled = false;
    button.textContent = "建立房間";
  }
}

function collectFormData() {
  // 移除房間代碼中的空格
  const roomCodeValue = document.getElementById("roomCode").value;
  const roomCode = roomCodeValue.replace(/\s+/g, ""); // 直接移除空格，不依賴 RoomCodeUtils
  const hasPassword = document.getElementById("hasPassword").checked;
  const hostJoinsGame = document.getElementById("hostJoinsGame").checked;

  return {
    roomCode,
    roomName: document.getElementById("roomName").value,
    hasPassword,
    password: hasPassword ? document.getElementById("password").value : null,
    hostJoinsGame,
    selectedStages,
    questionsCount: parseInt(document.getElementById("questionsCount").value),
    countdownSeconds: parseInt(
      document.getElementById("countdownSeconds").value,
    ),
    displaySettings: {
      showLeaderboard: document.getElementById("showLeaderboard").checked,
      showAnswerStatus: document.getElementById("showAnswerStatus").checked,
      showCompletionNotification: document.getElementById(
        "showCompletionNotification",
      ).checked,
      allowLateJoin: document.getElementById("allowLateJoin").checked,
      showFinalRanking: document.getElementById("showFinalRanking").checked,
    },
  };
}
