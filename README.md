# 執行功能訓練遊戲

3-6歲聽障學齡前幼兒執行功能訓練遊戲

## 📋 專案資訊

- **開發目標**：多人 Kahoot 風格 + 單人模式
- **部署環境**：Firebase Hosting
- **目標使用者**：3-6歲聽障學齡前幼兒

## 🚀 快速開始

### 1. 設定 Firebase 配置

編輯 `js/firebase-config.js`，填入您的 Firebase 配置資訊：

```javascript
const firebaseConfig = {
  apiKey: '您的 API Key',
  authDomain: '您的 Auth Domain',
  databaseURL: '您的 Database URL',
  projectId: '您的 Project ID',
  storageBucket: '您的 Storage Bucket',
  messagingSenderId: '您的 Sender ID',
  appId: '您的 App ID',
};
```

### 2. 安裝 Firebase CLI

```bash
npm install -g firebase-tools
```

### 3. 登入 Firebase

```bash
firebase login
```

### 4. 初始化專案

```bash
firebase init
```

選擇：

- Hosting
- 使用現有專案
- Public directory: `.`（當前目錄）

### 5. 本地測試

```bash
firebase serve
```

### 6. 部署到 Firebase

```bash
firebase deploy
```

## 📂 檔案結構

```
execution-function-game/
├── index.html                  # 起始頁面
├── multiplayer/               # 多人模式
├── singleplayer/              # 單人模式
├── leaderboard/               # 排行榜
├── management/                # 班級管理
├── js/                        # JavaScript
│   ├── firebase-config.js     # Firebase 配置（需填寫）
│   ├── utils/                 # 工具函式
│   ├── multiplayer/           # 多人邏輯
│   ├── singleplayer/          # 單人邏輯
│   ├── stages/                # 遊戲場邏輯
│   └── sound/                 # 聲音系統
├── css/                       # 樣式
├── audio/                     # 音效檔案
└── firebase.json              # Firebase 設定
```

## 🎮 遊戲模式

### 多人模式（Kahoot 風格）

- 建立房間
- 邀請朋友
- 即時競賽

### 單人模式

- 場地選擇
- 加權計分
- 徽章收集

## 📝 開發文件

詳細需求請參考：`完整需求統整文件_最終版v2.0.md`

## 🔒 安全性

- Firebase 規則已設定
- 本地資料使用 localStorage
- 全球排行榜需使用者同意

## 📧 聯絡資訊

學術研究專案 - 2026
