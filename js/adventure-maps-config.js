/**
 * ============================================
 * 探險地圖 — Config
 * ============================================
 * 對應需求文件：§3.2
 * 說明：2 張地圖 × 6 探險點的陣列定義
 *       可彈性調整探險點排列順序、題數
 *       強制逐步解鎖：①→②→③→④→⑤→⑥
 * ============================================
 */

const ADVENTURE_MAPS = [
  {
    id: "mouse",
    name: "🐭 小老鼠冒險",
    icon: "🐭",
    unlockCondition: null, // 預設開放
    points: [
      {
        id: "mouse_r1",
        field: "mouse",
        rule: "rule1",
        hasWM: false,
        questionsCount: 12,
        label: "① 規則一",
      },
      {
        id: "mouse_r1_wm",
        field: "mouse",
        rule: "rule1",
        hasWM: true,
        questionsCount: 12,
        label: "② 規則一 + 🧠WM",
      },
      {
        id: "mouse_r2",
        field: "mouse",
        rule: "rule2",
        hasWM: false,
        questionsCount: 12,
        label: "③ 規則二",
      },
      {
        id: "mouse_r2_wm",
        field: "mouse",
        rule: "rule2",
        hasWM: true,
        questionsCount: 12,
        label: "④ 規則二 + 🧠WM",
      },
      {
        id: "mouse_mixed",
        field: "mouse",
        rule: "mixed",
        hasWM: false,
        questionsCount: 12,
        label: "⑤ 混合規則",
      },
      {
        id: "mouse_mixed_wm",
        field: "mouse",
        rule: "mixed",
        hasWM: true,
        questionsCount: 12,
        label: "⑥ 混合規則 + 🧠WM",
      },
    ],
  },
  {
    id: "fishing",
    name: "🐟 釣魚冒險",
    icon: "🐟",
    unlockCondition: "mouse_all_passed", // 地圖 1 六點全通過後解鎖
    points: [
      {
        id: "fishing_r1",
        field: "fishing",
        rule: "rule1",
        hasWM: false,
        questionsCount: 12,
        label: "⑦ 規則一",
      },
      {
        id: "fishing_r1_wm",
        field: "fishing",
        rule: "rule1",
        hasWM: true,
        questionsCount: 12,
        label: "⑧ 規則一 + 🧠WM",
      },
      {
        id: "fishing_r2",
        field: "fishing",
        rule: "rule2",
        hasWM: false,
        questionsCount: 12,
        label: "⑨ 規則二",
      },
      {
        id: "fishing_r2_wm",
        field: "fishing",
        rule: "rule2",
        hasWM: true,
        questionsCount: 12,
        label: "⑩ 規則二 + 🧠WM",
      },
      {
        id: "fishing_mixed",
        field: "fishing",
        rule: "mixed",
        hasWM: false,
        questionsCount: 12,
        label: "⑪ 混合規則",
      },
      {
        id: "fishing_mixed_wm",
        field: "fishing",
        rule: "mixed",
        hasWM: true,
        questionsCount: 12,
        label: "⑫ 混合規則 + 🧠WM",
      },
    ],
  },
];

/**
 * 探險點 3 狀態
 * ⬜ locked   — 未解鎖（灰色 + 🔒）
 * 🟡 current  — 當前可玩（發光動畫）
 * ⭐ passed   — 已通過（顯示累計星星數）
 */
const ADVENTURE_POINT_STATUS = {
  LOCKED: "locked",
  CURRENT: "current",
  PASSED: "passed",
};

/**
 * 自由選擇模式解鎖條件
 * 12 個探險點全部通過後解鎖
 */
const FREE_SELECT_UNLOCK = {
  condition: "all_12_passed",
  teacherOverride: "?unlock=all",
  message: "請先完成探險地圖所有探險點！",
};

// =========================================
// 匯出
// =========================================

if (typeof window !== "undefined") {
  window.ADVENTURE_MAPS = ADVENTURE_MAPS;
  window.ADVENTURE_POINT_STATUS = ADVENTURE_POINT_STATUS;
  window.FREE_SELECT_UNLOCK = FREE_SELECT_UNLOCK;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    ADVENTURE_MAPS,
    ADVENTURE_POINT_STATUS,
    FREE_SELECT_UNLOCK,
  };
}
