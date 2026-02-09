# 🎵 Audio 目錄說明

**遵循規範**: NAMING-CONVENTION.md v2.3  
**更新日期**: 2026-02-09

---

## 📁 目錄結構

```
audio/
├── bgm/      # 背景音樂 (Background Music)
├── sfx/      # 音效 (Sound Effects)
└── voice/    # 語音導引 (Voice Guidance)
```

---

## 🎼 BGM - 背景音樂

**前綴**: `bgm-`  
**格式**: MP3 (建議 128-192 kbps)  
**檔名格式**: `bgm-{描述}.mp3`

### 範例

```
bgm-main-menu.mp3      # 主選單背景音樂
bgm-stage-a.mp3        # A關卡背景音樂
bgm-stage-b.mp3        # B關卡背景音樂
bgm-stage-c.mp3        # C關卡背景音樂
bgm-victory.mp3        # 勝利音樂
bgm-game-over.mp3      # 遊戲結束音樂
```

### 命名規則

✅ 使用 kebab-case  
✅ 以 `bgm-` 開頭  
✅ 描述清楚用途  
❌ 不使用中文  
❌ 不使用 camelCase 或 snake_case

---

## 🔊 SFX - 音效

**前綴**: `sfx-`  
**格式**: MP3 或 WAV  
**檔名格式**: `sfx-{描述}.mp3`

### 範例

```
sfx-correct.mp3              # 答對音效
sfx-wrong.mp3                # 答錯音效
sfx-button-click.mp3         # 按鈕點擊音效
sfx-countdown-tick.mp3       # 倒數計時滴答聲
sfx-stage-complete.mp3       # 關卡完成音效
sfx-game-over.mp3            # 遊戲結束音效
sfx-star-collected.mp3       # 收集星星音效
sfx-ui-hover.mp3             # UI 懸停音效
sfx-modal-open.mp3           # 彈窗開啟音效
sfx-modal-close.mp3          # 彈窗關閉音效
```

### 命名規則

✅ 使用 kebab-case  
✅ 以 `sfx-` 開頭  
✅ 描述音效觸發場景  
❌ 避免過於籠統的名稱（如 sound1.mp3）

---

## 🗣️ Voice - 語音導引

**前綴**: `voice-`  
**格式**: MP3 (建議 64-128 kbps)  
**檔名格式**: `voice-{描述}.mp3`

### 範例

```
voice-tutorial-intro.mp3     # 教學介紹
voice-stage-a-guide.mp3      # A關卡導引
voice-stage-b-guide.mp3      # B關卡導引
voice-stage-c-guide.mp3      # C關卡導引
voice-correct-feedback.mp3   # 正確回饋語音
voice-wrong-feedback.mp3     # 錯誤回饋語音
voice-encouragement.mp3      # 鼓勵語音
```

### 命名規則

✅ 使用 kebab-case  
✅ 以 `voice-` 開頭  
✅ 描述語音內容或用途  
❌ 不包含具體文字內容在檔名中

---

## 📋 添加新音訊的檢查清單

在添加新音訊檔案前，請確認：

- [ ] 檔名使用 kebab-case（小寫+連字符）
- [ ] 使用正確的前綴（bgm-/sfx-/voice-）
- [ ] 檔名清楚描述用途
- [ ] 無中文字元
- [ ] 無大寫字母（除副檔名）
- [ ] 檔案大小適當（BGM < 3MB, SFX < 500KB, Voice < 1MB）
- [ ] 已更新 ASSETS-INVENTORY.md

---

## 🔧 驗證工具

執行以下命令驗證所有音訊檔案命名是否符合規範：

```bash
node scripts/validate-assets.js
```

---

## 💡 最佳實踐

### 1. 檔案大小優化

- **BGM**: 使用 128-192 kbps MP3，循環播放
- **SFX**: 使用 64-128 kbps，檔案盡量小
- **Voice**: 使用 64-128 kbps，清晰度優先

### 2. 命名一致性

- 相關音效使用相同的描述詞
- 範例：`sfx-button-click.mp3`, `sfx-button-hover.mp3`

### 3. 版本管理

- 如需替換音效，建議保留舊版：
  ```
  sfx-correct.mp3        # 當前版本
  sfx-correct-v1.mp3     # 舊版本（備份）
  ```

---

## 📚 相關文檔

- [NAMING-CONVENTION.md](../NAMING-CONVENTION.md) - 完整命名規範
- [ASSETS-INVENTORY.md](../ASSETS-INVENTORY.md) - 資源清單
- [RESOURCE-REORGANIZATION-PLAN.md](../RESOURCE-REORGANIZATION-PLAN.md) - 重組計劃

---

**維護**: 開發團隊  
**問題回報**: 請在專案中提出 Issue
