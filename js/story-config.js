/**
 * ============================================
 * 故事系統 — 設定檔
 * ============================================
 * 說明：蛋寶寶的金鷹王者之路
 *       定義角色、進化里程碑、12 個探險點的劇情對話
 *
 * 角色：
 *   🦉 智慧貓頭鷹「阿智」 — 導師
 *   🦊 搗蛋狐狸「淘淘」   — 反派
 *   🦅 金鷹王者           — 傳說中的存在
 *
 * 進化路線（每完成 3 個探險點進化 1 次）：
 *   🥚 蛋寶寶 → 🐣 破殼雞 → 🐥 小雞仔 → 🐓 雞大王 → 🦅 金鷹王者
 *
 * 核心理念：👀看清楚 → 🧠想一想 → 🐾再動作
 * ============================================
 */

var STORY_CONFIG = {
  // ─── 角色定義 ───
  characters: {
    mentor: {
      id: "mentor",
      name: "阿智",
      icon: "🦉",
      role: "導師",
      description: "住在古老大樹上的智慧貓頭鷹，是蛋寶寶的引路人",
    },
    villain: {
      id: "villain",
      name: "淘淘",
      icon: "🦊",
      role: "搗蛋精靈",
      description: "愛搗蛋的小狐狸，總是把規則搞得亂七八糟",
    },
    legendaryEagle: {
      id: "eagle",
      name: "金鷹王者",
      icon: "🦅",
      role: "傳說",
      description: "住在彩虹山頂的傳說神鷹，是所有冒險者的終極目標",
    },
  },

  // ─── 進化里程碑 ───
  // 每 3 個探險點（依序號）觸發一次進化
  // triggerAfterPoint = 完成該 pointId 後觸發
  //
  // v4.7 三系統對齊：
  //   level-calculator.js 的 LEVEL_DEFINITIONS minStars 已對齊本表。
  //   通過里程碑 → stars ≥ minStars → 等級 / 寵物 / 故事同步進化。
  //   ┌────────┬───────────────────┬──────────┬──────────────┐
  //   │ 階段   │ triggerAfterPoint │ 保證⭐   │ level minStars│
  //   │ 1 🐣  │ mouse_r2          │ ≥ 4      │ 4            │
  //   │ 2 🐥  │ mouse_mixed_wm    │ ≥ 9      │ 9            │
  //   │ 3 🐓  │ fishing_r2        │ ≥ 13     │ 13           │
  //   │ 4 🦅  │ fishing_mixed_wm  │ ≥ 18     │ 18           │
  //   └────────┴───────────────────┴──────────┴──────────────┘
  evolutions: [
    {
      stage: 1,
      triggerAfterPoint: "mouse_r2", // 第 3 個探險點
      from: { icon: "🥚", name: "蛋寶寶" },
      to: { icon: "🐣", name: "破殼雞" },
      dialogue: {
        speaker: "mentor",
        text: "哇！你識破了淘淘的第一個詭計，蛋殼裂開了！歡迎來到世界，破殼雞！🐣",
        voiceFile: "audio/voice/story/voice-story-evo-1.mp3",
      },
    },
    {
      stage: 2,
      triggerAfterPoint: "mouse_mixed_wm", // 第 6 個探險點（地圖 1 完成）
      from: { icon: "🐣", name: "破殼雞" },
      to: { icon: "🐥", name: "小雞仔" },
      dialogue: {
        speaker: "mentor",
        text: "太厲害了！完成了整個小老鼠冒險！你長出了金色的小翅膀，進化成小雞仔！🐥",
        voiceFile: "audio/voice/story/voice-story-evo-2.mp3",
      },
    },
    {
      stage: 3,
      triggerAfterPoint: "fishing_r2", // 第 9 個探險點
      from: { icon: "🐥", name: "小雞仔" },
      to: { icon: "🐓", name: "雞大王" },
      dialogue: {
        speaker: "mentor",
        text: "了不起！你在釣魚港也識破了淘淘！你的翅膀越來越強壯，變成了威風的雞大王！🐓",
        voiceFile: "audio/voice/story/voice-story-evo-3.mp3",
      },
    },
    {
      stage: 4,
      triggerAfterPoint: "fishing_mixed_wm", // 第 12 個探險點（全部完成）
      from: { icon: "🐓", name: "雞大王" },
      to: { icon: "🦅", name: "金鷹王者" },
      dialogue: {
        speaker: "legendaryEagle",
        text: "你終於來到彩虹山頂了！從小小的蛋寶寶一路成長，現在你就是新的金鷹王者！展翅翱翔吧！🦅✨",
        voiceFile: "audio/voice/story/voice-story-evo-4.mp3",
      },
    },
  ],

  // ─── 12 個探險點的劇情對話 ───
  // key = adventure-maps-config.js 中的 point id
  // opening: 開始前的對話（顯示在探險點 Info Popup）
  //   - text: 精簡版故事（1-2 句核心句 + 口訣）
  //   - mnemonic: 規則口訣（供規則說明畫面強調顯示）
  // completion: 通過後的對話（返回地圖時顯示）
  // failure: 未通過的鼓勵語（返回地圖時顯示）
  //
  // ⚠️ 以下區塊由 tools/build-stories.js 自動產生
  //    原始文字請修改 content/stories/*.txt，然後執行：
  //    node tools/build-stories.js
  // __DIALOGUES_BEGIN__
  // ════════════════════════════════
  // 地圖 1：🐭 小老鼠冒險
  // ════════════════════════════════

  // ① 規則一（看到🧀起司→按，看到😺貓→不按）
  mouse_r1: {
    opening: {
      speaker: "mentor",
      text: "歡迎來到起司村！幫小老鼠收集起司吧！\n🧀起司→按按按！😺貓咪→不要按！",
      mnemonic: "🧀按按按，😺不要按！",
      voiceFile: "audio/voice/story/voice-story-mouse-r1-opening.mp3",
    },
    completion: {
      speaker: "mentor",
      text: "太棒了！收集好多起司！蛋寶寶真勇敢！🧀✨",
      voiceFile: "audio/voice/story/voice-story-mouse-r1-completion.mp3",
    },
    failure: {
      speaker: "mentor",
      text: "沒關係！記住口訣：🧀按按按，😺不要按！再試一次！",
      voiceFile: "audio/voice/story/voice-story-mouse-r1-failure.mp3",
    },
  },

  // ② 規則一 ＋ 工作記憶
  mouse_r1_wm: {
    opening: {
      speaker: "mentor",
      text: "這次除了收集起司，還要記住✨魔法密碼✨喔！\n🧀起司→按按按！😺貓咪→不要按！",
      mnemonic: "🧀按按按，😺不要按！＋🧠記密碼",
      voiceFile: "audio/voice/story/voice-story-mouse-r1wm-opening.mp3",
    },
    completion: {
      speaker: "mentor",
      text: "好厲害！收集起司又記住密碼！🧠✨",
      voiceFile: "audio/voice/story/voice-story-mouse-r1wm-completion.mp3",
    },
    failure: {
      speaker: "mentor",
      text: "加油！🧀按按按，😺不要按！慢慢來，你可以的！",
      voiceFile: "audio/voice/story/voice-story-mouse-r1wm-failure.mp3",
    },
  },

  // ③ 規則二（反轉！看到🧀起司→不按，看到😺貓→按）
  mouse_r2: {
    opening: {
      speaker: "villain",
      text: "嘿嘿！我是淘淘🦊！規則反過來啦！\n😺貓咪→按按按！🧀起司→不要按！",
      mnemonic: "😺按按按，🧀不要按！",
      voiceFile: "audio/voice/story/voice-story-mouse-r2-opening.mp3",
    },
    completion: {
      speaker: "villain",
      text: "什麼！？沒被搞混！？算你厲害…😤",
      voiceFile: "audio/voice/story/voice-story-mouse-r2-completion.mp3",
    },
    failure: {
      speaker: "mentor",
      text: "被搞混了嗎？記住口訣：😺按按按，🧀不要按！再試試！",
      voiceFile: "audio/voice/story/voice-story-mouse-r2-failure.mp3",
    },
  },

  // ④ 規則二 ＋ 工作記憶
  mouse_r2_wm: {
    opening: {
      speaker: "mentor",
      text: "淘淘把規則反過來了，還有✨魔法密碼✨要記！\n😺貓咪→按按按！🧀起司→不要按！",
      mnemonic: "😺按按按，🧀不要按！＋🧠記密碼",
      voiceFile: "audio/voice/story/voice-story-mouse-r2wm-opening.mp3",
    },
    completion: {
      speaker: "mentor",
      text: "破殼雞越來越厲害了！淘淘快氣壞了！🐣💪",
      voiceFile: "audio/voice/story/voice-story-mouse-r2wm-completion.mp3",
    },
    failure: {
      speaker: "mentor",
      text: "別擔心！😺按按按，🧀不要按！你可以的！",
      voiceFile: "audio/voice/story/voice-story-mouse-r2wm-failure.mp3",
    },
  },

  // ⑤ 混合規則（沒人→rule1，有人→rule2）
  mouse_mixed: {
    opening: {
      speaker: "villain",
      text: "新花招🦊！先看旁邊👤有沒有人！\n🚫沒人→🧀按、😺不按\n👤有人→😺按、🧀不按",
      mnemonic: "🚫沒人：🧀按😺不按\n👤有人：😺按🧀不按",
      voiceFile: "audio/voice/story/voice-story-mouse-mixed-opening.mp3",
    },
    completion: {
      speaker: "mentor",
      text: "眼力超厲害！淘淘的花招被你看穿了！👀✨",
      voiceFile: "audio/voice/story/voice-story-mouse-mixed-completion.mp3",
    },
    failure: {
      speaker: "mentor",
      text: "先看👤有沒有人！沒人→🧀按😺不按，有人→😺按🧀不按！",
      voiceFile: "audio/voice/story/voice-story-mouse-mixed-failure.mp3",
    },
  },

  // ⑥ 混合規則 ＋ 工作記憶（地圖 1 最終關）
  mouse_mixed_wm: {
    opening: {
      speaker: "mentor",
      text: "最後一關！混合規則加上✨魔法密碼✨！\n🚫沒人→🧀按😺不按\n👤有人→😺按🧀不按",
      mnemonic: "🚫沒人：🧀按😺不按\n👤有人：😺按🧀不按\n＋🧠記密碼",
      voiceFile: "audio/voice/story/voice-story-mouse-mixedwm-opening.mp3",
    },
    completion: {
      speaker: "mentor",
      text: "🎉 太厲害了！完成小老鼠冒險！獲得🧀【冷靜小勇士徽章】！",
      voiceFile: "audio/voice/story/voice-story-mouse-mixedwm-completion.mp3",
    },
    failure: {
      speaker: "mentor",
      text: "最後一關最難！先看有沒有人，再決定規則！多試幾次！💪",
      voiceFile: "audio/voice/story/voice-story-mouse-mixedwm-failure.mp3",
    },
  },

  // ════════════════════════════════
  // 地圖 2：🐟 釣魚冒險
  // ════════════════════════════════

  // ⑦ 規則一（看到🐟魚→按，看到🦈鯊魚→不按）
  fishing_r1: {
    opening: {
      speaker: "mentor",
      text: "歡迎來到釣魚港！幫忙釣魚吧！\n🐟小魚→按按按！🦈鯊魚→不要按！",
      mnemonic: "🐟按按按，🦈不要按！",
      voiceFile: "audio/voice/story/voice-story-fishing-r1-opening.mp3",
    },
    completion: {
      speaker: "mentor",
      text: "釣到好多魚！天生的小釣手！🐟✨",
      voiceFile: "audio/voice/story/voice-story-fishing-r1-completion.mp3",
    },
    failure: {
      speaker: "mentor",
      text: "🐟按按按，🦈不要按！再試一次！",
      voiceFile: "audio/voice/story/voice-story-fishing-r1-failure.mp3",
    },
  },

  // ⑧ 規則一 ＋ 工作記憶
  fishing_r1_wm: {
    opening: {
      speaker: "mentor",
      text: "這次釣魚還要記住✨魔法密碼✨！\n🐟小魚→按按按！🦈鯊魚→不要按！",
      mnemonic: "🐟按按按，🦈不要按！＋🧠記密碼",
      voiceFile: "audio/voice/story/voice-story-fishing-r1wm-opening.mp3",
    },
    completion: {
      speaker: "mentor",
      text: "了不起！釣魚又記住密碼！專注力越來越強！🧠🐟",
      voiceFile: "audio/voice/story/voice-story-fishing-r1wm-completion.mp3",
    },
    failure: {
      speaker: "mentor",
      text: "🐟按按按，🦈不要按！🧠記住密碼，再試試！",
      voiceFile: "audio/voice/story/voice-story-fishing-r1wm-failure.mp3",
    },
  },

  // ⑨ 規則二（反轉！看到🐟魚→不按，看到🦈鯊魚→按）
  fishing_r2: {
    opening: {
      speaker: "villain",
      text: "嘿嘿！我又來搗蛋啦🦊！規則反過來了！\n🦈鯊魚→按按按！🐟小魚→不要按！",
      mnemonic: "🦈按按按，🐟不要按！",
      voiceFile: "audio/voice/story/voice-story-fishing-r2-opening.mp3",
    },
    completion: {
      speaker: "villain",
      text: "不可能！連海上都不會被搞混！？可惡…😤",
      voiceFile: "audio/voice/story/voice-story-fishing-r2-completion.mp3",
    },
    failure: {
      speaker: "mentor",
      text: "記住口訣：🦈按按按，🐟不要按！再試試看！",
      voiceFile: "audio/voice/story/voice-story-fishing-r2-failure.mp3",
    },
  },

  // ⑩ 規則二 ＋ 工作記憶
  fishing_r2_wm: {
    opening: {
      speaker: "mentor",
      text: "反轉規則加上✨魔法密碼✨！集中精神！\n🦈鯊魚→按按按！🐟小魚→不要按！",
      mnemonic: "🦈按按按，🐟不要按！＋🧠記密碼",
      voiceFile: "audio/voice/story/voice-story-fishing-r2wm-opening.mp3",
    },
    completion: {
      speaker: "mentor",
      text: "威風凜凜的雞大王！淘淘的詭計都被你識破了！🐓👑",
      voiceFile: "audio/voice/story/voice-story-fishing-r2wm-completion.mp3",
    },
    failure: {
      speaker: "mentor",
      text: "🦈按按按，🐟不要按！你快成功了！",
      voiceFile: "audio/voice/story/voice-story-fishing-r2wm-failure.mp3",
    },
  },

  // ⑪ 混合規則（白天→rule1，晚上→rule2）
  fishing_mixed: {
    opening: {
      speaker: "villain",
      text: "最後的花招🦊！先看☀️白天還是🌙晚上！\n☀️白天→🐟按、🦈不按\n🌙晚上→🦈按、🐟不按",
      mnemonic: "☀️白天：🐟按🦈不按\n🌙晚上：🦈按🐟不按",
      voiceFile: "audio/voice/story/voice-story-fishing-mixed-opening.mp3",
    },
    completion: {
      speaker: "mentor",
      text: "判斷力超強！白天晚上都難不倒你！☀️🌙✨",
      voiceFile: "audio/voice/story/voice-story-fishing-mixed-completion.mp3",
    },
    failure: {
      speaker: "mentor",
      text: "先看☀️白天還是🌙晚上！白天→🐟按🦈不按，晚上→🦈按🐟不按！",
      voiceFile: "audio/voice/story/voice-story-fishing-mixed-failure.mp3",
    },
  },

  // ⑫ 混合規則 ＋ 工作記憶（最終關卡！）
  fishing_mixed_wm: {
    opening: {
      speaker: "mentor",
      text: "🏔️ 最終決戰！集合所有力量！\n☀️白天→🐟按🦈不按\n🌙晚上→🦈按🐟不按\n🧠還要記住密碼！金鷹王者在山頂等你！🦅",
      mnemonic: "☀️白天：🐟按🦈不按\n🌙晚上：🦈按🐟不按\n＋🧠記密碼",
      voiceFile: "audio/voice/story/voice-story-fishing-mixedwm-opening.mp3",
    },
    completion: {
      speaker: "legendaryEagle",
      text: "🎉🎉🎉 恭喜完成所有冒險！你就是新的金鷹王者！獲得🐟【專心小船長徽章】！🦅✨",
      voiceFile: "audio/voice/story/voice-story-fishing-mixedwm-completion.mp3",
    },
    failure: {
      speaker: "mentor",
      text: "最後一關！彩虹山頂就在眼前！再試一次！🏔️✨",
      voiceFile: "audio/voice/story/voice-story-fishing-mixedwm-failure.mp3",
    },
  },
  // __DIALOGUES_END__
};

// =========================================
// 公用 API
// =========================================

/**
 * 根據探險點 ID 取得對話資料
 * @param {string} pointId - e.g. "mouse_r1"
 * @returns {{ opening, completion, failure }|null}
 */
STORY_CONFIG.getDialogue = function (pointId) {
  return this[pointId] || null;
};

/**
 * 根據探險點 ID 取得進化資料（若該點觸發進化）
 * @param {string} pointId - e.g. "mouse_r2"
 * @returns {{ stage, from, to, dialogue }|null}
 */
STORY_CONFIG.getEvolution = function (pointId) {
  for (var i = 0; i < this.evolutions.length; i++) {
    if (this.evolutions[i].triggerAfterPoint === pointId) {
      return this.evolutions[i];
    }
  }
  return null;
};

/**
 * 根據 speaker id 取得角色資料
 * @param {string} speakerId - "mentor"|"villain"|"legendaryEagle"
 * @returns {{ id, name, icon, role }|null}
 */
STORY_CONFIG.getCharacter = function (speakerId) {
  return this.characters[speakerId] || null;
};

// =========================================
// 匯出
// =========================================

if (typeof window !== "undefined") {
  window.STORY_CONFIG = STORY_CONFIG;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { STORY_CONFIG: STORY_CONFIG };
}
