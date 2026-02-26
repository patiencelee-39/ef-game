/* =========================================
         頁面狀態
         ========================================= */
var currentSection = "food";

/* =========================================
         初始化
         ========================================= */
document.addEventListener("DOMContentLoaded", function () {
  refreshAll();
});

/* =========================================
         導航
         ========================================= */
function goBack() {
  if (document.referrer && document.referrer.indexOf("adventure-map") !== -1) {
    history.back();
  } else {
    window.location.href = "adventure-map.html";
  }
}

/* =========================================
         全畫面刷新
         ========================================= */
function refreshAll() {
  updateStarsDisplay();
  renderPetStage();
  renderItemGrid(currentSection);
}

function updateStarsDisplay() {
  document.getElementById("available-stars").textContent = getAvailableStars();
}

/* =========================================
         寵物展示區渲染
         ========================================= */
function renderPetStage() {
  var status = PetManager.getFullPetStatus();

  // 成長圖示
  var petEmoji = document.getElementById("pet-emoji");
  petEmoji.textContent = status.stage ? status.stage.icon : "🥚";

  // 心情動畫 class
  petEmoji.className = "pet-emoji " + (status.mood.animation || "pet-idle");

  // 心情 icon
  document.getElementById("pet-mood-icon").textContent =
    status.mood.emoji || "😐";

  // 名稱：優先顯示自訂名字，沒有才顯示階段名稱
  var petState = getPetState();
  var customName = petState.petName;
  var stageName = status.stage
    ? status.stage.icon + " " + status.stage.name
    : "蛋寶寶";
  document.getElementById("pet-name").textContent = customName
    ? customName
    : stageName;

  document.getElementById("pet-stage-label").textContent =
    "等級 " + (status.stage ? status.stage.level : 1);

  // 心情文字
  document.getElementById("pet-mood-label").textContent =
    "心情：" + status.mood.label + " " + status.mood.emoji;

  // 餵食次數
  document.getElementById("pet-fed-count").textContent =
    "累計餵食：" + status.fedCount + " 次";

  // 進度條
  renderProgress(status);

  // 配件
  renderPetAccessories(status);
}

function renderProgress(status) {
  var progress = status.progress;

  if (progress.isMaxLevel) {
    document.getElementById("progress-text").textContent = "已達最高階段！";
    document.getElementById("progress-percent").textContent = "MAX";
    document.getElementById("progress-fill").style.width = "100%";
  } else {
    document.getElementById("progress-text").textContent =
      "距 " +
      progress.nextLevelDef.icon +
      " " +
      progress.nextLevelDef.name +
      " 還差 " +
      progress.starsToNextLevel +
      " ⭐";
    document.getElementById("progress-percent").textContent =
      progress.progressPercent + "%";
    document.getElementById("progress-fill").style.width =
      progress.progressPercent + "%";
  }

  // 標示已到達的階段圖示
  var stageSpans = document.querySelectorAll("#progress-stages span");
  var currentLevel = status.stage ? status.stage.level : 1;
  stageSpans.forEach(function (span, i) {
    span.classList.toggle("reached", i + 1 <= currentLevel);
  });
}

function renderPetAccessories(status) {
  // 清除舊配件
  var display = document.getElementById("pet-display");
  var oldAcc = display.querySelectorAll(".pet-acc-layer");
  oldAcc.forEach(function (el) {
    el.remove();
  });

  // 只顯示「穿戴中」的配件
  var equipped = getEquippedAccessories();

  equipped.forEach(function (accId) {
    var acc = getPetAccessoryById(accId);
    if (!acc) return;

    var el = document.createElement("span");
    el.className = "pet-acc-layer acc-" + acc.position;
    el.textContent = acc.emoji;
    display.appendChild(el);
  });
}

/* =========================================
         Tab 切換
         ========================================= */
function switchSection(section) {
  currentSection = section;
  document.querySelectorAll(".section-tab").forEach(function (tab) {
    tab.classList.toggle("active", tab.dataset.section === section);
  });
  renderItemGrid(section);
}

/* =========================================
         物品網格（依 section 渲染）
         ========================================= */
var _stickerCatFilter = "all"; // 貼紙圖鑑目前分類
var _avatarCatFilter = "frame"; // 換裝商店目前分類

function renderItemGrid(section) {
  var grid = document.getElementById("item-grid");
  grid.innerHTML = "";

  if (section === "food") {
    renderFoodGrid(grid);
  } else if (section === "accessory") {
    renderAccessoryGrid(grid);
  } else if (section === "sticker") {
    renderStickerSection(grid);
  } else if (section === "avatar") {
    renderAvatarSection(grid);
  }
}

function renderFoodGrid(grid) {
  grid.style.display = ""; // reset to CSS grid
  var foods = getAllPetFoods();
  var available = getAvailableStars();
  var currentLevel = calculateLevel(getTotalStars());

  foods.forEach(function (food) {
    var requiredLevel = food.unlockLevel || 1;
    var isLocked = currentLevel < requiredLevel;
    var card = document.createElement("div");

    if (isLocked) {
      card.className = "item-card locked";
      card.innerHTML =
        '<div class="item-emoji">🔒</div>' +
        '<div class="item-name">' +
        food.name +
        "</div>" +
        '<div class="lock-label">🐣 Lv.' +
        requiredLevel +
        " 解鎖</div>";
    } else {
      card.className = "item-card";
      card.innerHTML =
        '<div class="item-emoji">' +
        food.emoji +
        "</div>" +
        '<div class="item-name">' +
        food.name +
        "</div>" +
        '<div class="item-cost">⭐ ' +
        food.cost +
        "</div>";

      card.addEventListener("click", function () {
        showFoodPopup(food);
      });
    }
    grid.appendChild(card);
  });
}

function renderAccessoryGrid(grid) {
  grid.style.display = ""; // reset to CSS grid
  var accessories = getAllPetAccessories();
  var currentLevel = calculateLevel(getTotalStars());
  var equipped = getEquippedAccessories();

  accessories.forEach(function (acc) {
    var owned = hasPetAccessory(acc.id);
    var requiredLevel = acc.unlockLevel || 1;
    var isLocked = currentLevel < requiredLevel;
    var isEquipped = equipped.indexOf(acc.id) !== -1;
    var card = document.createElement("div");

    if (isLocked) {
      card.className = "item-card locked";
      card.innerHTML =
        '<div class="item-emoji">🔒</div>' +
        '<div class="item-name">' +
        acc.name +
        "</div>" +
        '<div class="lock-label">🐣 Lv.' +
        requiredLevel +
        " 解鎖</div>";
    } else {
      card.className = "item-card" + (owned ? " owned" : "");

      var statusHtml;
      if (owned) {
        statusHtml = isEquipped
          ? '<span class="equip-badge equip-badge--on">穿戴中</span>'
          : '<span class="equip-badge equip-badge--off">未穿戴</span>';
      } else {
        statusHtml = '<div class="item-cost">⭐ ' + acc.cost + "</div>";
      }

      card.innerHTML =
        '<div class="item-emoji">' +
        acc.emoji +
        "</div>" +
        '<div class="item-name">' +
        acc.name +
        "</div>" +
        statusHtml;

      card.addEventListener("click", function () {
        showAccessoryPopup(acc, owned, isEquipped);
      });
    }
    grid.appendChild(card);
  });
}

/* =========================================
         彈窗 — 餵食
         ========================================= */

/* =========================================
         🎨 貼紙圖鑑 — 渲染
         ========================================= */
function renderStickerSection(grid) {
  // 使用 fragment 容器（grid 本身變成 block 暫存）
  grid.style.display = "block";

  // 1. 開包按鈕區
  var packCheck = StickerManager.canOpenPack();
  var packHtml =
    '<div class="pack-section">' +
    '<div class="pack-title">🎁 貼紙扭蛋</div>' +
    '<div class="pack-subtitle">花 ' +
    packCheck.cost +
    "⭐ 開一包，隨機獲得貼紙！</div>" +
    '<button class="btn-open-pack" id="btn-open-pack" onclick="handleOpenPack()"' +
    (packCheck.canOpen ? "" : " disabled") +
    ">" +
    "🎰 開包！（⭐" +
    packCheck.cost +
    "）" +
    "</button>" +
    "</div>";
  grid.innerHTML = packHtml;

  // 2. 收藏進度條
  var stats = StickerManager.getCollectionStats();
  var summaryHtml =
    '<div class="collection-summary">' +
    '<span class="cs-label">圖鑑 ' +
    stats.totalOwned +
    "/" +
    stats.totalDefined +
    "</span>" +
    '<div class="cs-bar"><div class="cs-fill" style="width:' +
    stats.completionPercent +
    '%"></div></div>' +
    '<span class="cs-pct">' +
    stats.completionPercent +
    "%</span>" +
    "</div>";
  grid.innerHTML += summaryHtml;

  // 3. 分類 tabs
  var catTabsHtml =
    '<div class="sticker-category-tabs">' +
    '<button class="sticker-cat-tab' +
    (_stickerCatFilter === "all" ? " active" : "") +
    '" onclick="filterStickerCat(\'all\')">📋 全部</button>';
  STICKER_CATEGORIES.forEach(function (cat) {
    catTabsHtml +=
      '<button class="sticker-cat-tab' +
      (_stickerCatFilter === cat.id ? " active" : "") +
      '" onclick="filterStickerCat(\'' +
      cat.id +
      "')\">" +
      cat.label +
      "</button>";
  });
  catTabsHtml += "</div>";
  grid.innerHTML += catTabsHtml;

  // 4. 貼紙卡片網格
  var innerGrid = document.createElement("div");
  innerGrid.className = "item-grid";
  innerGrid.style.display = "grid";

  var items = StickerManager.getAllStickersWithStatus(
    _stickerCatFilter === "all" ? undefined : _stickerCatFilter,
  );

  if (items.length === 0) {
    innerGrid.innerHTML =
      '<div class="empty-hint" style="grid-column:1/-1">' +
      '<div class="hint-emoji">📭</div>' +
      "<div>這個分類還沒有貼紙喔</div>" +
      "</div>";
  } else {
    items.forEach(function (entry) {
      var s = entry.sticker;
      var rarityObj = entry.rarity;
      var card = document.createElement("div");
      card.className =
        "item-card sticker-card rarity-" +
        s.rarity +
        (entry.owned ? " owned" : "") +
        (entry.locked ? " locked" : "");

      if (entry.locked) {
        card.innerHTML =
          '<div class="item-emoji">🔒</div>' +
          '<div class="item-name">' +
          s.name +
          "</div>" +
          '<div class="lock-label">🐣 Lv.' +
          entry.requiredLevel +
          " 解鎖</div>";
      } else if (entry.owned) {
        card.innerHTML =
          '<div class="item-emoji">' +
          s.emoji +
          "</div>" +
          '<div class="item-name">' +
          s.name +
          "</div>" +
          '<div style="font-size:0.75rem">' +
          '<span class="sticker-rarity-dot" style="background:' +
          rarityObj.color +
          '"></span>' +
          '<span style="color:' +
          rarityObj.color +
          '">' +
          rarityObj.label +
          "</span>" +
          "</div>";
      } else {
        // 未擁有但已解鎖 → 顯示問號
        card.innerHTML =
          '<div class="item-emoji" style="opacity:0.3">❓</div>' +
          '<div class="item-name" style="opacity:0.5">' +
          s.name +
          "</div>" +
          '<div style="font-size:0.75rem">' +
          '<span class="sticker-rarity-dot" style="background:' +
          rarityObj.color +
          '"></span>' +
          '<span style="color:' +
          rarityObj.color +
          ';opacity:0.6">' +
          rarityObj.label +
          "</span>" +
          "</div>";
      }
      innerGrid.appendChild(card);
    });
  }

  grid.appendChild(innerGrid);
}

function filterStickerCat(catId) {
  _stickerCatFilter = catId;
  renderItemGrid("sticker");
}

function handleOpenPack() {
  var result = StickerManager.openPack();
  if (!result.success) {
    GameModal.alert("無法開包", result.reason, { icon: "🎴" });
    return;
  }

  var draw = result.results[0]; // 每包 1 張
  var s = draw.sticker;
  var rarityObj = STICKER_RARITY[s.rarity] || STICKER_RARITY.common;

  // 更新星星顯示
  updateStarsDisplay();

  // 顯示開包動畫
  document.getElementById("reveal-emoji").textContent = s.emoji;
  document.getElementById("reveal-name").textContent = s.name;
  document.getElementById("reveal-rarity").style.color = rarityObj.color;
  document.getElementById("reveal-rarity").textContent = "✦ " + rarityObj.label;
  document.getElementById("reveal-new-dup").innerHTML = draw.isNew
    ? '<span class="reveal-new">🎉 新貼紙！</span>'
    : '<span class="reveal-dup">（已擁有）</span>';
  document.getElementById("reveal-desc").textContent = s.desc;

  document.getElementById("pack-reveal").classList.add("visible");
  FocusTrap.activate(document.getElementById("pack-reveal"));
}

function closeReveal() {
  document.getElementById("pack-reveal").classList.remove("visible");
  FocusTrap.deactivate();
  renderItemGrid("sticker"); // 刷新圖鑑
}

/* =========================================
         🖼️ 換裝商店 — 渲染
         ========================================= */
function renderAvatarSection(grid) {
  grid.style.display = "block";

  // 1. 分類 tab
  var catHtml = '<div class="avatar-cat-tabs">';
  AVATAR_CATEGORIES.forEach(function (cat) {
    catHtml +=
      '<button class="avatar-cat-tab' +
      (_avatarCatFilter === cat.id ? " active" : "") +
      '" onclick="filterAvatarCat(\'' +
      cat.id +
      "')\">" +
      cat.label +
      "</button>";
  });
  catHtml += "</div>";
  grid.innerHTML = catHtml;

  // 2. 收藏統計
  var shopStats = AvatarManager.getShopStats();
  grid.innerHTML +=
    '<div class="collection-summary">' +
    '<span class="cs-label">收藏 ' +
    shopStats.ownedCount +
    "/" +
    shopStats.totalItems +
    "</span>" +
    '<div class="cs-bar"><div class="cs-fill" style="width:' +
    shopStats.completionPercent +
    '%"></div></div>' +
    '<span class="cs-pct">' +
    shopStats.completionPercent +
    "%</span>" +
    "</div>";

  // 3. 物品卡片
  var innerGrid = document.createElement("div");
  innerGrid.className = "item-grid";
  innerGrid.style.display = "grid";

  var items = AvatarManager.getAllItemsWithStatus(_avatarCatFilter);
  var currentLevel = calculateLevel(getTotalStars());

  if (items.length === 0) {
    innerGrid.innerHTML =
      '<div class="empty-hint" style="grid-column:1/-1">' +
      '<div class="hint-emoji">🏪</div><div>暫無物品</div>' +
      "</div>";
  } else {
    items.forEach(function (entry) {
      var item = entry.item;
      var card = document.createElement("div");
      card.className =
        "item-card" +
        (entry.owned ? " owned" : "") +
        (entry.locked ? " locked" : "");

      if (entry.locked) {
        card.innerHTML =
          '<div class="item-emoji">🔒</div>' +
          '<div class="item-name">' +
          item.name +
          "</div>" +
          '<div class="lock-label">🐣 Lv.' +
          entry.requiredLevel +
          " 解鎖</div>";
      } else if (entry.owned) {
        var eqHtml = entry.equipped
          ? '<span class="equip-label equip-label--on">穿戴中</span>'
          : '<span class="equip-label equip-label--off">未穿戴</span>';
        card.innerHTML =
          '<div class="item-emoji">' +
          item.emoji +
          "</div>" +
          '<div class="item-name">' +
          item.name +
          "</div>" +
          eqHtml;
        card.addEventListener("click", function () {
          showAvatarItemPopup(item, true, entry.equipped);
        });
      } else {
        card.innerHTML =
          '<div class="item-emoji">' +
          item.emoji +
          "</div>" +
          '<div class="item-name">' +
          item.name +
          "</div>" +
          '<div class="item-cost">⭐ ' +
          item.cost +
          "</div>";
        card.addEventListener("click", function () {
          showAvatarItemPopup(item, false, false);
        });
      }
      innerGrid.appendChild(card);
    });
  }

  grid.appendChild(innerGrid);
}

function filterAvatarCat(catId) {
  _avatarCatFilter = catId;
  renderItemGrid("avatar");
}

/* =========================================
         彈窗 — 換裝物品
         ========================================= */
function showAvatarItemPopup(item, owned, equipped) {
  document.getElementById("popup-emoji").textContent = item.emoji;
  document.getElementById("popup-name").textContent = item.name;
  document.getElementById("popup-desc").textContent = item.desc;

  var btnsEl = document.getElementById("popup-buttons");
  btnsEl.innerHTML = "";

  if (owned) {
    document.getElementById("popup-price").textContent = equipped
      ? "✅ 穿戴中"
      : "📦 已擁有";

    var btnToggle = document.createElement("button");
    btnToggle.className = equipped ? "btn-cancel" : "btn-buy-acc";
    btnToggle.textContent = equipped ? "卸下" : "穿上";
    btnToggle.onclick = function () {
      if (equipped) {
        AvatarManager.unequip(item.category);
      } else {
        AvatarManager.equip(item.id);
      }
      closePopup();
      refreshAll();
    };
    btnsEl.appendChild(btnToggle);
  } else {
    document.getElementById("popup-price").textContent = "⭐ " + item.cost;
    var check = AvatarManager.canBuyItem(item.id);

    var btnBuy = document.createElement("button");
    btnBuy.className = "btn-buy-acc";
    btnBuy.textContent = "購買";
    btnBuy.disabled = !check.canBuy;
    btnBuy.onclick = function () {
      var result = AvatarManager.buyItem(item.id);
      closePopup();
      if (result.success) {
        showFeedSuccess("🎉 獲得 " + result.item.emoji + "！");
        refreshAll();
      } else {
        GameModal.alert("購買失敗", result.reason, { icon: "❌" });
      }
    };
    btnsEl.appendChild(btnBuy);
  }

  var btnCancel = document.createElement("button");
  btnCancel.className = "btn-cancel";
  btnCancel.textContent = "關閉";
  btnCancel.onclick = closePopup;
  btnsEl.appendChild(btnCancel);

  document.getElementById("action-popup").classList.add("visible");
  FocusTrap.activate(document.getElementById("action-popup"));
}
function showFoodPopup(food) {
  document.getElementById("popup-emoji").textContent = food.emoji;
  document.getElementById("popup-name").textContent = food.name;
  document.getElementById("popup-desc").textContent = food.desc;
  document.getElementById("popup-price").textContent = "⭐ " + food.cost;

  var btnsEl = document.getElementById("popup-buttons");
  btnsEl.innerHTML = "";

  var check = PetManager.canFeed(food.id);

  var btnFeed = document.createElement("button");
  btnFeed.className = "btn-feed";
  btnFeed.textContent = "餵食！";
  btnFeed.disabled = !check.canFeed;
  btnFeed.onclick = function () {
    handleFeed(food.id);
  };
  btnsEl.appendChild(btnFeed);

  var btnCancel = document.createElement("button");
  btnCancel.className = "btn-cancel";
  btnCancel.textContent = "取消";
  btnCancel.onclick = closePopup;
  btnsEl.appendChild(btnCancel);

  document.getElementById("action-popup").classList.add("visible");
  FocusTrap.activate(document.getElementById("action-popup"));
}

function handleFeed(foodId) {
  var result = PetManager.feed(foodId);
  closePopup();

  if (result.success) {
    playFeedAnimation(result.food, function () {
      refreshAll();
    });
  } else {
    GameModal.alert("餉食失敗", result.reason, { icon: "🍽️" });
  }
}

/**
 * 強化餵食動畫：食物飛入 → 咀嚼 → 滿足粒子爆發
 */
function playFeedAnimation(food, onDone) {
  var display = document.getElementById("pet-display");
  var emoji = document.getElementById("pet-emoji");

  // 1) 食物飛入動畫
  var flyEl = document.createElement("span");
  flyEl.className = "feed-fly-emoji";
  flyEl.textContent = food.emoji;
  display.appendChild(flyEl);

  // 2) 飛入完畢 → 咀嚼動畫
  setTimeout(function () {
    flyEl.remove();

    // 咀嚼（寵物快速縮放）
    emoji.classList.add("pet-munch");
    setTimeout(function () {
      emoji.classList.remove("pet-munch");
    }, 600);

    // 3) 滿足粒子爆發
    var particles = ["😋", "✨", "💕", "⭐", "🎵"];
    for (var p = 0; p < 6; p++) {
      spawnParticle(
        display,
        particles[Math.floor(Math.random() * particles.length)],
        "heart-particle",
      );
    }

    // 顯示開心語句
    showSpeechBubble(display, food.emoji + " 好好吃！😋");
  }, 500);

  // 4) 延遲後觸發完成
  setTimeout(function () {
    showFeedSuccess(food.emoji + " 好好吃！");
    if (onDone) onDone();
  }, 1200);
}

function showFeedSuccess(msg) {
  var overlay = document.getElementById("feed-success");
  var msgEl = document.getElementById("feed-success-msg");
  msgEl.textContent = msg;
  overlay.classList.add("visible");

  setTimeout(function () {
    overlay.classList.remove("visible");
  }, 1300);
}

/* =========================================
         彈窗 — 配件
         ========================================= */
function showAccessoryPopup(acc, owned, isEquipped) {
  document.getElementById("popup-emoji").textContent = acc.emoji;
  document.getElementById("popup-name").textContent = acc.name;
  document.getElementById("popup-desc").textContent = acc.desc;

  var btnsEl = document.getElementById("popup-buttons");
  btnsEl.innerHTML = "";

  if (owned) {
    document.getElementById("popup-price").textContent = isEquipped
      ? "✅ 穿戴中"
      : "📦 已擁有（未穿戴）";

    // 穿戴 / 卸下 按鈕
    var btnToggle = document.createElement("button");
    btnToggle.className = isEquipped ? "btn-cancel" : "btn-buy-acc";
    btnToggle.textContent = isEquipped ? "卸下" : "穿上";
    btnToggle.onclick = function () {
      togglePetAccessory(acc.id);
      closePopup();
      if (!isEquipped) {
        // 穿上 → 播放閃光特效
        playEquipSparkle();
      }
      refreshAll();
    };
    btnsEl.appendChild(btnToggle);
  } else {
    document.getElementById("popup-price").textContent = "⭐ " + acc.cost;
    var check = PetManager.canBuyAccessory(acc.id);

    var btnBuy = document.createElement("button");
    btnBuy.className = "btn-buy-acc";
    btnBuy.textContent = "購買";
    btnBuy.disabled = !check.canBuy;
    btnBuy.onclick = function () {
      handleBuyAccessory(acc.id);
    };
    btnsEl.appendChild(btnBuy);
  }

  var btnCancel = document.createElement("button");
  btnCancel.className = "btn-cancel";
  btnCancel.textContent = "關閉";
  btnCancel.onclick = closePopup;
  btnsEl.appendChild(btnCancel);

  document.getElementById("action-popup").classList.add("visible");
  FocusTrap.activate(document.getElementById("action-popup"));
}

function handleBuyAccessory(accId) {
  var result = PetManager.buyAccessory(accId);
  closePopup();

  if (result.success) {
    playEquipSparkle();
    showFeedSuccess("🎉 獲得 " + result.accessory.emoji + "！");
    refreshAll();
  } else {
    GameModal.alert("購買失敗", result.reason, { icon: "❌" });
  }
}

/**
 * 配件穿戴 / 購買閃光特效
 */
function playEquipSparkle() {
  var display = document.getElementById("pet-display");
  var sparkles = ["✨", "💫", "⭐"];
  for (var i = 0; i < 6; i++) {
    (function (idx) {
      setTimeout(function () {
        var sp = document.createElement("span");
        sp.className = "equip-sparkle";
        sp.textContent = sparkles[idx % sparkles.length];
        var angle = (idx / 6) * Math.PI * 2;
        sp.style.setProperty("--sx", Math.round(Math.cos(angle) * 50) + "px");
        sp.style.setProperty("--sy", Math.round(Math.sin(angle) * 50) + "px");
        display.appendChild(sp);
        setTimeout(function () {
          sp.remove();
        }, 900);
      }, idx * 80);
    })(i);
  }
}

/* =========================================
         共用彈窗操作
         ========================================= */
function closePopup() {
  document.getElementById("action-popup").classList.remove("visible");
  FocusTrap.deactivate();
}

// 點擊外部關閉
document.getElementById("action-popup").addEventListener("click", function (e) {
  if (e.target === this) closePopup();
});

/* =========================================
         🐔 寵物點擊互動（含連擊系統）
         ========================================= */

// ─── 連擊 combo 狀態 ───
var _comboCount = 0;
var _comboTimer = null;
var COMBO_WINDOW_MS = 600; // 600ms 內連續點擊算 combo

var _bubbleTimer = null;

document.getElementById("pet-display").addEventListener("click", function (e) {
  handlePetTap(e);
});

// 鍵盤 Enter 也可觸發
document
  .getElementById("pet-display")
  .addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handlePetTap(e);
    }
  });

function handlePetTap(e) {
  var display = document.getElementById("pet-display");
  var emoji = document.getElementById("pet-emoji");

  // 累計 combo
  _comboCount++;
  if (_comboTimer) clearTimeout(_comboTimer);
  _comboTimer = setTimeout(function () {
    _comboCount = 0;
  }, COMBO_WINDOW_MS);

  // ─── 依 combo 等級給不同反應 ───
  if (_comboCount >= 5) {
    // 🎊 大慶祝
    emoji.classList.remove("pet-tap-bounce", "pet-combo-spin");
    void emoji.offsetWidth;
    emoji.classList.add("pet-combo-celebrate");
    setTimeout(function () {
      emoji.classList.remove("pet-combo-celebrate");
    }, 800);

    // 星星噴射 ×8
    for (var s = 0; s < 8; s++) {
      spawnParticle(display, "⭐", "star-particle");
    }

    // 特殊 combo 語句
    var comboIdx = Math.floor(Math.random() * PET_COMBO_PHRASES.length);
    showSpeechBubble(display, PET_COMBO_PHRASES[comboIdx]);

    // 🔊 播放連擊語音
    if (
      typeof getPetComboVoiceFile === "function" &&
      typeof AudioPlayer !== "undefined" &&
      AudioPlayer.playVoice
    ) {
      AudioPlayer.playVoice(getPetComboVoiceFile(comboIdx), {
        text: PET_COMBO_PHRASES[comboIdx],
      });
    }

    _comboCount = 0; // reset
  } else if (_comboCount >= 3) {
    // 🌀 旋轉 + 更多愛心
    emoji.classList.remove("pet-tap-bounce", "pet-combo-celebrate");
    void emoji.offsetWidth;
    emoji.classList.add("pet-combo-spin");
    setTimeout(function () {
      emoji.classList.remove("pet-combo-spin");
    }, 600);

    for (var h = 0; h < 5; h++) {
      spawnParticle(display, "❤️", "heart-particle");
    }

    showMoodSpeechBubble(display);
  } else {
    // 🐔 基本彈跳
    emoji.classList.remove("pet-tap-bounce");
    void emoji.offsetWidth;
    emoji.classList.add("pet-tap-bounce");
    setTimeout(function () {
      emoji.classList.remove("pet-tap-bounce");
    }, 450);

    for (var i = 0; i < 3; i++) {
      spawnParticle(display, "❤️", "heart-particle");
    }

    showMoodSpeechBubble(display);
  }
}

/**
 * 通用粒子生成（❤️ / ⭐）
 */
function spawnParticle(container, char, className) {
  var el = document.createElement("span");
  el.className = className;
  el.textContent = char;
  var dx = Math.round(Math.random() * 80 - 40);
  el.style.setProperty("--dx", dx + "px");
  el.style.left = 50 + Math.round(Math.random() * 30 - 15) + "%";
  el.style.top = "30%";
  container.appendChild(el);
  setTimeout(function () {
    el.remove();
  }, 1300);
}

// 舊版相容
function spawnHeart(container) {
  spawnParticle(container, "❤️", "heart-particle");
}

/**
 * 心情×階段 對話氣泡
 */
function showMoodSpeechBubble(container) {
  var status = PetManager.getFullPetStatus();
  var moodId = status.mood ? status.mood.id : "normal";
  var level = status.stage ? status.stage.level : 1;

  var phrase;
  var phraseIndex = 0;
  if (
    typeof PET_SPEECH !== "undefined" &&
    PET_SPEECH[moodId] &&
    PET_SPEECH[moodId][level]
  ) {
    var pool = PET_SPEECH[moodId][level];
    phraseIndex = Math.floor(Math.random() * pool.length);
    phrase = pool[phraseIndex];
  } else {
    // fallback
    phrase = "咕咕！🐔";
  }

  showSpeechBubble(container, phrase);

  // 🔊 播放寵物心情語音
  if (
    typeof getPetSpeechVoiceFile === "function" &&
    typeof AudioPlayer !== "undefined" &&
    AudioPlayer.playVoice
  ) {
    AudioPlayer.playVoice(getPetSpeechVoiceFile(moodId, level, phraseIndex), {
      text: phrase,
    });
  }
}

function showSpeechBubble(container, text) {
  // 清除舊的
  var old = container.querySelector(".speech-bubble");
  if (old) old.remove();
  if (_bubbleTimer) clearTimeout(_bubbleTimer);

  var bubble = document.createElement("div");
  bubble.className = "speech-bubble";
  bubble.textContent = text;
  container.appendChild(bubble);

  _bubbleTimer = setTimeout(function () {
    bubble.remove();
    _bubbleTimer = null;
  }, 2200);
}

/* =========================================
         ✏️ 寵物命名
         ========================================= */
function showRenameModal() {
  var petState = getPetState();
  var input = document.getElementById("rename-input");
  input.value = petState.petName || "";
  document.getElementById("rename-modal").classList.add("visible");
  FocusTrap.activate(document.getElementById("rename-modal"));
  setTimeout(function () {
    input.focus();
  }, 100);
}

function closeRenameModal() {
  document.getElementById("rename-modal").classList.remove("visible");
  FocusTrap.deactivate();
}

function confirmRename() {
  var name = document.getElementById("rename-input").value.trim();
  if (name.length === 0) {
    // 空字串 → 清除自訂名，恢復預設
    setPetName("");
  } else if (name.length > 8) {
    GameModal.alert("名字太長", "名字最多 8 個字喔！", { icon: "✏️" });
    return;
  } else {
    setPetName(name);
  }
  closeRenameModal();
  renderPetStage();
}

// 點擊命名彈窗外部關閉
document.getElementById("rename-modal").addEventListener("click", function (e) {
  if (e.target === this) closeRenameModal();
});

// Enter 確認命名
document
  .getElementById("rename-input")
  .addEventListener("keydown", function (e) {
    if (e.isComposing || e.keyCode === 229) return;
    if (e.key === "Enter") {
      e.preventDefault();
      confirmRename();
    }
  });
