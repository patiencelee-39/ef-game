#!/usr/bin/env python3
"""
============================================
gTTS 語音預生成腳本
============================================
對應需求文件：§5.4c 第 5 項 — 語音四級 Fallback Level 2
說明：使用 Google Text-to-Speech (gTTS) 預先生成所有語音 MP3
      作為自訂 MP3 不存在時的備用語音

⚠️ 注意事項：
  1. gTTS 只能產生一種聲音（無法區分男/女聲）
  2. 因此 gTTS 只作為 Level 2 備用，不能替代自訂的男/女聲 MP3
  3. 輸出目錄：audio/voice/tts-fallback/
  4. 此腳本 **寫好但不執行**（E5 決策延後至媒體素材完成後）

使用方式：
  pip install gTTS
  python scripts/generate-tts-voices.py

============================================
"""

import os
import sys
from pathlib import Path

# =========================================
# 設定
# =========================================

# 專案根目錄（腳本在 scripts/ 底下，往上一層）
PROJECT_ROOT = Path(__file__).resolve().parent.parent

# 輸出目錄
OUTPUT_DIR = PROJECT_ROOT / "audio" / "voice" / "tts-fallback"

# gTTS 語言設定
LANG = "zh-TW"  # 繁體中文

# 語速（gTTS 的 slow 參數）
SLOW = False  # False = 正常速度；True = 慢速（適合幼兒但聽感不自然）

# =========================================
# 語音清單
# =========================================
# 格式：(輸出檔名, 要朗讀的文字)
# 檔名對應 sound-config.js 中 voice 類音檔的路徑結構
#
# 分類說明：
#   stimulusVoice — 刺激物名稱（gTTS 不分男女，統一產一份）
#   wmGuide       — WM 測驗指示語
#   badgeVoice    — 徽章播報
#   levelVoice    — 等級播報
#   unlockVoice   — 解鎖通知

VOICE_ENTRIES = [
    # ===== 刺激物語音（4 個） =====
    # gTTS 無法區分男/女聲，統一生成一份
    # audio-player.js 的 fallback 會自動用此替代
    ("stimulus-cheese.mp3", "起司"),
    ("stimulus-cat.mp3", "貓咪"),
    ("stimulus-fish.mp3", "魚"),
    ("stimulus-shark.mp3", "鯊魚"),

    # ===== WM 測驗指示語（2 個） =====
    ("wm-forward.mp3", "請照順序點選"),
    ("wm-reverse.mp3", "請倒著點選"),

    # ===== 徽章播報（18 個） =====
    ("badge-mouse-adventurer.mp3", "獲得小老鼠冒險家"),
    ("badge-fishing-adventurer.mp3", "獲得釣魚大冒險家"),
    ("badge-rule-switcher.mp3", "獲得規則轉換大師"),
    ("badge-mixed-master.mp3", "獲得混合高手"),
    ("badge-memory-expert.mp3", "獲得記憶達人"),
    ("badge-speed-king.mp3", "獲得速度之王"),
    ("badge-perfectionist.mp3", "獲得完美主義者"),
    ("badge-progress-star.mp3", "獲得進步之星"),
    ("badge-memory-star.mp3", "獲得記憶之星"),
    ("badge-all-clear.mp3", "獲得全制霸"),
    ("badge-rainbow-collector.mp3", "獲得七彩收藏家"),
    ("badge-brave-warrior.mp3", "獲得不屈勇士"),
    ("badge-early-bird.mp3", "獲得早起鳥兒"),
    ("badge-night-owl.mp3", "獲得懸梁刺骨"),
    ("badge-game-master.mp3", "獲得遊戲達人"),
    ("badge-badge-strong.mp3", "獲得徽章強者"),
    ("badge-badge-expert.mp3", "獲得徽章專家"),
    ("badge-badge-grandmaster.mp3", "獲得徽章職人大師"),

    # ===== 等級播報（5 個） =====
    ("level-1-egg.mp3", "你是蛋寶寶"),
    ("level-2-hatching.mp3", "恭喜升級為破殼雞"),
    ("level-3-chick.mp3", "恭喜升級為小雞仔"),
    ("level-4-rooster.mp3", "恭喜升級為雞大王"),
    ("level-5-eagle.mp3", "恭喜升級為金鷹王者"),

    # ===== 解鎖通知（6 個） =====
    ("unlock-mouse-rule2.mp3", "小老鼠規則二已解鎖"),
    ("unlock-mouse-mixed.mp3", "小老鼠混合規則已解鎖"),
    ("unlock-fishing-rule2.mp3", "釣魚規則二已解鎖"),
    ("unlock-fishing-mixed.mp3", "釣魚混合規則已解鎖"),
    ("unlock-map2.mp3", "恭喜解鎖釣魚冒險地圖"),
    ("unlock-free-choice.mp3", "恭喜解鎖自由選擇"),
]


# =========================================
# 主程式
# =========================================

def main():
    """生成所有 gTTS 語音 MP3"""

    # 檢查 gTTS 是否已安裝
    try:
        from gtts import gTTS
    except ImportError:
        print("❌ 尚未安裝 gTTS，請先執行：")
        print("   pip install gTTS")
        sys.exit(1)

    # 確保輸出目錄存在
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    total = len(VOICE_ENTRIES)
    success = 0
    skipped = 0
    failed = 0

    print(f"🔊 gTTS 語音預生成")
    print(f"   語言：{LANG}")
    print(f"   輸出：{OUTPUT_DIR}")
    print(f"   總數：{total} 個")
    print(f"{'=' * 50}")

    for i, (filename, text) in enumerate(VOICE_ENTRIES, 1):
        output_path = OUTPUT_DIR / filename

        # 如果檔案已存在，跳過（避免重複生成）
        if output_path.exists():
            print(f"  ⏭️  [{i}/{total}] {filename} — 已存在，跳過")
            skipped += 1
            continue

        try:
            tts = gTTS(text=text, lang=LANG, slow=SLOW)
            tts.save(str(output_path))
            print(f"  ✅ [{i}/{total}] {filename} — \"{text}\"")
            success += 1
        except Exception as e:
            print(f"  ❌ [{i}/{total}] {filename} — 錯誤：{e}")
            failed += 1

    print(f"{'=' * 50}")
    print(f"📊 結果：✅ {success} 成功 ｜ ⏭️ {skipped} 跳過 ｜ ❌ {failed} 失敗")
    print(f"📁 輸出位置：{OUTPUT_DIR}")

    if failed > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
