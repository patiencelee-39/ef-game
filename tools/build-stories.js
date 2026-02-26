#!/usr/bin/env node
/**
 * ============================================
 * build-stories.js
 * ============================================
 * 讀取 content/stories/*.txt → 重新產生 js/story-config.js 的 dialogues 區塊
 *
 * 使用方式：
 *   node tools/build-stories.js          # 預設：原地更新 js/story-config.js
 *   node tools/build-stories.js --dry    # 預覽模式：只印出產生的 JS，不寫檔
 *   node tools/build-stories.js --check  # 檢查模式：txt 與 JS 是否一致（CI 用）
 *
 * txt 格式範例（每個檔案 3 段，用 --- 分隔）：
 *   [開場] mentor
 *   歡迎來到起司村！...
 *
 *   ---
 *
 *   [通過] mentor
 *   太棒了！...
 *
 *   ---
 *
 *   [失敗] mentor
 *   沒關係！...
 * ============================================
 */

"use strict";

var fs = require("fs");
var path = require("path");

// ─── 常數 ───────────────────────────────────
var ROOT = path.resolve(__dirname, "..");
var STORIES_DIR = path.join(ROOT, "content", "stories");
var CONFIG_FILE = path.join(ROOT, "js", "story-config.js");

var BEGIN_MARKER = "// __DIALOGUES_BEGIN__";
var END_MARKER = "// __DIALOGUES_END__";

// 探險點定義（順序 = 產生順序）
var POINT_META = [
  // 地圖 1：🐭 小老鼠冒險
  {
    file: "01-mouse-r1.txt",
    id: "mouse_r1",
    num: "①",
    desc: "規則一（看到🧀起司→按，看到😺貓→不按）",
    mapHeader: "地圖 1：🐭 小老鼠冒險",
  },
  {
    file: "02-mouse-r1-wm.txt",
    id: "mouse_r1_wm",
    num: "②",
    desc: "規則一 ＋ 工作記憶",
  },
  {
    file: "03-mouse-r2.txt",
    id: "mouse_r2",
    num: "③",
    desc: "規則二（反轉！看到🧀起司→不按，看到😺貓→按）",
  },
  {
    file: "04-mouse-r2-wm.txt",
    id: "mouse_r2_wm",
    num: "④",
    desc: "規則二 ＋ 工作記憶",
  },
  {
    file: "05-mouse-mixed.txt",
    id: "mouse_mixed",
    num: "⑤",
    desc: "混合規則（有人→rule1，沒人→rule2）",
  },
  {
    file: "06-mouse-mixed-wm.txt",
    id: "mouse_mixed_wm",
    num: "⑥",
    desc: "混合規則 ＋ 工作記憶（地圖 1 最終關）",
    mapFooter: true,
  },

  // 地圖 2：🐟 釣魚冒險
  {
    file: "07-fishing-r1.txt",
    id: "fishing_r1",
    num: "⑦",
    desc: "規則一（看到🐟魚→按，看到🦈鯊魚→不按）",
    mapHeader: "地圖 2：🐟 釣魚冒險",
  },
  {
    file: "08-fishing-r1-wm.txt",
    id: "fishing_r1_wm",
    num: "⑧",
    desc: "規則一 ＋ 工作記憶",
  },
  {
    file: "09-fishing-r2.txt",
    id: "fishing_r2",
    num: "⑨",
    desc: "規則二（反轉！看到🐟魚→不按，看到🦈鯊魚→按）",
  },
  {
    file: "10-fishing-r2-wm.txt",
    id: "fishing_r2_wm",
    num: "⑩",
    desc: "規則二 ＋ 工作記憶",
  },
  {
    file: "11-fishing-mixed.txt",
    id: "fishing_mixed",
    num: "⑪",
    desc: "混合規則（白天→rule1，晚上→rule2）",
  },
  {
    file: "12-fishing-mixed-wm.txt",
    id: "fishing_mixed_wm",
    num: "⑫",
    desc: "混合規則 ＋ 工作記憶（最終關卡！）",
  },
];

// txt 標頭 → JS 欄位名
var SECTION_MAP = {
  開場: "opening",
  通過: "completion",
  失敗: "failure",
};

// ─── txt 解析 ───────────────────────────────
/**
 * 解析一個 story txt 檔案
 * @param {string} filePath
 * @returns {{ opening: {speaker,text}, completion: {speaker,text}, failure: {speaker,text} }}
 */
function parseTxtFile(filePath) {
  var raw = fs.readFileSync(filePath, "utf-8");
  var blocks = raw.split(/\n---\n/).map(function (b) {
    return b.trim();
  });

  var result = {};

  blocks.forEach(function (block) {
    if (!block) return;
    // 第一行格式： [開場] mentor
    var firstLineEnd = block.indexOf("\n");
    var firstLine =
      firstLineEnd === -1 ? block : block.substring(0, firstLineEnd);
    var body =
      firstLineEnd === -1 ? "" : block.substring(firstLineEnd + 1).trim();

    var headerMatch = firstLine.match(/^\[(.+?)\]\s+(\S+)/);
    if (!headerMatch) {
      throw new Error('無法解析標頭: "' + firstLine + '" ← ' + filePath);
    }

    var sectionLabel = headerMatch[1]; // 開場 / 通過 / 失敗
    var speaker = headerMatch[2]; // mentor / villain / legendaryEagle

    var jsField = SECTION_MAP[sectionLabel];
    if (!jsField) {
      throw new Error("未知段落標頭 [" + sectionLabel + "] ← " + filePath);
    }

    result[jsField] = {
      speaker: speaker,
      text: body,
    };
  });

  // 驗證三段都有
  ["opening", "completion", "failure"].forEach(function (key) {
    if (!result[key]) {
      throw new Error("缺少 [" + key + "] 段落 ← " + filePath);
    }
  });

  return result;
}

// ─── JS 產生 ────────────────────────────────
/**
 * 跳脫 JS 字串中的特殊字元（雙引號 & 反斜線）
 */
function escapeJsString(str) {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

/**
 * 產生一個 dialogue section 的 JS 字串
 */
function renderSection(indent, fieldName, data) {
  var lines = [];
  lines.push(indent + fieldName + ": {");
  lines.push(indent + '  speaker: "' + data.speaker + '",');
  lines.push(indent + '  text: "' + escapeJsString(data.text) + '",');
  lines.push(indent + "},");
  return lines.join("\n");
}

/**
 * 產生完整的 dialogues 區塊
 */
function generateDialoguesBlock() {
  var lines = [];
  var I4 = "    "; // 4-space indent (inside STORY_CONFIG)
  var I6 = "      "; // 6-space indent (inside dialogues)

  POINT_META.forEach(function (meta, idx) {
    var filePath = path.join(STORIES_DIR, meta.file);

    if (!fs.existsSync(filePath)) {
      throw new Error("找不到檔案: " + filePath);
    }

    var data = parseTxtFile(filePath);

    // 地圖標題（每張地圖第一個探險點前）
    if (meta.mapHeader) {
      if (idx > 0) lines.push(""); // 地圖間空行
      lines.push(I4 + "// ════════════════════════════════");
      lines.push(I4 + "// " + meta.mapHeader);
      lines.push(I4 + "// ════════════════════════════════");
      lines.push("");
    }

    // 探險點註解
    lines.push(I4 + "// " + meta.num + " " + meta.desc);
    lines.push(I4 + meta.id + ": {");

    // opening / completion / failure
    lines.push(renderSection(I6, "opening", data.opening));
    lines.push(renderSection(I6, "completion", data.completion));
    lines.push(renderSection(I6, "failure", data.failure));

    lines.push(I4 + "},");

    // 地圖結尾空行（非最後一個探險點時加空行）
    if (idx < POINT_META.length - 1 && !POINT_META[idx + 1].mapHeader) {
      lines.push("");
    }
  });

  return lines.join("\n");
}

// ─── 主流程 ─────────────────────────────────
function main() {
  var args = process.argv.slice(2);
  var isDry = args.indexOf("--dry") !== -1;
  var isCheck = args.indexOf("--check") !== -1;

  console.log("📖 正在讀取 " + POINT_META.length + " 個故事檔案...");

  var dialoguesBlock = generateDialoguesBlock();

  if (isDry) {
    console.log("\n--- 預覽產生的 dialogues ---\n");
    console.log(dialoguesBlock);
    console.log("\n--- 預覽結束（未寫入檔案） ---");
    return;
  }

  // 讀取現有 story-config.js
  if (!fs.existsSync(CONFIG_FILE)) {
    throw new Error("找不到 " + CONFIG_FILE);
  }
  var original = fs.readFileSync(CONFIG_FILE, "utf-8");

  var beginIdx = original.indexOf(BEGIN_MARKER);
  var endIdx = original.indexOf(END_MARKER);

  if (beginIdx === -1 || endIdx === -1) {
    throw new Error(
      "story-config.js 中找不到標記！\n" +
        '請確認檔案包含 "' +
        BEGIN_MARKER +
        '" 和 "' +
        END_MARKER +
        '"',
    );
  }

  // 在 BEGIN_MARKER 行末尾之後 ~ END_MARKER 行開頭之前
  var beforeBlock = original.substring(0, original.indexOf("\n", beginIdx) + 1);
  var afterBlock = original.substring(endIdx);

  var updated = beforeBlock + dialoguesBlock + "\n" + afterBlock;

  if (isCheck) {
    if (updated === original) {
      console.log("✅ txt 檔案與 story-config.js 一致，無需更新。");
      process.exit(0);
    } else {
      console.error("❌ txt 檔案與 story-config.js 不一致！請執行：");
      console.error("   node tools/build-stories.js");
      process.exit(1);
    }
  }

  fs.writeFileSync(CONFIG_FILE, updated, "utf-8");
  console.log("✅ 已更新 " + CONFIG_FILE);
  console.log("   共寫入 " + POINT_META.length + " 個探險點對話。");
}

main();
