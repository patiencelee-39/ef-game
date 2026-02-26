/**
 * ============================================
 * StagePicker — 共用遊戲場選擇元件
 * ============================================
 * 說明：多人建房 + 單人自由選擇共用的「遊戲場卡片 + 已選 chip 排序」UI
 *
 * 功能：
 *   ✅ 從 ComboSelector.STAGES（12 場）動態產生可選卡片
 *   ✅ 點擊卡片 → 加入已選列表（可重複選擇）
 *   ✅ 已選 chip 拖曳排序（HTML5 Drag + Touch）
 *   ✅ chip 點 ✕ 移除
 *   ✅ onChange 回呼（外部即時取得 selectedStages）
 *
 * 用法：
 *   StagePicker.init({
 *     cardsContainer:  document.getElementById('availableStages'),
 *     chipsContainer:  document.getElementById('selectedStages'),
 *     maxSelections:   20,           // 可省略, 預設 20
 *     onChange:        function(stages) { ... }
 *   });
 *
 *   StagePicker.getSelected();       // → ['A','C','A','G', ...]
 *   StagePicker.setSelected([...]);  // 程式化設定
 *
 * 依賴：ComboSelector（combo-selector.js）
 * ============================================
 */
var StagePicker = (function () {
  "use strict";

  // ── 內部狀態 ──
  var _selected = []; // 已選 stage ID 陣列（有序、可重複）
  var _cardsEl = null; // 可選卡片容器 DOM
  var _chipsEl = null; // 已選 chip 容器 DOM
  var _maxSelections = 20;
  var _onChange = null;
  var _dragIdx = null; // 拖曳來源 index

  // 難度中文
  var DIFF_LABELS = { easy: "簡單", medium: "中等", hard: "困難" };

  // ── 規則中文（供次標題顯示）──
  var RULE_LABELS = {
    rule1: "規則一",
    rule2: "規則二",
    mixed: "混合規則",
  };

  // ========================================
  // 初始化
  // ========================================
  function init(opts) {
    _cardsEl = opts.cardsContainer;
    _chipsEl = opts.chipsContainer;
    _maxSelections = opts.maxSelections || 20;
    _onChange = opts.onChange || null;
    _selected = [];

    _renderCards();
    _renderChips();

    // chip 容器拖曳事件（HTML5 DnD delegation）
    _chipsEl.addEventListener("dragstart", _onDragStart);
    _chipsEl.addEventListener("dragover", _onDragOver);
    _chipsEl.addEventListener("drop", _onDrop);
    _chipsEl.addEventListener("dragend", _onDragEnd);
  }

  // ========================================
  // 卡片區：渲染 12 張可選卡片
  // ========================================
  function _renderCards() {
    if (!_cardsEl) return;
    var stages = ComboSelector.getAll();
    _cardsEl.innerHTML = "";

    stages.forEach(function (s) {
      var card = document.createElement("div");
      card.className = "stage-card";
      card.setAttribute("data-stage", s.id);
      card.setAttribute("data-field", s.fieldId);
      card.setAttribute("data-rule", s.ruleId);
      if (s.hasWM) card.setAttribute("data-wm", "true");
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");

      var ruleLabel = RULE_LABELS[s.ruleId] || s.ruleId;
      var diffLabel = DIFF_LABELS[s.difficulty] || "";
      var wmBadge = s.hasWM ? " 🧠" : "";

      card.innerHTML =
        '<span class="emoji">' +
        s.icon +
        "</span>" +
        '<div class="stage-card-name">' +
        s.name +
        "</div>" +
        '<div class="stage-card-rule">' +
        ruleLabel +
        wmBadge +
        "</div>" +
        '<small class="stage-card-diff">' +
        diffLabel +
        "</small>";

      card.addEventListener("click", function () {
        _addStage(s.id);
      });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          _addStage(s.id);
        }
      });

      _cardsEl.appendChild(card);
    });
  }

  // ========================================
  // 新增 / 移除
  // ========================================
  function _addStage(stageId) {
    if (_selected.length >= _maxSelections) {
      if (window.GameModal) {
        GameModal.alert(
          "已達上限",
          "最多只能選擇 " + _maxSelections + " 個遊戲場",
          { icon: "⚠️" },
        );
      }
      return;
    }
    _selected.push(stageId);
    _renderChips();
    _notify();
  }

  function _removeByIndex(idx) {
    _selected.splice(idx, 1);
    _renderChips();
    _notify();
  }

  // ========================================
  // Chip 區：渲染已選 chip
  // ========================================
  function _renderChips() {
    if (!_chipsEl) return;

    if (_selected.length === 0) {
      _chipsEl.innerHTML =
        '<div class="selected-stages-empty">👆 請從下方選擇遊戲場（可重複，最多' +
        _maxSelections +
        "個）</div>";
      return;
    }

    _chipsEl.innerHTML = "";

    _selected.forEach(function (stageId, idx) {
      var s = ComboSelector.getById(stageId);
      if (!s) return;

      var chip = document.createElement("div");
      chip.className = "stage-chip";
      chip.setAttribute("draggable", "true");
      chip.setAttribute("data-index", idx);
      chip.setAttribute("data-stage", stageId);
      chip.setAttribute("role", "listitem");

      var ruleLabel = RULE_LABELS[s.ruleId] || "";
      var wmBadge = s.hasWM ? " 🧠" : "";

      chip.innerHTML =
        '<span class="chip-drag-handle">⠿</span>' +
        '<span class="emoji">' +
        s.icon +
        "</span>" +
        '<span class="chip-label">' +
        ruleLabel +
        wmBadge +
        "</span>" +
        '<button type="button" class="remove-btn" data-remove-index="' +
        idx +
        '" aria-label="移除">✕</button>';

      // 移除按鈕
      chip.querySelector(".remove-btn").addEventListener("click", function (e) {
        e.stopPropagation();
        _removeByIndex(idx);
      });

      // Touch 拖曳
      _attachTouchDrag(chip, idx);

      _chipsEl.appendChild(chip);
    });
  }

  // ========================================
  // HTML5 Drag & Drop（桌面）
  // ========================================
  function _onDragStart(e) {
    var chip = e.target.closest(".stage-chip");
    if (!chip) return;
    _dragIdx = parseInt(chip.dataset.index, 10);
    chip.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
  }

  function _onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    var chip = e.target.closest(".stage-chip");
    if (chip) chip.classList.add("drag-over");
  }

  function _onDrop(e) {
    e.preventDefault();
    _chipsEl.querySelectorAll(".drag-over").forEach(function (el) {
      el.classList.remove("drag-over");
    });
    var target = e.target.closest(".stage-chip");
    if (!target) return;
    var toIdx = parseInt(target.dataset.index, 10);
    if (_dragIdx == null || _dragIdx === toIdx) return;

    var moved = _selected.splice(_dragIdx, 1)[0];
    _selected.splice(toIdx, 0, moved);
    _dragIdx = null;
    _renderChips();
    _notify();
  }

  function _onDragEnd() {
    _dragIdx = null;
    _chipsEl.querySelectorAll(".dragging,.drag-over").forEach(function (el) {
      el.classList.remove("dragging", "drag-over");
    });
  }

  // ========================================
  // Touch 拖曳（行動裝置）
  // ========================================
  function _attachTouchDrag(chip, idx) {
    var startY = 0;

    chip.addEventListener(
      "touchstart",
      function (e) {
        _dragIdx = idx;
        startY = e.touches[0].clientY;
        chip.classList.add("dragging");
      },
      { passive: true },
    );

    chip.addEventListener(
      "touchmove",
      function (e) {
        e.preventDefault();
      },
      { passive: false },
    );

    chip.addEventListener("touchend", function (e) {
      chip.classList.remove("dragging");
      if (_dragIdx == null) return;

      var endY = e.changedTouches[0].clientY;
      var chips = _chipsEl.querySelectorAll(".stage-chip");
      var toIdx = _dragIdx;
      for (var i = 0; i < chips.length; i++) {
        var rect = chips[i].getBoundingClientRect();
        if (endY >= rect.top && endY <= rect.bottom) {
          toIdx = i;
          break;
        }
      }

      if (toIdx !== _dragIdx) {
        var moved = _selected.splice(_dragIdx, 1)[0];
        _selected.splice(toIdx, 0, moved);
        _renderChips();
        _notify();
      }
      _dragIdx = null;
    });
  }

  // ========================================
  // 通知外部
  // ========================================
  function _notify() {
    if (typeof _onChange === "function") {
      _onChange(_selected.slice());
    }
  }

  // ========================================
  // 公開 API
  // ========================================
  return {
    init: init,

    /** 取得目前已選 stage ID 陣列 */
    getSelected: function () {
      return _selected.slice();
    },

    /** 程式化設定已選列表 */
    setSelected: function (ids) {
      _selected = (ids || []).slice();
      _renderChips();
      _notify();
    },

    /** 清空選擇 */
    clear: function () {
      _selected = [];
      _renderChips();
      _notify();
    },
  };
})();
