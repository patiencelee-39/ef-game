// =========================================
// 探險地圖頁面控制
// =========================================

var currentViewMapIndex = 0;
var selectedPointData = null;
var _boardDetectTimer = null;
var _detectedBoard = null;

// ─── 探險點座標（百分比，相對於地圖圖片）───
// 座標會在地圖圖片載入後套用
// 每張地圖 6 個點沿白色路徑分佈
var POINT_POSITIONS = {
  mouse: [
    { left: "15%", top: "72%" },
    { left: "30%", top: "58%" },
    { left: "48%", top: "68%" },
    { left: "62%", top: "52%" },
    { left: "75%", top: "62%" },
    { left: "88%", top: "45%" },
  ],
  fishing: [
    { left: "12%", top: "70%" },
    { left: "28%", top: "55%" },
    { left: "42%", top: "65%" },
    { left: "58%", top: "48%" },
    { left: "72%", top: "58%" },
    { left: "85%", top: "42%" },
  ],
};

// ─── 初始化 ───

document.addEventListener("DOMContentLoaded", function () {
  // 🔊 初始化音訊
  if (typeof AudioPlayer !== "undefined" && AudioPlayer.init) {
    AudioPlayer.init();
  }
  _initMap();
});

function _showIdentityModal(callback) {
  var modal = document.getElementById("identityModal");
  modal.style.display = "flex";
  FocusTrap.activate(modal);
  var inputChildCode = document.getElementById("idChildCode");
  var inputNick = document.getElementById("idNickname");
  var inputClass = document.getElementById("idClass");
  var btnSubmit = document.getElementById("idSubmit");

  // 重置偵測狀態
  _detectedBoard = null;
  if (_boardDetectTimer) clearTimeout(_boardDetectTimer);

  // 自動 focus
  setTimeout(function () {
    inputNick.focus();
  }, 200);

  // === 看板代碼即時偵測 ===
  _setupBoardCodeDetection(inputClass);

  // --- 正式提交 ---
  btnSubmit.addEventListener("click", function () {
    var nick = inputNick.value.trim();
    var cls = inputClass.value.trim();
    if (!nick) {
      // 未填暱稱 → 彈出匿名確認視窗
      GameModal.confirm(
        "⚠️ 尚未填寫暱稱",
        '<p style="text-align:left;line-height:1.8;margin:0">' +
          "您尚未輸入暱稱或座號。<br>" +
          "若繼續，系統將以預設匿名身份 <b>00NoName</b> 進行遊戲：" +
          "</p>" +
          '<ul style="text-align:left;margin:8px 0 0 16px;padding:0;line-height:1.8">' +
          "<li>遊戲紀錄僅存於本次瀏覽階段</li>" +
          "<li>關閉分頁後紀錄自動清除</li>" +
          "<li>成績不會上傳至班級排行榜</li>" +
          "</ul>",
        {
          icon: "🙈",
          okText: "以匿名繼續",
          cancelText: "返回填寫",
          rawHtml: true,
        },
      ).then(function (confirmed) {
        if (confirmed) {
          _enterGuestMode();
        } else {
          inputNick.focus();
        }
      });
      return;
    }
    // 建立 / 更新 profile
    var childCode = inputChildCode ? inputChildCode.value.trim() : "";
    var profile = getPlayerProfile();
    if (profile) {
      profile.nickname = nick;
      profile.seatNumber = nick;
      profile.childCode = childCode;
      if (_detectedBoard) {
        profile.boardCode = _detectedBoard.code;
        profile.boardId = _detectedBoard.boardId;
        profile.boardName = _detectedBoard.boardName;
        profile.playerClass = _detectedBoard.boardName;
      } else {
        profile.playerClass = cls || "未分班";
        delete profile.boardCode;
        delete profile.boardId;
        delete profile.boardName;
      }
      savePlayerProfile(profile);
    } else {
      var className = _detectedBoard
        ? _detectedBoard.boardName
        : cls || "未分班";
      var p = initPlayerProfile(nick, nick, className);
      // 儲存兒童代碼
      var newPf = getPlayerProfile();
      if (newPf) {
        newPf.childCode = childCode;
        if (_detectedBoard) {
          newPf.boardCode = _detectedBoard.code;
          newPf.boardId = _detectedBoard.boardId;
          newPf.boardName = _detectedBoard.boardName;
        }
        savePlayerProfile(newPf);
      } else if (_detectedBoard) {
        var pf = getPlayerProfile();
        if (pf) {
          pf.boardCode = _detectedBoard.code;
          pf.boardId = _detectedBoard.boardId;
          pf.boardName = _detectedBoard.boardName;
          savePlayerProfile(pf);
        }
      }
    }
    modal.style.display = "none";
    FocusTrap.deactivate();

    // === 前測量表提醒 ===
    if (childCode) {
      try {
        var chexiRecords = JSON.parse(
          localStorage.getItem("efgame-chexi-records") || "[]",
        );
        var hasPreTest = chexiRecords.some(function (r) {
          var base = (r.childCode || "").replace(
            /\(\d{4}_\d{2}_\d{2}_\d{2}_\d{2}_\d{2}\)$/,
            "",
          );
          return (
            base.toLowerCase() === childCode.toLowerCase() &&
            r.testType === "pre"
          );
        });
        if (
          !hasPreTest &&
          typeof GameModal !== "undefined" &&
          GameModal.confirm
        ) {
          GameModal.confirm(
            "📋 尚未完成前測量表",
            "兒童代碼 <b>" +
              childCode +
              "</b> 尚未完成 TC-CHEXI 前測量表。<br>建議在開始訓練前，請家長或教師先完成前測評估。",
            {
              icon: "📋",
              okText: "前往填寫",
              cancelText: "稍後再說",
              rawHtml: true,
            },
          ).then(function (go) {
            if (go) {
              window.location.href = "../assessment/index.html";
            } else {
              if (callback) callback();
            }
          });
          return; // 不立即 callback，等使用者決定
        }
      } catch (e) {
        /* ignore */
      }
    }

    if (callback) callback();
  });

  // --- 取消（訪客模式 00NoName）---
  function _enterGuestMode() {
    // 啟用 sessionStorage 模式 → 關閉分頁即自動消失
    if (typeof enableGuestSessionMode === "function") {
      enableGuestSessionMode();
    }
    initPlayerProfile(GUEST_NICKNAME, GUEST_NICKNAME, "訪客");
    modal.style.display = "none";
    FocusTrap.deactivate();

    if (callback) callback();
  }

  // --- 點擊背景半透明區域 = 取消（關閉彈窗回到地圖）---
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      modal.style.display = "none";
      FocusTrap.deactivate();
    }
  });

  // Enter 鍵提交
  [inputNick, inputClass].forEach(function (el) {
    el.addEventListener("keydown", function (e) {
      if (e.isComposing || e.keyCode === 229) return;
      if (e.key === "Enter") btnSubmit.click();
    });
  });
}

// === 看板代碼即時偵測 ===
function _setupBoardCodeDetection(inputClass) {
  var statusEl = document.getElementById("idClassStatus");

  inputClass.addEventListener("input", function () {
    var val = inputClass.value.trim().toUpperCase();
    _detectedBoard = null;

    if (_boardDetectTimer) clearTimeout(_boardDetectTimer);

    // 不像代碼（太短或含中文等非英數字）→ 不查詢
    if (val.length < 4 || !/^[A-Z0-9]+$/.test(val)) {
      if (statusEl) statusEl.textContent = "";
      return;
    }

    // debounce 500ms
    _boardDetectTimer = setTimeout(function () {
      if (
        typeof FirestoreLeaderboard === "undefined" ||
        !FirestoreLeaderboard.findBoardByCode
      ) {
        return;
      }

      if (statusEl) {
        statusEl.textContent = "🔍 查詢中…";
        statusEl.style.color = "rgba(255,255,255,0.5)";
      }

      FirestoreLeaderboard.findBoardByCode(val)
        .then(function (board) {
          // 確保輸入值沒變
          if (inputClass.value.trim().toUpperCase() !== val) return;

          if (board) {
            _detectedBoard = board;
            if (statusEl) {
              statusEl.textContent = "✅ 有效看板代碼：" + board.boardName;
              statusEl.style.color = "#4caf50";
            }
          } else {
            _detectedBoard = null;
            if (statusEl) {
              statusEl.textContent = "將儲存為班級名稱";
              statusEl.style.color = "rgba(255,255,255,0.4)";
            }
          }
        })
        .catch(function () {
          if (statusEl) statusEl.textContent = "";
        });
    }, 500);
  });
}

function _initMap() {
  // 教師覆寫檢查
  if (ProgressTracker.checkTeacherOverride()) {
    ProgressTracker.applyTeacherOverride();
  }

  updateHeaderInfo();
  setupMapTabs();

  // 讀取 URL 參數決定預設地圖（從釣魚結算回來時顯示釣魚地圖）
  var initialMap = 0;
  try {
    var params = new URLSearchParams(window.location.search);
    var mapParam = parseInt(params.get("map"), 10);
    if (
      !isNaN(mapParam) &&
      mapParam >= 0 &&
      mapParam <
        (typeof ADVENTURE_MAPS !== "undefined" ? ADVENTURE_MAPS.length : 2)
    ) {
      initialMap = mapParam;
    }
  } catch (e) {
    /* ignore */
  }

  if (initialMap > 0) {
    switchMap(initialMap);
  } else {
    renderMap(0);
  }

  // === 故事系統：檢查是否有待播放的完成對話 / 進化動畫 ===
  if (typeof StoryDialogue !== "undefined" && StoryDialogue.checkPendingEvent) {
    StoryDialogue.checkPendingEvent(function () {
      // 對話結束後刷新 header（可能已進化）
      updateHeaderInfo();
      scrollToCurrentPoint();
    });
  } else {
    scrollToCurrentPoint();
  }
}

// ─── Header 更新 ───

function updateHeaderInfo() {
  var totalStars = getTotalStars();
  var availableStars = getAvailableStars();
  document.getElementById("total-stars").textContent = totalStars;

  // 若有花費過星星，顯示可用/總計
  var profile = getPlayerProfile();
  if (profile && (profile.spentStars || 0) > 0) {
    document.getElementById("total-stars").textContent =
      availableStars + "/" + totalStars;
  }

  var levelDef = getLevelByStars(totalStars);
  if (levelDef) {
    document.querySelector(".level-icon").textContent = levelDef.icon;
    document.querySelector(".level-name").textContent = levelDef.name;
  }

  // 徽章數
  var badgeCount = typeof getBadges === "function" ? getBadges().length : 0;
  var badgeEl = document.getElementById("total-badges");
  if (badgeEl) badgeEl.textContent = badgeCount;
}

// ─── Tab 控制 ───

function setupMapTabs() {
  var progress = getAdventureProgress();

  // 地圖 2 解鎖檢查
  var map2Unlocked = progress.currentMapIndex >= 1 || isMapAllPassed("mouse");
  var tab1 = document.getElementById("tab-map-1");
  if (!map2Unlocked) {
    tab1.classList.add("locked");
  }

  // 自由選擇解鎖檢查
  var freeTab = document.getElementById("tab-free-select");
  if (!ProgressTracker.isFreeSelectAvailable()) {
    freeTab.classList.add("locked");
  }

  // Tab 點擊事件
  document.getElementById("map-tabs").addEventListener("click", function (e) {
    var tab = e.target.closest(".map-tab");
    if (!tab) return;

    // 鎖定的 tab → 顯示提示
    if (tab.classList.contains("locked")) {
      var mapIndex = tab.dataset.map;
      if (mapIndex === "free") {
        GameModal.alert(
          "🔒 尚未解鎖",
          "完成全部 12 個探險關卡後，即可開啟自由選擇模式！",
          { icon: "🔒" },
        );
      } else {
        GameModal.alert(
          "🔒 尚未解鎖",
          "完成上一張地圖的所有關卡後，即可解鎖此地圖！",
          { icon: "🔒" },
        );
      }
      return;
    }

    var mapIndex = tab.dataset.map;

    if (mapIndex === "free") {
      ModeController.goToFreeSelect();
      return;
    }

    var idx = parseInt(mapIndex, 10);
    switchMap(idx);
  });
}

function switchMap(mapIndex) {
  currentViewMapIndex = mapIndex;

  // 更新 tab 狀態
  document.querySelectorAll(".map-tab").forEach(function (t) {
    t.classList.remove("active");
  });
  var activeTab = document.getElementById("tab-map-" + mapIndex);
  if (activeTab) activeTab.classList.add("active");

  // 更新標題
  var mapDef = ADVENTURE_MAPS[mapIndex];
  document.getElementById("header-title").textContent =
    mapDef.icon + " " + mapDef.name;

  // 切換地圖背景 SVG
  var mapBg = document.getElementById("map-bg");
  var MAP_SVG_FILES = [
    "../images/adventure-map.svg", // map 0: 小老鼠
    "../images/adventure-map2.svg", // map 1: 釣魚
  ];
  if (mapBg && MAP_SVG_FILES[mapIndex]) {
    mapBg.src = MAP_SVG_FILES[mapIndex];
  }

  renderMap(mapIndex);
}

// ─── 鎖定探險點暗示圖案 ───

/** 根據 field + rule 取得對應的刺激物 emoji，用於鎖定狀態暗示 */
function _getPointHintIcon(fieldId, ruleId) {
  var iconMap = {
    mouse: { rule1: "🧀", rule2: "😺", mixed: "🔀" },
    fishing: { rule1: "🐟", rule2: "🦈", mixed: "🔀" },
  };
  var fieldIcons = iconMap[fieldId];
  if (fieldIcons && fieldIcons[ruleId]) return fieldIcons[ruleId];
  // fallback → 使用 GAME_CONFIG field icon
  var f = GAME_CONFIG.FIELDS[fieldId];
  return f ? f.icon : "❓";
}

// ─── 地圖渲染 ───

function renderMap(mapIndex) {
  var overlay = document.getElementById("points-overlay");
  overlay.innerHTML = "";

  var statuses = ProgressTracker.getAllPointStatuses();
  var mapDef = ADVENTURE_MAPS[mapIndex];
  var mapPoints = statuses.filter(function (s) {
    return s.mapId === mapDef.id;
  });

  var positions = POINT_POSITIONS[mapDef.id];

  mapPoints.forEach(function (point, idx) {
    var pos = positions[idx] || { left: "50%", top: "50%" };

    var el = document.createElement("button");
    el.type = "button";
    el.className = "adventure-point point-" + point.status;
    el.style.left = pos.left;
    el.style.top = pos.top;
    el.style.transform = "translate(-50%, -50%)";
    el.dataset.pointIndex = idx;
    el.dataset.mapIndex = mapIndex;

    // 無障礙標籤
    var pointName = point.pointLabel.replace(/[①②③④⑤⑥⑦⑧⑨⑩⑪⑫]\s*/, "");
    if (point.status === "locked") {
      el.setAttribute("aria-label", pointName + "（尚未解鎖）");
      el.setAttribute("aria-disabled", "true");
      el.disabled = true;
    } else if (point.status === "current") {
      el.setAttribute("aria-label", pointName + "（目前關卡）");
    } else {
      var totalStars = point.starsEarned + point.wmStarsEarned;
      el.setAttribute(
        "aria-label",
        pointName + "（已通過，" + totalStars + " 星）",
      );
    }

    // 圓形按鈕
    var circle = document.createElement("div");
    circle.className = "point-circle";
    circle.setAttribute("aria-hidden", "true");

    if (point.status === "locked") {
      // 鎖定 → 顯示鎖頭
      circle.textContent = "🔒";
    } else {
      // 解鎖（current 或 passed）→ 顯示規則對應 emoji
      circle.textContent = _getPointHintIcon(point.field, point.rule);
    }

    el.appendChild(circle);

    // 標籤
    var label = document.createElement("div");
    label.className = "point-label";
    label.setAttribute("aria-hidden", "true");
    label.textContent = pointName;
    el.appendChild(label);

    // 已通過的星星數（顯示在標籤下方）
    if (
      point.status === "passed" &&
      point.starsEarned + point.wmStarsEarned > 0
    ) {
      var starsEl = document.createElement("div");
      starsEl.className = "point-stars";
      starsEl.setAttribute("aria-hidden", "true");
      starsEl.textContent = "⭐×" + (point.starsEarned + point.wmStarsEarned);
      el.appendChild(starsEl);
    }

    // 點擊事件
    if (point.status !== "locked") {
      el.addEventListener("click", function () {
        showPointInfo(point, idx, mapIndex);
      });
    } else {
      // 鎖定的探險點 → 提示使用者
      el.disabled = false; // 讓點擊事件能觸發
      el.addEventListener("click", function () {
        GameModal.alert(
          "🔒 尚未解鎖",
          "需先完成前面的關卡才能挑戰此探險點喔！",
          { icon: "🔒" },
        );
      });
    }

    overlay.appendChild(el);
  });
}

// ─── 探險點 Info Popup ───

function showPointInfo(point, pointIndex, mapIndex) {
  // 🔊 點擊音效
  if (typeof AudioPlayer !== "undefined" && AudioPlayer.playSfx) {
    AudioPlayer.playSfx(
      typeof getSoundFile === "function"
        ? getSoundFile("sfx.buttonClick")
        : null,
      { synthPreset: "click" },
    );
  }

  selectedPointData = {
    point: point,
    pointIndex: pointIndex,
    mapIndex: mapIndex,
  };

  var fieldConfig = GAME_CONFIG.FIELDS[point.field];
  var fieldName = fieldConfig ? fieldConfig.name : point.field;

  document.getElementById("popup-title").textContent = point.pointLabel;
  document.getElementById("popup-details").textContent =
    (fieldConfig ? fieldConfig.icon : "") +
    " " +
    fieldName +
    " × " +
    point.rule;

  // === 故事系統：注入開場對話 ===
  var storyContainer = document.getElementById("popup-story-opening");
  if (storyContainer) {
    var storyHTML = "";
    if (typeof StoryDialogue !== "undefined" && StoryDialogue.getOpeningHTML) {
      storyHTML = StoryDialogue.getOpeningHTML(point.pointId || point.id);
    }
    if (storyHTML) {
      storyContainer.innerHTML = storyHTML;
      storyContainer.style.display = "block";
      // 🔊 播放開場對話語音
      if (
        typeof StoryDialogue !== "undefined" &&
        StoryDialogue.playOpeningVoice
      ) {
        StoryDialogue.playOpeningVoice(point.pointId || point.id);
      }
    } else {
      storyContainer.innerHTML = "";
      storyContainer.style.display = "none";
    }
  }

  // WM 提示
  var wmEl = document.getElementById("popup-wm");
  wmEl.style.display = point.hasWM ? "block" : "none";

  // 最佳紀錄
  var bestEl = document.getElementById("popup-best");
  if (point.bestScore > 0) {
    bestEl.style.display = "block";
    document.getElementById("popup-best-score").textContent = point.bestScore;
    document.getElementById("popup-best-stars").textContent =
      point.starsEarned + point.wmStarsEarned;
  } else {
    bestEl.style.display = "none";
  }

  // 開始按鈕文字
  var playBtn = document.getElementById("popup-play-btn");
  playBtn.textContent = point.status === "passed" ? "🔄 再玩一次" : "▶️ 開始";

  // 規則說明連結
  var ruleLink = document.getElementById("popup-rule-link");
  if (ruleLink) {
    var introUrl =
      "../shared/game-intro.html?field=" +
      encodeURIComponent(point.field) +
      "&rule=" +
      encodeURIComponent(point.rule) +
      (point.hasWM ? "&wm=1" : "");
    ruleLink.href = introUrl;
  }

  document.getElementById("point-info-popup").classList.add("visible");
  FocusTrap.activate(document.getElementById("point-info-popup"));
}

function closePointInfo() {
  document.getElementById("point-info-popup").classList.remove("visible");
  FocusTrap.deactivate();
  selectedPointData = null;
}

function playCurrentPoint() {
  // 🔊 開始遊戲音效
  if (typeof AudioPlayer !== "undefined" && AudioPlayer.playSfx) {
    AudioPlayer.playSfx(
      typeof getSoundFile === "function"
        ? getSoundFile("sfx.pageTransition")
        : null,
      { synthPreset: "transition" },
    );
  }

  var pointOverride = null;

  // 若使用者選擇的是已通過的關卡（重玩），需傳遞指定的探險點
  if (selectedPointData && selectedPointData.point) {
    var status = selectedPointData.point.status;
    pointOverride = {
      mapIndex: selectedPointData.mapIndex,
      pointIndex: selectedPointData.pointIndex,
    };
  }

  closePointInfo();

  // 遊戲開始前檢查身份資料
  var profile = getPlayerProfile();
  if (!profile || !profile.nickname) {
    _showIdentityModal(function () {
      updateHeaderInfo();
      ModeController.startAdventureGame(pointOverride);
    });
  } else {
    ModeController.startAdventureGame(pointOverride);
  }
}

// 點擊 popup 外部關閉
document
  .getElementById("point-info-popup")
  .addEventListener("click", function (e) {
    if (e.target === this) closePointInfo();
  });

// ─── 自動滾動到當前點 ───

function scrollToCurrentPoint() {
  setTimeout(function () {
    var currentEl = document.querySelector(".point-current");
    if (currentEl) {
      currentEl.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  }, 500);
}
