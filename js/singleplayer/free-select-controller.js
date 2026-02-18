// =========================================
// 自由選擇頁面控制（per-field 規則版）
// =========================================

var selectedFields = [];
// per-field rules: { mouse: ["rule1"], fishing: ["rule1","rule2"] }
var fieldRules = {};
var wmEnabled = false;
var questionCount = 6;

// ─── 規則定義 ───
var RULE_DEFS = [
  { id: "rule1", name: "規則一（建立規則）", desc: "訓練抑制控制" },
  { id: "rule2", name: "規則二（規則轉換）", desc: "訓練認知彈性" },
  { id: "mixed", name: "混合規則", desc: "訓練工作記憶 + 認知彈性" },
];

// ─── 遊戲場 Toggle ───
function toggleField(fieldId) {
  var idx = selectedFields.indexOf(fieldId);
  if (idx === -1) {
    selectedFields.push(fieldId);
    fieldRules[fieldId] = [];
  } else {
    selectedFields.splice(idx, 1);
    delete fieldRules[fieldId];
  }

  document.querySelectorAll(".field-btn").forEach(function (btn) {
    btn.classList.toggle(
      "selected",
      selectedFields.indexOf(btn.dataset.field) !== -1,
    );
  });

  renderPerFieldRules();
  updatePreview();
}

// ─── 渲染各遊戲場的規則選擇器 ───
function renderPerFieldRules() {
  var container = document.getElementById("per-field-rules");
  if (!container) return;

  if (selectedFields.length === 0) {
    container.innerHTML = "";
    return;
  }

  var html = "";
  selectedFields.forEach(function (fieldId) {
    var fieldConfig = GAME_CONFIG.FIELDS[fieldId];
    var icon = fieldConfig ? fieldConfig.icon : "";
    var name = fieldConfig ? fieldConfig.name : fieldId;
    var rules = fieldRules[fieldId] || [];

    html += '<div class="per-field-block" data-field="' + fieldId + '">';
    html +=
      '<p class="section-label per-field-label">' +
      icon +
      " " +
      name +
      " — 選擇規則</p>";
    html += '<div class="rule-selector">';

    RULE_DEFS.forEach(function (rule) {
      var isSelected = rules.indexOf(rule.id) !== -1;
      html +=
        '<button class="rule-option' +
        (isSelected ? " selected" : "") +
        '" type="button"' +
        ' data-field="' +
        fieldId +
        '" data-rule="' +
        rule.id +
        '"' +
        ' role="checkbox" aria-checked="' +
        (isSelected ? "true" : "false") +
        '"' +
        " onclick=\"toggleFieldRule('" +
        fieldId +
        "','" +
        rule.id +
        "')\">" +
        '<div class="rule-checkbox" aria-hidden="true"></div>' +
        '<div class="rule-info">' +
        '<div class="rule-name">' +
        rule.name +
        "</div>" +
        '<div class="rule-desc">' +
        rule.desc +
        "</div>" +
        "</div>" +
        "</button>";
    });

    html += "</div></div>";
  });

  container.innerHTML = html;
}

// ─── 切換某遊戲場的某規則 ───
function toggleFieldRule(fieldId, ruleId) {
  if (!fieldRules[fieldId]) fieldRules[fieldId] = [];
  var arr = fieldRules[fieldId];
  var idx = arr.indexOf(ruleId);
  if (idx === -1) {
    arr.push(ruleId);
  } else {
    arr.splice(idx, 1);
  }

  // 更新按鈕外觀
  var block = document.querySelector(
    '.per-field-block[data-field="' + fieldId + '"]',
  );
  if (block) {
    block.querySelectorAll(".rule-option").forEach(function (opt) {
      var isSelected = arr.indexOf(opt.dataset.rule) !== -1;
      opt.classList.toggle("selected", isSelected);
      opt.setAttribute("aria-checked", isSelected ? "true" : "false");
    });
  }

  updatePreview();
}

// ─── WM Toggle ───
function toggleWM() {
  wmEnabled = !wmEnabled;
  document.getElementById("wm-toggle").classList.toggle("active", wmEnabled);
  var wmBtn = document.querySelector(".wm-toggle");
  if (wmBtn) wmBtn.setAttribute("aria-checked", wmEnabled ? "true" : "false");
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

// ─── 建立組合（per-field） ───
function buildCombos() {
  var combos = [];
  selectedFields.forEach(function (fieldId) {
    var rules = fieldRules[fieldId] || [];
    rules.forEach(function (ruleId) {
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
