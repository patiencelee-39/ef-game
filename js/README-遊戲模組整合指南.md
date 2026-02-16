# 🎮 執行功能訓練遊戲 - 模組化整合指南

**更新時間**: 2026/02/09  
**當前進度**: 階段一 100% 完成 ✅

---

## 📋 階段一完成進度

✅ **已完成的檔案：**

1. `/js/game-config.js` - 遊戲配置檔案
2. `/js/svg-assets.js` - SVG 圖形資源
3. `/js/audio-controller.js` - 音效控制器
4. `/js/game-logic.js` - 核心遊戲邏輯
5. `/js/game-logic-wm.js` - 工作記憶測試擴展模組

🎉 **階段一：核心遊戲邏輯移植 - 已完成！**

---

## 🔧 檔案說明

### 1. game-config.js（已完成）

**功能**：集中管理所有遊戲參數

**包含內容**：

- 試題數量設定（練習、正式測驗）
- 刺激呈現時間設定
- 機率控制（Go/No-Go、人物出現、晝夜）
- 工作記憶測試設定
- 配色系統（與配色文檔同步）

**使用方式**：

```javascript
// 在 HTML 中引入
<script src="js/game-config.js"></script>;

// 存取設定
console.log(CONFIG.round1Trials); // 6
console.log(CONFIG.goRatio); // 0.75
```

---

### 2. svg-assets.js（已完成）

**功能**：提供所有遊戲使用的 SVG 圖形素材

**包含資源**：

- `cheese` - 起司（Go 刺激）
- `cat` - 貓咪（No-Go 刺激）
- `mouse Hole` - 老鼠洞場景
- `person` - 人物指示器（DCCS）
- `fish` - 魚（Go 刺激）
- `shark` - 鯊魚（No-Go 刺激）
- `oceanBg` - 海洋場景（白天）
- `oceanNight` - 海洋場景（晚上）

**使用方式**：

```javascript
// 在 HTML 中引入
<script src="js/svg-assets.js"></script>;

// 使用 SVG
document.getElementById("stimulusBox").innerHTML = SVG_ASSETS.cheese;
document.getElementById("backgroundLayer").innerHTML = SVG_ASSETS.mouseHole;
```

---

## 📂 目標檔案結構

```
/Users/patiencelee38/Documents/Thesis II/VScode/
├── js/
│   ├── game-config.js          ✅ 已完成
│   ├── svg-assets.js           ✅ 已完成
│   ├── game-logic.js           ⏳ 待完成
│   ├── audio-controller.js     ⏳ 待完成
│   ├── game-ui.js              ⏳ 待完成
│   └── firebase-config.js      ✅ 已存在
│
├── singleplayer/
│   ├── game.html               🔄 需整合模組
│   ├── stage-select.html       ✅ 已存在
│   └── result.html             ✅ 已存在
│
├── multiplayer/
│   ├── game.html               🔄 需整合模組
│   ├── room-create.html        ✅ 已存在
│   ├── room-join.html          ✅ 已存在
│   ├── room-lobby.html         ✅ 已存在
│   └── result.html             ✅ 已存在
│
└── index.html                  ✅ 配色已更新
```

---

### 3. audio-controller.js（已完成）

**功能**：管理遊戲音效

**包含功能**：

- Web Audio API 上下文管理
- `playTone(frequency, waveType, duration)` - 播放指定音調
- `playCorrect()` - 播放正確音效 (880Hz 正弦波)
- `playError()` - 播放錯誤音效 (150Hz 鋸齒波)

**使用方式**：

```javascript
// 在 HTML 中引入
<script src="js/audio-controller.js"></script>;

// 使用音效
AudioController.playCorrect(); // 正確答案
AudioController.playError(); // 錯誤答案
AudioController.playTone(600, "sine", 0.1); // 自定義音調
```

**命名規範遵循**：

- ✅ 檔案名稱：kebab-case (`audio-controller.js`)
- ✅ 物件名稱：PascalCase (`AudioController`)
- ✅ 函式名稱：camelCase + 動詞開頭 (`playTone`, `playCorrect`)
- ✅ 變數名稱：camelCase (`frequency`, `waveType`)

---

### 4. game-logic.js（已完成）

**功能**：核心遊戲邏輯控制器

**包含功能**：

- 遊戲狀態管理 (`GameLogic.state`)
- DOM 元素快取 (`GameLogic.elements`)
- 遊戲初始化 (`initializeGame()`)
- 回合管理 (`startRound1()`, `startRound2()`, 等)
- 刺激物顯示邏輯 (`showStimulus()`)
- 答案檢查 (`checkAnswer()`)
- 輸入處理 (`handleInput()`, `handleTimeout()`)
- 反饋系統 (`triggerFeedback()`)
- 結果記錄 (`recordResult()`)
- CSV 匯出 (`exportData()`)
- 序列生成 (`generateSequence()`, `shuffleArray()`)

**DCCS 範式實作**：

- Round 1: 純 Go/No-Go (cheese/cat)
- Round 2: DCCS with person condition (規則反轉)
- Round 3: Ocean theme (fish/shark)
- Round 4: Day/night condition (晚上都不按)

**使用方式**：

```javascript
// 在 HTML 中按順序引入
<script src="js/game-config.js"></script>
<script src="js/svg-assets.js"></script>
<script src="js/audio-controller.js"></script>
<script src="js/game-logic.js"></script>

// 初始化遊戲
GameLogic.showTutorial();  // 從首頁開始
GameLogic.startPractice();  // 開始練習
GameLogic.startRound1();    // 開始第一回合

// 處理輸入
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    GameLogic.handleInput();
  }
});
```

**狀態管理**：

```javascript
// 存取遊戲狀態
console.log(GameLogic.state.currentRound); // 當前回合
console.log(GameLogic.state.score); // 當前分數
console.log(GameLogic.state.results); // 所有試驗結果

// 修改狀態（不建議直接修改，應使用提供的函式）
GameLogic.state.participantId = "P001"; // 僅在特殊情況下使用
```

**命名規範遵循**：

- ✅ 檔案名稱：kebab-case (`game-logic.js`)
- ✅ 物件名稱：PascalCase (`GameLogic`)
- ✅ 函式名稱：camelCase + 動詞開頭 (`showStimulus`, `checkAnswer`)
- ✅ 布林變數：is/has/can/should 前綴 (`isPlaying`, `hasResponded`)
- ✅ 常數引用：UPPER_SNAKE_CASE (`CONFIG.round1Trials`)

---

### 5. game-logic-wm.js（已完成）

**功能**：工作記憶測試擴展模組

**包含功能**：

- 四個回合的工作記憶測試
- 位置式選擇介面
- 順序/逆序測試支援
- 答案比對與反饋

**擴展函式**：

- `prepareWMTest()`, `prepareWMTest2()`, `prepareWMTest3()`, `prepareWMTest4()`
- `updateWMQuestion()`, `generateWMButtons()`, `toggleWMPosition()`
- `checkWMAnswer()`, `showWMResult()`
- `resetWMTest()`, `continueAfterWM()`

**使用方式**：

```javascript
// 在 game-logic.js 之後引入
<script src="js/game-logic.js"></script>
<script src="js/game-logic-wm.js"></script>

// 自動擴展 GameLogic 物件
GameLogic.prepareWMTest();   // 第一回合測試
GameLogic.checkWMAnswer();   // 檢查答案
```

**命名規範遵循**：

- ✅ 檔案名稱：kebab-case (`game-logic-wm.js`)
- ✅ 擴展命名：延續 GameLogic 命名空間
- ✅ 函式名稱：camelCase + 動詞開頭
- ✅ 參數名稱：camelCase (`position`, `isCorrect`)

---

## 🎯 下一步計劃

### **階段二：整合到現有遊戲系統** ⭐ 接下來的重點

**任務 1：修改 singleplayer/game.html**

- 引入所有模組檔案（按順序）
- 移除舊的內嵌程式碼
- 連接 GameLogic 物件到現有 HTML 結構
- 測試所有四個回合和工作記憶測試

**任務 2：適配 multiplayer/game.html**

- 引入所有模組檔案
- 保留 Firebase 同步層
- 添加多人遊戲特殊邏輯（等待其他玩家）
- 測試多人遊戲流程

**任務 3：應用配色系統**

- 更新所有遊戲頁面 CSS
- 確保配色一致性

**任務 4：測試與部署**

- 本地測試所有功能
- Firebase 部署
- 跨瀏覽器測試

---

## 💡 使用範例

### 完整引入順序（單人遊戲）

```html
<!DOCTYPE html>
<html lang="zh-TW">
  <head>
    <meta charset="UTF-8" />
    <title>執行功能訓練遊戲</title>
    <link rel="stylesheet" href="../css/main.css" />
  </head>
  <body>
    <!-- 遊戲 HTML 結構 -->
    <div id="startScreen" class="screen">...</div>
    <div id="playScreen" class="screen hidden">...</div>

    <!-- 1. 首先引入配置 -->
    <script src="../js/game-config.js"></script>

    <!-- 2. 然後引入資源 -->
    <script src="../js/svg-assets.js"></script>

    <!-- 3. 引入音效控制 -->
    <script src="../js/audio-controller.js"></script>

    <!-- 4. 引入核心邏輯 -->
    <script src="../js/game-logic.js"></script>

    <!-- 5. 引入工作記憶擴展 -->
    <script src="../js/game-logic-wm.js"></script>

    <!-- 6. 初始化遊戲 -->
    <script>
      // 綁定事件
      document.addEventListener("keydown", (e) => {
        if (e.code === "Space" && GameLogic.state.isPlaying) {
          GameLogic.handleInput();
        }
      });

      // 設定按鈕點擊事件
      document.getElementById("btnSpace").addEventListener("click", () => {
        if (GameLogic.state.isPlaying) {
          GameLogic.handleInput();
        }
      });
    </script>
  </body>
</html>
```

---

## 📝 模組設計優勢

### ✅ 程式碼重用

- 單人和多人模式共享相同邏輯
- 減少維護成本

### ✅ 可測試性

- 每個模組可獨立測試
- 方便除錯

### ✅ 可擴展性

- 新增回合只需修改 game-logic.js
- 新增音效只需修改 audio-controller.js

### ✅ 可維護性

- 參數調整只需修改 CONFIG
- 圖形更新只需修改 SVG_ASSETS

### ✅ 符合規範

- 完全遵循 NAMING-CONVENTION.md v2.3
- 所有函式都有 JSDoc 註解
- 無魔法值（所有數值都在 CONFIG 中）

---

## ⚠️ 注意事項

### 引入順序很重要

模組之間有依賴關係，必須按照以下順序引入：

1. `game-config.js` - 其他模組需要讀取 CONFIG
2. `svg-assets.js` - game-logic 需要使用 SVG_ASSETS
3. `audio-controller.js` - game-logic 需要使用 AudioController
4. `game-logic.js` - 核心邏輯
5. `game-logic-wm.js` - 擴展 GameLogic

### 命名空間衝突

- 所有模組都使用全域命名空間
- 避免使用 `CONFIG`, `SVG_ASSETS`, `AudioController`, `GameLogic` 作為變數名

### Debug 模式

```javascript
// 開啟 debug 輸出
CONFIG.debugMode = true;

// 關閉 debug 輸出
CONFIG.debugMode = false;
```

---

## 🏆 階段一完成檢查清單

- [x] 提取遊戲配置到獨立檔案
- [x] 提取 SVG 資源到獨立檔案
- [x] 提取音效控制到獨立檔案
- [x] 提取核心遊戲邏輯
- [x] 提取工作記憶測試邏輯
- [x] 所有命名符合規範
- [x] 所有函式都有 JSDoc 註解
- [x] 無魔法值
- [x] 更新整合指南文件

**🎉 階段一：核心遊戲邏輯移植 - 100% 完成！**

---

## 📞 參考資源

- [NAMING-CONVENTION.md](../NAMING-CONVENTION.md) - 命名規範完整文件
- [配色系統完整文檔.md](../配色系統完整文檔.md) - 配色設計規範
- [index-0204v14拷貝.html](../index-0204v14拷貝.html) - 原始完整遊戲參考
- `startRound2Practice()` / `startRound2()` - 第二回合
- `startRound3Practice()` / `startRound3()` - 第三回合
- `startRound4Practice()` / `startRound4()` - 第四回合

#### **刺激顯示與判斷**

- `showStimulus()` - 顯示刺激物（核心邏輯）
- `nextTrial()` - 進入下一題
- `checkAnswer()` - 檢查答案是否正確

#### **輸入處理**

- `handleInput()` - 處理玩家按鍵
- `handleTimeout()` - 處理逾時

#### **回饋與記錄**

- `triggerFeedback()` - 顯示回饋動畫
- `recordResult()` - 記錄結果
- `endSession()` - 結束回合

#### **工作記憶測試**

- `prepareWMTest()` / `prepareWMTest2()` / `prepareWMTest3()` / `prepareWMTest4()`
- `updateWMQuestion()` - 更新題目
- `generateWMButtons()` - 生成按鈕
- `toggleWMPosition()` - 切換選項
- `checkWMAnswer()` - 檢查答案
- `resetWMTest()` - 重設測試

---

### **步驟 3：創建音效控制器**

創建 `audio-controller.js`：

```javascript
const audio = {
  ctx: new (window.AudioContext || window.webkitAudioContext)(),
  playTone: function(freq, type, duration) { ... },
  playCorrect: function() { this.playTone(880, 'sine', 0.1); },
  playError: function() { this.playTone(150, 'sawtooth', 0.3); }
};
```

---

### **步驟 4：創建 UI 控制器**

創建 `game-ui.js`：

```javascript
const gameUI = {
  updateUI: function() { ... },
  showScreen: function(screenName) { ... },
  updateScoreDisplay: function(score) { ... },
  updateTrialDisplay: function(current, total) { ... }
};
```

---

### **步驟 5：整合到 singleplayer/game.html**

在 `singleplayer/game.html` 中引入所有模組：

```html
<!-- 遊戲模組 -->
<script src="../js/game-config.js"></script>
<script src="../js/svg-assets.js"></script>
<script src="../js/audio-controller.js"></script>
<script src="../js/game-logic.js"></script>
<script src="../js/game-ui.js"></script>

<!-- Firebase 模組 -->
<script src="../js/firebase-config.js"></script>
```

---

## 🚀 優勢說明

### **為什麼要模組化？**

1. **程式碼重用** ✅
   - 單人模式和多人模式共用相同邏輯
   - 減少維護成本

2. **易於維護** ✅
   - 修改遊戲參數只需改 `game-config.js`
   - 修改圖形只需改 `svg-assets.js`

3. **便於測試** ✅
   - 每個模組可獨立測試
   - 問題定位更快速

4. **可擴展性** ✅
   - 未來新增第五回合只需在 `game-logic.js` 添加函式
   - 新增音效只需在 `audio-controller.js` 添加

5. **團隊協作** ✅
   - 不同人可同時開發不同模組
   - 減少程式碼衝突

---

## 📌 注意事項

### **相容性維護**

- 保留舊變數名稱（如 `--bg-color` 和 `--bg-dark` 同時存在）
- 確保現有 `index-0204v14拷貝.html` 繼續運作

### **配色統一**

- 所有新檔案使用 `game-config.js` 中的配色
- 與 `配色系統完整文檔.md` 保持同步

### **Firebase 整合**

- 確保模組化後的遊戲邏輯能正確儲存資料到 Firebase
- 多人模式需要額外的同步邏輯

---

## ✅ 檢查清單

**階段一完成後應確認：**

- [ ] `game-config.js` 可正確讀取所有設定值
- [ ] `svg-assets.js` 所有圖形能正確顯示
- [ ] 配色與 `配色系統完整文檔.md` 一致
- [ ] 檔案路徑正確，瀏覽器無載入錯誤

**下一階段開始前應確認：**

- [ ] `index-0204v14拷貝.html` 的遊戲邏輯已完整讀取
- [ ] 了解每個函式的功能與參數
- [ ] 規劃好模組之間的依賴關係

---

**準備好繼續下一步了嗎？請告訴我！** 🚀
