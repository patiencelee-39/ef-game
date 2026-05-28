# 動態難度調整：Go Miss 處理方案分析

## 問題背景

目前動態難度引擎（`simple-adaptive-engine.js`）的升降級邏輯**只看 No-Go 試題**：

- No-Go 連對 ≥ STREAK_THRESHOLD → 升一級
- No-Go 連錯 ≥ STREAK_THRESHOLD → 降一級
- Go 試題（無論對錯）→ 完全忽略

### 造成的問題

當玩家完全不操作（AFK）時：

- Go 題沒按 → Miss（錯誤），但被引擎忽略
- No-Go 題沒按 → CR（正確），被引擎計為「答對」

結果：AFK 狀態下 No-Go 題持續累積連對 → 不斷升級 → 一路升到 L10。

---

## 三種修正方案

### 方案甲：Go Miss 計入連錯

```javascript
onTrialComplete: function (trialResult) {
  if (trialResult.isGo) {
    if (!trialResult.isCorrect) {
      // Go Miss → 計入連錯
      _consecutiveIncorrect++;
      _consecutiveCorrect = 0;
    }
    // Go Hit → 忽略
    return;
  }
  // No-Go 邏輯不變
  if (trialResult.isCorrect) {
    _consecutiveCorrect++;
    _consecutiveIncorrect = 0;
  } else {
    _consecutiveIncorrect++;
    _consecutiveCorrect = 0;
  }
  _tryAdjustLevel();
}
```

**規則：** Go Miss 等同 No-Go FA，直接累積連錯計數。

---

### 方案乙：Go Miss 只重置連對

```javascript
onTrialComplete: function (trialResult) {
  if (trialResult.isGo) {
    if (!trialResult.isCorrect) {
      // Go Miss → 打斷連對，但不累積連錯
      _consecutiveCorrect = 0;
    }
    // Go Hit → 忽略
    return;
  }
  // No-Go 邏輯不變
  if (trialResult.isCorrect) {
    _consecutiveCorrect++;
    _consecutiveIncorrect = 0;
  } else {
    _consecutiveIncorrect++;
    _consecutiveCorrect = 0;
  }
  _tryAdjustLevel();
}
```

**規則：** Go Miss 清除升級進度，但不觸發降級。

---

### 方案丙：連續多題 Go Miss 才計入連錯

```javascript
var _goMissStreak = 0;
var GO_MISS_TOLERANCE = 3; // 連續容忍次數

onTrialComplete: function (trialResult) {
  if (trialResult.isGo) {
    if (!trialResult.isCorrect) {
      // Go Miss
      _consecutiveCorrect = 0; // 打斷連對
      _goMissStreak++;
      if (_goMissStreak >= GO_MISS_TOLERANCE) {
        // 連續 Miss 達標 → 疑似 AFK，計入連錯
        _consecutiveIncorrect++;
        _goMissStreak = 0;
      }
    } else {
      // Go Hit → 正常操作，重置 Miss 計數
      _goMissStreak = 0;
    }
    return;
  }
  // No-Go 邏輯不變
  if (trialResult.isCorrect) {
    _consecutiveCorrect++;
    _consecutiveIncorrect = 0;
  } else {
    _consecutiveIncorrect++;
    _consecutiveCorrect = 0;
  }
  _tryAdjustLevel();
}
```

**規則：** 每次 Go Miss 都打斷連對；連續 Miss 達 3 次才累積一次連錯（疑似 AFK）。Go Hit 重置容忍計數。

---

## 情境模擬比較

### 前提假設

- STREAK_THRESHOLD = 2
- goRatio = 80%（每 10 題約 8 題 Go、2 題 No-Go）
- GO_MISS_TOLERANCE = 3（方案丙）

---

### 情境 1：完全 AFK（不操作）

典型出題：`G G G G NG G G NG G G G NG ...`

| 步驟 | 題型 | 結果 | 方案甲 | 方案乙 | 方案丙 |
|------|------|------|--------|--------|--------|
| 1 | Go | Miss | 連錯=1 | 連對=0 | 連對=0, miss連=1 |
| 2 | Go | Miss | 連錯=**2→降級** | 連對=0 | 連對=0, miss連=2 |
| 3 | Go | Miss | 連錯=1 | 連對=0 | miss連=**3→連錯=1**, miss連=0 |
| 4 | Go | Miss | 連錯=**2→降級** | 連對=0 | 連對=0, miss連=1 |
| 5 | No-Go | CR | 連對=1 | 連對=1 | 連對=1 |
| 6 | Go | Miss | 連錯=1 | 連對=0 | 連對=0, miss連=1 |
| 7 | Go | Miss | 連錯=**2→降級** | 連對=0 | 連對=0, miss連=2 |
| 8 | No-Go | CR | 連對=1 | 連對=1 | 連對=1 |
| 9 | No-Go | CR | 連對=**2→升級** | 連對=**2→升級** | 連對=**2→升級** |

**AFK 結果：**

| 方案 | 行為 |
|------|------|
| 甲 | 快速降級（每 2 題 Go Miss 就降一次），但若連續出 2 題 No-Go 仍會升回 |
| 乙 | 不會降級，但升級也困難（Go Miss 打斷連對）。若隨機連出 2 題 No-Go 仍會升級 |
| 丙 | 偶爾降級（每 3 題 Go Miss 累積 1 次連錯，需 6 題觸發降級），升級同樣受阻 |

---

### 情境 2：正常幼兒偶爾漏按

表現：多數 Go Hit，偶爾 1-2 題 Miss，No-Go 大多 CR

| 步驟 | 題型 | 結果 | 方案甲 | 方案乙 | 方案丙 |
|------|------|------|--------|--------|--------|
| 1 | No-Go | CR | 連對=1 | 連對=1 | 連對=1 |
| 2 | Go | Hit | (忽略) | (忽略) | miss連=0 |
| 3 | Go | **Miss** | 連錯=1 | 連對=0 | 連對=0, miss連=1 |
| 4 | Go | Hit | (忽略) | (忽略) | miss連=0 |
| 5 | No-Go | CR | 連對=1 | 連對=1 | 連對=1 |
| 6 | No-Go | CR | 連對=**2→升級** | 連對=**2→升級** | 連對=**2→升級** |

**正常遊玩結果：**

| 方案 | 影響 |
|------|------|
| 甲 | 1 次 Go Miss 累積 1 次連錯，但未達 threshold（2），不會降級。下次 No-Go 正確就重置。**影響小** |
| 乙 | 連對被歸零，需重新累積。**不會誤降級** |
| 丙 | 1 次 Go Miss 只打斷連對，miss連=1 但離容忍上限(3)還遠。**最溫和** |

---

### 情境 3：幼兒分心 3-4 秒（連漏 2 題 Go）

| 步驟 | 題型 | 結果 | 方案甲 | 方案乙 | 方案丙 |
|------|------|------|--------|--------|--------|
| 1 | No-Go | CR | 連對=1 | 連對=1 | 連對=1 |
| 2 | Go | Miss | 連錯=1 | 連對=0 | 連對=0, miss連=1 |
| 3 | Go | Miss | 連錯=**2→降級** | 連對=0 | 連對=0, miss連=2 |
| 4 | No-Go | CR | 連對=1 | 連對=1 | 連對=1 |

**短暫分心結果：**

| 方案 | 影響 |
|------|------|
| 甲 | **降級！** 連漏 2 題 Go 就觸發。3-6 歲幼兒注意力波動大，此情境常見 |
| 乙 | 不降級，只是升級進度被重置 |
| 丙 | 不降級（miss連=2，未達容忍 3） |

---

### 情境 4：長時間 AFK 後回來繼續玩

假設 AFK 了 10 題，然後回來正常操作。

| 方案 | AFK 期間等級變化 | 回來後的狀態 |
|------|----------------|------------|
| 甲 | 降了約 4-5 次（每 2 題 Go Miss 降一次，但遇 No-Go CR 可能升回） | 等級震盪後偏低 |
| 乙 | 不變（不會降，但也升不了） | 維持 AFK 前的等級 |
| 丙 | 降了約 1-2 次（每 3 題 Go Miss 才累積 1 次連錯，需 6 題才降一次） | 小幅下降 |

---

## 綜合評估

| 評估指標 | 方案甲 | 方案乙 | 方案丙 |
|---------|--------|--------|--------|
| 防止 AFK 升級 | ✅ 完全防止 | ⚠️ 大部分防止（偶爾連出 2 題 No-Go 仍會升） | ✅ 完全防止 |
| AFK 時會降級 | ✅ 快速降級 | ❌ 不會降（凍結） | ⚠️ 緩慢降級 |
| 正常幼兒誤傷風險 | ⚠️ 中等（連漏 2 題就降） | ✅ 無（不會誤降） | ✅ 低（需連漏 3 題才開始累積） |
| 實作複雜度 | 低（改 2 行） | 最低（改 1 行） | 中等（新增變數 + 邏輯分支） |
| 適合研究用途 | ⚠️ 等級數據波動大 | ✅ 等級穩定，AFK 數據另外標記排除 | ✅ 平衡：輕微修正不失真 |
| 適合訓練用途 | ⚠️ 可能打擊幼兒信心 | ✅ 溫和 | ✅ 溫和且有修正力 |

---

## 建議

| 使用情境 | 建議方案 |
|---------|---------|
| 純研究（資料精確度優先） | **方案乙** — 等級不會因 AFK 亂跑，研究者事後用 Go Hit Rate 篩選無效資料 |
| 訓練為主（希望難度反映真實能力） | **方案丙** — 容忍短暫分心，但長時間不操作會緩慢修正 |
| 簡單直覺（不想增加複雜度） | **方案甲** — 最少程式碼，但需接受幼兒偶爾被誤降 |

---

## 附錄：各方案與 STREAK_THRESHOLD 的互動

STREAK_THRESHOLD 越大，升降級越慢。目前預設為 2（最敏感）。

| STREAK_THRESHOLD | 方案甲誤降風險 | 方案丙容忍度 |
|-----------------|--------------|------------|
| 2 | 高（連漏 2 題就降） | 需 6 題 Go Miss 才降 |
| 3 | 中（連漏 3 題才降） | 需 9 題 Go Miss 才降 |
| 4 | 低 | 需 12 題 Go Miss 才降 |

若選方案甲，可考慮同時將 STREAK_THRESHOLD 提高到 3，降低誤傷。
