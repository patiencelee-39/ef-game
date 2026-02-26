/**
 * ============================================
 * 聲音系統 — Config
 * ============================================
 * 對應需求文件：§4.3.1
 * 說明：所有音效、語音、播報均由此檔定義
 *       更換 config 即可切換整套聲音，不需修改遊戲邏輯
 * 兩個主開關：🔊 音效（sfx）、🗣️ 語音（voice）
 *
 * ⚠️ 音效與語音的 Fallback 機制不同（§5.4c）：
 *   🔊 音效（sfx）：三級 — 自訂 → 預設 → 靜默跳過
 *   🗣️ 語音（voice）：四級 — 自訂 MP3 → gTTS 預生成 → Web Speech API → 純視覺
 *
 * NOTE: 語音四級 Fallback 已於 Phase 3 在 audio-player.js 完整實作。
 *   getSoundFile() 負責音效的三級 fallback。
 *   語音四級降級（L1→L2→L3→L4）由 AudioPlayer._playVoice() 處理。
 * ============================================
 */

const SOUND_PACKS = {
  // ===== 預設音效包 =====
  default: {
    packName: "預設音效",

    // -------------------------------------------
    // 回饋音效（§4.3）
    // -------------------------------------------
    feedback: {
      correct: { file: "audio/feedback/correct-ding.mp3", label: "答對 — 叮" },
      incorrect: {
        file: "audio/feedback/incorrect-buzz.mp3",
        label: "答錯 — 噗",
      },
      badge: { file: "audio/feedback/badge-unlock.mp3", label: "徽章解鎖" },
      levelUp: { file: "audio/feedback/level-up.mp3", label: "升級" },
      complete: { file: "audio/feedback/game-complete.mp3", label: "遊戲完成" },
    },

    // -------------------------------------------
    // 規則說明語音（§4.3）
    // -------------------------------------------
    ruleGuide: {
      mouse: {
        rule1: {
          file: "audio/guide/mouse-rule1.mp3",
          label: "小老鼠規則一說明",
        },
        rule2: {
          file: "audio/guide/mouse-rule2.mp3",
          label: "小老鼠規則二說明",
        },
        mixed: {
          file: "audio/guide/mouse-mixed.mp3",
          label: "小老鼠混合規則說明",
        },
      },
      fishing: {
        rule1: {
          file: "audio/guide/fishing-rule1.mp3",
          label: "釣魚規則一說明",
        },
        rule2: {
          file: "audio/guide/fishing-rule2.mp3",
          label: "釣魚規則二說明",
        },
        mixed: {
          file: "audio/guide/fishing-mixed.mp3",
          label: "釣魚混合規則說明",
        },
      },
    },

    // -------------------------------------------
    // 刺激物語音 — 男女聲雙軌（§4.2.1）
    // 女聲 = 規則一 & 混合規則 A 情境
    // 男聲 = 混合規則 B 情境
    // -------------------------------------------
    stimulusVoice: {
      mouse: {
        go: {
          female: {
            file: "audio/voice/female/cheese.mp3",
            label: "👩 女聲「起司」",
          },
          male: {
            file: "audio/voice/male/cheese.mp3",
            label: "👨 男聲「起司」",
          },
        },
        noGo: {
          female: {
            file: "audio/voice/female/cat.mp3",
            label: "👩 女聲「貓咪」",
          },
          male: { file: "audio/voice/male/cat.mp3", label: "👨 男聲「貓咪」" },
        },
      },
      fishing: {
        go: {
          female: {
            file: "audio/voice/female/fish.mp3",
            label: "👩 女聲「魚」",
          },
          male: { file: "audio/voice/male/fish.mp3", label: "👨 男聲「魚」" },
        },
        noGo: {
          female: {
            file: "audio/voice/female/shark.mp3",
            label: "👩 女聲「鯊魚」",
          },
          male: {
            file: "audio/voice/male/shark.mp3",
            label: "👨 男聲「鯊魚」",
          },
        },
      },
    },

    // -------------------------------------------
    // WM 規則語音（§3.4）
    // -------------------------------------------
    wmGuide: {
      forward: {
        file: "audio/voice/wm/wm-forward.mp3",
        label: "「請照順序點選！」",
      },
      reverse: {
        file: "audio/voice/wm/wm-reverse.mp3",
        label: "「請倒著點選！」",
      },
    },

    // -------------------------------------------
    // 徽章名稱播報語音 — 18 個（§3.7）
    // -------------------------------------------
    badgeVoice: {
      mouseAdventurer: {
        file: "audio/voice/badge/badge-mouse-adventurer.mp3",
        label: "「獲得小老鼠冒險家！」",
      },
      fishingAdventurer: {
        file: "audio/voice/badge/badge-fishing-adventurer.mp3",
        label: "「獲得釣魚大冒險家！」",
      },
      ruleSwitcher: {
        file: "audio/voice/badge/badge-rule-switcher.mp3",
        label: "「獲得規則轉換大師！」",
      },
      mixedMaster: {
        file: "audio/voice/badge/badge-mixed-master.mp3",
        label: "「獲得混合高手！」",
      },
      memoryExpert: {
        file: "audio/voice/badge/badge-memory-expert.mp3",
        label: "「獲得記憶達人！」",
      },
      speedKing: {
        file: "audio/voice/badge/badge-speed-king.mp3",
        label: "「獲得速度之王！」",
      },
      perfectionist: {
        file: "audio/voice/badge/badge-perfectionist.mp3",
        label: "「獲得完美主義者！」",
      },
      progressStar: {
        file: "audio/voice/badge/badge-progress-star.mp3",
        label: "「獲得進步之星！」",
      },
      memoryStar: {
        file: "audio/voice/badge/badge-memory-star.mp3",
        label: "「獲得記憶之星！」",
      },
      allClear: {
        file: "audio/voice/badge/badge-all-clear.mp3",
        label: "「獲得全制霸！」",
      },
      rainbowCollector: {
        file: "audio/voice/badge/badge-rainbow-collector.mp3",
        label: "「獲得七彩收藏家！」",
      },
      braveWarrior: {
        file: "audio/voice/badge/badge-brave-warrior.mp3",
        label: "「獲得不屈勇士！」",
      },
      earlyBird: {
        file: "audio/voice/badge/badge-early-bird.mp3",
        label: "「獲得早起鳥兒！」",
      },
      nightOwl: {
        file: "audio/voice/badge/badge-night-owl.mp3",
        label: "「獲得懸梁刺骨！」",
      },
      gameMaster: {
        file: "audio/voice/badge/badge-game-master.mp3",
        label: "「獲得遊戲達人！」",
      },
      badgeStrong: {
        file: "audio/voice/badge/badge-badge-strong.mp3",
        label: "「獲得徽章強者！」",
      },
      badgeExpert: {
        file: "audio/voice/badge/badge-badge-expert.mp3",
        label: "「獲得徽章專家！」",
      },
      badgeGrandmaster: {
        file: "audio/voice/badge/badge-badge-grandmaster.mp3",
        label: "「獲得徽章職人大師！」",
      },
    },

    // -------------------------------------------
    // 等級名稱播報語音 — 5 個（§3.8）
    // -------------------------------------------
    levelVoice: {
      level1: {
        file: "audio/voice/level/level-1-egg.mp3",
        label: "「你是蛋寶寶！」",
      },
      level2: {
        file: "audio/voice/level/level-2-hatching.mp3",
        label: "「恭喜升級為破殼雞！」",
      },
      level3: {
        file: "audio/voice/level/level-3-chick.mp3",
        label: "「恭喜升級為小雞仔！」",
      },
      level4: {
        file: "audio/voice/level/level-4-rooster.mp3",
        label: "「恭喜升級為雞大王！」",
      },
      level5: {
        file: "audio/voice/level/level-5-eagle.mp3",
        label: "「恭喜升級為金鷹王者！」",
      },
    },

    // -------------------------------------------
    // 解鎖通知語音 — 6 個（§3.9, §3.2）
    // -------------------------------------------
    unlockVoice: {
      mouseRule2: {
        file: "audio/voice/unlock/unlock-mouse-rule2.mp3",
        label: "「小老鼠規則二已解鎖！」",
      },
      mouseMixed: {
        file: "audio/voice/unlock/unlock-mouse-mixed.mp3",
        label: "「小老鼠混合規則已解鎖！」",
      },
      fishingRule2: {
        file: "audio/voice/unlock/unlock-fishing-rule2.mp3",
        label: "「釣魚規則二已解鎖！」",
      },
      fishingMixed: {
        file: "audio/voice/unlock/unlock-fishing-mixed.mp3",
        label: "「釣魚混合規則已解鎖！」",
      },
      map2: {
        file: "audio/voice/unlock/unlock-map2.mp3",
        label: "「恭喜解鎖釣魚冒險地圖！」",
      },
      freeChoice: {
        file: "audio/voice/unlock/unlock-free-choice.mp3",
        label: "「恭喜解鎖自由選擇！」",
      },
    },

    // -------------------------------------------
    // 其他音效（§4.3）
    // -------------------------------------------
    sfx: {
      stimulusAppear: { file: "audio/sfx/pop.mp3", label: "刺激物出現" },
      countdown: { file: "audio/sfx/countdown-beep.mp3", label: "倒數嗶聲" },
      countdownGo: { file: "audio/sfx/countdown-go.mp3", label: "開始！" },
      wmHighlight: { file: "audio/sfx/wm-highlight.mp3", label: "WM 位置亮起" },
      wmCorrect: { file: "audio/sfx/wm-correct.mp3", label: "WM 回答正確" },
      wmIncorrect: { file: "audio/sfx/wm-incorrect.mp3", label: "WM 回答錯誤" },
      buttonClick: { file: "audio/sfx/click.mp3", label: "按鈕點擊" },
      pageTransition: { file: "audio/sfx/transition.mp3", label: "頁面切換" },
      playerJoin: { file: "audio/sfx/player-join.mp3", label: "玩家加入提示" },
    },
  },

  // ===== 未來可擴充：替代音效包 =====
  // 'cute-animals': { ... }
  // 'music-box': { ... }
};

// =========================================
// 狀態管理
// =========================================

/** 當前使用的音效包 */
let currentSoundPack = "default";

/** 自訂覆蓋（使用者替換的個別音效） */
let soundOverrides = {};
// 例如：{ 'feedback.correct': 'custom/my-ding.mp3' }

// =========================================
// API
// =========================================

/**
 * 取得當前音效包
 * @returns {Object} 當前音效包物件
 */
function getCurrentSoundPack() {
  return SOUND_PACKS[currentSoundPack];
}

/**
 * 取得指定音效的檔案路徑（含 Fallback）
 * 三級 Fallback：自訂 → 預設 → null（靜默跳過）
 * @param {string} path - 點分隔路徑，如 'feedback.correct'
 * @returns {string|null} 音效檔案路徑或 null
 */
function getSoundFile(path) {
  // 1. 檢查自訂覆蓋
  if (soundOverrides[path]) {
    return soundOverrides[path];
  }

  // 2. 從當前音效包取得
  const pack = getCurrentSoundPack();
  if (!pack) {
    Logger.warn(`⚠️ 音效包 "${currentSoundPack}" 不存在`);
    return null;
  }

  const keys = path.split(".");
  let result = pack;
  for (const key of keys) {
    if (result && typeof result === "object" && key in result) {
      result = result[key];
    } else {
      Logger.warn(`⚠️ 音效路徑 "${path}" 不存在，靜默跳過`);
      return null;
    }
  }

  return result && result.file ? result.file : null;
}

/**
 * 切換音效包
 * @param {string} packId - 音效包 ID
 * @returns {boolean} 是否切換成功
 */
function setSoundPack(packId) {
  if (SOUND_PACKS[packId]) {
    currentSoundPack = packId;
    localStorage.setItem("efgame-sound-pack", packId);
    Logger.debug(`✅ 音效包已切換為：${SOUND_PACKS[packId].packName}`);
    return true;
  }
  Logger.warn(`⚠️ 音效包 "${packId}" 不存在`);
  return false;
}

/**
 * 設定個別音效覆蓋
 * @param {string} path - 點分隔路徑
 * @param {string} customFile - 自訂音效檔案路徑
 */
function setSoundOverride(path, customFile) {
  soundOverrides[path] = customFile;
  localStorage.setItem(
    "efgame-sound-overrides",
    JSON.stringify(soundOverrides),
  );
}

/**
 * 清除所有自訂覆蓋
 */
function clearSoundOverrides() {
  soundOverrides = {};
  localStorage.removeItem("efgame-sound-overrides");
}

// =========================================
// 初始化：讀取 localStorage 偏好
// =========================================
(function initSoundConfig() {
  // 讀取音效包偏好
  const savedPack = localStorage.getItem("efgame-sound-pack");
  if (savedPack && SOUND_PACKS[savedPack]) {
    currentSoundPack = savedPack;
  }

  // 讀取自訂覆蓋
  const savedOverrides = localStorage.getItem("efgame-sound-overrides");
  if (savedOverrides) {
    try {
      soundOverrides = JSON.parse(savedOverrides);
    } catch (e) {
      Logger.warn("⚠️ 自訂音效覆蓋解析失敗，已重置");
      soundOverrides = {};
    }
  }
})();

// =========================================
// 匯出
// =========================================

if (typeof window !== "undefined") {
  window.SOUND_PACKS = SOUND_PACKS;
  window.getCurrentSoundPack = getCurrentSoundPack;
  window.getSoundFile = getSoundFile;
  window.setSoundPack = setSoundPack;
  window.setSoundOverride = setSoundOverride;
  window.clearSoundOverrides = clearSoundOverrides;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    SOUND_PACKS,
    getCurrentSoundPack,
    getSoundFile,
    setSoundPack,
    setSoundOverride,
    clearSoundOverrides,
  };
}
