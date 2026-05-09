# EF Game — 執行功能訓練遊戲

> **3-6 歲聽障學齡前幼兒**專用的執行功能（Executive Function）訓練遊戲。  
> 以 DCCS（Dimensional Change Card Sort）為核心任務，結合動態評量與自適應難度機制。

[![Firebase Hosting](https://img.shields.io/badge/deploy-Firebase%20Hosting-FFCA28?logo=firebase)](https://efgame-634af.web.app)

---

## 目錄

- [專案概覽](#專案概覽)
- [功能特色](#功能特色)
- [技術架構](#技術架構)
- [快速開始（教師部署）](#快速開始教師部署)
- [開發者指南](#開發者指南)
- [檔案結構](#檔案結構)
- [遊戲模式](#遊戲模式)
- [安全性與隱私](#安全性與隱私)
- [授權](#授權)

---

## 專案概覽

| 項目         | 說明                                     |
| ------------ | ---------------------------------------- |
| **目標對象** | 3-6 歲聽障學齡前幼兒                     |
| **核心任務** | DCCS 卡片維度切換（顏色 ↔ 形狀）         |
| **理論基礎** | 執行功能訓練 + 自適應難度（10 級）+ 動態評量 |
| **部署平台** | Firebase Hosting                         |

---

## 功能特色

### 認知訓練

- **DCCS 卡片分類** — 顏色 / 形狀維度切換
- **自適應難度** — 10 級難度，依連續答對/答錯自動升降
- **工作記憶** — 位置記憶 + 正序/逆序回憶

### 遊戲模式

- **單人冒險** — 冒險地圖、加權計分、徽章收集、寵物養成
- **多人競賽** — Kahoot 風格即時對戰，支援房間代碼加入
- **接力賽** — 團隊合作，分組輪流作答

### 獎勵系統

- **寵物養成** — 透過遊戲表現升級寵物
- **冒險地圖** — 關卡解鎖與星星進度
- **排行榜** — 世界排行 / 班級排名

### 無障礙

- 所有頁面含 Skip Link
- `aria-live` 即時播報結果
- 大按鈕、高對比色彩設計

---

## 技術架構

```
Frontend:  Vanilla JavaScript (IIFE 模組)
Backend:   Firebase RTDB (即時同步) + Firestore (持久化)
Auth:      Firebase Auth (匿名 + Google)
Hosting:   Firebase Hosting
PWA:       Service Worker + manifest.json
Build:     Vite (僅編譯 Firebase SDK bundle)
```

### 關鍵模組

| 模組           | 路徑                              | 說明                             |
| -------------- | --------------------------------- | -------------------------------- |
| 遊戲設定       | `js/game-config.js`               | GAME_CONFIG 全域設定             |
| 規則引擎       | `js/game/rule-engine.js`          | Go/No-Go 判斷邏輯               |
| 自適應引擎     | `js/adaptive/simple-adaptive-engine.js` | 10 級動態難度調整          |
| 難度提供者     | `js/adaptive/difficulty-provider.js`    | 策略模式 facade              |
| 遊戲主迴圈     | `js/singleplayer/game-controller.js`    | 單人遊戲流程控制             |
| 工作記憶       | `js/shared/working-memory.js`     | WM 位置記憶任務                  |
| 房間管理       | `js/multiplayer/room-manager.js`  | 房間 CRUD + 即時監聽             |
| 遊戲同步       | `js/multiplayer/game-sync.js`     | 多人答題同步                     |
| Logger         | `js/utils/logger.js`              | 集中式日誌，受 LOG_LEVEL 控管    |
| Service Worker | `sw.js`                           | 離線快取 + trimCache             |

---

## 快速開始（教師部署）

想要 Fork 這個專案並部署到你自己的 Firebase？

### 一鍵設定

```bash
git clone https://github.com/你的帳號/倉庫名稱.git
cd 倉庫名稱
npm install
npm run setup
```

腳本會引導你完成 Firebase 登入、綁定專案、填入金鑰、建置 bundle。

完成後：

```bash
firebase deploy
```

詳細步驟請參閱 **[教師設定指南](docs/TEACHER-SETUP-GUIDE.md)**。

---

## 開發者指南

### 前置需求

- [Node.js](https://nodejs.org/) >= 16
- [Firebase CLI](https://firebase.google.com/docs/cli) (`npm i -g firebase-tools`)

### 本地開發

```bash
npm install
firebase serve          # → http://localhost:5000
```

### 常用指令

| 指令 | 用途 |
|------|------|
| `firebase serve` | 本地測試 |
| `npm run build:firebase` | 重新編譯 Firebase SDK bundle |
| `firebase deploy` | 部署（Hosting + Rules） |
| `npm run lint` | ESLint 檢查 |
| `npm run format:check` | Prettier 格式驗證 |
| `npm run validate` | lint + format（部署前執行） |

### 日誌層級

在 `js/game-config.js` 中調整 `DEV.LOG_LEVEL`：

| 值         | 說明                   |
| ---------- | ---------------------- |
| `"debug"`  | 顯示所有日誌（開發用） |
| `"info"`   | info / warn / error    |
| `"warn"`   | warn / error（預設）   |
| `"error"`  | 僅 error               |
| `"silent"` | 完全靜音               |

### 程式碼風格

- 模組以 IIFE 封裝，掛載至 `window`
- 命名：檔案 `kebab-case`、變數 `camelCase`、常數 `UPPER_SNAKE`
- 使用 `Logger` 取代 `console.log`

### 相關文件

| 文件 | 說明 |
|------|------|
| `docs/完整需求文件v4.5.md` | 完整功能需求 |
| `docs/TEACHER-GUIDE.md` | 教師遊戲參數指南 |
| `docs/TEACHER-SETUP-GUIDE.md` | 教師 Fork 部署指南 |
| `docs/開發規範與工具.md` | 開發規範 + 除錯指南 |
| `docs/配色系統完整文檔.md` | 色彩系統設計 |

---

## 檔案結構

```
efgame/
├── index.html                        # 首頁
├── settings/index.html               # 遊戲設定頁
├── manifest.json                     # PWA manifest
├── sw.js                             # Service Worker
├── firebase.json                     # Hosting + Rules 部署設定
├── database.rules.json               # RTDB 安全規則
├── firestore.rules                   # Firestore 安全規則
│
├── src/
│   ├── firebase-init.example.js      # Firebase 金鑰範本（佔位符）
│   └── firebase-init.js              # 你的金鑰（不追蹤 git）
│
├── js/
│   ├── game-config.js                # 全域遊戲設定（教師可調）
│   ├── firebase-bundle.js            # Vite 編譯產出（不追蹤 git）
│   ├── game/                         # 純遊戲邏輯
│   │   ├── rule-engine.js            # Go/No-Go 判斷
│   │   └── stimulus-renderer.js      # 刺激呈現
│   ├── adaptive/                     # 自適應難度
│   │   ├── difficulty-provider.js    # 策略模式 facade
│   │   └── simple-adaptive-engine.js # 10 級動態引擎
│   ├── singleplayer/                 # 單人模式
│   │   ├── game-controller.js        # 遊戲主迴圈
│   │   ├── adventure-map-controller.js
│   │   ├── mode-controller.js
│   │   └── settings-controller.js
│   ├── multiplayer/                   # 多人模式
│   │   ├── room-manager.js
│   │   ├── game-sync.js
│   │   └── relay-manager.js
│   ├── shared/                        # 共用元件
│   │   ├── working-memory.js
│   │   ├── countdown.js
│   │   ├── result-upload.js
│   │   └── leaderboard.js
│   ├── utils/                         # 工具函式
│   │   ├── logger.js
│   │   ├── score-calculator.js
│   │   └── badge-checker.js
│   └── shop/                          # 寵物/商店系統
│
├── css/
│   ├── common.css
│   ├── themes/                        # CSS 主題變數
│   └── pages/                         # 各頁面樣式
│
├── singleplayer/                      # 單人模式頁面
├── multiplayer/                       # 多人模式頁面
├── leaderboard/                       # 排行榜頁面
├── stimuli/                           # DCCS 刺激素材（SVG）
├── images/                            # 冒險地圖等圖片
├── audio/                             # 音效檔案
├── scripts/                           # 工具腳本
│   └── setup.sh                       # 教師一鍵設定
└── docs/                              # 文件
```

---

## 遊戲模式

### 單人冒險

1. **冒險地圖** — 兩張地圖共 12 個關卡，逐步解鎖
2. **DCCS 任務** — 每回合 40 題（可調），含工作記憶關卡
3. **自由選擇** — 全破關後解鎖，可自由組合場地與規則
4. **結果頁** — 星星評價 + 經驗值 + 寵物餵食 + 排行榜上傳

### 多人競賽（Kahoot 風格）

1. **建立房間** — 老師/家長建立，生成房間代碼
2. **加入房間** — 幼兒輸入代碼 + 暱稱
3. **同步競賽** — 全員同題目、倒數計時
4. **即時排名** — 每題後顯示排行

### 接力賽

1. **分組** — 2-4 隊自動分配
2. **輪流** — 每位隊員依序作答
3. **團隊積分** — 累計隊伍總分

---

## 安全性與隱私

| 層級               | 措施                                                                            |
| ------------------ | ------------------------------------------------------------------------------- |
| **HTTP 標頭**      | X-Content-Type-Options · X-Frame-Options · Referrer-Policy · Permissions-Policy |
| **RTDB 規則**      | `.validate` 約束欄位型別與值域                                                  |
| **Firestore 規則** | 讀寫權限依使用者身分控管                                                        |
| **前端**           | DOMParser 消毒；Logger 取代原生 console                                         |
| **金鑰管理**       | `src/firebase-init.js` 不追蹤 git，公開 repo 僅含佔位符範本                     |
| **隱私**           | 不蒐集個資；排行榜需使用者同意                                                  |

---

## 授權

本專案為學術研究用途 © 2026 Patience Lee
