# 教師設定指南 — 從零開始部署你自己的 EF Game

這份指南假設你**完全沒有程式背景**，會一步一步帶你完成所有操作。
請照著順序做，不要跳步驟。

---

## 你會得到什麼？

完成這份指南後，你會有：
- 一個**只屬於你的**遊戲網站（網址像 `https://你的名字.web.app`）
- 學生的遊戲資料存在**你自己的資料庫**，和原始作者完全獨立
- 未來可以自由修改遊戲設定

---

## 需要的時間

大約 30-45 分鐘（第一次比較久，之後更新只需 1 分鐘）。

---

## 第一步：準備工作（只需做一次）

### 1-1. 註冊 Google 帳號

如果你已經有 Gmail，跳過這步。

### 1-2. 註冊 GitHub 帳號

1. 打開 https://github.com/
2. 點右上角「Sign up」
3. 依照畫面指示完成註冊（需要 email 驗證）

### 1-3. 安裝 Node.js

Node.js 是一個讓你電腦能執行工具程式的東西（你不需要寫任何程式）。

**Mac：**
1. 打開 https://nodejs.org/
2. 點綠色的「LTS」按鈕下載
3. 打開下載的 `.pkg` 檔案
4. 一直點「繼續」直到安裝完成

**Windows：**
1. 打開 https://nodejs.org/
2. 點綠色的「LTS」按鈕下載
3. 打開下載的 `.msi` 檔案
4. 一直點「Next」→「Install」→「Finish」

### 1-4. 安裝 Git

Git 是用來下載和管理程式碼的工具。

**Mac：**
- 打開「終端機」（Spotlight 搜尋「Terminal」）
- 輸入 `git --version` 然後按 Enter
- 如果跳出安裝提示，點「安裝」就好
- 如果顯示版本號碼（例如 `git version 2.x.x`），代表已經有了

**Windows：**
1. 打開 https://git-scm.com/downloads/win
2. 下載安裝，所有選項都用預設（一直按 Next）
3. 安裝完成後，用「Git Bash」取代原本的命令提示字元

### 1-5. 打開終端機

接下來所有步驟都在「終端機」裡面操作。

| 作業系統 | 怎麼打開 |
|---------|---------|
| Mac | Spotlight（Cmd + 空白鍵）→ 輸入「Terminal」→ Enter |
| Windows | 開始選單 → 搜尋「Git Bash」→ 點開 |

打開後你會看到一個黑底（或白底）的視窗，上面有閃爍的游標。
這就是「終端機」，你之後只要**把指令複製貼上，然後按 Enter** 就好。

---

## 第二步：複製遊戲程式碼到你的 GitHub

### 2-1. Fork（複製一份到你的帳號）

1. 用瀏覽器打開原始遊戲的 GitHub 頁面
2. 點右上角的「**Fork**」按鈕
3. 在跳出的頁面直接點「**Create fork**」
4. 等幾秒鐘，完成後你的 GitHub 裡就會多出一個相同的倉庫

### 2-2. 下載到你的電腦

回到終端機，一行一行複製貼上（每貼一行就按一次 Enter）：

```bash
cd ~/Desktop
```

```bash
git clone https://github.com/你的GitHub帳號/倉庫名稱.git
```

> 把「你的GitHub帳號」和「倉庫名稱」替換成你實際的內容。
> 例如：`git clone https://github.com/wang-teacher/ef-game.git`

```bash
cd 倉庫名稱
```

> 例如：`cd ef-game`

做完後，遊戲程式碼就下載到你的桌面了。

---

## 第三步：建立你自己的 Firebase 專案

Firebase 是 Google 提供的免費服務，用來放網站和存資料。

### 3-1. 建立專案

1. 打開 https://console.firebase.google.com/
2. 用你的 Google 帳號登入
3. 點「**新增專案**」（或 Add project）
4. 輸入專案名稱，例如 `efgame-wang`（只能用英文小寫、數字、連字號）
5. Google Analytics → 關閉（不需要）→ 點「建立專案」
6. 等 30 秒，看到打勾就點「繼續」

### 3-2. 啟用登入功能

1. 左邊選單找到「**Build**」→ 點「**Authentication**」
2. 點「**Get started**」（開始使用）
3. 你會看到「Sign-in method」頁籤，啟用以下兩個：

**啟用匿名登入：**
- 找到「Anonymous」（匿名）→ 點進去
- 把開關打開 → 點「Save」（儲存）

**啟用 Google 登入：**
- 回到列表，找到「Google」→ 點進去
- 把開關打開
- 「Project support email」選你的 Gmail
- 點「Save」（儲存）

### 3-3. 建立即時資料庫（Realtime Database）

1. 左邊選單「**Build**」→「**Realtime Database**」
2. 點「**Create Database**」（建立資料庫）
3. 地區選「**Singapore (asia-southeast1)**」← 離台灣最近
4. 安全規則選「**Start in locked mode**」（鎖定模式）
5. 點「Enable」（啟用）

### 3-4. 建立 Firestore 資料庫

1. 左邊選單「**Build**」→「**Firestore Database**」
2. 點「**Create database**」
3. 地區選「**asia-east1 (Taiwan)**」
4. 安全規則選「**Start in production mode**」（生產模式）
5. 點「Create」（建立）

### 3-5. 取得你的金鑰（很重要！）

1. 點左上角的齒輪圖示 ⚙️ →「**Project settings**」（專案設定）
2. 滑到最下面，找到「**Your apps**」（你的應用程式）
3. 點「**</>**」圖示（Web 應用程式）
4. 暱稱輸入 `EF Game`
5. 勾選「**Also set up Firebase Hosting**」（同時設定 Hosting）
6. 點「**Register app**」（註冊應用程式）
7. 畫面會顯示一段程式碼，找到下面這個部分：

```
apiKey: "AIzaSy..."
authDomain: "efgame-wang.firebaseapp.com"
databaseURL: "https://efgame-wang-default-rtdb.asia-southeast1.firebasedatabase.app"
projectId: "efgame-wang"
storageBucket: "efgame-wang.firebasestorage.app"
messagingSenderId: "123456789"
appId: "1:123456789:web:abc123"
```

**請把這個頁面保持開啟**，等一下會用到這些值。

點「Continue to console」回到主頁。

---

## 第四步：一鍵設定（在終端機裡操作）

回到終端機（應該還在剛才 `cd` 進去的資料夾）。

輸入以下指令然後按 Enter：

```bash
npm install
```

> 會跑一陣子（1-3 分鐘），會下載需要的工具。看到很多文字在跑是正常的。
> 結束時會回到閃爍游標的狀態。

接著輸入：

```bash
npm run setup
```

腳本會一步一步問你問題，照著回答：

| 腳本問你 | 你要輸入什麼 |
|---------|-------------|
| 「是否登入 Firebase？」 | 瀏覽器會自動打開，選你的 Google 帳號登入，然後回到終端機 |
| 「Project ID:」 | 輸入你的專案 ID，例如 `efgame-wang` |
| 「apiKey:」 | 從剛才保持開啟的頁面，複製 apiKey 的值貼上 |
| 「authDomain:」 | 複製 authDomain 的值貼上 |
| 「databaseURL:」 | 複製 databaseURL 的值貼上 |
| 「storageBucket:」 | 複製 storageBucket 的值貼上 |
| 「messagingSenderId:」 | 複製 messagingSenderId 的值貼上 |
| 「appId:」 | 複製 appId 的值貼上 |

> 複製時**不要包含引號**（`""`），只要裡面的內容。
> 例如 apiKey 只要貼 `AIzaSy...` 這段，不要貼 `"AIzaSy..."`。

最後腳本會自動建置，看到「設定完成」就代表成功了！

---

## 第五步：部署上線！

在終端機輸入：

```bash
firebase deploy
```

等 1-2 分鐘，看到類似這樣的訊息就代表成功：

```
✅ Deploy complete!

Hosting URL: https://efgame-wang.web.app
```

**恭喜！** 用瀏覽器打開那個網址，你的遊戲就上線了！

---

## 之後要更新怎麼辦？

如果原作者更新了遊戲，你想同步最新版本：

在終端機輸入（一行一行來）：

```bash
cd ~/Desktop/倉庫名稱
```

```bash
git pull
```

```bash
npm run build:firebase
```

```bash
firebase deploy
```

這樣就更新完成了。

---

## 常見問題

### Q: 終端機顯示「command not found: node」？

代表 Node.js 沒安裝成功。請關閉終端機，重新開一個，再試一次 `node --version`。
如果還是不行，重新到 https://nodejs.org/ 下載安裝。

### Q: `npm run setup` 顯示紅色錯誤？

最常見的原因是打字打錯了。請確認：
- Project ID 是英文小寫 + 數字 + 連字號，沒有空格
- 貼上的金鑰值沒有多餘的空格或引號

可以重新跑一次 `npm run setup`，不會壞掉。

### Q: `firebase deploy` 失敗？

確認你有網路連線，並且 Firebase 登入沒有過期。
試試看先跑 `firebase login`，重新登入後再 `firebase deploy`。

### Q: 學生的資料會跟原作者混在一起嗎？

**不會。** 每個 Firebase 專案是完全獨立的世界。
你的學生資料只存在你的專案裡，別人看不到。

### Q: 我不需要跑 `firebase init` 嗎？

不需要。所有設定檔已經準備好了，你只需要綁定你自己的專案就好。

### Q: 部署成功但畫面空白？

試試清除瀏覽器快取：
- Mac: Cmd + Shift + R
- Windows: Ctrl + Shift + R

### Q: 費用會很貴嗎？

Firebase 免費方案（Spark Plan）對一般班級使用綽綽有餘：
- Hosting: 每月 10 GB 傳輸量
- 資料庫: 每月 1 GB 儲存
- 除非你有幾千個學生同時在線，不然不會超出免費額度

---

## 需要幫助？

如果遇到問題，請截圖終端機的錯誤訊息，聯繫原作者。
