// =========================================
// 自由選擇頁面控制
// =========================================

var selectedFields = [];
var selectedRules = [];
var wmEnabled = false;
var questionCount = 6;

// ─── 遊戲場 Toggle ───
function toggleField(fieldId) {
  var idx = selectedFields.indexOf(fieldId);
  if (idx === -1) {
    selectedFields.push(fieldId);
  } else {
    selectedFields.splice(idx, 1);
  }

  document.querySelectorAll(".field-btn").forEach(function (btn) {
    btn.classList.toggle(
      "selected",
      selectedFields.indexOf(btn.dataset.field) !== -1,
    );
  });

  updatePreview();
}

// ─── 規則 Toggle ───
function toggleRule(ruleId) {
  var idx = selectedRules.indexOf(ruleId);
  if (idx === -1) {
    selectedRules.push(ruleId);
  } else {
    selectedRules.splice(idx, 1);
  }

  document.querySelectorAll(".rule-option").forEach(function (opt) {
    var isSelected = selectedRules.indexOf(opt.dataset.rule) !== -1;
    opt.classList.toggle("selected", isSelected);
    opt.setAttribute("aria-checked", isSelected ? "true" : "false");
  });

  updatePreview();
}

// ─── WM Toggle ───
function toggleWM() {
  wmEnabled = !wmEnabled;
  document
    .getElementById("wm-toggle")
    .classList.toggle("active", wmEnabled);
  // 更新 ARIA switch 狀態
  var wmBtn = document.querySelector(".wm-toggle");
  if (wmBtn)
    wmBtn.setAttribute("aria-checked", wmEnabled ? "true" : "false");
  updatePreview();
}

// ─── 題數更新 ───
function updateQuestionCount(val) {
  questionCount = parseInt(val, 10);
  document.getElementById("count-value").textContent = questionCount;
  updatePreview();
}

// ─── 組合預覽 ───
function updatePreview() {
  var combos = buildCombos();
  var list = document.getElementById("combo-list");
  var startBtn = document.getElementById("btn-start");

  if (combos.length === 0) {
    list.innerHTML = '<li class="no-combo-msg">請選擇遊戲場和規則</li>';
    startBtn.disabled = true;
    return;
  }

  startBtn.disabled = false;
  list.innerHTML = "";

  combos.forEach(function (combo, idx) {
    var li = document.createElement("li");
    li.className = "combo-item";

    var fieldConfig = GAME_CONFIG.FIELDS[combo.fieldId];
    var ruleName =
      combo.ruleId === "rule1"
        ? "規則一"
        : combo.ruleId === "rule2"
          ? "規則二"
          : "混合規則";

    var actualCount =
      combo.ruleId === "mixed"
        ? questionCount * GAME_CONFIG.QUESTIONS.MIXED_MULTIPLIER
        : questionCount;

    li.innerHTML =
      '<span class="combo-item-name">' +
      (idx + 1) +
      ". " +
      (fieldConfig ? fieldConfig.icon : "") +
      " " +
      (fieldConfig ? fieldConfig.name : combo.fieldId) +
      " × " +
      ruleName +
      (combo.hasWM ? " 🧠" : "") +
      "</span>" +
      '<span class="combo-item-meta">' +
      actualCount +
      "題</span>";

    list.appendChild(li);
  });
}

// ─── 建立組合 ───
function buildCombos() {
  var combos = [];
  selectedFields.forEach(function (fieldId) {
    selectedRules.forEach(function (ruleId) {
      combos.push({
        fieldId: fieldId,
        ruleId: ruleId,
        hasWM: wmEnabled,
        questionCount: questionCount,
      });
    });
  });
  return combos;
}

// ─── 開始遊戲 ───
function startGame() {
  var combos = buildCombos();
  if (combos.length === 0) return;
  ModeController.startFreeSelectGame(combos);
}

// ─── 初始化 ───
document.addEventListener("DOMContentLoaded", function () {
  // 確認是否有自由選擇權限
  if (!ProgressTracker.isFreeSelectAvailable()) {
    alert("🔒 " + FREE_SELECT_UNLOCK.message);
    ModeController.goToAdventureMap();
    return;
  }

  // 讀取偏好題數
  var savedCount = getQuestionCountPreference();
  if (savedCount) {
    questionCount = savedCount;
    document.getElementById("count-slider").value = savedCount;
    document.getElementById("count-value").textContent = savedCount;
  }
});
