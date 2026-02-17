var currentCategory = "frame";
var selectedItemId = null;

document.addEventListener("DOMContentLoaded", function () {
  refreshAll();
});

function goBack() {
  if (
    document.referrer &&
    document.referrer.indexOf("adventure-map") !== -1
  ) {
    history.back();
  } else {
    window.location.href = "adventure-map.html";
  }
}

function refreshAll() {
  updateStarsDisplay();
  updatePreview();
  renderItemGrid(currentCategory);
}

function updateStarsDisplay() {
  document.getElementById("available-stars").textContent =
    getAvailableStars();
}

function updatePreview() {
  var el = document.getElementById("preview-avatar");
  var equipped = getEquippedItems();
  var totalStars = getTotalStars();
  var levelDef = getLevelByStars(totalStars);

  // 設定等級圖示
  document.getElementById("preview-level-icon").textContent = levelDef
    ? levelDef.icon
    : "🥚";

  // 清除舊 frame class
  el.className = "preview-avatar";

  // 套用頭像框
  if (equipped.frame) {
    var frameItem = getAvatarItemById(equipped.frame);
    if (frameItem) el.classList.add(frameItem.cssClass);
  }

  // 移除舊配飾
  var oldAcc = el.querySelector(".preview-accessory");
  if (oldAcc) oldAcc.remove();

  // 套用配飾
  if (equipped.accessory) {
    var accItem = getAvatarItemById(equipped.accessory);
    if (accItem) {
      var accEl = document.createElement("span");
      accEl.className = "preview-accessory " + accItem.cssClass;
      accEl.textContent = accItem.emoji;
      el.appendChild(accEl);
    }
  }

  var label = levelDef ? levelDef.icon + " " + levelDef.name : "";
  document.getElementById("preview-label").textContent =
    label + " 的造型";
}

function filterCategory(catId) {
  currentCategory = catId;
  document.querySelectorAll(".category-tab").forEach(function (tab) {
    tab.classList.toggle("active", tab.dataset.category === catId);
  });
  renderItemGrid(catId);
}

function renderItemGrid(category) {
  var grid = document.getElementById("item-grid");
  grid.innerHTML = "";

  var items = AvatarManager.getAllItemsWithStatus(category);

  items.forEach(function (entry) {
    var card = document.createElement("div");

    if (entry.locked) {
      card.className = "item-card locked";
      card.innerHTML =
        '<div class="item-emoji">🔒</div>' +
        '<div class="item-name">' +
        entry.item.name +
        "</div>" +
        '<div class="lock-label">🐣 Lv.' +
        entry.requiredLevel +
        " 解鎖</div>";
      // 鎖定物品不可點擊
    } else {
      card.className =
        "item-card" +
        (entry.equipped ? " equipped" : entry.owned ? " owned" : "");

      card.innerHTML =
        '<div class="item-emoji">' +
        entry.item.emoji +
        "</div>" +
        '<div class="item-name">' +
        entry.item.name +
        "</div>" +
        (entry.equipped
          ? '<div class="item-status status-equipped">✅ 使用中</div>'
          : entry.owned
            ? '<div class="item-status status-owned">已擁有</div>'
            : '<div class="item-cost">⭐ ' + entry.item.cost + "</div>");

      card.addEventListener("click", function () {
        showPopup(entry);
      });
    }

    grid.appendChild(card);
  });
}

function showPopup(entry) {
  selectedItemId = entry.item.id;
  document.getElementById("popup-emoji").textContent = entry.item.emoji;
  document.getElementById("popup-name").textContent = entry.item.name;
  document.getElementById("popup-desc").textContent = entry.item.desc;

  var actionsEl = document.getElementById("popup-actions");
  actionsEl.innerHTML = "";

  if (entry.equipped) {
    // 已裝備 → 卸下
    document.getElementById("popup-price").textContent = "使用中";
    var btnUnequip = document.createElement("button");
    btnUnequip.className = "btn-unequip";
    btnUnequip.textContent = "卸下";
    btnUnequip.onclick = function () {
      handleUnequip(entry.item.category);
    };
    actionsEl.appendChild(btnUnequip);
  } else if (entry.owned) {
    // 已擁有 → 裝備
    document.getElementById("popup-price").textContent = "已擁有";
    var btnEquip = document.createElement("button");
    btnEquip.className = "btn-equip-action";
    btnEquip.textContent = "裝備";
    btnEquip.onclick = function () {
      handleEquip(entry.item.id);
    };
    actionsEl.appendChild(btnEquip);
  } else {
    // 未擁有 → 購買
    document.getElementById("popup-price").textContent =
      "⭐ " + entry.item.cost;
    var canBuy = AvatarManager.canBuyItem(entry.item.id);
    var btnBuy = document.createElement("button");
    btnBuy.className = "btn-buy";
    btnBuy.textContent = "購買";
    btnBuy.disabled = !canBuy.canBuy;
    btnBuy.onclick = function () {
      handleBuy(entry.item.id);
    };
    actionsEl.appendChild(btnBuy);
  }

  var btnCancel = document.createElement("button");
  btnCancel.className = "btn-popup-cancel";
  btnCancel.textContent = "關閉";
  btnCancel.onclick = closePopup;
  actionsEl.appendChild(btnCancel);

  document.getElementById("buy-popup").classList.add("visible");
}

function closePopup() {
  document.getElementById("buy-popup").classList.remove("visible");
  selectedItemId = null;
}

function handleBuy(itemId) {
  var result = AvatarManager.buyItem(itemId);
  if (result.success) {
    // 自動裝備
    AvatarManager.equip(itemId);
    closePopup();
    refreshAll();
  } else {
    alert(result.reason);
  }
}

function handleEquip(itemId) {
  AvatarManager.equip(itemId);
  closePopup();
  refreshAll();
}

function handleUnequip(slot) {
  AvatarManager.unequip(slot);
  closePopup();
  refreshAll();
}

// 點擊外部關閉
document
  .getElementById("buy-popup")
  .addEventListener("click", function (e) {
    if (e.target === this) closePopup();
  });
