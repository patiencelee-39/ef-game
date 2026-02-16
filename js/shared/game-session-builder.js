/**
 * ============================================
 * 遊戲組合選擇器 — GameSessionBuilder
 * ============================================
 * 對應需求文件：§3.2, §2.8, Flow-4
 * 說明：多人房主 + 單人自由選擇共用的「組合建構」模組
 *
 * 功能清單：
 *   ✅ 遊戲場複選（🐭 小老鼠 / 🐟 釣魚 / 全選）
 *   ✅ 規則複選（規則一 / 規則二 / 混合 / 全選）
 *   ✅ WM 逐組勾選 + 全選/全取消
 *   ✅ 題數每組獨立設定（6-30，預設 6，混合自動 ×2）
 *   ✅ 已選組合拖曳排序（HTML5 Drag & Drop）
 *   ✅ 多人額外：倒數秒數設定（2-5 秒）
 *
 * 產出資料結構：
 *   combos: [
 *     { fieldId: 'mouse', ruleId: 'rule1', questionCount: 6, enableWm: false },
 *     { fieldId: 'mouse', ruleId: 'mixed', questionCount: 12, enableWm: true },
 *     ...
 *   ]
 *
 * 依賴：
 *   - GAME_CONFIG（game-config.js）
 *
 * 匯出：window.GameSessionBuilder + module.exports
 * ============================================
 */

// =========================================
// 常數
// =========================================

/**
 * 遊戲場定義
 * @readonly
 */
var FIELD_OPTIONS = [
  { id: "mouse", name: "🐭 小老鼠", icon: "🐭" },
  { id: "fishing", name: "🐟 釣魚", icon: "🐟" },
];

/**
 * 規則定義
 * @readonly
 */
var RULE_OPTIONS = [
  { id: "rule1", name: "規則一（建立規則）", short: "規則一" },
  { id: "rule2", name: "規則二（規則轉換）", short: "規則二" },
  { id: "mixed", name: "混合（混合轉換）", short: "混合" },
];

// =========================================
// 配置讀取工具
// =========================================

/**
 * 讀取 GAME_CONFIG 的題數設定
 */
function _getQConfig() {
  if (typeof GAME_CONFIG !== "undefined" && GAME_CONFIG.QUESTIONS) {
    return GAME_CONFIG.QUESTIONS;
  }
  return {
    DEFAULT_COUNT: 6,
    MIXED_MULTIPLIER: 2,
    MIN_COUNT: 6,
    MAX_COUNT: 30,
  };
}

/**
 * 讀取倒數預設秒數
 */
function _getCountdownDefault() {
  if (typeof GAME_CONFIG !== "undefined" && GAME_CONFIG.TIMING) {
    return GAME_CONFIG.TIMING.COUNTDOWN_SECONDS || 3;
  }
  return 3;
}

// =========================================
// 資料模型
// =========================================

/**
 * 建立空的 session 資料結構
 *
 * @param {Object}  [overrides]
 * @param {boolean} [overrides.isMultiplayer=false]
 * @returns {Object}
 */
function _createEmptySession(overrides) {
  var opts = overrides || {};
  return {
    /** 已選擇的組合清單（排序後） */
    combos: [],
    /** 是否多人模式 */
    isMultiplayer: !!opts.isMultiplayer,
    /** 倒數秒數（多人才用） */
    countdownSeconds: _getCountdownDefault(),
  };
}

/**
 * 建立單一 combo 物件
 *
 * @param {string}  fieldId
 * @param {string}  ruleId
 * @param {number}  questionCount
 * @param {boolean} enableWm
 * @returns {Object}
 */
function _createCombo(fieldId, ruleId, questionCount, enableWm) {
  var qConfig = _getQConfig();
  var isMixed = ruleId === "mixed";
  var defaultCount = isMixed
    ? qConfig.DEFAULT_COUNT * qConfig.MIXED_MULTIPLIER
    : qConfig.DEFAULT_COUNT;
  var count = questionCount || defaultCount;

  // 確保在範圍內
  count = Math.max(qConfig.MIN_COUNT, Math.min(qConfig.MAX_COUNT, count));
  // 混合規則強制偶數
  if (isMixed && count % 2 !== 0) {
    count = count + 1;
  }

  // 取遊戲場名稱
  var fieldDef = null;
  for (var i = 0; i < FIELD_OPTIONS.length; i++) {
    if (FIELD_OPTIONS[i].id === fieldId) {
      fieldDef = FIELD_OPTIONS[i];
      break;
    }
  }

  // 取規則名稱
  var ruleDef = null;
  for (var j = 0; j < RULE_OPTIONS.length; j++) {
    if (RULE_OPTIONS[j].id === ruleId) {
      ruleDef = RULE_OPTIONS[j];
      break;
    }
  }

  return {
    fieldId: fieldId,
    ruleId: ruleId,
    questionCount: count,
    enableWm: !!enableWm,
    /** 顯示用名稱，例如「🐭規則一」 */
    displayName:
      (fieldDef ? fieldDef.icon : "") +
      " " +
      (ruleDef ? ruleDef.short : ruleId),
    /** 唯一識別（供拖曳排序用） */
    key: fieldId + "_" + ruleId,
  };
}

// =========================================
// 笛卡爾積工具
// =========================================

/**
 * 從選取的 fields × rules 產生所有組合
 *
 * @param {Array<string>} selectedFieldIds - ['mouse', 'fishing']
 * @param {Array<string>} selectedRuleIds  - ['rule1', 'rule2', 'mixed']
 * @param {Object}        [wmMap]          - { 'mouse_rule1': true, ... }
 * @param {Object}        [countMap]       - { 'mouse_rule1': 12, ... }
 * @returns {Array<Object>} combo 陣列
 */
function _generateCombos(selectedFieldIds, selectedRuleIds, wmMap, countMap) {
  var combos = [];
  var wm = wmMap || {};
  var counts = countMap || {};

  for (var f = 0; f < selectedFieldIds.length; f++) {
    for (var r = 0; r < selectedRuleIds.length; r++) {
      var fieldId = selectedFieldIds[f];
      var ruleId = selectedRuleIds[r];
      var key = fieldId + "_" + ruleId;
      combos.push(_createCombo(fieldId, ruleId, counts[key] || 0, !!wm[key]));
    }
  }

  return combos;
}

// =========================================
// 拖曳排序
// =========================================

/**
 * 在陣列中移動元素（用於拖曳排序）
 *
 * @param {Array} arr
 * @param {number} fromIndex
 * @param {number} toIndex
 * @returns {Array} 新陣列（不修改原陣列）
 */
function _moveInArray(arr, fromIndex, toIndex) {
  var result = arr.slice();
  var item = result.splice(fromIndex, 1)[0];
  result.splice(toIndex, 0, item);
  return result;
}

// =========================================
// 驗證
// =========================================

/**
 * 驗證 session 是否有效
 *
 * @param {Object} session
 * @returns {{ valid: boolean, errors: string[] }}
 */
function _validate(session) {
  var errors = [];

  if (!session.combos || session.combos.length === 0) {
    errors.push("至少需要選擇一個遊戲組合");
  }

  for (var i = 0; i < (session.combos || []).length; i++) {
    var c = session.combos[i];
    var qConfig = _getQConfig();

    if (c.questionCount < qConfig.MIN_COUNT) {
      errors.push(c.displayName + "：題數不得少於 " + qConfig.MIN_COUNT);
    }
    if (c.questionCount > qConfig.MAX_COUNT) {
      errors.push(c.displayName + "：題數不得超過 " + qConfig.MAX_COUNT);
    }
  }

  if (session.isMultiplayer) {
    if (session.countdownSeconds < 2 || session.countdownSeconds > 5) {
      errors.push("倒數秒數須在 2-5 秒之間");
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors,
  };
}

// =========================================
// 公開 API
// =========================================

var GameSessionBuilder = {
  /**
   * 建立新的 session
   *
   * @param {Object} [options]
   * @param {boolean} [options.isMultiplayer=false]
   * @returns {Object} session 資料結構
   */
  createSession: function (options) {
    return _createEmptySession(options);
  },

  /**
   * 從 fields × rules 選擇產生組合
   *
   * @param {Object} params
   * @param {Array<string>} params.fields    - 選取的遊戲場 ID
   * @param {Array<string>} params.rules     - 選取的規則 ID
   * @param {Object}        [params.wmMap]   - WM 勾選對照 { key: boolean }
   * @param {Object}        [params.countMap] - 題數對照 { key: number }
   * @returns {Array<Object>} combo 陣列
   *
   * @example
   * var combos = GameSessionBuilder.generateCombos({
   *   fields: ['mouse', 'fishing'],
   *   rules: ['rule1', 'mixed'],
   *   wmMap: { 'mouse_mixed': true, 'fishing_mixed': true },
   *   countMap: { 'mouse_mixed': 12 }
   * });
   */
  generateCombos: function (params) {
    if (!params) return [];
    return _generateCombos(
      params.fields || [],
      params.rules || [],
      params.wmMap,
      params.countMap,
    );
  },

  /**
   * 建立單一 combo
   *
   * @param {string}  fieldId
   * @param {string}  ruleId
   * @param {number}  [questionCount]
   * @param {boolean} [enableWm=false]
   * @returns {Object}
   */
  createCombo: function (fieldId, ruleId, questionCount, enableWm) {
    return _createCombo(fieldId, ruleId, questionCount, enableWm);
  },

  /**
   * 重新排序組合（拖曳結果）
   *
   * @param {Array<Object>} combos
   * @param {number}        fromIndex
   * @param {number}        toIndex
   * @returns {Array<Object>} 排序後的新陣列
   */
  reorderCombos: function (combos, fromIndex, toIndex) {
    return _moveInArray(combos, fromIndex, toIndex);
  },

  /**
   * 設定 combo 的題數
   *
   * @param {Object} combo
   * @param {number} count
   * @returns {Object} 更新後的 combo（新物件）
   */
  setQuestionCount: function (combo, count) {
    var qConfig = _getQConfig();
    var newCount = Math.max(
      qConfig.MIN_COUNT,
      Math.min(qConfig.MAX_COUNT, count),
    );
    // 混合強制偶數
    if (combo.ruleId === "mixed" && newCount % 2 !== 0) {
      newCount = newCount + 1;
    }
    var updated = {};
    for (var k in combo) {
      if (combo.hasOwnProperty(k)) {
        updated[k] = combo[k];
      }
    }
    updated.questionCount = newCount;
    return updated;
  },

  /**
   * 切換 combo 的 WM 啟用狀態
   *
   * @param {Object} combo
   * @returns {Object} 更新後的 combo（新物件）
   */
  toggleWm: function (combo) {
    var updated = {};
    for (var k in combo) {
      if (combo.hasOwnProperty(k)) {
        updated[k] = combo[k];
      }
    }
    updated.enableWm = !updated.enableWm;
    return updated;
  },

  /**
   * 批量設定所有 combo 的 WM 狀態
   *
   * @param {Array<Object>} combos
   * @param {boolean}       enabled
   * @returns {Array<Object>} 新陣列
   */
  setAllWm: function (combos, enabled) {
    return combos.map(function (c) {
      var updated = {};
      for (var k in c) {
        if (c.hasOwnProperty(k)) {
          updated[k] = c[k];
        }
      }
      updated.enableWm = !!enabled;
      return updated;
    });
  },

  /**
   * 驗證 session
   *
   * @param {Object} session
   * @returns {{ valid: boolean, errors: string[] }}
   */
  validate: function (session) {
    return _validate(session);
  },

  /**
   * 將 session 轉為可序列化的純物件（存入 Firebase / localStorage）
   *
   * @param {Object} session
   * @returns {Object}
   */
  serialize: function (session) {
    return {
      combos: (session.combos || []).map(function (c) {
        return {
          fieldId: c.fieldId,
          ruleId: c.ruleId,
          questionCount: c.questionCount,
          enableWm: c.enableWm,
        };
      }),
      isMultiplayer: session.isMultiplayer,
      countdownSeconds: session.countdownSeconds,
      createdAt: Date.now(),
    };
  },

  /**
   * 從序列化資料還原 session（重建 displayName 等衍生欄位）
   *
   * @param {Object} data - serialize() 的輸出
   * @returns {Object} 完整 session
   */
  deserialize: function (data) {
    var session = _createEmptySession({
      isMultiplayer: data.isMultiplayer,
    });
    session.countdownSeconds = data.countdownSeconds || _getCountdownDefault();
    session.combos = (data.combos || []).map(function (c) {
      return _createCombo(c.fieldId, c.ruleId, c.questionCount, c.enableWm);
    });
    return session;
  },

  // -----------------------------------------
  // 常數暴露
  // -----------------------------------------

  /** @readonly */
  FIELD_OPTIONS: FIELD_OPTIONS,

  /** @readonly */
  RULE_OPTIONS: RULE_OPTIONS,
};

// =========================================
// 匯出
// =========================================

if (typeof window !== "undefined") {
  window.GameSessionBuilder = GameSessionBuilder;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = GameSessionBuilder;
}
