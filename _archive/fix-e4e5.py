#!/usr/bin/env python3
"""一次性腳本：在 Phase 3 🔴 表格加入 E4/E5 提醒"""
import os

filepath = os.path.join(os.path.dirname(__file__), '..', '完整需求文件v4.5.md')

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 找到 tts-fallback 目錄那一行結尾到 🟡 之間的內容
marker_before = '| Phase 1 目錄結構需補充                                              |'
marker_after = '這時候最適合討論介面設計'

idx_before = content.find(marker_before)
idx_after = content.find(marker_after)

if idx_before == -1 or idx_after == -1:
    print(f"❌ 找不到標記 (before={idx_before}, after={idx_after})")
    exit(1)

# 從 marker_before 結尾到 marker_after 前的 ** 和 emoji
end_of_row = idx_before + len(marker_before)
# 找到 marker_after 前面的 ** 開頭
star_idx = content.rfind('**', end_of_row, idx_after)

new_rows = """
| 🔊 E4 Web Speech 語速策略 | audio-player.js 的 Level 3（Web Speech API）男/女聲替代策略。**等聲音/SVG 素材製作完成後再決定**                                    | audio-player.js（Level 3 實作細節）                                 |
| 🐍 E5 gTTS 何時執行       | gTTS 預生成腳本何時實際執行產出 MP3。**等聲音/SVG 素材製作完成後再決定**                                                            | scripts/generate-tts-voices.py（已寫好腳本但未執行）                |

**🟡 """

content = content[:end_of_row] + new_rows + content[idx_after:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ E4/E5 提醒已加入 Phase 3 🔴 表格")
