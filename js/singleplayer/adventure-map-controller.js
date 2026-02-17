// =========================================
// 探險地圖頁面控制
// =========================================

var currentViewMapIndex = 0;
var selectedPointData = null;

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
  var inputNick = document.getElementById("idNickname");
  var inputClass = document.getElementById("idClass");
  var btnSubmit = document.getElementById("idSubmit");

  // 自動 focus
  setTimeout(function () {
    inputNick.focus();
  }, 200);

  // --- 正式提交 ---
  btnSubmit.addEventListener("click", function () {
    var nick = inputNick.value.trim();
    var cls = inputClass.value.trim();
    if (!nick) {
      inputNick.style.borderColor = "#e74c3c";
      inputNick.setAttribute("placeholder", "請輸入暱稱或座號");
      inputNick.focus();
      return;
    }
    // 建立 / 更新 profile
    var profile = getPlayerProfile();
    if (profile) {
      profile.nickname = nick;
      profile.seatNumber = nick;
      profile.playerClass = cls || "未分班";
      savePlayerProfile(profile);
    } else {
      var p = initPlayerProfile(nick, nick, cls || "未分班");
    }
    modal.style.display = "none";
    FocusTrap.deactivate();
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

  // --- 點擊背景半透明區域 = 取消（訪客模式 00NoName）---
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      _enterGuestMode();
    }
  });

  // Enter 鍵提交
  [inputNick, inputClass].forEach(function (el) {
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter") btnSubmit.click();
    });
  });
}

function _initMap() {
  // 教師覆寫檢查
  if (ProgressTracker.checkTeacherOverride()) {
    ProgressTracker.applyTeacherOverride();
  }

  updateHeaderInfo();
  setupMapTabs();
  renderMap(0);
  scrollToCurrentPoint();
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
    if (!tab || tab.classList.contains("locked")) return;

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
      // 鎖定的探險點：顯示規則對應的刺激物圖案（作為暗示）
      circle.textContent = _getPointHintIcon(point.field, point.rule);
      circle.style.filter = "grayscale(0.7) brightness(0.7)";
    } else if (point.status === "current") {
      circle.textContent = idx + 1 + mapIndex * 6;
    } else {
      circle.textContent = "⭐";
    }

    el.appendChild(circle);

    // 標籤
    var label = document.createElement("div");
    label.className = "point-label";
    label.setAttribute("aria-hidden", "true");
    label.textContent = pointName;
    el.appendChild(label);

    // 已通過的星星數
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

    // 點擊事件（locked 已 disabled，不需額外判斷）
    if (point.status !== "locked") {
      el.addEventListener("click", function () {
        showPointInfo(point, idx, mapIndex);
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
