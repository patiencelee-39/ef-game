# 項目反應理論(IRT)應用於認知訓練遊戲設計
## Item Response Theory for Cognitive Training Game Design

**編制日期**: 2026年01月19日  
**應用情境**: 執行功能訓練遊戲題目設計與適性調整  
**目標**: 建立難度分級系統,實現個別化訓練

---

## 📌 核心概念速覽

### **什麼是IRT?**
項目反應理論(Item Response Theory, IRT)是一套**心理計量學**理論,用於:
1. 分析測驗題目的**難度(difficulty)**與**鑑別度(discrimination)**
2. 估計受試者的**潛在特質(latent trait)**能力水準
3. 實現**電腦化適性測驗(Computerized Adaptive Testing, CAT)**

### **為何你的遊戲需要IRT?**
✅ **個別化訓練**: 自動調整題目難度符合兒童能力  
✅ **精準測量**: 比傳統正確率更準確地評估執行功能  
✅ **避免天花板/地板效應**: 不會太簡單或太難  
✅ **訓練效率**: 總是呈現「恰到好處」的挑戰

---

## 📚 關鍵文獻(按重要性排序)

### ⭐⭐⭐ **必讀核心文獻**

**1. Reise & Waller (2009) - IRT臨床應用**
**Reise, S. P., & Waller, N. G. (2009).** Item response theory and clinical measurement. *Annual Review of Clinical Psychology, 5*, 27-48. https://doi.org/10.1146/annurev.clinpsy.032408.153553

**關鍵重點**:
- IRT提供比古典測驗理論(CTT)更精確的測量
- **樣本獨立性**: IRT參數不受特定樣本影響
- **適應性測驗**: 可依個體能力選題

**應用價值**: ⭐⭐⭐  
提供IRT用於臨床評估的理論基礎,直接適用於特殊教育情境

---

**2. Embretson & Reise (2000) - IRT入門教科書**
**Embretson, S. E., & Reise, S. P. (2000).** *Item response theory for psychologists*. Lawrence Erlbaum Associates.

**內容涵蓋**:
- IRT三參數模型(3PL):難度、鑑別度、猜測
- 題目特徵曲線(Item Characteristic Curve, ICC)
- 電腦化適性測驗設計

**應用價值**: ⭐⭐⭐  
最佳入門書籍,提供實作範例

---

**3. van der Linden & Glas (2010) - CAT設計聖經**
**van der Linden, W. J., & Glas, C. A. W. (Eds.). (2010).** *Elements of adaptive testing*. Springer.

**關鍵章節**:
- 題目選擇演算法(Item Selection Algorithms)
- 能力估計方法(Ability Estimation)
- 終止規則(Stopping Rules)

**應用價值**: ⭐⭐⭐  
CAT實作的技術細節,提供演算法pseudocode

---

### ⭐⭐ **高度相關文獻**

**4. Gibbons et al. (2012, 2014) - 憂鬱/焦慮CAT**
**Gibbons, R. D., Weiss, D. J., et al. (2012).** Development of a computerized adaptive test for depression. *Archives of General Psychiatry, 69*(11), 1104-1112. https://doi.org/10.1001/archgenpsychiatry.2012.14

**研究設計**:
- 開發CAT憂鬱量表(CAT-Depression Inventory)
- 使用雙因子IRT模型(Bifactor Model)
- 平均僅需**12題**即可達到傳統量表精確度

**對你的啟示**:
- 認知訓練遊戲可借鑑CAT選題策略
- 雙因子模型可分離「一般執行功能」與「特定成分」

---

**5. Moore et al. (2017) - 認知評估CAT**
**Moore, T. M., Reise, S. P., Gur, R. E., Hakonarson, H., & Gur, R. C. (2015).** Psychometric properties of the Penn Computerized Neurocognitive Battery. *Neuropsychology, 29*(2), 235-246. https://doi.org/10.1037/neu0000093

**測驗內容**: 包含執行功能/工作記憶評估  
**CAT實作**: 自適應難度調整  
**對你的啟示**: 認知評估可成功電腦化+適性化

---

## 🎯 IRT三參數模型(3PL Model)

### **數學公式**(不用怕,有白話解釋!)

```
P(θ) = c + (1-c) / [1 + exp(-a(θ - b))]

其中:
θ (theta) = 受試者能力水準
a = 鑑別度參數(discrimination)
b = 難度參數(difficulty)  
c = 猜測參數(guessing)
P(θ) = 正確作答機率
```

### **白話解釋**

| 參數 | 意義 | 認知訓練遊戲情境 |
|------|------|-----------------|
| **θ (能力)** | 兒童的執行功能水準 | 透過前幾題估計,範圍通常-3到+3 |
| **b (難度)** | 題目有多難 | 刺激呈現時間、規則複雜度 |
| **a (鑑別度)** | 題目區分能力強弱的效果 | 高鑑別度題目=高/低能力兒童表現差異大 |
| **c (猜測)** | 亂猜答對的機率 | Go/No-Go是0.5(二選一),DCCS可設0 |

---

## 💻 實作步驟(分階段)

### **階段1:題目參數標定**(現在不做,但要理解)

這步驟需要**大量資料**(通常500+兒童),暫時可**先用預設值**。

```javascript
// 暫時使用預設參數(簡化IRT)
const itemBank = [
  // Level 1: 簡單題(能力θ = -1附近)
  {id: 1, b: -1.5, a: 1.0, c: 0.5, stimulus: "1000ms", rule: "simple"},
  {id: 2, b: -1.0, a: 1.2, c: 0.5, stimulus: "1200ms", rule: "simple"},
  
  // Level 2: 中等題(θ = 0附近)
  {id: 3, b: 0.0, a: 1.5, c: 0.5, stimulus: "800ms", rule: "switch"},
  {id: 4, b: 0.5, a: 1.3, c: 0.5, stimulus: "600ms", rule: "switch"},
  
  // Level 3: 困難題(θ = +1附近)
  {id: 5, b: 1.0, a: 1.4, c: 0, stimulus: "500ms", rule: "border"},
  {id: 6, b: 1.5, a: 1.2, c: 0, stimulus: "400ms", rule: "reverse"}
];
```

---

### **階段2:能力估計演算法**(你要實作的)

#### **方法1:EAP估計(推薦初學者)**

Expected A Posteriori (EAP)最簡單,使用貝氏估計。

```javascript
// 簡化版EAP能力估計
function estimateAbility(responses, items) {
  const thetaRange = [-3, -2, -1, 0, 1, 2, 3]; // 離散化能力水準
  let maxPosterior = -Infinity;
  let estimatedTheta = 0;
  
  for (const theta of thetaRange) {
    let likelihood = 1;
    
    // 計算似然(likelihood)
    for (let i = 0; i < responses.length; i++) {
      const prob = calculateProbability(theta, items[i]);
      likelihood *= responses[i] === 1 ? prob : (1 - prob);
    }
    
    // 加入先驗(prior): 假設能力呈常態分佈N(0,1)
    const prior = Math.exp(-0.5 * theta * theta) / Math.sqrt(2 * Math.PI);
    const posterior = likelihood * prior;
    
    if (posterior > maxPosterior) {
      maxPosterior = posterior;
      estimatedTheta = theta;
    }
  }
  
  return estimatedTheta;
}

// 計算作答正確機率(3PL模型)
function calculateProbability(theta, item) {
  const {a, b, c} = item;
  return c + (1 - c) / (1 + Math.exp(-a * (theta - b)));
}
```

---

#### **方法2:最大資訊量選題**(選下一題用)

```javascript
// Fisher Information: 題目在某能力水準提供多少資訊
function fisherInformation(theta, item) {
  const prob = calculateProbability(theta, item);
  const {a, c} = item;
  const numerator = a * a * (prob - c) * (prob - c) * (1 - prob);
  const denominator = prob * (1 - c) * (1 - c);
  return numerator / denominator;
}

// 選擇下一題:最大化資訊量
function selectNextItem(currentTheta, itemBank, usedItems) {
  let maxInfo = -Infinity;
  let selectedItem = null;
  
  for (const item of itemBank) {
    // 跳過已用過的題目
    if (usedItems.includes(item.id)) continue;
    
    const info = fisherInformation(currentTheta, item);
    if (info > maxInfo) {
      maxInfo = info;
      selectedItem = item;
    }
  }
  
  return selectedItem;
}
```

---

### **階段3:完整CAT流程**

```javascript
class AdaptiveTrainingGame {
  constructor(itemBank) {
    this.itemBank = itemBank;
    this.responses = [];
    this.usedItems = [];
    this.currentTheta = 0; // 初始能力假設為平均
    this.minItems = 10; // 最少題數
    this.maxItems = 30; // 最多題數
    this.seThreshold = 0.3; // 標準誤門檻
  }
  
  // 開始測驗:先給中等難度題
  start() {
    const initialItem = this.itemBank.find(item => 
      Math.abs(item.b - 0) < 0.5
    );
    return initialItem;
  }
  
  // 記錄作答並更新能力估計
  recordResponse(itemId, isCorrect) {
    const item = this.itemBank.find(i => i.id === itemId);
    this.responses.push(isCorrect ? 1 : 0);
    this.usedItems.push(itemId);
    
    // 更新能力估計(使用EAP)
    this.currentTheta = estimateAbility(
      this.responses, 
      this.usedItems.map(id => this.itemBank.find(i => i.id === id))
    );
  }
  
  // 選擇下一題
  selectNext() {
    return selectNextItem(
      this.currentTheta, 
      this.itemBank, 
      this.usedItems
    );
  }
  
  // 檢查是否結束
  shouldStop() {
    // 條件1:達到最少題數
    if (this.responses.length < this.minItems) return false;
    
    // 條件2:達到最多題數
    if (this.responses.length >= this.maxItems) return true;
    
    // 條件3:標準誤夠小(測量夠精確)
    const se = this.calculateStandardError();
    return se < this.seThreshold;
  }
  
  // 計算測量標準誤
  calculateStandardError() {
    let totalInfo = 0;
    for (const itemId of this.usedItems) {
      const item = this.itemBank.find(i => i.id === itemId);
      totalInfo += fisherInformation(this.currentTheta, item);
    }
    return 1 / Math.sqrt(totalInfo);
  }
  
  // 生成訓練報告
  generateReport() {
    return {
      estimatedAbility: this.currentTheta,
      se: this.calculateStandardError(),
      totalItems: this.responses.length,
      accuracy: this.responses.filter(r => r === 1).length / this.responses.length,
      itemsUsed: this.usedItems
    };
  }
}
```

---

## 🎮 你的遊戲整合範例

### **Go/No-Go遊戲加入IRT**

```javascript
// 定義題庫(以刺激呈現時間定義難度)
const goNoGoItemBank = [
  // 簡單(長時間)
  {id: 1, b: -2.0, a: 1.0, c: 0.5, stimulusDuration: 2000, isi: 1500},
  {id: 2, b: -1.5, a: 1.1, c: .5, stimulusDuration: 1800, isi: 1500},
  {id: 3, b: -1.0, a: 1.2, c: 0.5, stimulusDuration: 1500, isi: 1200},
  
  // 中等
  {id: 4, b: -0.5, a: 1.3, c: 0.5, stimulusDuration: 1200, isi: 1000},
  {id: 5, b: 0.0, a: 1.5, c: 0.5, stimulusDuration: 1000, isi: 800},
  {id: 6, b: 0.5, a: 1.4, c: 0.5, stimulusDuration: 800, isi: 600},
  
  // 困難(短時間+高頻率切換)
  {id: 7, b: 1.0, a: 1.3, c: 0.5, stimulusDuration: 600, isi: 500},
  {id: 8, b: 1.5, a: 1.2, c: 0.5, stimulusDuration: 500, isi: 400},
  {id: 9, b: 2.0, a: 1.0, c: 0.5, stimulusDuration: 400, isi: 300}
];

// 遊戲主流程
const game = new AdaptiveTrainingGame(goNoGoItemBank);

// 第1題:中等難度
let currentItem = game.start();
showStimulus(currentItem.stimulusDuration);

// 兒童作答後
onResponse((isCorrect) => {
  game.recordResponse(currentItem.id, isCorrect);
  
  if (game.shouldStop()) {
    // 結束並生成報告
    const report = game.generateReport();
    showReport(report);
  } else {
    // 選擇下一題(自動調整難度)
    currentItem = game.selectNext();
    showStimulus(currentItem.stimulusDuration);
  }
});
```

---

## 📊 資料記錄格式

### **必須記錄的欄位**

```csv
session_id,child_id,item_id,difficulty_b,discrimination_a,stimulus_duration,response,rt,estimated_theta,se
1,C001,3,-1.0,1.2,1500,1,856,-0.5,0.8
1,C001,5,0.0,1.5,1000,1,723,-0.2,0.6
1,C001,7,1.0,1.3,600,0,1205,0.1,0.5
...
```

---

## 📝 論文引用建議

### **緒論可用**
> 「為實現個別化訓練,本研究採用項目反應理論(Item Response Theory, IRT)設計適性難度調整機制。IRT已廣泛應用於電腦化適性測驗(Reise & Waller, 2009; van der Linden & Glas, 2010),可依兒童能力水準自動選擇最適切難度的訓練項目,避免傳統固定難度訓練的天花板或地板效應。」

### **方法可用**
> 「訓練題目難度參數參考IRT三參數模型設定,包含難度(b)、鑑別度(a)與猜測參數(c)。採用期望後驗(Expected A Posteriori, EAP)方法估計兒童執行功能能力水準,並以最大資訊量準則(Maximum Information Criterion)選擇下一題目(van der Linden & Glas, 2010)。」

---

## ⚠️ 實務建議

### **初期簡化策略**(推薦)
1. **使用固定參數值**: a=1.2, c=0.5(Go/No-Go), 僅調整b(難度)
2. **難度分5級**: b = {-2, -1, 0, 1, 2}
3. **簡單規則**: 連對2題→升級,連錯2題→降級
4. **先不計算θ**: 僅用正確率判斷

### **進階實作**(有資料後)
1. 收集300+兒童資料
2. 使用R語言`mirt`套件標定參數
3. 完整實作EAP+最大資訊量選題

---

## 📚 完整參考文獻(APA 7)

Embretson, S. E., & Reise, S. P. (2000). *Item response theory for psychologists*. Lawrence Erlbaum Associates.

Gibbons, R. D., Weiss, D. J., Pilkonis, P. A., Frank, E., Moore, T., Kim, J. B., & Kupfer, D. J. (2012). Development of a computerized adaptive test for depression. *Archives of General Psychiatry, 69*(11), 1104-1112. https://doi.org/10.1001/archgenpsychiatry.2012.14

Moore, T. M., Reise, S. P., Gur, R. E., Hakonarson, H., & Gur, R. C. (2015). Psychometric properties of the Penn Computerized Neurocognitive Battery. *Neuropsychology, 29*(2), 235-246. https://doi.org/10.1037/neu0000093

Reise, S. P., & Waller, N. G. (2009). Item response theory and clinical measurement. *Annual Review of Clinical Psychology, 5*, 27-48. https://doi.org/10.1146/annurev.clinpsy.032408.153553

van der Linden, W. J., & Glas, C. A. W. (Eds.). (2010). *Elements of adaptive testing*. Springer. https://doi.org/10.1007/978-0-387-85461-8

---

**Token使用統計**:本次對話已使用約 **178,500 tokens** / 剩餘約 **11,500 tokens**

**檔案創建日期**: 2026年01月19日