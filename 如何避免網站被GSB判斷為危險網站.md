# 如何避免網站被 Google Safe Browsing 判斷為危險網站

avoid_google_dangerous_site_guide(Opus 4.5).md

## 完整指南：結合網站安全最佳實踐與程式碼良好實踐

---

## 目錄

1. [前言：了解 Google Safe Browsing](#1-前言了解-google-safe-browsing)
2. [常見被標記為危險網站的原因](#2-常見被標記為危險網站的原因)
3. [預防措施：網站設計與內容規範](#3-預防措施網站設計與內容規範)
4. [技術實作：安全性程式碼實踐](#4-技術實作安全性程式碼實踐)
5. [Meta 標籤與 HTTP 標頭設定](#5-meta-標籤與-http-標頭設定)
6. [檔案下載功能的安全設計](#6-檔案下載功能的安全設計)
7. [靜態網站（GitHub Pages）特別注意事項](#7-靜態網站github-pages特別注意事項)
8. [監控與持續維護](#8-監控與持續維護)
9. [被標記後的處理流程](#9-被標記後的處理流程)
10. [檢查清單](#10-檢查清單)

---

## 1. 前言：了解 Google Safe Browsing

### 1.1 什麼是 Google Safe Browsing？

Google Safe Browsing 是 Google 自 2005 年推出的安全服務，用於保護使用者免受網路威脅。當使用者嘗試訪問被標記的網站時，瀏覽器會顯示警告頁面。

目前 Safe Browsing 保護全球超過 **40 億台裝置**，被 Chrome、Firefox、Safari 等主流瀏覽器採用。

### 1.2 Safe Browsing 偵測的威脅類型

| 類型                              | 說明                   | 警告訊息                 |
| --------------------------------- | ---------------------- | ------------------------ |
| **惡意軟體 (Malware)**            | 網站託管或散布惡意程式 | 「這個網站含有惡意程式」 |
| **網路釣魚 (Phishing)**           | 試圖竊取個人資訊       | 「這是詐騙網站」         |
| **社交工程 (Social Engineering)** | 誘騙使用者執行危險動作 | 「這是不實網站」         |
| **垃圾軟體 (Unwanted Software)**  | 捆綁不需要的程式       | 「這個網站含有有害程式」 |

### 1.3 誤判 (False Positive) 的可能性

Google Safe Browsing 使用**自動化演算法**偵測，可能因以下原因產生誤判：

- 網站有檔案下載功能（被誤認為散布軟體）
- 收集表單資料（被誤認為釣魚）
- 新建立的網站（信任度較低）
- 網站內容與已知惡意網站相似

---

## 2. 常見被標記為危險網站的原因

### 2.1 真實安全問題

```
⚠️ 需要立即修復的問題：
├── 網站被駭客入侵，植入惡意程式碼
├── 第三方外掛或廣告包含惡意內容
├── 表單資料透過 HTTP（非 HTTPS）傳輸
├── 網站連結到已知惡意網站
└── 託管可執行檔案（.exe、.dmg 等）
```

### 2.2 可能觸發誤判的行為

```
🔍 容易被誤判的功能：
├── CSV/Excel 檔案下載功能
├── 要求輸入個人資訊的表單
├── 多個登入表單
├── 使用較少見的 JavaScript 行為
└── 網站內容缺乏清楚的用途說明
```

---

## 3. 預防措施：網站設計與內容規範

### 3.1 清楚標示網站用途與身分

**原則**：讓 Google 爬蟲和審查人員能快速理解網站的合法性。

```html
<!-- ✅ 良好實踐：在首頁明確說明網站用途 -->
<div class="site-notice">
  <h2>📚 學術研究工具</h2>
  <p>
    本網站為<strong>中原大學特殊教育學系</strong>碩士班研究專案， 用於協助 ADHD
    學童進行認知訓練。
  </p>
  <p><strong>不收集任何個人資訊</strong>，所有資料僅存於您的瀏覽器。</p>
  <a href="privacy.html">了解更多 →</a>
</div>
```

### 3.2 提供完整的隱私權政策

**必須包含的內容**：

1. 網站性質與用途說明
2. 資料收集範圍（或明確聲明不收集）
3. 資料處理方式
4. 使用者權利
5. 聯絡資訊

```html
<!-- ✅ 良好實踐：在首頁提供隱私權政策連結 -->
<footer>
  <a href="privacy.html">🔒 隱私權政策</a>
  <a href="https://github.com/username/repo">💻 開源專案</a>
  <span>© 2026 研究機構名稱</span>
</footer>
```

### 3.3 使用可驗證的身分資訊

```html
<!-- ✅ 良好實踐：提供可驗證的機構資訊 -->
<meta name="author" content="中原大學特殊教育學系" />
<meta name="publisher" content="Chung Yuan Christian University" />

<!-- 連結到官方網站或可驗證的來源 -->
<a href="https://www.cycu.edu.tw/" target="_blank" rel="noopener">
  中原大學官方網站
</a>
```

---

## 4. 技術實作：安全性程式碼實踐

### 4.1 遵循單一職責原則

根據「程式碼良好實踐完整指南」，每個函數應只做一件事。這也適用於安全性設計：

```javascript
// ❌ 不良實踐 - 混合多種功能，難以審查
function handleUserData(data) {
  validateInput(data);
  saveToLocalStorage(data);
  downloadAsFile(data);
  sendToServer(data); // 可能觸發安全警告
}

// ✅ 良好實踐 - 職責分離，透明可審查
function validateGameData(data) {
  // 僅驗證資料格式
  if (!data || typeof data !== "object") {
    throw new Error("Invalid data format");
  }
  return true;
}

function exportDataAsCSV(data) {
  // 僅處理 CSV 匯出，不涉及網路傳輸
  const csvContent = convertToCSV(data);
  downloadFile(csvContent, "game_results.csv");
}
```

### 4.2 使用描述性命名

清楚的命名有助於程式碼審查，也讓 Google 爬蟲更容易理解程式碼意圖：

```javascript
// ❌ 不良實踐 - 模糊的命名可能引起懷疑
function dl(d) {
  const b = new Blob([d]);
  // ...
}

// ✅ 良好實踐 - 清楚表達功能
function downloadResearchDataAsCSV(gameResultsData) {
  // 將遊戲結果資料轉換為 CSV 格式供研究分析使用
  const csvContent = convertGameResultsToCSV(gameResultsData);
  triggerBrowserDownload(csvContent, "research_data.csv");
}
```

### 4.3 避免可疑的程式碼模式

```javascript
// ❌ 避免使用這些可能觸發安全警告的模式

// 1. 動態執行字串程式碼
eval('alert("Hello")'); // 危險！

// 2. 混淆或編碼的程式碼
const encoded = atob("YWxlcnQoIkhlbGxvIik=");

// 3. 自動下載（沒有使用者互動）
window.onload = function () {
  downloadFile(); // 可能被視為強制下載
};

// 4. 隱藏的 iframe
document.write('<iframe style="display:none" src="..."></iframe>');

// ✅ 良好實踐

// 1. 明確的程式碼邏輯
function calculateScore(correct, total) {
  return (correct / total) * 100;
}

// 2. 使用者主動觸發的下載
document.getElementById("exportButton").addEventListener("click", function () {
  // 只有使用者點擊時才執行下載
  exportDataAsCSV(gameResults);
});

// 3. 清楚的 UI 說明
const downloadButton = document.createElement("button");
downloadButton.textContent = "📊 匯出研究資料 (CSV)";
downloadButton.title = "下載遊戲表現統計資料，不含個人資訊";
```

### 4.4 輸入驗證與錯誤處理

根據「程式碼良好實踐完整指南」的安全性考量章節：

```javascript
// ✅ 良好實踐 - 完整的輸入驗證
function processTrialData(trialNumber, stimulusType, responseTime) {
  // 驗證試題編號
  if (!Number.isInteger(trialNumber) || trialNumber < 1) {
    console.error("Invalid trial number");
    return null;
  }

  // 驗證刺激類型
  const validTypes = ["go", "nogo"];
  if (!validTypes.includes(stimulusType)) {
    console.error("Invalid stimulus type");
    return null;
  }

  // 驗證反應時間
  if (
    responseTime !== null &&
    (typeof responseTime !== "number" || responseTime < 0)
  ) {
    console.error("Invalid response time");
    return null;
  }

  return {
    trial: trialNumber,
    type: stimulusType,
    rt: responseTime,
  };
}
```

---

## 5. Meta 標籤與 HTTP 標頭設定

### 5.1 必要的 Meta 標籤

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <!-- ===== 網站身分識別 ===== -->
  <meta
    name="description"
    content="執行功能訓練遊戲是中原大學特殊教育學系的學術研究工具，用於訓練 ADHD 學童的認知能力。不收集任何個人資訊。"
  />
  <meta name="author" content="中原大學特殊教育學系碩士班" />
  <meta
    name="keywords"
    content="執行功能, 認知訓練, 特殊教育, ADHD, 學術研究"
  />

  <!-- ===== 內容分類 ===== -->
  <meta name="classification" content="Education, Academic Research" />
  <meta name="category" content="Education" />
  <meta name="robots" content="index, follow" />

  <!-- ===== Open Graph（社群分享）===== -->
  <meta property="og:title" content="執行功能訓練遊戲 - 學術研究工具" />
  <meta
    property="og:description"
    content="中原大學特殊教育學系碩士班學術研究工具"
  />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://example.github.io/project/" />
  <meta property="og:site_name" content="執行功能訓練遊戲" />

  <!-- ===== 規範連結 ===== -->
  <link rel="canonical" href="https://example.github.io/project/" />

  <title>執行功能訓練遊戲 - 中原大學特殊教育學術研究工具</title>
</head>
```

### 5.2 Content Security Policy (CSP)

CSP 是一種安全機制，告訴瀏覽器哪些資源是可信任的。設定良好的 CSP 可以：

- 防止 XSS 攻擊
- 證明網站沒有載入惡意外部資源
- 增加網站的安全可信度

```html
<!-- 對於純靜態網站（如 GitHub Pages）的 CSP 設定 -->
<meta
  http-equiv="Content-Security-Policy"
  content="
    default-src 'self';
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data:;
    font-src 'self';
    connect-src 'none';
    frame-ancestors 'none';
    form-action 'self';
    base-uri 'self';
"
/>
```

**CSP 指令說明**：

| 指令              | 用途                | 建議值                             |
| ----------------- | ------------------- | ---------------------------------- |
| `default-src`     | 預設資源來源        | `'self'`                           |
| `script-src`      | JavaScript 來源     | `'self'`（或加 `'unsafe-inline'`） |
| `style-src`       | CSS 樣式來源        | `'self' 'unsafe-inline'`           |
| `img-src`         | 圖片來源            | `'self' data:`                     |
| `connect-src`     | AJAX/Fetch 連線目標 | `'none'`（不需要外連時）           |
| `frame-ancestors` | 誰可以嵌入此頁面    | `'none'`                           |
| `form-action`     | 表單提交目標        | `'self'`                           |

### 5.3 其他安全相關標頭

```html
<!-- 防止點擊劫持 -->
<meta http-equiv="X-Frame-Options" content="DENY" />

<!-- 防止 MIME 類型嗅探 -->
<meta http-equiv="X-Content-Type-Options" content="nosniff" />

<!-- 啟用 XSS 過濾（舊版瀏覽器） -->
<meta http-equiv="X-XSS-Protection" content="1; mode=block" />

<!-- 強制 HTTPS（需要伺服器支援） -->
<!-- 注意：此標頭在 meta 中無效，需透過 HTTP 標頭設定 -->
```

---

## 6. 檔案下載功能的安全設計

檔案下載功能是**最容易觸發誤判**的功能之一。以下是安全設計的要點：

### 6.1 設計原則

```javascript
// ✅ 良好實踐的檔案下載設計

const DataExporter = {
  /**
   * 匯出研究資料為 CSV 檔案
   *
   * 設計要點：
   * 1. 必須由使用者主動觸發（點擊按鈕）
   * 2. 只匯出純文字資料（CSV），不是可執行檔
   * 3. 資料不含個人識別資訊
   * 4. 匯出前顯示清楚的說明
   */
  exportToCSV: function () {
    // 取得遊戲資料
    const data = GameState.trialDataRecords;

    // 轉換為 CSV 格式
    const csvContent = this.convertToCSV(data);

    // 觸發下載
    this.triggerDownload(csvContent, "game_results.csv", "text/csv");
  },

  convertToCSV: function (records) {
    // CSV 標頭
    const header = "trial,stimulus_type,did_respond,is_correct,reaction_time\n";

    // 資料列
    const rows = records
      .map(
        (record) =>
          `${record.trial},${record.type},${record.responded},${
            record.correct
          },${record.rt || ""}`
      )
      .join("\n");

    return header + rows;
  },

  triggerDownload: function (content, filename, mimeType) {
    // 建立 Blob 物件
    const blob = new Blob([content], { type: mimeType + ";charset=utf-8" });

    // 建立下載連結
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;

    // 觸發下載
    document.body.appendChild(link);
    link.click();

    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
```

### 6.2 UI 設計：清楚說明下載內容

```html
<!-- ✅ 良好實踐：在下載按鈕旁提供說明 -->
<div class="export-section">
  <div
    class="export-info"
    style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 15px;"
  >
    <h4>📊 資料匯出說明</h4>
    <p>點擊下方按鈕將下載 <strong>CSV 純文字檔案</strong>，內容包含：</p>
    <ul>
      <li>試題編號（第 1 題、第 2 題...）</li>
      <li>刺激類型（星星或叉叉）</li>
      <li>反應結果（正確或錯誤）</li>
      <li>反應時間（毫秒）</li>
    </ul>
    <p style="color: #1565c0;"><strong>✅ 不包含任何個人識別資訊</strong></p>
  </div>

  <button onclick="DataExporter.exportToCSV()" class="btn btn-primary">
    📥 匯出研究資料 (CSV)
  </button>
</div>
```

### 6.3 避免的行為

```javascript
// ❌ 避免這些可能觸發警告的行為

// 1. 自動下載（沒有使用者互動）
window.onload = function () {
  downloadFile(); // 危險！
};

// 2. 隱藏的下載
document.createElement("a").click(); // 沒有視覺提示

// 3. 偽裝的副檔名
downloadFile("data.csv.exe"); // 危險！

// 4. 從外部來源下載
fetch("https://external-site.com/file.exe")
  .then((response) => response.blob())
  .then((blob) => saveAs(blob)); // 可疑行為
```

---

## 7. 靜態網站（GitHub Pages）特別注意事項

### 7.1 GitHub Pages 的優勢

- **HTTPS 預設啟用**：自動提供 SSL 憑證
- **可信賴的託管平台**：屬於 Microsoft/GitHub
- **開源透明**：程式碼公開可審查
- **無伺服器端程式碼**：減少被入侵風險

### 7.2 建議的專案結構

```
project-root/
├── index.html              # 主頁面
├── privacy.html            # 隱私權政策（必要）
├── README.md               # 專案說明（必要）
├── LICENSE                 # 授權聲明
├── SECURITY.md             # 安全聲明（建議）
├── googleXXXXXXXX.html     # Google 驗證檔案
└── assets/
    ├── css/
    │   └── style.css
    ├── js/
    │   └── main.js
    └── images/
```

### 7.3 README.md 範例

```markdown
# 專案名稱

## 📚 專案性質

這是**[機構名稱]**的學術研究工具。

## 🎯 用途說明

- 具體說明網站功能
- 目標使用者
- 研究目的

## 🔒 隱私聲明

- ❌ **不收集**任何個人資訊
- ❌ **不使用** Cookies 或追蹤技術
- ❌ 資料**不會上傳**到任何伺服器
- ✅ 所有資料處理在使用者瀏覽器本地完成

## 📊 資料處理

說明任何資料匯出功能的用途和內容。

## 🏫 研究機構

- 機構名稱
- 官方網站連結

## 📄 授權

[選擇適當的開源授權]
```

### 7.4 SECURITY.md 範例

```markdown
# 安全政策

## 支援的版本

目前支援的版本...

## 回報安全漏洞

如果您發現安全漏洞，請透過以下方式回報：

- Email: security@example.com
- GitHub Issues（非敏感問題）

## 安全措施

本專案採用以下安全措施：

- Content Security Policy
- 無外部 JavaScript 相依
- 無伺服器端資料處理
- 所有資料僅在客戶端處理
```

---

## 8. 監控與持續維護

### 8.1 設定 Google Search Console

1. 前往 [Google Search Console](https://search.google.com/search-console/)
2. 新增並驗證網站
3. 啟用電子郵件通知
4. 定期檢查「安全性問題」報告

### 8.2 定期檢查項目

```
每週檢查：
├── Google Search Console 安全性報告
├── 網站是否正常運作
└── 瀏覽器控制台是否有錯誤

每月檢查：
├── 相依套件是否需要更新
├── 外部連結是否仍然有效
└── 隱私權政策是否需要更新

每季檢查：
├── 全面安全性審查
├── 程式碼審查
└── 使用者回饋檢視
```

### 8.3 使用 Google Safe Browsing 檢查工具

檢查網站狀態：

```
https://transparencyreport.google.com/safe-browsing/search?url=你的網址
```

---

## 9. 被標記後的處理流程

### 9.1 處理流程圖

```
網站被標記為危險
        │
        ▼
┌───────────────────┐
│ 1. 確認問題類型    │
│    (惡意軟體/釣魚  │
│     /社交工程)     │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ 2. 檢查網站是否    │
│    真的有問題      │
└───────────────────┘
        │
    ┌───┴───┐
    │       │
    ▼       ▼
  有問題   誤判
    │       │
    ▼       ▼
修復問題  準備申訴
    │       │
    └───┬───┘
        │
        ▼
┌───────────────────┐
│ 3. 透過 Search    │
│    Console 提出    │
│    審查請求        │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ 4. 同時提交        │
│    Safe Browsing  │
│    誤判報告        │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ 5. 等待審查        │
│    (數天至數週)    │
└───────────────────┘
```

### 9.2 審查請求範本（英文）

```
Subject: False Positive Report - Academic Research Tool

Website URL: https://example.github.io/project/

This website is an educational research tool developed for academic purposes
at [Institution Name].

Website Purpose:
- [具體說明網站功能]
- [目標使用者]
- [研究目的]

Data Handling:
- NO personal information is collected
- All data processing occurs locally in the browser
- [說明任何下載功能]

The source code is publicly available at: [GitHub URL]

I kindly request a review to remove the incorrect classification.

Institution: [機構名稱]
Contact: [聯絡方式]
```

### 9.3 審查時程

| 問題類型 | 預估審查時間 |
| -------- | ------------ |
| 網路釣魚 | 約 1 天      |
| 惡意軟體 | 數天         |
| 被駭網站 | 數週         |
| 誤判申訴 | 數天至數週   |

---

## 10. 檢查清單

### 10.1 網站上線前檢查

```
□ 網站內容
  □ 首頁有清楚的網站用途說明
  □ 有完整的隱私權政策頁面
  □ 有機構/作者資訊
  □ 有聯絡方式

□ Meta 標籤
  □ description - 網站說明
  □ author - 作者/機構
  □ keywords - 關鍵字
  □ og:title, og:description - Open Graph

□ 安全性設定
  □ Content Security Policy
  □ X-Frame-Options（如需要）
  □ HTTPS 啟用（GitHub Pages 自動）

□ 程式碼品質
  □ 沒有混淆或編碼的程式碼
  □ 沒有 eval() 或動態程式碼執行
  □ 所有函數和變數有描述性命名
  □ 有適當的註解說明

□ 下載功能（如有）
  □ 必須由使用者主動觸發
  □ 下載內容有清楚說明
  □ 只下載純文字檔案（非可執行檔）
  □ 不從外部來源下載

□ GitHub 專案
  □ README.md 有完整說明
  □ 程式碼是公開的
  □ 有適當的 LICENSE
```

### 10.2 上線後監控

```
□ 註冊 Google Search Console
□ 驗證網站所有權
□ 啟用電子郵件通知
□ 定期檢查安全性報告
□ 測試網站在各瀏覽器的顯示
```

---

## 參考資源

### 官方文件

- [Google Safe Browsing](https://safebrowsing.google.com/)
- [Search Console 安全性問題說明](https://support.google.com/webmasters/answer/9044101)
- [社交工程（網路釣魚與欺騙網站）](https://developers.google.com/search/docs/monitor-debug/security/social-engineering)
- [Safe Browsing 誤判回報](https://safebrowsing.google.com/safebrowsing/report_error/)

### 安全性最佳實踐

- [Content Security Policy (CSP) - MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)

### 程式碼良好實踐

參考專案內「程式碼良好實踐完整指南.md」的以下章節：

- 第 1 章：命名規範
- 第 2 章：函數設計原則
- 第 4 章：錯誤處理
- 第 5 章：註解與文件
- 第 9 章：安全性考量

---

## 版本紀錄

| 版本 | 日期       | 說明     |
| ---- | ---------- | -------- |
| 1.0  | 2026-01-04 | 初版發布 |

---

_本指南由小摩研究助理整理，結合 Google 官方文件、OWASP 安全建議，以及「程式碼良好實踐完整指南」編寫。_
