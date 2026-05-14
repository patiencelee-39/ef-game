// 頁面初始化
document.addEventListener("DOMContentLoaded", async () => {
  // 確保 Firebase 初始化完成
  if (!firebase.apps.length) {
    Logger.error("Firebase 未初始化");
    GameModal.alert("系統錯誤", "系統初始化失敗，請重新整理頁面", {
      icon: "❌",
    });
    return;
  }

  // 匿名登入 Firebase
  try {
    await firebase.auth().signInAnonymously();
    Logger.info("✅ Firebase 登入成功");
  } catch (error) {
    Logger.error("❌ Firebase 登入失敗:", error);
    GameModal.alert("登入失敗", "請重新整理頁面", { icon: "❌" });
    return;
  }

  // 房間代碼欄位預設空白，允許自行填入
  // 不限制字元輸入，但偵測到易混淆字元時顯示警告
  var roomCodeInput = document.getElementById("roomCode");
  var codeWarning = document.getElementById("codeWarning");
  var CONFUSABLE_CHARS = /[0OoIl1i]/;
  roomCodeInput.addEventListener("input", function () {
    var val = roomCodeInput.value.replace(/\s+/g, "").toUpperCase();
    roomCodeInput.value = val;
    if (val && CONFUSABLE_CHARS.test(val)) {
      codeWarning.textContent =
        "⚠️ 代碼含有易混淆字元（0/O、1/I/l）。建議避免使用以免參加者輸入錯誤。";
      codeWarning.style.display = "block";
    } else {
      codeWarning.style.display = "none";
    }
  });

  // 密碼開關
  document.getElementById("hasPassword").addEventListener("change", (e) => {
    document
      .getElementById("passwordGroup")
      .classList.toggle("hidden", !e.target.checked);
  });

  // 遊戲場選擇邏輯 — 使用共用 StagePicker
  StagePicker.init({
    cardsContainer: document.getElementById("availableStages"),
    chipsContainer: document.getElementById("selectedStages"),
    maxSelections: 20,
    onChange: function (stages) {
      selectedStages = stages;
    },
  });

  // 遊戲模式選擇
  initGameModeSelector();

  // 返回按鈕
  document.getElementById("backBtn").addEventListener("click", () => {
    window.location.href = "../index.html";
  });

  // 表單提交
  document
    .getElementById("createRoomForm")
    .addEventListener("submit", handleFormSubmit);
});

// 遊戲場選擇器 — 由 StagePicker 共用元件處理
let selectedStages = [];

// 場地資訊從 ComboSelector 共用模組取得
const stageInfo = (function () {
  var map = {};
  ComboSelector.getAll().forEach(function (s) {
    map[s.id] = s;
  });
  return map;
})();

// 表單提交處理
async function handleFormSubmit(e) {
  e.preventDefault();

  if (selectedStages.length === 0) {
    GameModal.alert("尚未選擇", "請至少選擇一個遊戲場", { icon: "⚠️" });
    return;
  }

  // 驗證房主暱稱
  var hostNickname = document.getElementById("hostNickname").value.trim();
  if (!hostNickname) {
    var useAnon = await GameModal.confirm(
      "尚未輸入暱稱",
      "<p>您尚未輸入房主暱稱。</p>" +
        "<p>按「<b>匿名建立</b>」將以預設名稱 <code>00NoName</code> 建立房間。</p>" +
        "<p>按「<b>返回填寫</b>」可自行輸入暱稱。</p>",
      {
        icon: "🤔",
        rawHtml: true,
        okText: "匿名建立",
        cancelText: "返回填寫",
      },
    );
    if (useAnon) {
      hostNickname = "00NoName";
      document.getElementById("hostNickname").value = hostNickname;
    } else {
      document.getElementById("hostNickname").focus();
      return;
    }
  }

  const button = e.target.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = "建立中...";

  try {
    const roomData = collectFormData();

    // 若代碼未填，自動生成（避開混淆字元）
    if (!roomData.roomCode) {
      if (window.RoomCodeUtils && window.RoomCodeUtils.generateUnique) {
        roomData.roomCode = await window.RoomCodeUtils.generateUnique();
      } else {
        roomData.roomCode = Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase();
      }
    }

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
          nickname: hostNickname,
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
          nickname: hostNickname,
        }),
      );
    }

    // 跳轉到房間大廳
    window.location.href = `room-lobby.html?code=${roomCode}`;
  } catch (error) {
    GameModal.alert("建立失敗", "建立房間失敗: " + error.message, {
      icon: "❌",
    });
    button.disabled = false;
    button.textContent = "建立房間";
  }
}

function collectFormData() {
  // 移除房間代碼中的空格，若空白則留空（後續自動生成）
  var roomCodeValue = document.getElementById("roomCode").value.trim();
  var roomCode = roomCodeValue.replace(/\s+/g, "").toUpperCase();
  var hasPassword = document.getElementById("hasPassword").checked;
  var hostJoinsGame = document.getElementById("hostJoinsGame").checked;
  var wmEl = document.getElementById("enableWM");
  var enableWM = wmEl ? wmEl.checked : false;

  // 遊戲模式
  var activeMode = document.querySelector(
    "#gameModeSelector .game-mode-btn.active",
  );
  var gameMode = activeMode
    ? activeMode.getAttribute("data-mode")
    : "individual";
  var teamCount = 2;
  var teamAssignment = "random";
  var captainSelection = "hostAssign";
  var batonOrderMode = "captainAssign";

  if (gameMode === "relay") {
    // 接力賽：共用隊伍對抗的 slider 讀取隊數
    var relaySlider = document.getElementById("relayTeamCount");
    teamCount = relaySlider ? parseInt(relaySlider.value, 10) : 2;
    // 接力賽：讀取分隊方式
    var relayAssignBtn = document.querySelector(
      "#relayAssignRow .team-assign-btn.active",
    );
    teamAssignment = relayAssignBtn
      ? relayAssignBtn.getAttribute("data-assign")
      : "random";
    // 接力賽：讀取棒次排列
    var relayBatonBtn = document.querySelector(
      "#relayBatonOrderRow .team-assign-btn.active",
    );
    batonOrderMode = relayBatonBtn
      ? relayBatonBtn.getAttribute("data-baton")
      : "captainAssign";
    // 接力賽：讀取隊長選擇
    var relayCaptainBtn = document.querySelector(
      "#relayCaptainSelectRow .team-assign-btn.active",
    );
    captainSelection = relayCaptainBtn
      ? relayCaptainBtn.getAttribute("data-captain")
      : "hostAssign";
  } else if (gameMode === "team") {
    var slider = document.getElementById("teamCount");
    teamCount = slider ? parseInt(slider.value, 10) : 2;
    var activeAssign = document.querySelector(
      "#teamAssignRow .team-assign-btn.active",
    );
    teamAssignment = activeAssign
      ? activeAssign.getAttribute("data-assign")
      : "random";
    // 隊伍對抗沒有隊長功能，captainSelection 保持預設值
  }

  return {
    roomCode: roomCode || "",
    roomName: document.getElementById("roomName").value,
    hostNickname: document.getElementById("hostNickname").value.trim(),
    hasPassword,
    password: hasPassword ? document.getElementById("password").value : null,
    hostJoinsGame,
    enableWM,
    gameMode,
    teamCount,
    teamAssignment,
    captainSelection,
    batonOrderMode,
    maxPlayers: parseInt(document.getElementById("maxPlayers").value, 10) || 8,
    selectedStages,
    questionsCount: parseInt(document.getElementById("questionsCount").value),
    countdownSeconds: parseInt(
      document.getElementById("countdownSeconds").value,
    ),
    displaySettings: {
      showLeaderboard: document.getElementById("showLeaderboard").checked,
      showCompletionNotification: document.getElementById(
        "showCompletionNotification",
      ).checked,
      allowLateJoin: document.getElementById("allowLateJoin").checked,
      showFinalRanking: document.getElementById("showFinalRanking").checked,
    },
  };
}

// =========================================
// 遊戲模式選擇器
// =========================================

function initGameModeSelector() {
  var selector = document.getElementById("gameModeSelector");
  var relayOptions = document.getElementById("relayOptions");
  var teamOptions = document.getElementById("teamOptions");
  var teamAssignRow = document.getElementById("teamAssignRow");
  var teamCountSlider = document.getElementById("teamCount");
  var teamCountValue = document.getElementById("teamCountValue");
  var teamAssignHint = document.getElementById("teamAssignHint");

  if (!selector) return;

  // ┌─────────────────────────────────────────────────────────┐
  // │ 🔒 開發中鎖定（隊伍對抗 & 接力賽）                           │
  // │                                                         │
  // │ ★ 功能完成後如何解鎖：                                     │
  // │   1. 找到這一行「// ┌──」                                 │
  // │   2. 找到下方的「// └──」                                 │
  // │   3. 把這兩行之間的所有東西（包含這兩行本身）全部刪除           │
  // │   4. 存檔，完成。不需要修改任何其他檔案                       │
  // │                                                         │
  // │ ★ 開發者如何進入：                                         │
  // │   在瀏覽器按 F12 → Console，輸入：                         │
  // │   localStorage.setItem("ef_dev_mode", "1")              │
  // │   然後重新整理頁面，按鈕就會出現（還需要輸入密碼）              │
  // └─────────────────────────────────────────────────────────┘
  selector.querySelectorAll('[data-mode="team"],[data-mode="relay"]').forEach(function(btn) {
    if (!localStorage.getItem("ef_dev_mode")) {
      btn.style.display = "none";
    } else {
      btn.addEventListener("click", function(e) {
        e.stopPropagation();
        var pwd = prompt("此功能開發中，開發者請輸入開發密碼：");
        if (pwd !== "00000") {
          GameModal.alert("🔒 功能鎖定", "密碼錯誤或已取消，此功能尚在開發中。", { icon: "🔒" });
        } else {
          selector.querySelectorAll(".game-mode-btn").forEach(function(b) {
            b.classList.remove("active");
          });
          btn.classList.add("active");
          var mode = btn.getAttribute("data-mode");
          var ro = document.getElementById("relayOptions");
          var to = document.getElementById("teamOptions");
          if (ro) ro.classList[mode === "relay" ? "add" : "remove"]("visible");
          if (to) to.classList[mode === "team" ? "add" : "remove"]("visible");
        }
      });
    }
  });
  // └───── 🔒 開發中鎖定結束 ─── 功能完成後刪除到這裡 ─────┘

  // 模式切換
  selector.addEventListener("click", function (e) {
    var btn = e.target.closest(".game-mode-btn");
    if (!btn) return;

    selector.querySelectorAll(".game-mode-btn").forEach(function (b) {
      b.classList.remove("active");
    });
    btn.classList.add("active");

    var mode = btn.getAttribute("data-mode");
    if (relayOptions) {
      if (mode === "relay") {
        relayOptions.classList.add("visible");
      } else {
        relayOptions.classList.remove("visible");
      }
    }
    if (teamOptions) {
      if (mode === "team") {
        teamOptions.classList.add("visible");
      } else {
        teamOptions.classList.remove("visible");
      }
    }
  });

  // 接力賽隊伍數 slider
  var relayTeamSlider = document.getElementById("relayTeamCount");
  var relayTeamValue = document.getElementById("relayTeamCountValue");
  if (relayTeamSlider && relayTeamValue) {
    relayTeamSlider.addEventListener("input", function () {
      relayTeamValue.textContent = relayTeamSlider.value + " 隊";
    });
  }

  // 接力賽分隊方式切換
  var relayAssignRow = document.getElementById("relayAssignRow");
  var relayAssignHint = document.getElementById("relayAssignHint");
  if (relayAssignRow) {
    relayAssignRow.addEventListener("click", function (e) {
      var btn = e.target.closest(".team-assign-btn");
      if (!btn) return;
      relayAssignRow.querySelectorAll(".team-assign-btn").forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      var method = btn.getAttribute("data-assign");
      if (relayAssignHint) {
        var hints = {
          random: "開始遊戲時自動隨機分隊",
          selfSelect: "玩家在等待室自行選擇加入哪一隊",
          manual: "房主在等待室手動分配隊伍",
        };
        relayAssignHint.textContent = hints[method] || "";
      }
    });
  }

  // 接力賽棒次排列模式切換
  var relayBatonRow = document.getElementById("relayBatonOrderRow");
  var relayBatonHint = document.getElementById("relayBatonOrderHint");
  if (relayBatonRow) {
    relayBatonRow.addEventListener("click", function (e) {
      var btn = e.target.closest(".team-assign-btn");
      if (!btn) return;
      relayBatonRow.querySelectorAll(".team-assign-btn").forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      var mode = btn.getAttribute("data-baton");
      if (relayBatonHint) {
        relayBatonHint.textContent =
          mode === "random"
            ? "開始遊戲時自動隨機排列棒次"
            : "隊長在等待室手動安排接力順序";
      }
    });
  }

  // 隊伍對抗 — 隊伍數量滑桿
  if (teamCountSlider && teamCountValue) {
    teamCountSlider.addEventListener("input", function () {
      teamCountValue.textContent = teamCountSlider.value + " 隊";
    });
  }

  // 隊伍對抗 — 分隊方式切換
  if (teamAssignRow) {
    teamAssignRow.addEventListener("click", function (e) {
      var btn = e.target.closest(".team-assign-btn");
      if (!btn) return;

      teamAssignRow.querySelectorAll(".team-assign-btn").forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");

      var method = btn.getAttribute("data-assign");
      if (teamAssignHint) {
        var hints = {
          random: "開始遊戲時自動隨機分隊",
          selfSelect: "玩家在等待室自行選擇加入哪一隊",
          manual: "房主在等待室手動分配隊伍",
        };
        teamAssignHint.textContent = hints[method] || "";
      }
    });
  }

  // 隊長選擇方式切換（僅接力賽）
  ["relayCaptainSelectRow"].forEach(function (rowId) {
    var row = document.getElementById(rowId);
    if (!row) return;
    var hintId = rowId === "captainSelectRow" ? "captainSelectHint" : "relayCaptainSelectHint";
    var hintEl = document.getElementById(hintId);

    row.addEventListener("click", function (e) {
      var btn = e.target.closest(".team-assign-btn");
      if (!btn) return;

      row.querySelectorAll(".team-assign-btn").forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");

      var mode = btn.getAttribute("data-captain");
      if (hintEl) {
        hintEl.textContent =
          mode === "random"
            ? "遊戲開始時自動隨機指定隊長"
            : "房主在等待室指定各隊隊長";
      }
    });
  });

  // 進階設定 — 房間人數上限滑桿
  var maxPlayersSlider = document.getElementById("maxPlayers");
  var maxPlayersValue = document.getElementById("maxPlayersValue");
  if (maxPlayersSlider && maxPlayersValue) {
    maxPlayersSlider.addEventListener("input", function () {
      maxPlayersValue.textContent = maxPlayersSlider.value + " 人";
    });
  }

  // 渲染本場難度參數預覽
  renderParamPreview();
}

/**
 * 渲染房間難度參數預覽表
 */
function renderParamPreview() {
  const SP_DEFAULTS = {
    stimulusMs: 2000,
    graceMs: 1000,
    isiMinMs: 800,
    isiMaxMs: 1200,
    feedbackMs: 800,
    goRatio: 80,
    wmMinPos: 2,
    wmMaxPos: 4,
    wmReverse: 30,
    wmTimeoutMs: 60000,
  };

  let params = {};
  try {
    const raw = localStorage.getItem("ef_static_params");
    if (raw) params = JSON.parse(raw);
  } catch (e) {
    /* ignore */
  }

  const html = '<table style="width:100%;border-collapse:collapse;font-size:0.9rem;">'
    + '<tr style="border-bottom:1px solid rgba(255,255,255,0.1);"><td style="padding:6px 8px;font-weight:600;width:40%;">圖片顯示</td><td style="padding:6px 8px;">' + (params.stimulusMs || SP_DEFAULTS.stimulusMs) + ' ms</td></tr>'
    + '<tr style="border-bottom:1px solid rgba(255,255,255,0.1);"><td style="padding:6px 8px;font-weight:600;width:40%;">對錯反饋</td><td style="padding:6px 8px;">' + (params.feedbackMs || SP_DEFAULTS.feedbackMs) + ' ms</td></tr>'
    + '<tr style="border-bottom:1px solid rgba(255,255,255,0.1);"><td style="padding:6px 8px;font-weight:600;width:40%;">題目間隔</td><td style="padding:6px 8px;">' + (params.isiMinMs || SP_DEFAULTS.isiMinMs) + '~' + (params.isiMaxMs || SP_DEFAULTS.isiMaxMs) + ' ms</td></tr>'
    + '<tr style="border-bottom:1px solid rgba(255,255,255,0.1);"><td style="padding:6px 8px;font-weight:600;width:40%;">額外反應</td><td style="padding:6px 8px;">' + (params.graceMs || SP_DEFAULTS.graceMs) + ' ms</td></tr>'
    + '<tr style="border-bottom:1px solid rgba(255,255,255,0.1);"><td style="padding:6px 8px;font-weight:600;width:40%;">Go比例</td><td style="padding:6px 8px;">' + (params.goRatio || SP_DEFAULTS.goRatio) + '%</td></tr>'
    + '<tr style="border-bottom:1px solid rgba(255,255,255,0.1);"><td style="padding:6px 8px;font-weight:600;width:40%;">WM廣度</td><td style="padding:6px 8px;">' + (params.wmMinPos || SP_DEFAULTS.wmMinPos) + '~' + (params.wmMaxPos || SP_DEFAULTS.wmMaxPos) + ' 格</td></tr>'
    + '<tr style="border-bottom:1px solid rgba(255,255,255,0.1);"><td style="padding:6px 8px;font-weight:600;width:40%;">WM作答時限</td><td style="padding:6px 8px;">' + ((params.wmTimeoutMs || SP_DEFAULTS.wmTimeoutMs) / 1000).toFixed(0) + ' 秒</td></tr>'
    + '<tr><td style="padding:6px 8px;font-weight:600;width:40%;">逆序機率</td><td style="padding:6px 8px;">' + (params.wmReverse || SP_DEFAULTS.wmReverse) + '%</td></tr>'
    + '</table>';

  const paramPreview = document.getElementById("paramPreview");
  if (paramPreview) {
    paramPreview.innerHTML = html;
  }
}
