// =========================================
// 貼紙圖鑑頁面控制
// =========================================

var currentCategory = "all";

// ─── 初始化 ───

document.addEventListener("DOMContentLoaded", function () {
  buildCategoryTabs();
  refreshAll();
});

// ─── 返回 ───

function goBack() {
  if (document.referrer && document.referrer.indexOf("adventure-map") !== -1) {
    history.back();
  } else {
    window.location.href = "adventure-map.html";
  }
}

// ─── 刷新全部 UI ───

function refreshAll() {
  updateStarsDisplay();
  updateStats();
  updateOpenPackButton();
  renderStickerGrid(currentCategory);
}

// ─── 星星顯示 ───

function updateStarsDisplay() {
  var available = getAvailableStars();
  document.getElementById("available-stars").textContent = available;
}

// ─── 統計卡片 ───

function updateStats() {
  var stats = StickerManager.getCollectionStats();
  document.getElementById("stats-progress").textContent =
    stats.totalOwned + " / " + stats.totalDefined;
  document.getElementById("stats-bar").style.width =
    stats.completionPercent + "%";
  document.getElementById("stats-detail").textContent =
    "收集進度 " +
    stats.completionPercent +
    "%　｜　已解鎖 " +
    stats.totalUnlocked +
    " / " +
    stats.totalDefined +
    "　｜　已開 " +
    stats.openedPacks +
    " 包";
}

// ─── 開包按鈕狀態 ───

function updateOpenPackButton() {
  var check = StickerManager.canOpenPack();
  var btn = document.getElementById("btn-open-pack");
  btn.disabled = !check.canOpen;

  var costText = document.getElementById("pack-cost");
  if (StickerManager.isCollectionComplete()) {
    costText.textContent = "🎉 已全部收集完成！";
    btn.disabled = true;
    btn.textContent = "🏆 圖鑑全滿";
  } else if (!check.canOpen) {
    costText.textContent =
      "星星不足（需要 " + check.cost + " ⭐，目前 " + check.available + " ⭐）";
  } else {
    costText.textContent = "花費 " + check.cost + " ⭐ 開啟一包";
  }
}

// ─── 分類 Tab ───

function buildCategoryTabs() {
  var container = document.getElementById("category-tabs");
  // 「全部」按鈕已在 HTML 中

  var categories = getAllCategories();
  categories.forEach(function (cat) {
    var btn = document.createElement("button");
    btn.className = "category-tab";
    btn.dataset.category = cat.id;
    btn.textContent = cat.label;
    btn.onclick = function () {
      filterByCategory(cat.id);
    };
    container.appendChild(btn);
  });
}

function filterByCategory(categoryId) {
  currentCategory = categoryId;

  // 更新 tab 樣式
  document.querySelectorAll(".category-tab").forEach(function (tab) {
    tab.classList.toggle("active", tab.dataset.category === categoryId);
  });

  renderStickerGrid(categoryId);
}

// ─── 貼紙網格渲染 ───

function renderStickerGrid(category) {
  var grid = document.getElementById("sticker-grid");
  grid.innerHTML = "";

  var filter = category === "all" ? null : category;
  var items = StickerManager.getAllStickersWithStatus(filter);

  items.forEach(function (item) {
    var cell = document.createElement("div");

    // 判斷狀態：locked > not-owned > owned
    var stateClass;
    if (item.locked) {
      stateClass = "locked";
    } else if (item.owned) {
      stateClass = "owned";
    } else {
      stateClass = "not-owned";
    }

    cell.className =
      "sticker-cell " + stateClass + " rarity-" + item.sticker.rarity;

    // 🔒 鎖定標示
    if (item.locked) {
      var lockBadge = document.createElement("div");
      lockBadge.className = "sticker-lock-badge";
      lockBadge.textContent = "🔒";
      cell.appendChild(lockBadge);
    }

    // 稀有度角標
    if (item.owned && item.sticker.rarity !== "common") {
      var badge = document.createElement("div");
      badge.className = "rarity-badge";
      badge.style.background = item.rarity.color;
      cell.appendChild(badge);
    }

    // emoji
    var emoji = document.createElement("div");
    emoji.className = "sticker-emoji";
    if (item.locked) {
      emoji.textContent = "🔒";
    } else {
      emoji.textContent = item.owned ? item.sticker.emoji : "❓";
    }
    cell.appendChild(emoji);

    // 名稱 / 解鎖提示
    var name = document.createElement("div");
    name.className = "sticker-name";
    if (item.locked) {
      name.textContent = "Lv." + item.requiredLevel + " 解鎖";
    } else {
      name.textContent = item.owned ? item.sticker.name : "???";
    }
    cell.appendChild(name);

    // 點擊事件（已擁有才顯示詳情）
    if (item.owned) {
      cell.addEventListener("click", function () {
        showDetail(item.sticker);
      });
    }

    grid.appendChild(cell);
  });
}

// ─── 開包 ───

function handleOpenPack() {
  var result = StickerManager.openPack();

  if (!result.success) {
    alert(result.reason);
    return;
  }

  // 顯示結果
  var first = result.results[0];
  var sticker = first.sticker;
  var rarity = STICKER_RARITY[sticker.rarity];

  document.getElementById("result-emoji").textContent = sticker.emoji;
  document.getElementById("result-name").textContent = sticker.name;
  document.getElementById("result-rarity").textContent = rarity.label;
  document.getElementById("result-rarity").style.color = rarity.color;
  document.getElementById("result-desc").textContent = sticker.desc;

  var statusEl = document.getElementById("result-status");
  if (first.isNew) {
    statusEl.textContent = "✨ 新收藏！";
    statusEl.className = "pack-result-status is-new";
  } else {
    statusEl.textContent = "已擁有（重複）";
    statusEl.className = "pack-result-status is-dupe";
  }

  // 顯示 overlay
  document.getElementById("pack-result-overlay").classList.add("visible");

  // 刷新背景資料
  refreshAll();
}

function closePackResult() {
  document.getElementById("pack-result-overlay").classList.remove("visible");
}

// ─── 貼紙詳情 ───

function showDetail(sticker) {
  var rarity = STICKER_RARITY[sticker.rarity];

  document.getElementById("detail-emoji").textContent = sticker.emoji;
  document.getElementById("detail-name").textContent = sticker.name;
  document.getElementById("detail-rarity").textContent = rarity.label;
  document.getElementById("detail-rarity").style.color = rarity.color;
  document.getElementById("detail-desc").textContent = sticker.desc;

  document.getElementById("sticker-detail-popup").classList.add("visible");
}

function closeDetail() {
  document.getElementById("sticker-detail-popup").classList.remove("visible");
}

// 點擊 overlay 外部關閉
document
  .getElementById("pack-result-overlay")
  .addEventListener("click", function (e) {
    if (e.target === this) closePackResult();
  });

document
  .getElementById("sticker-detail-popup")
  .addEventListener("click", function (e) {
    if (e.target === this) closeDetail();
  });
