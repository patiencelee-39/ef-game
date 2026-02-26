# 🎮 EF Game — 執行功能訓練遊戲

> **3-6 歲聽障學齡前幼兒**專用的執行功能（Executive Function）訓練遊戲。  
> 以 DCCS（Dimensional Change Card Sort）為核心任務，結合動態評量與 IRT 自適應機制。

[![Firebase Hosting](https://img.shields.io/badge/deploy-Firebase%20Hosting-FFCA28?logo=firebase)](https://efgame-634af.web.app)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](#授權)

---

## 目錄

- [專案概覽](#專案概覽)
- [功能特色](#功能特色)
- [技術架構](#技術架構)
- [快速開始](#快速開始)
- [檔案結構](#檔案結構)
- [遊戲模式](#遊戲模式)
- [安全性與隱私](#安全性與隱私)
- [PWA 支援](#pwa-支援)
- [開發指南](#開發指南)
- [授權](#授權)

---

## 專案概覽

| 項目         | 說明                                     |
| ------------ | ---------------------------------------- |
| **目標對象** | 3-6 歲聽障學齡前幼兒                     |
| **核心任務** | DCCS 卡片維度切換（顏色 ↔ 形狀）         |
| **理論基礎** | 執行功能訓練 + IRT 自適應難度 + 動態評量 |
| **部署平台** | Firebase Hosting                         |
| **線上版**   | <https://efgame-634af.web.app>           |

---

## 功能特色

### 🧠 認知訓練

- **DCCS 卡片分類** — 顏色 / 形狀維度切換
- **IRT 自適應** — 根據幼兒能力即時調整題目難度
- **動態評量** — 提供即時提示與鷹架支持

### 🎯 遊戲模式

- **單人模式** — 含冒險地圖、加權計分、徽章收集
- **多人模式** — Kahoot 風格即時競賽，支援建立 / 加入房間
- **接力賽** — 團隊合作模式，分組輪流作答

### 🐾 獎勵系統

- **寵物養成** — 透過遊戲表現升級可愛寵物
- **冒險地圖** — 關卡解鎖與星星進度
- **排行榜** — 全球 / 班級排名

### ♿ 無障礙

- 所有頁面含 Skip Link
- `aria-live` 即時播報結果
- 大按鈕、高對比色彩設計

---

## 技術架構

```
Frontend:  Vanilla JavaScript (IIFE 模組 + Class)
Backend:   Firebase RTDB (即時同步) + Firestore (持久化)
Hosting:   Firebase Hosting
PWA:       Service Worker + manifest.json
Storage:   localStorage / sessionStorage (離線紀錄)
```

### 關鍵模組

| 模組           | 路徑                              | 說明                                          |
| -------------- | --------------------------------- | --------------------------------------------- |
| 遊戲設定       | `js/config.js`                    | GAME_CONFIG 全域設定（難度、計時、LOG_LEVEL） |
| Firebase       | `js/firebase-config.js`           | Firebase 初始化與房間清理                     |
| Logger         | `js/utils/logger.js`              | 集中式日誌，受 LOG_LEVEL 控管                 |
| 房間管理       | `js/multiplayer/room-manager.js`  | 房間 CRUD + 即時監聽                          |
| 遊戲同步       | `js/multiplayer/game-sync.js`     | 多人答題同步                                  |
| 接力賽         | `js/multiplayer/relay-manager.js` | 團隊接力邏輯                                  |
| 寵物系統       | `js/singleplayer/pet-system.js`   | 寵物經驗值與升級                              |
| Service Worker | `sw.js`                           | 離線快取 + trimCache                          |

---

## 快速開始

### 前置需求

- [Node.js](https://nodejs.org/) ≥ 16
- [Firebase CLI](https://firebase.google.com/docs/cli) (`npm i -g firebase-tools`)

### 安裝 & 本地測試

```bash
# 1. 登入 Firebase
firebase login

# 2. 本地啟動
firebase serve
# → http://localhost:5000
```

### 部署

```bash
firebase deploy
```

> **注意**: `firebase-config.js` 中的 API Key 已填入且屬公開設計，安全性由 RTDB / Firestore 規則保障。

---

## 檔案結構

```
efgame/
├── index.html                     # 首頁（單人 / 多人入口）
├── manifest.json                  # PWA manifest
├── sw.js                          # Service Worker（離線快取）
├── firebase.json                  # Hosting 設定 + 安全標頭
├── database.rules.json            # RTDB 安全規則
├── firestore.rules                # Firestore 安全規則
├── favicon.svg                    # SVG 圖示
├── icon-192x192.png               # PWA 圖示 192×192
├── icon-512x512.png               # PWA 圖示 512×512
│
├── js/
│   ├── config.js                  # 全域遊戲設定
│   ├── firebase-config.js         # Firebase 初始化
│   ├── utils/
│   │   ├── logger.js              # 集中式日誌
│   │   └── ...
│   ├── multiplayer/               # 多人模式邏輯
│   │   ├── room-manager.js
│   │   ├── room-lobby-controller.js
│   │   ├── game-controller.js
│   │   ├── game-sync.js
│   │   ├── relay-manager.js
│   │   └── ...
│   ├── singleplayer/              # 單人模式邏輯
│   │   ├── pet-system.js
│   │   └── ...
│   ├── stages/                    # 關卡場景
│   └── sound/                     # 音效系統
│
├── css/                           # 樣式表
│   ├── common.css
│   └── multiplayer/
│       └── relay.css
│
├── multiplayer/                   # 多人模式頁面
│   ├── room-create.html
│   ├── room-join.html
│   ├── room-lobby.html
│   ├── game.html
│   └── result.html
│
├── singleplayer/                  # 單人模式頁面
│   ├── game.html
│   ├── result.html
│   ├── adventure-map.html
│   └── pet.html
│
├── leaderboard/                   # 排行榜
├── management/                    # 班級管理
├── audio/                         # 音效檔案
├── stimuli/                       # DCCS 刺激素材（SVG）
├── screenshots/                   # PWA 截圖（待補）
└── shared/                        # 共用 HTML 片段
```

---

## 遊戲模式

### 🕹️ 單人模式

1. **冒險地圖** — 依序解鎖 6 個場景關卡
2. **DCCS 任務** — 每輪 10-15 題，自適應難度
3. **結果頁** — 星星評價 + 經驗值 + 寵物餵食

### 👥 多人模式（Kahoot 風格）

1. **建立房間** — 老師 / 家長建立，生成房間代碼
2. **加入房間** — 幼兒輸入代碼 + 暱稱
3. **大廳等待** — 即時顯示已加入玩家
4. **同步競賽** — 全員同題目、倒數計時
5. **即時排名** — 每題後顯示排行

### 🏃 接力賽模式

1. **分組** — 2-4 隊自動分配
2. **輪流** — 每位隊員依序作答
3. **接棒** — 前一位完成後自動切換下一位
4. **團隊積分** — 累計隊伍總分

---

## 安全性與隱私

| 層級               | 措施                                                                            |
| ------------------ | ------------------------------------------------------------------------------- |
| **HTTP 標頭**      | X-Content-Type-Options · X-Frame-Options · Referrer-Policy · Permissions-Policy |
| **RTDB 規則**      | `.validate` 約束欄位型別與值域                                                  |
| **Firestore 規則** | 讀寫權限依使用者身分控管                                                        |
| **前端**           | DOMParser 消毒 XHR 回應；Logger 取代原生 console                                |
| **隱私**           | 不蒐集個資；排行榜需使用者同意；詳見 [隱私政策](privacy.html)                   |

---

## PWA 支援

- ✅ `manifest.json` — 含圖示、捷徑、截圖欄位
- ✅ `sw.js` — 靜態資源快取 + 頁面快取 + trimCache
- ✅ `offline.html` — 離線提示頁面
- ✅ 可安裝至手機主畫面

---

## 開發指南

### 日誌層級

在 `js/config.js` 中調整 `DEV.LOG_LEVEL`：

| 值         | 說明                            |
| ---------- | ------------------------------- |
| `"debug"`  | 顯示所有日誌（開發用）          |
| `"info"`   | 顯示 info / warn / error        |
| `"warn"`   | 僅顯示 warn / error（**預設**） |
| `"error"`  | 僅顯示 error                    |
| `"silent"` | 完全靜音                        |

### 程式碼風格

- 模組以 IIFE 封裝，掛載至 `window`
- 命名：檔案 `kebab-case`、變數 `camelCase`、常數 `UPPER_SNAKE`
- 詳見 `NAMING-CONVENTION.md`

### 相關文件

| 文件                             | 說明             |
| -------------------------------- | ---------------- |
| `完整需求統整文件_最終版v2.0.md` | 完整功能需求     |
| `配色系統完整文檔.md`            | 色彩系統設計     |
| `程式除錯完整指南.md`            | 除錯手冊         |
| `TEACHER-GUIDE.md`               | 教師使用指南     |
| `NAMING-CONVENTION.md`           | 命名規範         |
| `SINGLEPLAYER-TEST-CHECKLIST.md` | 單人模式測試清單 |

---

## 授權

本專案為學術研究用途 © 2026。
