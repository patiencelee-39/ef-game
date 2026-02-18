/**
 * ComboSelector — 多人競賽場地×規則 Stage 註冊表
 * 統一 A/B/C/D 場地 → fieldId/ruleId 的唯一映射來源
 *
 * 取代：room-create-controller stageInfo、room-manager stageToCombo、
 *       result-controller stageInfo、game-controller 硬編碼反推
 *
 * 依賴：無（不依賴 game-config.js）
 */
var ComboSelector = (function () {
  "use strict";

  /**
   * Stage 定義表 — Single Source of Truth
   * id:         UI 識別碼（A/B/C/D…）
   * fieldId:    對應 GAME_CONFIG.FIELDS key
   * ruleId:     對應 field.rules key
   * hasWM:      此 combo 是否含工作記憶測試
   * name:       UI 顯示名稱
   * icon:       UI 顯示 emoji
   * difficulty: 難度標籤
   */
  var STAGES = [
    {
      id: "A",
      fieldId: "mouse",
      ruleId: "rule1",
      hasWM: false,
      name: "場地A：起司森林",
      icon: "🧀",
      difficulty: "easy",
    },
    {
      id: "B",
      fieldId: "mouse",
      ruleId: "rule2",
      hasWM: false,
      name: "場地B：人類村莊",
      icon: "🧑",
      difficulty: "medium",
    },
    {
      id: "C",
      fieldId: "fishing",
      ruleId: "rule1",
      hasWM: false,
      name: "場地C：海洋世界",
      icon: "🐟",
      difficulty: "medium",
    },
    {
      id: "D",
      fieldId: "fishing",
      ruleId: "rule2",
      hasWM: false,
      name: "場地D：晝夜迷宮",
      icon: "🌙",
      difficulty: "hard",
    },
    // ── 未來擴充 ──
    // { id: "E", fieldId: "mouse",   ruleId: "mixed", hasWM: true,
    //   name: "場地E：轉換星球", icon: "🔄", difficulty: "hard" },
    // { id: "F", fieldId: "fishing", ruleId: "mixed", hasWM: true,
    //   name: "場地F：變色深海", icon: "🌊", difficulty: "hard" },
  ];

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
