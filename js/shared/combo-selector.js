/* ============================================================
 *  📋 檔案說明（給教師的白話版）
 *  ─────────────────────────────────
 *  檔案名稱：combo-selector.js
 *  一句話說明：「場地代號 A~L（12 場）」和「實際遊戲方式」的對照表
 *
 *  🔍 教師可以在這個檔案修改的項目：
 *     1. 🏷️ 場地名稱 ─ 例如「場地A：起司森林」可以改成其他名字
 *     2. 😀 場地圖示 ─ 例如 🧀 可以換成其他 Emoji
 *     3. 🎮 難度標籤 ─ easy（簡單）/ medium（中等）/ hard（困難）
 *
 *  ⚠️ 修改注意：
 *     - 只修改寫著「← 教師可改」的內容
 *     - 不要動 id、fieldId、ruleId、hasWM 這些程式代號
 *     - 不要修改檔案下半部的工具功能區
 *
 *  📚 詳細教學請見：TEACHER-GUIDE.md
 * ============================================================ */

/**
 * ComboSelector — 遊戲場地×規則 Stage 註冊表（多人 + 單人共用）
 * 統一 A~L（12 場）→ fieldId/ruleId/hasWM 的唯一映射來源
 *
 * 取代：room-create-controller stageInfo、room-manager stageToCombo、
 *       result-controller stageInfo、game-controller 硬編碼反推
 *
 * 依賴：無（不依賴 game-config.js）
 */
var ComboSelector = (function () {
  "use strict";

  /* ── 🎓 教師可調區：場地對照表 ────────────────────────────
   *
   *  📖 白話說明：
   *     遊戲有 12 個場地（A~L），對應 2 個遊戲場 × 3 種規則 × 有無🧠WM：
   *
   *     🐭 小老鼠：A (規則一) B (規則一+WM) C (規則二) D (規則二+WM) E (混合) F (混合+WM)
   *     🐟 釣魚：  G (規則一) H (規則一+WM) I (規則二) J (規則二+WM) K (混合) L (混合+WM)
   *
   *  🔧 每個場地可修改的項目：
   *     name:       場地顯示名稱（出現在遊戲畫面和選場地時）
   *     icon:       場地圖示 Emoji（出現在場地卡片上）
   *     difficulty: 難度標籤，只能填 "easy"、"medium"、"hard"
   *
   *  💡 修改範例：
   *     想把場地A改名？找到下方 name: "場地A：起司森林"，
   *     把引號內的文字改成你想要的名字，例如 "場地A：快樂草原"。
   *
   *  ⚠️ 請勿修改：id、fieldId、ruleId、hasWM
   *     這些是程式內部使用的代號，改了遊戲會壞掉
   * ──────────────────────────────────────────────────────── */
  var STAGES = [
    /* ── 🐭 小老鼠 ────────────────────────────── */
    {
      id: "A",
      fieldId: "mouse",
      ruleId: "rule1",
      hasWM: false,
      name: "起司森林", // ← 教師可改
      icon: "🧀", // ← 教師可改
      difficulty: "easy", // ← 教師可改
    },
    {
      id: "B",
      fieldId: "mouse",
      ruleId: "rule1",
      hasWM: true,
      name: "起司森林·記憶關", // ← 教師可改
      icon: "🧀", // ← 教師可改
      difficulty: "easy", // ← 教師可改
    },
    {
      id: "C",
      fieldId: "mouse",
      ruleId: "rule2",
      hasWM: false,
      name: "貓咪廣場", // ← 教師可改
      icon: "😺", // ← 教師可改
      difficulty: "medium", // ← 教師可改
    },
    {
      id: "D",
      fieldId: "mouse",
      ruleId: "rule2",
      hasWM: true,
      name: "貓咪廣場·記憶關", // ← 教師可改
      icon: "😺", // ← 教師可改
      difficulty: "medium", // ← 教師可改
    },
    {
      id: "E",
      fieldId: "mouse",
      ruleId: "mixed",
      hasWM: false,
      name: "村莊奇遇", // ← 教師可改
      icon: "🏘️", // ← 教師可改
      difficulty: "hard", // ← 教師可改
    },
    {
      id: "F",
      fieldId: "mouse",
      ruleId: "mixed",
      hasWM: true,
      name: "村莊奇遇·記憶關", // ← 教師可改
      icon: "🏘️", // ← 教師可改
      difficulty: "hard", // ← 教師可改
    },
    /* ── 🐟 釣魚 ─────────────────────────────── */
    {
      id: "G",
      fieldId: "fishing",
      ruleId: "rule1",
      hasWM: false,
      name: "珊瑚淺灘", // ← 教師可改
      icon: "🐟", // ← 教師可改
      difficulty: "easy", // ← 教師可改
    },
    {
      id: "H",
      fieldId: "fishing",
      ruleId: "rule1",
      hasWM: true,
      name: "珊瑚淺灘·記憶關", // ← 教師可改
      icon: "🐟", // ← 教師可改
      difficulty: "easy", // ← 教師可改
    },
    {
      id: "I",
      fieldId: "fishing",
      ruleId: "rule2",
      hasWM: false,
      name: "鯊魚灣", // ← 教師可改
      icon: "🦈", // ← 教師可改
      difficulty: "medium", // ← 教師可改
    },
    {
      id: "J",
      fieldId: "fishing",
      ruleId: "rule2",
      hasWM: true,
      name: "鯊魚灣·記憶關", // ← 教師可改
      icon: "🦈", // ← 教師可改
      difficulty: "medium", // ← 教師可改
    },
    {
      id: "K",
      fieldId: "fishing",
      ruleId: "mixed",
      hasWM: false,
      name: "潮汐深海", // ← 教師可改
      icon: "🌊", // ← 教師可改
      difficulty: "hard", // ← 教師可改
    },
    {
      id: "L",
      fieldId: "fishing",
      ruleId: "mixed",
      hasWM: true,
      name: "潮汐深海·記憶關", // ← 教師可改
      icon: "🌊", // ← 教師可改
      difficulty: "hard", // ← 教師可改
    },
  ];

  /* ── ⚠️ 以下為程式內部工具功能，教師請勿修改 ───────── */

  // 建立 ID → Stage 索引
  var _byId = {};
  STAGES.forEach(function (s) {
    _byId[s.id] = s;
  });

  /** 依 stage ID 取得完整 Stage 物件 */
  function getById(stageId) {
    return _byId[stageId] || null;
  }

  /** 取得所有可選 Stage（淺拷貝） */
  function getAll() {
    return STAGES.slice();
  }

  /** stage ID → { fieldId, ruleId, hasWM, questionCount } combo 格式 */
  function toCombo(stageId, questionCount) {
    var s = _byId[stageId];
    if (!s) return null;
    return {
      fieldId: s.fieldId,
      ruleId: s.ruleId,
      hasWM: s.hasWM,
      questionCount: questionCount || 0,
    };
  }

  /** stage IDs 陣列 → combos 陣列（用於 room-manager 建房） */
  function toCombos(stageIds, questionCount) {
    return stageIds.map(function (id) {
      var c = toCombo(id, questionCount);
      if (!c) throw new Error("無效的遊戲場 ID: " + id);
      return c;
    });
  }

  /** stage ID → { name, icon, difficulty }（用於 UI 顯示） */
  function getDisplayInfo(stageId) {
    var s = _byId[stageId];
    if (!s) return { name: "場地 " + stageId, icon: "🎯", difficulty: "" };
    return { name: s.name, icon: s.icon, difficulty: s.difficulty };
  }

  return {
    STAGES: STAGES,
    getById: getById,
    getAll: getAll,
    toCombo: toCombo,
    toCombos: toCombos,
    getDisplayInfo: getDisplayInfo,
  };
})();
