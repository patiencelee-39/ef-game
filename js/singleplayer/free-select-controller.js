// =========================================
// 自由選擇頁面控制（StagePicker 共用版）
// =========================================
// 使用 StagePicker 共用元件取代舊的 field toggle + per-field rule 選擇

var questionCount = 6;

// ─── 題數更新 ───
function updateQuestionCount(val) {
  questionCount = parseInt(val, 10);
  document.getElementById("count-value").textContent = questionCount;
}

// ─── 從 StagePicker 已選列表建立 combos（供 ModeController 使用）───
function buildCombos() {
  var stageIds = StagePicker.getSelected();
  if (!stageIds || stageIds.length === 0) return [];

  return stageIds.map(function (stageId) {
    var s = ComboSelector.getById(stageId);
    if (!s) return null;
    var isMixed = s.ruleId === "mixed";
    var qCount = isMixed
      ? questionCount * (GAME_CONFIG.QUESTIONS.MIXED_MULTIPLIER || 2)
      : questionCount;
    return {
      fieldId: s.fieldId,
      ruleId: s.ruleId,
      hasWM: s.hasWM,
      questionCount: qCount,
    };
  }).filter(Boolean);
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
    GameModal.alert("🔒 尚未解鎖", FREE_SELECT_UNLOCK.message, {
      icon: "🔒",
    }).then(function () {
      ModeController.goToAdventureMap();
    });
    return;
  }

  // 讀取偏好題數
  var savedCount = getQuestionCountPreference();
  if (savedCount) {
    questionCount = savedCount;
    document.getElementById("count-slider").value = savedCount;
    document.getElementById("count-value").textContent = savedCount;
  }

  // 初始化 StagePicker 共用元件
  StagePicker.init({
    cardsContainer: document.getElementById("availableStages"),
    chipsContainer: document.getElementById("selectedStages"),
    maxSelections: 20,
    onChange: function (stages) {
      var startBtn = document.getElementById("btn-start");
      if (startBtn) {
        startBtn.disabled = stages.length === 0;
      }
    },
  });
});
