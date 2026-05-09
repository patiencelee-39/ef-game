# 教師設定指南 — 複製 EF Game 到自己的 Firebase

本指南幫助教師將 EF Game 專案 fork 到自己的 GitHub 帳號，並部署到自己的 Firebase 專案。

---

## 事前準備

| 項目 | 說明 |
|------|------|
| Google 帳號 | 用於 Firebase（免費方案即可） |
| GitHub 帳號 | 用於 fork 程式碼 |
| Node.js | [下載 LTS 版](https://nodejs.org/)，安裝後重開終端機 |
| 終端機 | Mac: Terminal / Windows: PowerShell |

---

## 第一部分：Fork 程式碼

### 1. Fork GitHub 倉庫

1. 前往原始倉庫頁面
2. 點右上角 **Fork** 按鈕
3. 選擇你的帳號 → Create fork

### 2. 下載到電腦

打開終端機，輸入：

```bash
git clone https://github.com/你的帳號/倉庫名稱.git
cd 倉庫名稱
```

---

## 第二部分：建立 Firebase 專案

### 1. 建立專案

1. 打開 [Firebase Console](https://console.firebase.google.com/)
2. 點「新增專案」
3. 輸入專案名稱（例如 `efgame-myschool`）
4. Google Analytics 可關閉（不需要）
5. 建立完成

### 2. 啟用 Authentication

1. 左側選單 → Build → Authentication
2. 點「開始使用」
3. Sign-in method 頁籤：
   - 啟用 **匿名** (Anonymous)
   - 啟用 **Google**（用於排行榜上傳）

### 3. 建立 Realtime Database

1. 左側選單 → Build → Realtime Database
2. 點「建立資料庫」
3. 地區選 **asia-southeast1**（新加坡，台灣最近）
4. 安全規則選「以鎖定模式啟動」（之後由 repo 的規則覆蓋）

### 4. 建立 Firestore Database

1. 左側選單 → Build → Firestore Database
2. 點「建立資料庫」
3. 地區選 **asia-east1**（台灣）
4. 安全規則選「以生產模式啟動」（之後由 repo 的規則覆蓋）

### 5. 建立 Web 應用程式（取得金鑰）

1. 專案設定（左上齒輪 ⚙️）→ 一般
2. 滑到最下面「你的應用程式」→ 點 **</>** 圖示（Web）
3. 暱稱輸入 `EF Game`，勾選 Firebase Hosting → 註冊應用程式
4. 畫面會顯示 `firebaseConfig` 物件 — **請記下這些值**

你會看到類似：

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "efgame-myschool.firebaseapp.com",
  databaseURL: "https://efgame-myschool-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "efgame-myschool",
  storageBucket: "efgame-myschool.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## 第三部分：一鍵設定（推薦）

回到終端機，在專案資料夾中執行：

```bash
npm run setup
```

腳本會依序引導你：
1. 登入 Firebase
2. 輸入 Project ID
3. 輸入上一步取得的 firebaseConfig 各欄位
4. 自動建置 `firebase-bundle.js`

完成後即可部署。

---

## 第三部分（替代）：手動設定

如果一鍵腳本有問題，也可以手動操作：

### 1. 安裝依賴

```bash
npm install
```

### 2. 安裝 Firebase CLI

```bash
npm install -g firebase-tools
```

### 3. 登入 Firebase

```bash
firebase login
```

### 4. 建立 .firebaserc

將 `.firebaserc.example` 複製為 `.firebaserc`，填入你的 Project ID：

```bash
cp .firebaserc.example .firebaserc
```

編輯 `.firebaserc`：

```json
{
  "projects": {
    "default": "efgame-myschool"
  }
}
```

### 5. 修改 Firebase 金鑰

先從範本複製：

```bash
cp src/firebase-init.example.js src/firebase-init.js
```

編輯 `src/firebase-init.js`，找到 `firebaseConfig` 物件（約第 72 行），替換成你的值：

```javascript
const firebaseConfig = {
  apiKey: "你的 apiKey",
  authDomain: "你的專案.firebaseapp.com",
  databaseURL: "https://你的專案-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "你的專案ID",
  storageBucket: "你的專案.firebasestorage.app",
  messagingSenderId: "你的 senderId",
  appId: "你的 appId",
};
```

### 6. 重新建置 Firebase Bundle

```bash
npm run build:firebase
```

---

## 第四部分：部署

```bash
firebase deploy
```

這個指令會一次部署：
- ✅ 網站檔案（Hosting）
- ✅ Realtime Database 安全規則
- ✅ Firestore 安全規則

部署完成後，終端機會顯示網址，例如：

```
✅ Hosting URL: https://efgame-myschool.web.app
```

用瀏覽器打開即可使用。

---

## 日常操作

| 指令 | 用途 |
|------|------|
| `firebase serve` | 本地測試（http://localhost:5000） |
| `firebase deploy` | 部署到線上 |
| `firebase deploy --only hosting` | 只更新網站（較快） |
| `npm run validate` | 檢查程式碼格式 |

---

## 常見問題

### Q: 我不需要跑 `firebase init` 嗎？

不需要。repo 裡已包含完整的 `firebase.json`、`firestore.rules`、`database.rules.json`，你只需要在 `.firebaserc` 裡指定你的 Project ID。

### Q: 安全規則怎麼辦？

已經寫好了，隨 `firebase deploy` 一起部署。你不需要手動在 Console 裡設定規則。

### Q: 部署後顯示空白頁面？

1. 確認 `firebase deploy` 沒有錯誤訊息
2. 清除瀏覽器快取（Ctrl+Shift+R）
3. 檢查 Firebase Console → Hosting 是否有最新的部署紀錄

### Q: 學生的遊戲資料會互通嗎？

不會。每個 Firebase 專案是完全獨立的，學生資料只會存在你的專案裡。

### Q: 如何更新到最新版本？

```bash
git pull upstream main
npm run build:firebase
firebase deploy
```

（需先設定 upstream remote：`git remote add upstream 原始倉庫網址`）

---

## 檔案結構說明

設定過程中會產生的檔案（已加入 .gitignore，不會推上 GitHub）：

```
.firebaserc            ← 你的 Project ID
src/firebase-init.js   ← 你的 Firebase 金鑰（由 setup 從 .example 複製產生）
js/firebase-bundle.js  ← 建置產出（由 npm run build:firebase 生成）
```

repo 裡追蹤的範本/設定檔（不需要動）：

```
src/firebase-init.example.js ← 範本（佔位符，不含任何真實金鑰）
.firebaserc.example          ← .firebaserc 的範本
firebase.json                ← Hosting/DB/Firestore 部署設定（已設好）
firestore.rules              ← Firestore 安全規則（已設好）
database.rules.json          ← RTDB 安全規則（已設好）
```
