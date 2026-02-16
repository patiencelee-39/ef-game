# IRT測量模式 + DA訓練模式整合指南
## Integrating IRT (Measurement) with Dynamic Assessment (Training)

**編制日期**: 2026年01月31日  
**核心概念**: IRT用於**測量能力**,DA用於**訓練介入**  
**應用**: 聽障學生執行功能訓練遊戲

---

## 🎯 核心架構圖

```
執行功能訓練遊戲系統
├── 【測量模式】IRT-Based Assessment
│   ├─ 前測(Pre-test): 估計初始能力θ
│   ├─ 適性選題: 最大資訊量選題
│   └─ 後測(Post-test): 評估訓練成效
│
└── 【訓練模式】DA-Based Training
    ├─ 近側發展區(ZPD)定位
    ├─ 中介學習(MLE)鷹架
    ├─ 漸進撤除支持(Fading)
    └─ 後設認知引導
```

---

## 📚 Part 1: IRT測量模式文獻

### **核心文獻**(已在前份文件)
1. **Reise & Waller (2009)** - IRT臨床應用
2. **Embretson & Reise (2000)** - IRT教科書
3. **van der Linden & Glas (2010)** - CAT設計

**測量目的**:
- 精確估計兒童**當前執行功能水準**
- 追蹤訓練前後**能力變化**
- 提供**客觀、可比較的測量**

---

## 📚 Part 2: 動態評量(DA)訓練模式文獻

### ⭐⭐⭐ **DA經典奠基文獻**

---

#### **1. Vygotsky (1978) - ZPD理論基礎**

**Vygotsky, L. S. (1978).** *Mind in society: The development of higher psychological processes*. Harvard University Press.

**核心概念**: **近側發展區(Zone of Proximal Development, ZPD)**
- **定義**: 「兒童獨立表現」與「經協助後表現」之間的差距
- **ZPD三層結構**:
  | 層次 | 名稱 | 特徵 |
  |------|------|------|
  | 下層 | 已掌握區 | 可獨立完成(舒適區) |
  | **中層** | **ZPD** | **需協助可完成(學習區)** ⭐ |
  | 上層 | 挫折區 | 即使協助也無法完成 |

**教育意涵**:
- 訓練應**定位在ZPD**,不應太簡單或太難
- 學習透過**社會互動**與**文化工具**(語言、符號)發生
- 今日的ZPD表現,將成為明日的獨立表現

---

#### **2. Wood, Bruner & Ross (1976) - 鷹架理論**

**Wood, D., Bruner, J. S., & Ross, G. (1976).** The role of tutoring in problem solving. *Journal of Child Psychology and Psychiatry, 17*(2), 89-100. https://doi.org/10.1111/j.1469-7610.1976.tb00381.x

**核心概念**: **Scaffolding(鷹架)**

**鷹架特徵**:
1. **暫時性**: 如建築鷹架,完成後即拆除
2. **適時性**: 需要時提供,不需要時撤除
3. **調整性**: 依學習者能力動態調整
4. **目標性**: 促進獨立自主學習

**鷹架策略**:
- **示範(Modeling)**: 教師先做一次給學生看
- **提示(Prompting)**: 給予引導性問題
- **回饋(Feedback)**: 指出部分正確,給予線索
- **結構化(Structuring)**: 將任務分解為小步驟

---

#### **3. Feuerstein et al. (1979, 2002) - 中介學習經驗(MLE)**

**Feuerstein, R., Rand, Y., & Hoffman, M. B. (1979).** *The dynamic assessment of retarded performers: The Learning Potential Assessment Device*. University Park Press.

**Feuerstein, R., Feuerstein, R. S., & Falik, L. H. (2010).** *Beyond smarter: Mediated learning and the brain's capacity for change*. Teachers College Press.

**理論**: **結構性認知可塑性(Structural Cognitive Modifiability)**
- 認知結構可透過**中介學習經驗(MLE)**改變
- 即使嚴重認知障礙者仍具改變潛能

**MLE三大系統**:

| 系統 | 名稱 | 功能 |
|------|------|------|
| **LPAD** | Learning Propensity Assessment Device | **動態評量**:測試-介入-再測 |
| **FIE** | Feuerstein Instrumental Enrichment | **認知訓練**:14種思考工具 |
| **SME** | Shaping Modifying Environments | **環境塑造**:改變生態系統 |

**MLE核心準則**(12項,最重要5項):
1. **意圖性(Intentionality)**: 教學者有明確教學意圖
2. **超越性(Transcendence)**: 教學超越當下,連結過去未來
3. **意義性(Meaning)**: 賦予學習材料意義與價值
4. **能力感(Competence)**: 建立學習者自信
5. **調節與控制(Regulation)**: 教導自我調節策略

---

### ⭐⭐ **DA實證研究文獻**

---

#### **4. Tzuriel (2001, 2013) - 動態評量綜述**

**Tzuriel, D. (2001).** Dynamic assessment of young children: Educational and intervention perspectives. *Educational Psychology Review, 13*(4), 385-435. https://doi.org/10.1023/A:1009032414088

**Tzuriel, D. (2013).** *Mediated learning and cognitive modifiability*. Springer.

**DA定義**:
> 「動態評量是一種**互動式評估取向**,聚焦於學習者對介入的反應能力,而非僅測量當前表現。」

**DA vs. 靜態測驗**:

| 特徵 | 靜態測驗(IRT) | 動態評量(DA) |
|------|--------------|-------------|
| **目的** | 測量當前能力 | 測量學習潛能 |
| **過程** | 單次施測 | 測試→介入→再測 |
| **焦點** | 產品(結果) | 過程(如何學習) |
| **互動** | 標準化,無互動 | 介入性,高互動 |
| **資訊** | 能力分數θ | 缺陷功能+介入策略 |

**DA對執行功能訓練的價值**:
- 辨識**特定認知缺陷** (如:工作記憶、抑制、認知彈性)
- 發現**學習潛能**,而非僅看當前表現
- 提供**個別化介入策略**

---

#### **5. Lidz & Elliott (2000) - DA實務手冊**

**Lidz, C. S., & Elliott, J. G. (Eds.). (2000).** *Dynamic assessment: Prevailing models and applications*. Elsevier.

**DA應用領域**:
- 學齡前幼兒(Lidz, 2003)
- 腦傷復健(Haywood & Lidz, 2007)
- 第二語言學習
- 特殊教育介入

**DA實施步驟**:
1. **前測(Pre-test)**: 評估基線表現
2. **介入(Intervention)**: MLE鷹架支持
3. **後測(Post-test)**: 評估學習增益
4. **遷移測試(Transfer)**: 評估類化能力

---

## 🔄 Part 3: IRT + DA 整合模型

### **概念整合**

```
訓練遊戲完整流程
┌──────────────────────────────────────┐
│ 【階段1】IRT前測 (5-10題)              │
│ ├─ 目的: 估計初始能力θ₀              │
│ ├─ 方法: EAP估計                     │
│ └─ 輸出: θ₀ = -0.5 (假設)           │
└──────────────────────────────────────┘
            ↓
┌──────────────────────────────────────┐
│ 【階段2】DA訓練 (20-30題)              │
│ ├─ 定位ZPD: 難度b ≈ θ₀ ± 0.5        │
│ ├─ MLE鷹架:                          │
│ │  ├─ Level 1: 完整提示+示範         │
│ │  ├─ Level 2: 部分提示             │
│ │  ├─ Level 3: 僅錯誤回饋           │
│ │  └─ Level 4: 完全獨立             │
│ └─ 漸進撤除: 依表現動態調整          │
└──────────────────────────────────────┘
            ↓
┌──────────────────────────────────────┐
│ 【階段3】IRT後測 (5-10題)              │
│ ├─ 目的: 評估訓練成效                │
│ ├─ 方法: 重新估計θ₁                 │
│ └─ 輸出: Δθ = θ₁ - θ₀ = +0.8      │
└──────────────────────────────────────┘
```

---

### **關鍵設計決策**

#### **Q1: 如何用IRT定位ZPD?**
**A**: ZPD = [θ - 0.5, θ + 0.5]

```javascript
function identifyZPD(currentTheta) {
  return {
    lowerBound: currentTheta - 0.5, // ZPD下界
    optimalLevel: currentTheta,      // 最佳挑戰
    upperBound: currentTheta + 0.5   // ZPD上界
  };
}
```

#### **Q2: 如何提供MLE鷹架?**
**A**: 分級提示系統

| 鷹架等級 | 提示強度 | 範例(Go/No-Go遊戲) |
|---------|---------|------------------|
| **Level 1** | 完整示範 | 「看到星星要按空白鍵」(動畫示範) |
| **Level 2** | 部分提示 | 錯誤後:「記得現在是星星遊戲喔!」 |
| **Level 3** | 僅回饋 | 錯誤後:紅色閃爍,無文字 |
| **Level 4** | 完全獨立 | 無任何提示 |

#### **Q3: 何時撤除鷹架?**
**A**: 連續正確判定

```javascript
function decideFading(consecutiveCorrect) {
  if (consecutiveCorrect >= 3) {
    currentScaffoldLevel++; // 降低鷹架
  }
  return Math.min(currentScaffoldLevel, 4); // 最多Level 4
}
```

---

## 💻 完整程式碼範例

### **整合IRT+DA的訓練遊戲類別**

```javascript
class IntegratedTrainingGame {
  constructor(itemBank) {
    this.itemBank = itemBank;
    
    // IRT測量參數
    this.currentTheta = 0;
    this.responses = [];
    
    // DA訓練參數
    this.scaffoldLevel = 1; // 1=完整,4=獨立
    this.consecutiveCorrect = 0;
    this.zpd = {lower: -0.5, upper: 0.5};
  }
  
  // ========== 階段1: IRT前測 ==========
  async runPreTest() {
    console.log("開始IRT前測...");
    const preTestItems = this.selectPreTestItems(10);
    
    for (const item of preTestItems) {
      const response = await this.presentItem(item, false); // 無鷹架
      this.recordResponse(item, response);
    }
    
    // 估計初始能力
    this.currentTheta = this.estimateAbility();
    this.zpd = this.identifyZPD(this.currentTheta);
    
    console.log(`前測完成! 初始能力θ₀ = ${this.currentTheta.toFixed(2)}`);
    console.log(`ZPD範圍: [${this.zpd.lower.toFixed(2)}, ${this.zpd.upper.toFixed(2)}]`);
  }
  
  // ========== 階段2: DA訓練 ==========
  async runDATraining(maxTrials = 30) {
    console.log("開始DA訓練...");
    
    for (let i = 0; i < maxTrials; i++) {
      // 1. 從ZPD範圍內選題
      const item = this.selectItemFromZPD();
      
      // 2. 依當前鷹架等級呈現題目
      const response = await this.presentItemWithScaffold(
        item, 
        this.scaffoldLevel
      );
      
      // 3. 記錄與更新
      this.recordResponse(item, response);
      
      // 4. 決定是否撤除鷹架
      if (response.correct) {
        this.consecutiveCorrect++;
        if (this.consecutiveCorrect >= 3) {
          this.scaffoldLevel = Math.min(this.scaffoldLevel + 1, 4);
          this.consecutiveCorrect = 0;
          console.log(`鷹架提升至Level ${this.scaffoldLevel}`);
        }
      } else {
        this.consecutiveCorrect = 0;
        // 錯誤時可考慮降低鷹架(增加支持)
        if (this.scaffoldLevel > 1) {
          this.scaffoldLevel--;
          console.log(`鷹架降低至Level ${this.scaffoldLevel}`);
        }
      }
      
      // 5. 每5題更新ZPD
      if ((i + 1) % 5 === 0) {
        this.currentTheta = this.estimateAbility();
        this.zpd = this.identifyZPD(this.currentTheta);
      }
    }
  }
  
  // ========== 階段3: IRT後測 ==========
  async runPostTest() {
    console.log("開始IRT後測...");
    const postTestItems = this.selectPostTestItems(10);
    
    for (const item of postTestItems) {
      const response = await this.presentItem(item, false); // 無鷹架
      this.recordResponse(item, response);
    }
    
    const finalTheta = this.estimateAbility();
    const improvement = finalTheta - this.currentTheta;
    
    console.log(`後測完成! 最終能力θ₁ = ${finalTheta.toFixed(2)}`);
    console.log(`訓練成效Δθ = ${improvement.toFixed(2)}`);
    
    return {
      preTestTheta: this.currentTheta,
      postTestTheta: finalTheta,
      improvement: improvement
    };
  }
  
  // ========== 輔助方法 ==========
  
  identifyZPD(theta) {
    return {
      lower: theta - 0.5,
      optimal: theta,
      upper: theta + 0.5
    };
  }
  
  selectItemFromZPD() {
    // 選擇難度在ZPD範圍內的題目
    const zpd Items = this.itemBank.filter(item => 
      item.b >= this.zpd.lower && item.b <= this.zpd.upper
    );
    return zpdItems[Math.floor(Math.random() * zpdItems.length)];
  }
  
  async presentItemWithScaffold(item, scaffoldLevel) {
    switch(scaffoldLevel) {
      case 1: // 完整鷹架
        return await this.presentWithFullScaffold(item);
      case 2: // 部分鷹架
        return await this.presentWithPartialScaffold(item);
      case 3: // 僅回饋
        return await this.presentWithFeedbackOnly(item);
      case 4: // 完全獨立
        return await this.presentItem(item, false);
    }
  }
  
  async presentWithFullScaffold(item) {
    // 完整示範+提示
    this.showInstruction("看到星星按空白鍵!");
    this.showAnimation(); // 動畫示範
    await this.wait(2000);
    return await this.presentItem(item, true);
  }
  
  estimateAbility() {
    // 使用EAP估計(參考前份文件)
    return estimateAbility(this.responses, this.usedItems);
  }
}
```

---

## 📝 論文寫作整合

### **文獻探討可寫**

> 「本研究採用**雙模式設計**:測量模式使用項目反應理論(IRT)精確評估兒童執行功能水準;訓練模式則基於Vygotsky(1978)近側發展區(ZPD)理論與Feuerstein等人(1979, 2010)中介學習經驗(MLE)理論,提供適性鷹架支持。IRT估計的能力參數θ用於定位ZPD範圍(θ ± 0.5),確保訓練題目難度適中。訓練過程採分級鷹架策略(Wood et al., 1976),依兒童表現漸進撤除支持,促進獨立自主學習。」

### **研究方法可寫**

> 「訓練流程分三階段:(1) **IRT前測**(10題):估計初始能力θ₀,無鷹架介入;(2) **DA訓練**(30題):依θ₀定位ZPD,提供分級鷹架(完整示範→部分提示→僅回饋→完全獨立),依連續答對次數動態調整鷹架等級;(3) **IRT後測**(10題):重新估計θ₁,訓練成效以Δθ = θ₁ - θ₀表示。」

---

## 📚 完整參考文獻(APA 7)

### **IRT測量文獻**(見前份文件)

### **DA訓練文獻**

Feuerstein, R., Rand, Y., & Hoffman, M. B. (1979). *The dynamic assessment of retarded performers: The Learning Potential Assessment Device, theory, instruments, and techniques*. University Park Press.

Feuerstein, R., Feuerstein, R. S., & Falik, L. H. (2010). *Beyond smarter: Mediated learning and the brain's capacity for change*. Teachers College Press.

Haywood, H. C., & Lidz, C. S. (2007). *Dynamic assessment in practice: Clinical and educational applications*. Cambridge University Press.

Lidz, C. S., & Elliott, J. G. (Eds.). (2000). *Dynamic assessment: Prevailing models and applications*. Elsevier.

Tzuriel, D. (2001). Dynamic assessment of young children: Educational and intervention perspectives. *Educational Psychology Review, 13*(4), 385-435. https://doi.org/10.1023/A:1009032414088

Tzuriel, D. (2013). *Mediated learning and cognitive modifiability: Dynamic assessment and intervention perspectives*. Springer.

Vygotsky, L. S. (1978). *Mind in society: The development of higher psychological processes*. Harvard University Press.

Wood, D., Bruner, J. S., & Ross, G. (1976). The role of tutoring in problem solving. *Journal of Child Psychology and Psychiatry, 17*(2), 89-100. https://doi.org/10.1111/j.1469-7610.1976.tb00381.x

---

**Token使用**: 本次對話約 **165,000 tokens** / 剩餘 **25,000 tokens**  
**檔案日期**: 2026年01月31日