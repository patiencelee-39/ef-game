# 📋 群組比較分析器 - 完整程式碼設計文件

## 🎯 設計目標

建立一個單一 HTML 檔案，能夠：
1. 接受多個 CSV 檔案上傳
2. 自動依參與者分組
3. 提供三種分析模式
4. 生成互動式圖表
5. 完全在瀏覽器端運作（無需伺服器）

---

## 🏗️ 整體架構

```
csv_group_comparison_analyzer.html
│
├─ HTML 結構
│  ├─ 標題區
│  ├─ 上傳區
│  ├─ 預覽區
│  └─ 圖表區
│
├─ CSS 樣式
│  ├─ 漸層背景
│  ├─ 卡片設計
│  └─ 響應式布局
│
└─ JavaScript 邏輯
   ├─ 檔案處理模組
   ├─ 資料分組模組
   ├─ 圖表生成模組
   └─ 模式切換模組
```

---

## 📐 核心設計模式

### 1. 模組化架構

```javascript
// 資料層
let allFilesData = [];        // 儲存所有檔案原始資料
let participantsData = {};    // 依參與者分組的資料
let charts = {};              // 圖表物件管理
let currentMode = 'cross-person'; // 當前模式

// 功能模組
- handleFileSelect()          // 檔案上傳處理
- showPreview()               // 預覽顯示
- generateAnalysis()          // 分析生成
- generateCrossPersonAnalysis()    // 跨人比較
- generateIndividualProgressAnalysis() // 個人進步
- generateComprehensiveAnalysis()  // 綜合分析
```

---

## 🎨 HTML 結構設計

### 區塊 1：標題區
```html
<div class="header">
    <h1>📊 執行功能訓練遊戲</h1>
    <p>群組比較分析器 v4.0</p>
</div>
```

**設計原則：**
- 使用半透明背景 (`rgba(255,255,255,0.1)`)
- 毛玻璃效果 (`backdrop-filter: blur(10px)`)
- 置中對齊

---

### 區塊 2：上傳區
```html
<div class="upload-section">
    <div class="instructions">
        使用說明（列表）
    </div>
    
    <div class="upload-area">
        上傳介面
        <input type="file" multiple>
    </div>
    
    <div class="loading">
        載入動畫
    </div>
</div>
```

**關鍵設計：**
- `<input type="file" multiple>` - 支援多檔案選擇
- 虛線邊框 (`border: 3px dashed`)
- 拖曳上傳支援（未實作但可擴充）

---

### 區塊 3：預覽區
```html
<div class="preview-section">
    <h2>📈 資料概覽</h2>
    
    <!-- 統計資訊 -->
    <p>已載入 <span id="totalFiles">0</span> 個檔案</p>
    
    <!-- 參與者分組顯示 -->
    <div id="participantsInfo"></div>
    
    <!-- 模式切換按鈕 -->
    <div class="comparison-mode">
        <button class="mode-btn">👥 跨人比較</button>
        <button class="mode-btn">📈 個人進步</button>
        <button class="mode-btn">🎯 綜合分析</button>
    </div>
    
    <!-- 動作按鈕 -->
    <button onclick="generateAnalysis()">生成分析</button>
</div>
```

**動態生成內容：**
```javascript
// 為每位參與者生成一個群組卡片
<div class="participant-group">
    <div class="participant-header" style="background: ${color};">
        <h3>👤 ${participant}</h3>
        <p>共 ${tests.length} 次測試</p>
    </div>
    
    <!-- 每次測試生成一張卡片 -->
    <div class="test-card">
        測試資訊 + 正確率 + 反應時間
    </div>
</div>
```

---

### 區塊 4：圖表區
```html
<div class="charts-section">
    <!-- 動態插入圖表容器 -->
    <!-- 每個圖表一個 .chart-container -->
</div>
```

**動態生成圖表容器：**
```javascript
function addChartContainer(id, title) {
    const html = `
        <div class="chart-container">
            <h2>${title}</h2>
            <canvas id="${id}"></canvas>
        </div>
    `;
    document.getElementById('chartsSection').innerHTML += html;
}
```

---

## 🎨 CSS 設計重點

### 顏色系統
```css
:root {
    --primary-color: #667eea;   /* 主色調：藍紫色 */
    --success-color: #4CAF50;   /* 成功：綠色 */
    --error-color: #f44336;     /* 錯誤：紅色 */
}

/* 漸層背景 */
body {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 參與者顏色系統 */
const participantColors = [
    '#4CAF50',  // 綠色
    '#2196F3',  // 藍色
    '#FF9800',  // 橘色
    '#9C27B0',  // 紫色
    '#F44336'   // 紅色
];
```

---

### 卡片設計
```css
.upload-section {
    background: white;
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    padding: 40px;
}

/* 毛玻璃效果 */
.header {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
}

/* 參與者群組 */
.participant-group {
    background: #f8f9fa;
    border-radius: 15px;
    padding: 20px;
}

/* 測試卡片 */
.test-card {
    background: white;
    border: 2px solid #667eea;
    border-radius: 10px;
    display: flex;
    justify-content: space-between;
}
```

---

### 響應式設計
```css
.container {
    max-width: 1600px;  /* 大螢幕 */
    margin: 0 auto;
}

.stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
}

/* 自動適應不同螢幕寬度 */
```

---

## 🔧 JavaScript 核心邏輯

### 模組 1：檔案上傳處理

```javascript
function handleFileSelect(event) {
    const files = event.target.files;
    
    // 1. 驗證檔案
    if (!files || files.length === 0) return;
    
    // 2. 顯示載入動畫
    document.getElementById('loading').style.display = 'block';
    
    // 3. 初始化資料結構
    allFilesData = [];
    participantsData = {};
    let filesProcessed = 0;
    
    // 4. 使用 PapaParse 解析每個檔案
    Array.from(files).forEach(file => {
        Papa.parse(file, {
            header: true,           // 第一行當作欄位名稱
            skipEmptyLines: true,   // 跳過空白行
            complete: function(results) {
                // 5. 提取參與者資訊
                const participant = results.data[0]?.Participant || '未知';
                
                // 6. 儲存到 allFilesData
                allFilesData.push({
                    fileName: file.name,
                    data: results.data,
                    participant: participant,
                    timestamp: results.data[0]?.Timestamp || '未知'
                });
                
                // 7. 依參與者分組
                if (!participantsData[participant]) {
                    participantsData[participant] = [];
                }
                participantsData[participant].push({
                    fileName: file.name,
                    data: results.data,
                    timestamp: results.data[0]?.Timestamp || '未知'
                });
                
                // 8. 檢查是否所有檔案都處理完
                filesProcessed++;
                if (filesProcessed === files.length) {
                    document.getElementById('loading').style.display = 'none';
                    showPreview();  // 顯示預覽
                }
            }
        });
    });
}
```

**關鍵技術：**
- `Papa.parse()` - CSV 解析庫
- `Array.from(files)` - 將 FileList 轉為陣列
- 異步處理 - 每個檔案獨立解析
- 計數機制 - 追蹤完成進度

---

### 模組 2：資料分組顯示

```javascript
function showPreview() {
    // 1. 更新統計數字
    document.getElementById('totalFiles').textContent = allFilesData.length;
    document.getElementById('totalParticipants').textContent = 
        Object.keys(participantsData).length;
    
    // 2. 生成每位參與者的群組卡片
    let html = '';
    const participantColors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0'];
    let colorIndex = 0;
    
    // 3. 迭代每位參與者
    for (const [participant, tests] of Object.entries(participantsData)) {
        const color = participantColors[colorIndex % participantColors.length];
        colorIndex++;
        
        // 4. 生成參與者標題
        html += `
            <div class="participant-group">
                <div class="participant-header" style="background: ${color};">
                    <h3>👤 ${participant}</h3>
                    <p>共 ${tests.length} 次測試</p>
                </div>
        `;
        
        // 5. 生成每次測試的卡片
        tests.forEach((test, index) => {
            // 計算正確率
            const regular = test.data.filter(row => 
                row.Round && !row.Round.startsWith('WM')
            );
            const correct = regular.filter(row => row.Correct === 'yes').length;
            const accuracy = (correct / regular.length * 100).toFixed(1);
            
            // 計算平均反應時間
            const rtData = regular
                .map(row => parseFloat(row['RT(ms)']))
                .filter(rt => rt > 0);
            const avgRT = rtData.length > 0 ? 
                Math.round(rtData.reduce((sum, rt) => sum + rt, 0) / rtData.length) : 0;
            
            // 生成測試卡片
            html += `
                <div class="test-card">
                    <div>
                        <div style="font-weight: bold;">
                            測試 ${index + 1}：${test.fileName}
                        </div>
                        <div style="color: #666;">
                            🕒 ${test.timestamp}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 1.5em; color: ${color};">
                            ${accuracy}%
                        </div>
                        <div style="color: #666;">
                            平均 ${avgRT} ms
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
    }
    
    // 6. 插入 HTML
    document.getElementById('participantsInfo').innerHTML = html;
    
    // 7. 顯示預覽區
    document.getElementById('previewSection').style.display = 'block';
}
```

**設計亮點：**
- 顏色循環分配
- 即時統計計算
- 動態 HTML 生成
- 視覺化層級結構

---

### 模組 3：模式切換

```javascript
let currentMode = 'cross-person';  // 預設模式

function setComparisonMode(mode) {
    // 1. 更新當前模式
    currentMode = mode;
    
    // 2. 更新按鈕樣式
    document.querySelectorAll('.mode-btn').forEach(btn => 
        btn.classList.remove('active')
    );
    document.getElementById(`mode-${mode}`).classList.add('active');
}
```

**CSS 配合：**
```css
.mode-btn {
    padding: 10px 20px;
    border: 2px solid #667eea;
    background: white;
    color: #667eea;
}

.mode-btn.active {
    background: #667eea;
    color: white;
}
```

---

### 模組 4：圖表生成（跨人比較）

```javascript
function generateCrossPersonAnalysis() {
    const participants = Object.keys(participantsData);
    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336'];
    
    // 1. 為每位參與者取最新一次測試
    const latestTests = participants.map(p => {
        const tests = participantsData[p];
        return tests[tests.length - 1];
    });
    
    // === 圖表 1：正確率比較 ===
    addChartContainer('chart1', '🎯 各參與者正確率比較');
    
    // 計算每位參與者的正確率
    const accuracies = latestTests.map(test => {
        const regular = test.data.filter(row => 
            row.Round && !row.Round.startsWith('WM')
        );
        const correct = regular.filter(row => row.Correct === 'yes').length;
        return (correct / regular.length * 100);
    });
    
    // 使用 Chart.js 建立圖表
    charts.chart1 = new Chart(document.getElementById('chart1'), {
        type: 'bar',  // 長條圖
        data: {
            labels: participants,  // X 軸標籤
            datasets: [{
                label: '正確率 (%)',
                data: accuracies,
                backgroundColor: colors.slice(0, participants.length)
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
    
    // === 圖表 2：反應時間比較 ===
    addChartContainer('chart2', '⏱️ 各參與者平均反應時間比較');
    
    const avgRTs = latestTests.map(test => {
        const regular = test.data.filter(row => 
            row.Round && !row.Round.startsWith('WM')
        );
        const rtData = regular
            .map(row => parseFloat(row['RT(ms)']))
            .filter(rt => rt > 0);
        return rtData.reduce((sum, rt) => sum + rt, 0) / rtData.length;
    });
    
    charts.chart2 = new Chart(document.getElementById('chart2'), {
        type: 'bar',
        data: {
            labels: participants,
            datasets: [{
                label: '平均反應時間 (ms)',
                data: avgRTs,
                backgroundColor: colors.slice(0, participants.length)
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
    
    // === 圖表 3：工作記憶雷達圖 ===
    addChartContainer('chart3', '🧠 各參與者工作記憶平均正確率');
    
    const wmAvgs = latestTests.map(test => {
        const wmTrials = test.data.filter(row => 
            row.Round && row.Round.startsWith('WM')
        );
        let totalAccuracy = 0;
        
        wmTrials.forEach(trial => {
            const correct = trial.Stimulus.split('-');
            const user = trial.InputKey.split('-');
            let correctCount = 0;
            for (let i = 0; i < correct.length; i++) {
                if (correct[i] === user[i]) correctCount++;
            }
            totalAccuracy += (correctCount / correct.length * 100);
        });
        
        return wmTrials.length > 0 ? totalAccuracy / wmTrials.length : 0;
    });
    
    charts.chart3 = new Chart(document.getElementById('chart3'), {
        type: 'radar',  // 雷達圖
        data: {
            labels: participants,
            datasets: [{
                label: 'WM 平均正確率 (%)',
                data: wmAvgs,
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                borderColor: '#667eea',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}
```

**Chart.js 核心概念：**
```javascript
new Chart(canvas元素, {
    type: '圖表類型',  // bar, line, radar, pie...
    data: {
        labels: ['X軸標籤'],
        datasets: [{
            label: '資料集名稱',
            data: [數值陣列],
            backgroundColor: '背景色',
            borderColor: '邊框色'
        }]
    },
    options: {
        responsive: true,  // 響應式
        scales: {          // 座標軸設定
            y: { beginAtZero: true, max: 100 }
        }
    }
});
```

---

### 模組 5：個人進步分析

```javascript
function generateIndividualProgressAnalysis() {
    const participants = Object.keys(participantsData);
    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0'];
    
    // 為每位參與者生成一個進步圖表
    participants.forEach((participant, pIndex) => {
        const tests = participantsData[participant];
        
        // 至少要有 2 次測試才能看進步
        if (tests.length < 2) return;
        
        const color = colors[pIndex % colors.length];
        const chartId = `progress-${pIndex}`;
        
        // 建立圖表容器
        addChartContainer(chartId, `📈 ${participant} - 測試進步趨勢`);
        
        // 準備 X 軸標籤
        const labels = tests.map((t, i) => `測試 ${i + 1}`);
        
        // 計算每次測試的正確率
        const accuracies = tests.map(test => {
            const regular = test.data.filter(row => 
                row.Round && !row.Round.startsWith('WM')
            );
            const correct = regular.filter(row => row.Correct === 'yes').length;
            return (correct / regular.length * 100);
        });
        
        // 計算每次測試的平均反應時間
        const avgRTs = tests.map(test => {
            const regular = test.data.filter(row => 
                row.Round && !row.Round.startsWith('WM')
            );
            const rtData = regular
                .map(row => parseFloat(row['RT(ms)']))
                .filter(rt => rt > 0);
            return rtData.reduce((sum, rt) => sum + rt, 0) / rtData.length;
        });
        
        // 建立雙軸圖表
        charts[chartId] = new Chart(document.getElementById(chartId), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '正確率 (%)',
                        data: accuracies,
                        borderColor: color,
                        backgroundColor: `${color}33`,
                        yAxisID: 'y',      // 左側 Y 軸
                        borderWidth: 3
                    },
                    {
                        label: '反應時間 (ms)',
                        data: avgRTs,
                        borderColor: '#f44336',
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        yAxisID: 'y1',     // 右側 Y 軸
                        borderWidth: 2,
                        borderDash: [5, 5]  // 虛線
                    }
                ]
            },
            options: {
                responsive: true,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                scales: {
                    y: {  // 左側 Y 軸 - 正確率
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: '正確率 (%)'
                        }
                    },
                    y1: {  // 右側 Y 軸 - 反應時間
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '反應時間 (ms)'
                        },
                        grid: {
                            drawOnChartArea: false  // 不繪製網格線
                        }
                    }
                }
            }
        });
    });
}
```

**雙軸圖表原理：**
```
左側 Y 軸 (y)              右側 Y 軸 (y1)
   100% │                      │ 100ms
        │    ●───●             │   ●
    80% │   ╱                80│  ╱
        │  ╱                   │ ╱
    60% │                    60│●
        └──────────────        └──────
         測試1  測試2            測試1  測試2
```

---

### 模組 6：綜合分析

```javascript
function generateComprehensiveAnalysis() {
    // === 圖表 1：所有測試正確率分布 ===
    addChartContainer('comp1', '📊 所有測試正確率分布');
    
    const allTests = [];
    const allLabels = [];
    const allColors = [];
    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0'];
    
    // 迭代所有參與者和測試
    Object.keys(participantsData).forEach((participant, pIndex) => {
        const tests = participantsData[participant];
        tests.forEach((test, tIndex) => {
            // 計算正確率
            const regular = test.data.filter(row => 
                row.Round && !row.Round.startsWith('WM')
            );
            const correct = regular.filter(row => row.Correct === 'yes').length;
            const accuracy = (correct / regular.length * 100);
            
            allTests.push(accuracy);
            allLabels.push(`${participant}-T${tIndex + 1}`);
            allColors.push(colors[pIndex % colors.length]);
        });
    });
    
    charts.comp1 = new Chart(document.getElementById('comp1'), {
        type: 'bar',
        data: {
            labels: allLabels,
            datasets: [{
                label: '正確率 (%)',
                data: allTests,
                backgroundColor: allColors
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true, max: 100 } }
        }
    });
    
    // === 圖表 2：各回合平均表現 ===
    addChartContainer('comp2', '🎯 各回合平均正確率（所有參與者）');
    
    const roundData = [];
    for (let round = 1; round <= 4; round++) {
        let totalAccuracy = 0;
        let count = 0;
        
        // 計算所有測試在該回合的平均正確率
        allFilesData.forEach(fileData => {
            const roundTrials = fileData.data.filter(row => 
                parseInt(row.Round) === round
            );
            if (roundTrials.length > 0) {
                const correct = roundTrials.filter(row => 
                    row.Correct === 'yes'
                ).length;
                totalAccuracy += (correct / roundTrials.length * 100);
                count++;
            }
        });
        
        roundData.push(count > 0 ? totalAccuracy / count : 0);
    }
    
    charts.comp2 = new Chart(document.getElementById('comp2'), {
        type: 'line',
        data: {
            labels: ['回合 1', '回合 2', '回合 3', '回合 4'],
            datasets: [{
                label: '平均正確率 (%)',
                data: roundData,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                borderWidth: 3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true, max: 100 } }
        }
    });
    
    // === 圖表 3：工作記憶詳細比較（多折線） ===
    addChartContainer('comp3', '🧠 工作記憶各測試詳細比較');
    
    const wmDatasets = [];
    
    // 為每個 WM 測試建立一條線
    for (let wmNum = 1; wmNum <= 4; wmNum++) {
        const wmData = [];
        
        allFilesData.forEach(fileData => {
            const wmTrial = fileData.data.find(row => 
                row.Round === `WM${wmNum}`
            );
            
            if (wmTrial) {
                const correct = wmTrial.Stimulus.split('-');
                const user = wmTrial.InputKey.split('-');
                let correctCount = 0;
                for (let i = 0; i < correct.length; i++) {
                    if (correct[i] === user[i]) correctCount++;
                }
                wmData.push((correctCount / correct.length * 100));
            }
        });
        
        wmDatasets.push({
            label: `WM${wmNum}`,
            data: wmData,
            borderColor: colors[wmNum - 1],
            backgroundColor: colors[wmNum - 1],
            borderWidth: 2
        });
    }
    
    charts.comp3 = new Chart(document.getElementById('comp3'), {
        type: 'line',
        data: {
            labels: allLabels,
            datasets: wmDatasets
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true, max: 100 } }
        }
    });
}
```

---

## 🔍 關鍵技術細節

### 1. PapaParse CSV 解析

```javascript
Papa.parse(file, {
    header: true,           // 第一行為欄位名稱
    skipEmptyLines: true,   // 跳過空白行
    complete: function(results) {
        // results.data 是解析後的陣列
        // 每個元素是一個物件，key 為欄位名稱
    },
    error: function(error) {
        console.error('解析錯誤', error);
    }
});
```

**解析結果範例：**
```javascript
[
    {
        Participant: "01阿摩",
        Round: "1",
        Trial: "1",
        Stimulus: "cat",
        Correct: "no",
        "RT(ms)": "39"
    },
    // ... 更多資料
]
```

---

### 2. 資料過濾與計算

```javascript
// 過濾一般試題（排除 WM）
const regular = data.filter(row => 
    row.Round && !row.Round.startsWith('WM')
);

// 計算正確率
const correct = regular.filter(row => row.Correct === 'yes').length;
const accuracy = (correct / regular.length * 100);

// 計算平均反應時間
const rtData = regular
    .map(row => parseFloat(row['RT(ms)']))  // 轉換為數字
    .filter(rt => rt > 0);                  // 排除 0
const avgRT = rtData.reduce((sum, rt) => sum + rt, 0) / rtData.length;
```

---

### 3. Chart.js 圖表類型

```javascript
// 長條圖（Bar Chart）
{ type: 'bar' }
// 用於比較不同類別

// 折線圖（Line Chart）
{ type: 'line' }
// 用於顯示趨勢變化

// 雷達圖（Radar Chart）
{ type: 'radar' }
// 用於多維度比較
```

---

### 4. 工作記憶位置比對

```javascript
// 計算位置正確率
const correct = trial.Stimulus.split('-');  // ['cheese', 'cheese', 'cat']
const user = trial.InputKey.split('-');     // ['cheese', 'cat', 'cheese']

let correctCount = 0;
for (let i = 0; i < correct.length; i++) {
    if (correct[i] === user[i]) {
        correctCount++;
    }
}

const accuracy = (correctCount / correct.length * 100);
// 範例：1/3 = 33.3%
```

---

## 📦 完整檔案結構

```
csv_group_comparison_analyzer.html
│
├─ <!DOCTYPE html>
├─ <html lang="zh-TW">
│
├─ <head>
│  ├─ <meta charset="UTF-8">
│  ├─ <title>群組比較分析器</title>
│  ├─ <script src="chart.js">
│  ├─ <script src="papaparse.js">
│  └─ <style> ... CSS ... </style>
│
├─ <body>
│  ├─ <div class="container">
│  │  ├─ <div class="header">
│  │  ├─ <div class="upload-section">
│  │  ├─ <div class="preview-section">
│  │  └─ <div class="charts-section">
│  │
│  └─ <script>
│     ├─ // 全域變數
│     ├─ // 檔案處理
│     ├─ // 預覽顯示
│     ├─ // 模式切換
│     ├─ // 圖表生成（3種模式）
│     └─ // 輔助函數
│
└─ </html>
```

---

## 🎯 設計優勢

### 1. 單一檔案設計 ✅
- 不需要伺服器
- 不需要安裝
- 雙擊即可使用

### 2. 完全本地處理 ✅
- 資料不上傳
- 隱私安全
- 速度快

### 3. 模組化架構 ✅
- 程式碼清晰
- 易於維護
- 易於擴充

### 4. 響應式設計 ✅
- 適應各種螢幕
- 電腦/平板/手機

### 5. 視覺化優先 ✅
- 直觀的圖表
- 清晰的配色
- 專業的設計

---

## 🔧 可擴充功能

### 1. 匯出功能
```javascript
function exportResults() {
    // 匯出 PDF 報告
    // 使用 jsPDF 庫
}
```

### 2. 資料篩選
```javascript
function filterByDate(startDate, endDate) {
    // 依日期範圍篩選
}

function filterByParticipant(names) {
    // 依參與者篩選
}
```

### 3. 統計測試
```javascript
function performTTest(group1, group2) {
    // t 檢定
    // 使用 simple-statistics 庫
}
```

### 4. 客製化圖表
```javascript
function customizeChart(chartId, options) {
    // 自訂顏色、字型、樣式
}
```

---

## ✅ 總結

### 核心技術棧
- HTML5
- CSS3（Flexbox + Grid）
- JavaScript（ES6+）
- Chart.js 4.4.1
- PapaParse 5.4.1

### 設計模式
- 模組化設計
- 事件驅動
- 資料驅動視圖
- 異步處理

### 檔案大小
約 30-40 KB（未壓縮）

### 瀏覽器支援
- Chrome ✅
- Edge ✅
- Firefox ✅
- Safari ✅

---

**這就是完整的程式碼設計！**  
**所有邏輯都包含在單一 HTML 檔案中！**
