/* ============================================================
 *  📋 檔案說明
 *  ─────────────────────────────────
 *  檔案名稱：assessment-controller.js
 *  一句話說明：TC-CHEXI 量表評估頁面的控制邏輯
 *
 *  功能：
 *   1. 載入題目 JSON 並動態產生題目卡片
 *   2. 自動偵測前/後測（依 localStorage 紀錄）
 *   3. 計算各分量表分數
 *   4. 儲存/讀取 localStorage
 *   5. 匯出 CSV
 *   6. 歷史紀錄管理
 * ============================================================ */

(function () {
  "use strict";

  /* ====================================
     常數
     ==================================== */

  const STORAGE_KEY = "efgame-chexi-records";
  const ITEMS_PATH = "../js/assessment/tc-chexi-items.json";

  /* ====================================
     狀態
     ==================================== */

  let itemsData = null; // 載入的 JSON
  let responses = {}; // { itemId: value(1-5) }
  let currentTestType = null; // "pre" | "post" | "test-3" | ...

  /* ====================================
     工具：代碼 / 測驗標籤
     ==================================== */

  /** 從完整代碼（含時間戳）取出基底代碼 */
  function getBaseCode(fullCode) {
    if (!fullCode) return "";
    var m = fullCode.match(/^(.+?)\(\d{4}_\d{2}_\d{2}_\d{2}_\d{2}_\d{2}\)$/);
    return m ? m[1] : fullCode;
  }

  /** testType → 顯示標籤 */
  function getTestLabel(testType) {
    if (testType === "pre") return "前測";
    if (testType === "post") return "後測";
    var m = testType && testType.match(/^test-(\d+)$/);
    if (m) return "第" + m[1] + "次測量";
    return testType || "前測";
  }

  /** 依同代碼既有筆數決定 testType */
  function getTestTypeByCount(count) {
    if (count === 0) return "pre";
    if (count === 1) return "post";
    return "test-" + (count + 1);
  }

  /** 格式化日期+時間 (顯示用) */
  function formatDateTime(d) {
    var y = d.getFullYear();
    var mo = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    var h = String(d.getHours()).padStart(2, "0");
    var mi = String(d.getMinutes()).padStart(2, "0");
    var sec = String(d.getSeconds()).padStart(2, "0");
    return y + "-" + mo + "-" + day + " " + h + ":" + mi + ":" + sec;
  }

  /* ====================================
     DOM 參照
     ==================================== */

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const dom = {};

  function cacheDom() {
    dom.childCode = $("#childCode");
    dom.fillerRoleGroup = $("#fillerRole");
    dom.childAgeY = $("#childAgeY");
    dom.childAgeM = $("#childAgeM");
    dom.testTypeIndicator = $("#testTypeIndicator");
    dom.btnStartScale = $("#btnStartScale");
    dom.infoError = $("#infoError");
    dom.infoSection = $("#infoSection");
    dom.scaleSection = $("#scaleSection");
    dom.scaleInstructions = $("#scaleInstructions");
    dom.questionsContainer = $("#questionsContainer");
    dom.progressText = $("#progressText");
    dom.progressPercent = $("#progressPercent");
    dom.progressFill = $("#progressFill");
    dom.btnSubmit = $("#btnSubmit");
    dom.submitWarning = $("#submitWarning");
    dom.resultSummary = $("#resultSummary");
    dom.resultMeta = $("#resultMeta");
    dom.scoreGrid = $("#scoreGrid");
    dom.btnNewAssessment = $("#btnNewAssessment");
    dom.historySection = $("#historySection");
    dom.historyList = $("#historyList");
    dom.historyActions = $("#historyActions");
    dom.btnExportCsv = $("#btnExportCsv");
    dom.btnClearAll = $("#btnClearAll");
    dom.btnExportJson = $("#btnExportJson");
    dom.btnImportJson = $("#btnImportJson");
    dom.importFileInput = $("#importFileInput");
    // dom.btnShareEmail = $("#btnShareEmail");
    // dom.emailOverlay = $("#emailOverlay");
    // dom.emailInput = $("#emailInput");
    // dom.emailCancel = $("#emailCancel");
    // dom.emailSend = $("#emailSend");
    dom.btnImportJsonEmpty = $("#btnImportJsonEmpty");
    dom.importFileInputEmpty = $("#importFileInputEmpty");
    dom.historyActionsEmpty = $("#historyActionsEmpty");
    dom.confirmOverlay = $("#confirmOverlay");
    dom.confirmTitle = $("#confirmTitle");
    dom.confirmMessage = $("#confirmMessage");
    dom.confirmCancel = $("#confirmCancel");
    dom.confirmOk = $("#confirmOk");

    // 比較報告 DOM
    dom.comparisonReport = $("#comparisonReport");
    dom.comparisonReportInner = $("#comparisonReportInner");
    dom.comparisonMeta = $("#comparisonMeta");
    dom.comparisonOverall = $("#comparisonOverall");
    dom.comparisonGrid = $("#comparisonGrid");
    dom.comparisonTotal = $("#comparisonTotal");
    dom.comparisonInterpretation = $("#comparisonInterpretation");
    dom.btnExportComparisonPdf = $("#btnExportComparisonPdf");
    dom.btnNewAssessment2 = $("#btnNewAssessment2");

    // 原始數據 Modal
    dom.rawDataOverlay = $("#rawDataOverlay");
    dom.rawDataTitle = $("#rawDataTitle");
    dom.rawDataContent = $("#rawDataContent");
    dom.rawDataClose = $("#rawDataClose");
  }

  /* ====================================
     初始化
     ==================================== */

  async function init() {
    cacheDom();
    await loadItems();
    bindEvents();
    renderHistory();
    validateInfoForm(); // 初始狀態檢查
  }

  async function loadItems() {
    try {
      const resp = await fetch(ITEMS_PATH);
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      itemsData = await resp.json();
    } catch (err) {
      console.error("載入題目失敗:", err);
      dom.questionsContainer.innerHTML =
        '<p style="color: var(--error-red); text-align: center;">⚠️ 題目載入失敗，請重新整理頁面。</p>';
    }
  }

  /* ====================================
     事件綁定
     ==================================== */

  function bindEvents() {
    // 基本資料欄位變化 → 驗證 + 自動偵測
    dom.childCode.addEventListener("input", onInfoChange);
    dom.fillerRoleGroup.addEventListener("change", onInfoChange);
    dom.childAgeY.addEventListener("change", onInfoChange);
    dom.childAgeM.addEventListener("change", onInfoChange);

    // radio-option 視覺回饋
    dom.fillerRoleGroup.querySelectorAll(".radio-option").forEach((opt) => {
      opt.addEventListener("click", () => {
        dom.fillerRoleGroup
          .querySelectorAll(".radio-option")
          .forEach((o) => o.classList.remove("selected"));
        opt.classList.add("selected");
      });
    });

    // 開始填寫
    dom.btnStartScale.addEventListener("click", startScale);

    // 提交
    dom.btnSubmit.addEventListener("click", submitScale);

    // 填寫另一份
    dom.btnNewAssessment.addEventListener("click", resetToStart);

    // 匯出 CSV
    dom.btnExportCsv.addEventListener("click", exportCsv);

    // 清除全部
    dom.btnClearAll.addEventListener("click", () => {
      showConfirm(
        "清除全部紀錄",
        "確定要刪除所有量表紀錄嗎？此操作無法復原。",
        () => {
          localStorage.removeItem(STORAGE_KEY);
          renderHistory();
        },
      );
    });

    // 比較報告操作
    dom.btnExportComparisonPdf.addEventListener("click", exportComparisonPdf);
    dom.btnNewAssessment2.addEventListener("click", resetToStart);

    // E-mail 寄送 -- 暫時停用
    // if (dom.btnShareEmail) {
    //   dom.btnShareEmail.addEventListener("click", openEmailDialog);
    // }
    // if (dom.emailCancel) {
    //   dom.emailCancel.addEventListener("click", closeEmailDialog);
    // }
    // if (dom.emailOverlay) {
    //   dom.emailOverlay.addEventListener("click", function (e) {
    //     if (e.target === dom.emailOverlay) closeEmailDialog();
    //   });
    // }
    // if (dom.emailSend) {
    //   dom.emailSend.addEventListener("click", shareByEmail);
    // }
    // email format radio 視覺
    // document.querySelectorAll(".email-format-option").forEach(function (opt) {
    //   opt.addEventListener("click", function () {
    //     document.querySelectorAll(".email-format-option").forEach(function (o) {
    //       o.classList.remove("selected");
    //     });
    //     opt.classList.add("selected");
    //   });
    // });

    // JSON 備份匯出/匯入
    dom.btnExportJson.addEventListener("click", exportJsonBackup);
    dom.btnImportJson.addEventListener("click", () =>
      dom.importFileInput.click(),
    );
    dom.importFileInput.addEventListener("change", importJsonBackup);
    if (dom.btnImportJsonEmpty) {
      dom.btnImportJsonEmpty.addEventListener("click", () =>
        dom.importFileInputEmpty.click(),
      );
    }
    if (dom.importFileInputEmpty) {
      dom.importFileInputEmpty.addEventListener("change", importJsonBackup);
    }

    // 原始數據 Modal 關閉
    if (dom.rawDataClose) {
      dom.rawDataClose.addEventListener("click", function () {
        dom.rawDataOverlay.classList.remove("visible");
      });
    }
    if (dom.rawDataOverlay) {
      dom.rawDataOverlay.addEventListener("click", function (e) {
        if (e.target === dom.rawDataOverlay)
          dom.rawDataOverlay.classList.remove("visible");
      });
    }

    // 確認對話框
    dom.confirmCancel.addEventListener("click", hideConfirm);
  }

  /* ====================================
     基本資料驗證 & 前後測自動偵測
     ==================================== */

  function onInfoChange() {
    validateInfoForm();
    detectTestType();
  }

  function validateInfoForm() {
    const code = dom.childCode.value.trim();
    const role = getSelectedRole();
    const ageY = dom.childAgeY.value;

    const valid = code.length > 0 && role && ageY;
    dom.btnStartScale.disabled = !valid;

    if (!valid) {
      dom.infoError.style.display = "none";
    }

    return valid;
  }

  function getSelectedRole() {
    const checked = dom.fillerRoleGroup.querySelector(
      'input[name="fillerRole"]:checked',
    );
    return checked ? checked.value : null;
  }

  function detectTestType() {
    const code = dom.childCode.value.trim();
    if (!code) {
      dom.testTypeIndicator.classList.remove(
        "visible",
        "pre-test",
        "post-test",
      );
      currentTestType = null;
      return;
    }

    const records = loadRecords();
    const baseLC = code.toLowerCase();
    // 依基底代碼比對（相容新舊格式）
    const sameCodeRecords = records.filter(
      (r) => getBaseCode(r.childCode).toLowerCase() === baseLC,
    );
    const count = sameCodeRecords.length;
    currentTestType = getTestTypeByCount(count);
    const label = getTestLabel(currentTestType);

    if (count === 0) {
      dom.testTypeIndicator.className = "test-type-indicator visible pre-test";
      dom.testTypeIndicator.querySelector(".icon").textContent = "✨";
      dom.testTypeIndicator.querySelector(".text").textContent =
        code + " 尚無紀錄 → 本次為【" + label + "】";
    } else {
      dom.testTypeIndicator.className = "test-type-indicator visible post-test";
      dom.testTypeIndicator.querySelector(".icon").textContent =
        count >= 2 ? "📈" : "📊";
      dom.testTypeIndicator.querySelector(".text").textContent =
        "偵測到 " +
        code +
        " 已有 " +
        count +
        " 筆紀錄 → 本次為【" +
        label +
        "】";
    }
  }

  /* ====================================
     開始量表
     ==================================== */

  function startScale() {
    if (!validateInfoForm()) return;
    if (!itemsData) {
      showInfoError("題目尚未載入完成，請稍候再試。");
      return;
    }

    // 隱藏基本資料區、顯示量表區
    dom.infoSection.style.display = "none";
    dom.scaleSection.classList.add("visible");
    dom.resultSummary.classList.remove("visible");

    // 設定指示語
    dom.scaleInstructions.textContent = itemsData.meta.instructions;

    // 產生題目
    responses = {};
    renderQuestions();
    updateProgress();

    // 滾動到量表頂部
    dom.scaleSection.scrollIntoView({ behavior: "smooth" });
  }

  function renderQuestions() {
    const items = itemsData.items;
    const labels = itemsData.meta.scaleLabels;
    let html = "";

    items.forEach((item, idx) => {
      const subscaleInfo = itemsData.subscales.find(
        (s) => s.id === item.subscale,
      );
      const subscaleName = subscaleInfo ? subscaleInfo.name : item.subscale;

      html += `
        <div class="question-card" data-item-id="${item.id}" id="q${item.id}">
          <div class="question-number">第 ${idx + 1} 題 / ${items.length}</div>
          <div class="question-text">${item.text}</div>
          <div class="likert-scale">
      `;

      for (let v = 1; v <= 5; v++) {
        const shortLabel = v === 1 ? labels[0] : v === 5 ? labels[4] : "";
        html += `
            <button type="button" class="likert-btn" data-item-id="${item.id}" data-value="${v}">
              <span class="number">${v}</span>
              ${shortLabel ? `<span class="label">${shortLabel}</span>` : ""}
            </button>
        `;
      }

      html += `
          </div>
        </div>
      `;
    });

    dom.questionsContainer.innerHTML = html;

    // 綁定 Likert 按鈕
    dom.questionsContainer.querySelectorAll(".likert-btn").forEach((btn) => {
      btn.addEventListener("click", onLikertClick);
    });
  }

  function onLikertClick(e) {
    const btn = e.currentTarget;
    const itemId = parseInt(btn.dataset.itemId, 10);
    const value = parseInt(btn.dataset.value, 10);

    // 更新狀態
    responses[itemId] = value;

    // 更新視覺
    const card = btn.closest(".question-card");
    card
      .querySelectorAll(".likert-btn")
      .forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    card.classList.add("answered");
    card.classList.remove("unanswered-highlight");

    // 更新進度
    updateProgress();
  }

  function updateProgress() {
    if (!itemsData) return;
    const total = itemsData.items.length;
    const done = Object.keys(responses).length;
    const pct = Math.round((done / total) * 100);

    dom.progressText.textContent = `已完成 ${done} / ${total} 題`;
    dom.progressPercent.textContent = `${pct}%`;
    dom.progressFill.style.width = `${pct}%`;
  }

  /* ====================================
     提交量表
     ==================================== */

  function submitScale() {
    const total = itemsData.items.length;
    const done = Object.keys(responses).length;

    if (done < total) {
      // 找出未作答題目，高亮並滾動
      dom.submitWarning.classList.add("visible");
      const firstUnanswered = itemsData.items.find(
        (item) => responses[item.id] === undefined,
      );
      if (firstUnanswered) {
        const card = document.getElementById(`q${firstUnanswered.id}`);
        if (card) {
          card.classList.add("unanswered-highlight");
          card.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      return;
    }

    dom.submitWarning.classList.remove("visible");

    // 計算分數
    const scores = calculateScores();

    // 兒童代碼自動加上時間戳
    const baseCode = dom.childCode.value.trim();
    const now = new Date();
    const ts =
      now.getFullYear() +
      "_" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "_" +
      String(now.getDate()).padStart(2, "0") +
      "_" +
      String(now.getHours()).padStart(2, "0") +
      "_" +
      String(now.getMinutes()).padStart(2, "0") +
      "_" +
      String(now.getSeconds()).padStart(2, "0");
    const fullCode = baseCode + "(" + ts + ")";

    // 建立紀錄
    const record = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      childCode: fullCode,
      baseCode: baseCode,
      testType: currentTestType || "pre",
      fillerRole: getSelectedRole(),
      childAge: `${dom.childAgeY.value}y${dom.childAgeM.value || 0}m`,
      childAgeDisplay: `${dom.childAgeY.value}歲${dom.childAgeM.value || 0}個月`,
      date: now.toISOString(),
      dateDisplay: formatDateTime(now),
      responses: itemsData.items.map((item) => ({
        itemId: item.id,
        subscale: item.subscale,
        value: responses[item.id],
      })),
      scores: scores,
    };

    // 儲存（不刪除舊紀錄）
    saveRecord(record);

    // 非前測 → 嘗試顯示與前一次測量的比較報告
    if (record.testType !== "pre") {
      const records = loadRecords();
      const baseLC = baseCode.toLowerCase();
      // 找同代碼的所有紀錄（排除本次），依日期排序
      const sameCodeRecords = records
        .filter(
          (r) =>
            getBaseCode(r.childCode).toLowerCase() === baseLC &&
            r.id !== record.id,
        )
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      // 取最後一筆作為比較對象（相鄰測量）
      const prevRecord =
        sameCodeRecords.length > 0
          ? sameCodeRecords[sameCodeRecords.length - 1]
          : null;
      if (prevRecord) {
        showComparison(prevRecord, record);
        return;
      }
    }

    // 前測或找不到前一次紀錄→簡式結果
    showResult(record);
  }

  function calculateScores() {
    const scoresBySubscale = {};
    itemsData.subscales.forEach((s) => {
      scoresBySubscale[s.id] = 0;
    });

    let total = 0;

    itemsData.items.forEach((item) => {
      const val = responses[item.id] || 0;
      if (scoresBySubscale[item.subscale] !== undefined) {
        scoresBySubscale[item.subscale] += val;
      }
      total += val;
    });

    return { ...scoresBySubscale, total };
  }

  function showResult(record) {
    dom.scaleSection.classList.remove("visible");
    dom.resultSummary.classList.add("visible");

    // 元資訊
    const typeLabel = getTestLabel(record.testType);
    const roleLabel = record.fillerRole === "parent" ? "家長" : "教師";
    dom.resultMeta.textContent = `${getBaseCode(record.childCode)} ｜ ${typeLabel} ｜ ${roleLabel}填寫 ｜ ${record.dateDisplay}`;

    // 分數卡片
    let gridHtml = "";
    itemsData.subscales.forEach((s) => {
      gridHtml += `
        <div class="score-card">
          <div class="score-label">${s.name} (${s.nameEn})</div>
          <div class="score-value">${record.scores[s.id]}</div>
          <div class="score-max">/ ${s.maxScore}</div>
        </div>
      `;
    });
    gridHtml += `
      <div class="score-card total">
        <div class="score-label">總分 (Total)</div>
        <div class="score-value">${record.scores.total}</div>
        <div class="score-max">/ ${itemsData.subscales.reduce((a, s) => a + s.maxScore, 0)}</div>
      </div>
    `;
    dom.scoreGrid.innerHTML = gridHtml;

    // 更新歷史
    renderHistory();

    // 滾動到結果
    dom.resultSummary.scrollIntoView({ behavior: "smooth" });
  }

  /* ====================================
     重新開始
     ==================================== */

  function resetToStart() {
    dom.resultSummary.classList.remove("visible");
    dom.scaleSection.classList.remove("visible");
    dom.comparisonReport.classList.remove("visible");
    dom.infoSection.style.display = "";
    dom.childCode.value = "";
    dom.childAgeY.value = "";
    dom.childAgeM.value = "";
    dom.fillerRoleGroup
      .querySelectorAll(".radio-option")
      .forEach((o) => o.classList.remove("selected"));
    dom.fillerRoleGroup
      .querySelectorAll("input[type='radio']")
      .forEach((r) => (r.checked = false));
    dom.testTypeIndicator.classList.remove("visible", "pre-test", "post-test");
    dom.btnStartScale.disabled = true;
    responses = {};
    currentTestType = null;

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ====================================
     localStorage 存取
     ==================================== */

  function loadRecords() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveRecord(record) {
    const records = loadRecords();
    records.push(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }

  function deleteRecord(recordId) {
    let records = loadRecords();
    records = records.filter((r) => r.id !== recordId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    renderHistory();
  }

  /* ====================================
     歷史紀錄渲染
     ==================================== */

  function renderHistory() {
    const records = loadRecords();

    if (records.length === 0) {
      dom.historyList.innerHTML =
        '<div class="history-empty">尚無量表紀錄。填寫量表後將在此顯示。</div>';
      dom.historyActions.style.display = "none";
      if (dom.historyActionsEmpty) dom.historyActionsEmpty.style.display = "";
      return;
    }

    dom.historyActions.style.display = "";
    if (dom.historyActionsEmpty) dom.historyActionsEmpty.style.display = "none";

    // 依基底代碼分組，排序各組，建立「前一筆」查找表
    var groups = {};
    records.forEach(function (r) {
      var base = getBaseCode(r.childCode).toLowerCase();
      if (!groups[base]) groups[base] = [];
      groups[base].push(r);
    });
    Object.values(groups).forEach(function (g) {
      g.sort(function (a, b) {
        return new Date(a.date) - new Date(b.date);
      });
    });
    var prevMap = {};
    Object.values(groups).forEach(function (g) {
      for (var i = 1; i < g.length; i++) {
        prevMap[g[i].id] = g[i - 1].id;
      }
    });

    let html = '<div class="history-list">';
    // 依日期倒序
    const sorted = [...records].sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );

    sorted.forEach((r) => {
      const typeLabel = getTestLabel(r.testType);
      const typeClass = r.testType === "pre" ? "pre" : "post";
      const roleLabel = r.fillerRole === "parent" ? "家長" : "教師";
      const displayCode = getBaseCode(r.childCode);
      const displayDate = r.dateDisplay || formatDateTime(new Date(r.date));
      const hasPrev = !!prevMap[r.id];
      html += `
        <div class="history-item">
          <div class="hi-main">
            <span class="hi-code">${escHtml(displayCode)}</span>
            <span class="hi-type ${typeClass}">${typeLabel}</span>
            <span class="hi-date">${displayDate}｜${roleLabel}</span>
            <span class="hi-score">總分 ${r.scores.total}</span>
          </div>
          <div class="hi-actions">
            <button class="hi-raw" data-id="${r.id}" title="查看原始數據">📋</button>
            ${hasPrev ? '<button class="hi-compare" data-id="' + r.id + '" data-prev="' + prevMap[r.id] + '" title="與前次比較">📊</button>' : ""}
            <button class="hi-delete" data-id="${r.id}" title="刪除此筆">✕</button>
          </div>
        </div>
      `;
    });

    html += "</div>";
    dom.historyList.innerHTML = html;

    // 綁定刪除
    dom.historyList.querySelectorAll(".hi-delete").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        showConfirm("刪除紀錄", "確定要刪除這筆紀錄嗎？", () => {
          deleteRecord(btn.dataset.id);
        });
      });
    });

    // 綁定原始數據
    dom.historyList.querySelectorAll(".hi-raw").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        showRawData(btn.dataset.id);
      });
    });

    // 綁定比較
    dom.historyList.querySelectorAll(".hi-compare").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        showHistoryComparison(btn.dataset.prev, btn.dataset.id);
      });
    });
  }

  /* ====================================
     原始數據查看
     ==================================== */

  function showRawData(recordId) {
    var records = loadRecords();
    var record = records.find(function (r) {
      return r.id === recordId;
    });
    if (!record || !itemsData) return;

    var baseCode = getBaseCode(record.childCode);
    var typeLabel = getTestLabel(record.testType);
    var roleLabel = record.fillerRole === "parent" ? "家長" : "教師";
    var dateStr = record.dateDisplay || formatDateTime(new Date(record.date));

    dom.rawDataTitle.textContent = baseCode + " — " + typeLabel + " 原始數據";

    var html =
      '<p class="rawdata-meta">' +
      escHtml(dateStr) +
      "｜" +
      roleLabel +
      "｜" +
      escHtml(record.childAgeDisplay || record.childAge) +
      "｜總分 " +
      record.scores.total +
      "</p>";

    html +=
      '<table class="rawdata-table"><thead><tr>' +
      "<th>題號</th><th>向度</th><th>題目</th><th>作答</th>" +
      "</tr></thead><tbody>";

    var subscaleNameMap = {};
    itemsData.subscales.forEach(function (s) {
      subscaleNameMap[s.id] = s.name + " (" + s.nameEn + ")";
    });

    record.responses.forEach(function (resp) {
      var item =
        itemsData.items.find(function (it) {
          return it.id === resp.itemId;
        }) || {};
      var sName = subscaleNameMap[resp.subscale] || resp.subscale;
      html +=
        "<tr>" +
        "<td>" +
        resp.itemId +
        "</td>" +
        '<td><span class="subscale-tag-sm ' +
        resp.subscale +
        '">' +
        sName +
        "</span></td>" +
        "<td>" +
        escHtml(item.text || "") +
        "</td>" +
        '<td style="text-align:center;font-weight:600;">' +
        resp.value +
        "</td>" +
        "</tr>";
    });

    html += "</tbody></table>";

    // 各向度小計
    html += '<div class="rawdata-subtotals">';
    itemsData.subscales.forEach(function (s) {
      html +=
        '<span class="rawdata-subtotal ' +
        s.id +
        '">' +
        s.name +
        " (" +
        s.nameEn +
        "): " +
        record.scores[s.id] +
        " / " +
        s.maxScore +
        "</span>";
    });
    var totalMax = itemsData.subscales.reduce(function (a, s) {
      return a + s.maxScore;
    }, 0);
    html +=
      '<span class="rawdata-subtotal total">總分: ' +
      record.scores.total +
      " / " +
      totalMax +
      "</span>";
    html += "</div>";

    dom.rawDataContent.innerHTML = html;
    dom.rawDataOverlay.classList.add("visible");
  }

  /* ====================================
     歷史紀錄觸發比較報告
     ==================================== */

  function showHistoryComparison(prevId, currId) {
    var records = loadRecords();
    var prevRecord = records.find(function (r) {
      return r.id === prevId;
    });
    var currRecord = records.find(function (r) {
      return r.id === currId;
    });
    if (!prevRecord || !currRecord) return;

    // 隱藏其他畫面，顯示比較報告
    dom.infoSection.style.display = "none";
    dom.scaleSection.classList.remove("visible");
    dom.resultSummary.classList.remove("visible");
    showComparison(prevRecord, currRecord);
  }

  /* ====================================
     JSON 備份匯出 / 匯入
     ==================================== */

  function exportJsonBackup() {
    const records = loadRecords();
    if (records.length === 0) return;

    const backup = {
      _format: "efgame-chexi-backup",
      _version: "1.0",
      _exportedAt: new Date().toISOString(),
      _recordCount: records.length,
      records: records,
    };

    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TC-CHEXI_備份_${formatDateFile(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function importJsonBackup(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (evt) {
      try {
        const data = JSON.parse(evt.target.result);

        // 驗證格式
        let importRecords;
        if (
          data._format === "efgame-chexi-backup" &&
          Array.isArray(data.records)
        ) {
          importRecords = data.records;
        } else if (Array.isArray(data)) {
          importRecords = data;
        } else {
          alert("⚠️ 無法識別的檔案格式，請確認是 TC-CHEXI 備份檔。");
          return;
        }

        // 驗證必要欄位
        const valid = importRecords.every(
          (r) => r.id && r.childCode && r.testType && r.scores,
        );
        if (!valid || importRecords.length === 0) {
          alert("⚠️ 備份檔內容不完整或格式錯誤。");
          return;
        }

        // 合併現有紀錄（依 ID 去重）
        const existing = loadRecords();
        const existingIds = new Set(existing.map((r) => r.id));
        let addedCount = 0;

        importRecords.forEach((r) => {
          if (!existingIds.has(r.id)) {
            existing.push(r);
            existingIds.add(r.id);
            addedCount++;
          }
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
        renderHistory();

        const skipCount = importRecords.length - addedCount;
        let msg = `✅ 匯入完成！新增 ${addedCount} 筆紀錄。`;
        if (skipCount > 0) msg += `\n（${skipCount} 筆重複紀錄已跳過）`;
        alert(msg);
      } catch (err) {
        console.error("匯入失敗:", err);
        alert("⚠️ 匯入失敗，請確認檔案格式正確。");
      }
    };
    reader.readAsText(file);

    // 重置 file input（讓同一檔案可以再次選取）
    e.target.value = "";
  }

  /* ====================================
     E-mail 寄送 -- 暫時停用
     ==================================== */

  // function openEmailDialog() {
  //   if (loadRecords().length === 0) return;
  //   var saved = localStorage.getItem("efgame-chexi-email") || "";
  //   dom.emailInput.value = saved;
  //   dom.emailOverlay.classList.add("visible");
  //   dom.emailInput.focus();
  // }
  //
  // function closeEmailDialog() {
  //   dom.emailOverlay.classList.remove("visible");
  // }
  //
  // function shareByEmail() {
  //   var email = (dom.emailInput.value || "").trim();
  //   if (!email || !email.includes("@")) {
  //     dom.emailInput.style.borderColor = "var(--error-red)";
  //     dom.emailInput.focus();
  //     return;
  //   }
  //   dom.emailInput.style.borderColor = "";
  //   localStorage.setItem("efgame-chexi-email", email);
  //
  //   var fmt =
  //     (document.querySelector('input[name="emailFormat"]:checked') || {})
  //       .value || "csv";
  //   var files = [];
  //   var fileNames = [];
  //
  //   if (fmt === "csv" || fmt === "both") {
  //     var csvResult = buildCsvFile();
  //     if (csvResult) {
  //       files.push(csvResult.file);
  //       fileNames.push(csvResult.name);
  //     }
  //   }
  //   if (fmt === "json" || fmt === "both") {
  //     var jsonResult = buildJsonFile();
  //     if (jsonResult) {
  //       files.push(jsonResult.file);
  //       fileNames.push(jsonResult.name);
  //     }
  //   }
  //
  //   if (files.length === 0) return;
  //
  //   if (navigator.canShare && navigator.canShare({ files: files })) {
  //     navigator
  //       .share({
  //         title: "TC-CHEXI 量表紀錄",
  //         text: "TC-CHEXI 繁體中文兒童執行功能量表紀錄",
  //         files: files,
  //       })
  //       .then(function () {
  //         closeEmailDialog();
  //       })
  //       .catch(function (err) {
  //         if (err.name !== "AbortError") {
  //           fallbackMailto(email, fileNames);
  //         }
  //       });
  //   } else {
  //     files.forEach(function (f, i) {
  //       var url = URL.createObjectURL(f);
  //       var a = document.createElement("a");
  //       a.href = url;
  //       a.download = fileNames[i];
  //       document.body.appendChild(a);
  //       a.click();
  //       document.body.removeChild(a);
  //       URL.revokeObjectURL(url);
  //     });
  //     fallbackMailto(email, fileNames);
  //   }
  // }
  //
  // function fallbackMailto(email, fileNames) {
  //   var subject = encodeURIComponent(
  //     "TC-CHEXI 量表紀錄 — " + formatDateFile(new Date()),
  //   );
  //   var body = encodeURIComponent(
  //     "您好，\n\n附件為 TC-CHEXI 繁體中文兒童執行功能量表的紀錄檔案。\n\n" +
  //       "附件檔名：\n" +
  //       fileNames.join("\n") +
  //       "\n\n" +
  //       "⚠️ 提醒：檔案已下載至您的裝置，請在郵件中手動附加檔案後寄出。\n\n" +
  //       "— 系統自動產生",
  //   );
  //   window.open(
  //     "mailto:" + email + "?subject=" + subject + "&body=" + body,
  //     "_self",
  //   );
  //   closeEmailDialog();
  // }

  function buildJsonFile() {
    var records = loadRecords();
    if (records.length === 0) return null;
    var backup = {
      _format: "efgame-chexi-backup",
      _version: "1.0",
      _exportedAt: new Date().toISOString(),
      _recordCount: records.length,
      records: records,
    };
    var json = JSON.stringify(backup, null, 2);
    var name = "TC-CHEXI_備份_" + formatDateFile(new Date()) + ".json";
    var file = new File([json], name, { type: "application/json" });
    return { file: file, name: name };
  }

  /* ====================================
     CSV 匯出
     ==================================== */

  /**
   * 建立 CSV File 物件（供匯出與 email 共用）
   */
  function buildCsvFile() {
    var records = loadRecords();
    if (records.length === 0) return null;

    var result = buildCsvContent(records);
    var file = new File([result.content], result.name, {
      type: "text/csv;charset=utf-8;",
    });
    return { file: file, name: result.name };
  }

  function exportCsv() {
    var result = buildCsvFile();
    if (!result) return;

    // 下載
    const url = URL.createObjectURL(result.file);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * 建立 CSV 內容與檔名（共用邏輯，供匯出與 email 共用）
   */
  function buildCsvContent(records) {
    // 各向度題目順序（含英文名）
    const SUBSCALE_ITEMS = [
      {
        id: "wm",
        name: "工作記憶",
        nameEn: "Working Memory",
        items: [1, 3, 6, 7, 9, 18, 22, 23],
      },
      {
        id: "plan",
        name: "計畫",
        nameEn: "Planning",
        items: [11, 13, 16, 19, 20, 24],
      },
      {
        id: "reg",
        name: "調適",
        nameEn: "Regulation",
        items: [2, 4, 8, 10, 14],
      },
      {
        id: "inhib",
        name: "抑制",
        nameEn: "Inhibition",
        items: [5, 12, 15, 17, 21],
      },
    ];

    // 表頭：基本資料 → 各向度（小計 → 題目）→ 總分
    const headers = ["兒童代碼", "測驗類型", "填寫者", "兒童年齡", "填寫日期"];
    SUBSCALE_ITEMS.forEach(function (sub) {
      headers.push(sub.name + "(" + sub.nameEn + ")小計");
      sub.items.forEach(function (qNum) {
        headers.push("Q" + qNum);
      });
    });
    headers.push("總分");

    // 資料列
    const rows = [headers];
    records.forEach(function (r) {
      var row = [
        r.childCode,
        getTestLabel(r.testType),
        r.fillerRole === "parent" ? "家長" : "教師",
        r.childAgeDisplay || r.childAge,
        r.dateDisplay || formatDateTime(new Date(r.date)),
      ];

      var respMap = {};
      if (r.responses)
        r.responses.forEach(function (rsp) {
          respMap[rsp.itemId] = rsp.value;
        });

      SUBSCALE_ITEMS.forEach(function (sub) {
        row.push(r.scores[sub.id] != null ? r.scores[sub.id] : "");
        sub.items.forEach(function (qNum) {
          row.push(respMap[qNum] != null ? respMap[qNum] : "");
        });
      });
      row.push(r.scores.total);
      rows.push(row);
    });

    // 產生 CSV 內容（加 BOM 以確保 Excel 正確顯示中文）
    const bom = "\uFEFF";
    const csvContent =
      bom +
      rows
        .map(function (row) {
          return row
            .map(function (cell) {
              var str = String(cell);
              return str.includes(",") ||
                str.includes('"') ||
                str.includes("\n")
                ? '"' + str.replace(/"/g, '""') + '"'
                : str;
            })
            .join(",");
        })
        .join("\n");

    // 檔名後綴：依兒童代碼分組計算測量序號
    var groups = {};
    records.forEach(function (r) {
      var base = getBaseCode(r.childCode).toLowerCase();
      if (!groups[base]) groups[base] = [];
      groups[base].push(r);
    });
    Object.values(groups).forEach(function (g) {
      g.sort(function (a, b) {
        return new Date(a.date) - new Date(b.date);
      });
    });
    var measurementNumberMap = {};
    Object.values(groups).forEach(function (g) {
      g.forEach(function (r, idx) {
        measurementNumberMap[r.id] = idx === 0 ? 0 : idx + 1;
      });
    });
    var measurementNumbers = new Set();
    records.forEach(function (r) {
      measurementNumbers.add(measurementNumberMap[r.id]);
    });
    var suffix = "";
    if (measurementNumbers.size === 1) {
      var num = Array.from(measurementNumbers)[0];
      suffix = "_" + num;
    }

    var name =
      "TC-CHEXI_量表紀錄_" + formatDateFile(new Date()) + suffix + ".csv";
    return { content: csvContent, name: name };
  }

  /* ====================================
     確認對話框
     ==================================== */

  let confirmCallback = null;

  function showConfirm(title, message, onOk) {
    dom.confirmTitle.textContent = title;
    dom.confirmMessage.textContent = message;
    confirmCallback = onOk;
    dom.confirmOverlay.classList.add("visible");

    // 綁定確定按鈕（一次性）— 先暫存 callback 再關閉
    dom.confirmOk.onclick = () => {
      const cb = confirmCallback;
      hideConfirm();
      if (cb) cb();
    };
  }

  function hideConfirm() {
    dom.confirmOverlay.classList.remove("visible");
    confirmCallback = null;
  }

  /* ====================================
     前後測比較報告
     ==================================== */

  /**
   * 依分數百分比回傳表情等級
   * 注意：分數越高 = 困難越大，分數低 = 較好
   */
  function getEmojiLevel(score, maxScore) {
    const pct = (score / maxScore) * 100;
    if (pct <= 20) return { emoji: "😊", text: "幾乎沒有困難", level: 1 };
    if (pct <= 40) return { emoji: "🙂", text: "偶父困難", level: 2 };
    if (pct <= 60) return { emoji: "😐", text: "有些困難", level: 3 };
    if (pct <= 80) return { emoji: "😟", text: "明顯困難", level: 4 };
    return { emoji: "😰", text: "嚴重困難", level: 5 };
  }

  /**
   * 產生單一次量表的白話解讀
   */
  function getSubscaleInterpretation(
    subscaleId,
    preScore,
    postScore,
    maxScore,
  ) {
    const diff = preScore - postScore; // 正 = 進步（分數降低）
    const pctChange = preScore > 0 ? Math.round((diff / preScore) * 100) : 0;
    const absDiff = Math.abs(diff);

    const nameMap = {
      wm: {
        name: "工作記憶 (Working Memory)",
        good: "記住指令、遍照視定執行多步驟任務",
        icon: "🧠",
      },
      plan: {
        name: "計畫能力 (Planning)",
        good: "規劃活動、擅整物品、表達想法",
        icon: "📋",
      },
      reg: {
        name: "調適能力 (Regulation)",
        good: "專注於較不有趣的任務、不容易分心",
        icon: "🎯",
      },
      inhib: {
        name: "抑制控制 (Inhibition)",
        good: "停下來想一想再行動、等待輪流",
        icon: "✋",
      },
    };

    const info = nameMap[subscaleId] || {
      name: subscaleId,
      good: "",
      icon: "✨",
    };

    if (diff > 0) {
      if (pctChange >= 20) {
        return {
          icon: "🌟",
          text: `<strong>${info.name}</strong>從 ${preScore} 分降至 ${postScore} 分（進步 ${pctChange}%），孩子在${info.good}方面有<strong>顯著進步</strong>！`,
        };
      }
      return {
        icon: "⭐",
        text: `<strong>${info.name}</strong>從 ${preScore} 分降至 ${postScore} 分（進步 ${pctChange}%），孩子在${info.good}方面有<strong>小幅改善</strong>。`,
      };
    } else if (diff < 0) {
      return {
        icon: "💡",
        text: `<strong>${info.name}</strong>從 ${preScore} 分變為 ${postScore} 分（增加 ${absDiff} 分），這個領域可能需要更多練習與支持。`,
      };
    }
    return {
      icon: "⚖️",
      text: `<strong>${info.name}</strong>前後測皆為 ${preScore} 分，表現穩定。`,
    };
  }

  /**
   * 顯示前後測比較報告
   */
  function showComparison(preRecord, postRecord) {
    dom.scaleSection.classList.remove("visible");
    dom.resultSummary.classList.remove("visible");
    dom.comparisonReport.classList.add("visible");

    // --- 動態標籤 ---
    const prevLabel = getTestLabel(preRecord.testType);
    const currLabel = getTestLabel(postRecord.testType);

    // --- 元資訊 ---
    const preDate =
      preRecord.dateDisplay || formatDateTime(new Date(preRecord.date));
    const postDate =
      postRecord.dateDisplay || formatDateTime(new Date(postRecord.date));
    const roleLabel = postRecord.fillerRole === "parent" ? "家長" : "教師";
    dom.comparisonMeta.textContent = `兒童代碼：${getBaseCode(postRecord.childCode)} ｜ ${roleLabel}填寫 ｜ ${prevLabel}：${preDate} ｜ ${currLabel}：${postDate}`;

    // --- 計算總分變化 ---
    const totalMax = itemsData.subscales.reduce((a, s) => a + s.maxScore, 0);
    const preTotalScore = preRecord.scores.total;
    const postTotalScore = postRecord.scores.total;
    const totalDiff = preTotalScore - postTotalScore; // 正 = 進步
    const totalPctChange =
      preTotalScore > 0 ? Math.round((totalDiff / preTotalScore) * 100) : 0;

    // 計算有幾個次量表進步
    let improvedCount = 0;
    let worsenedCount = 0;
    itemsData.subscales.forEach((s) => {
      const d = (preRecord.scores[s.id] || 0) - (postRecord.scores[s.id] || 0);
      if (d > 0) improvedCount++;
      else if (d < 0) worsenedCount++;
    });

    // --- 整體摘要 ---
    let overallEmoji, overallTitle, overallDesc;
    if (totalDiff > 0 && totalPctChange >= 15) {
      overallEmoji = "🎉";
      overallTitle = "訓練有效，整體顯著進步！";
      overallDesc = `總分從 ${preTotalScore} 降至 ${postTotalScore}（降低 ${totalPctChange}%），${improvedCount} 個領域有改善。分數降低代表孩子在執行功能方面的困難減少了！`;
    } else if (totalDiff > 0) {
      overallEmoji = "⭐";
      overallTitle = "有小幅進步，繼續加油！";
      overallDesc = `總分從 ${preTotalScore} 降至 ${postTotalScore}（降低 ${totalPctChange}%）。分數降低代表孩子的困難減少，持續訓練可以看到更多進步。`;
    } else if (totalDiff === 0) {
      overallEmoji = "⚖️";
      overallTitle = "前後測表現穩定";
      overallDesc = `總分維持在 ${preTotalScore} 分，表示孩子的執行功能表現穩定。可以繼續觀察各次量表的變化。`;
    } else {
      overallEmoji = "💡";
      overallTitle = "還有努力空間";
      overallDesc = `總分從 ${preTotalScore} 變為 ${postTotalScore}（增加 ${Math.abs(totalDiff)} 分）。分數上升代表困難稍增，建議從各次量表找出需要加強的領域。`;
    }

    dom.comparisonOverall.innerHTML = `
      <span class="overall-emoji">${overallEmoji}</span>
      <div class="overall-title">${overallTitle}</div>
      <div class="overall-desc">${overallDesc}</div>
    `;

    // --- 各次量表卡片 ---
    let gridHtml = "";
    itemsData.subscales.forEach((s) => {
      const pre = preRecord.scores[s.id] || 0;
      const post = postRecord.scores[s.id] || 0;
      const diff = pre - post; // 正 = 進步
      const prePct = Math.round((pre / s.maxScore) * 100);
      const postPct = Math.round((post / s.maxScore) * 100);

      const preLevel = getEmojiLevel(pre, s.maxScore);
      const postLevel = getEmojiLevel(post, s.maxScore);

      let badgeClass, badgeText;
      if (diff > 0) {
        badgeClass = "improved";
        badgeText = `↓ ${diff} 分`;
      } else if (diff < 0) {
        badgeClass = "worsened";
        badgeText = `↑ ${Math.abs(diff)} 分`;
      } else {
        badgeClass = "same";
        badgeText = "— 相同";
      }

      const interp = getSubscaleInterpretation(s.id, pre, post, s.maxScore);

      gridHtml += `
        <div class="comp-card">
          <div class="comp-card-header">
            <span class="comp-subscale-name">${s.name} (${s.nameEn})</span>
            <span class="change-badge ${badgeClass}">${badgeText}</span>
          </div>
          <div class="bar-chart">
            <div class="bar-row">
              <span class="bar-label">${prevLabel}</span>
              <div class="bar-track">
                <div class="bar-fill pre" style="width: ${prePct}%"></div>
              </div>
              <span class="bar-value">${pre}</span>
            </div>
            <div class="bar-row">
              <span class="bar-label">${currLabel}</span>
              <div class="bar-track">
                <div class="bar-fill post" style="width: ${postPct}%"></div>
              </div>
              <span class="bar-value">${post}</span>
            </div>
          </div>
          <div class="emoji-level">
            <div class="level-item">
              <span class="level-emoji">${preLevel.emoji}</span>
              <span class="level-text">${preLevel.text}</span>
            </div>
            <span class="level-arrow">➡️</span>
            <div class="level-item">
              <span class="level-emoji">${postLevel.emoji}</span>
              <span class="level-text">${postLevel.text}</span>
            </div>
          </div>
          <div class="comp-card-interpretation">${interp.icon} ${interp.text}</div>
        </div>
      `;
    });
    dom.comparisonGrid.innerHTML = gridHtml;

    // --- 總分比較 ---
    const preTotal = preRecord.scores.total;
    const postTotal = postRecord.scores.total;
    let changeClass = "same";
    let changeText = "兩次測量總分相同";
    if (totalDiff > 0) {
      changeClass = "improved";
      changeText = `降低 ${totalDiff} 分（進步 ${totalPctChange}%）`;
    } else if (totalDiff < 0) {
      changeClass = "worsened";
      changeText = `增加 ${Math.abs(totalDiff)} 分`;
    }

    dom.comparisonTotal.innerHTML = `
      <h3 style="margin-bottom: var(--spacing-md)">總分比較</h3>
      <div class="total-score-row">
        <div class="total-block">
          <span class="total-label">${prevLabel}</span>
          <span class="total-number pre-color">${preTotal}</span>
        </div>
        <span class="total-arrow">➡️</span>
        <div class="total-block">
          <span class="total-label">${currLabel}</span>
          <span class="total-number post-color">${postTotal}</span>
        </div>
        <span style="color: var(--text-light); font-size: var(--font-size-sm)">/ ${totalMax}</span>
      </div>
      <div class="total-change ${changeClass}">${changeText}</div>
    `;

    // --- 綜合白話解讀 ---
    let interpHtml = "<h3>📖 各領域詳細解讀</h3>";
    itemsData.subscales.forEach((s) => {
      const pre = preRecord.scores[s.id] || 0;
      const post = postRecord.scores[s.id] || 0;
      const interp = getSubscaleInterpretation(s.id, pre, post, s.maxScore);
      interpHtml += `
        <div class="interp-item">
          <span class="interp-icon">${interp.icon}</span>
          <span class="interp-text">${interp.text}</span>
        </div>
      `;
    });
    interpHtml += `
      <div class="interp-item" style="margin-top: var(--spacing-md); padding-top: var(--spacing-sm); border-top: 1px solid rgba(255,255,255,0.08)">
        <span class="interp-icon">💬</span>
        <span class="interp-text">提醒：本量表分數越<strong>低</strong>代表執行功能表現越<strong>好</strong>（困難越少）。因此分數下降是好的趨勢！</span>
      </div>
    `;
    dom.comparisonInterpretation.innerHTML = interpHtml;

    // 更新歷史
    renderHistory();

    // 滾動到比較報告
    dom.comparisonReport.scrollIntoView({ behavior: "smooth" });
  }

  /* ====================================
     PDF 匯出（比較報告）
     ==================================== */

  async function exportComparisonPdf() {
    const btn = dom.btnExportComparisonPdf;
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = "⚙️ 產生中...";

    try {
      // 檢查函式庫
      if (typeof html2canvas === "undefined") {
        throw new Error("圖片轉換工具尚未載入，請稍候再試。");
      }
      var JsPDFClass =
        (window.jspdf && window.jspdf.jsPDF) || window.jsPDF || null;
      if (!JsPDFClass) {
        throw new Error("PDF 工具尚未載入，請稍候再試。");
      }

      var target = dom.comparisonReportInner;

      // html2canvas 擷取
      var canvas = await html2canvas(target, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#1a1a2e",
        logging: false,
      });

      // jsPDF 分頁
      var imgData = canvas.toDataURL("image/png");
      var pdf = new JsPDFClass("p", "mm", "a4");
      var pageW = pdf.internal.pageSize.getWidth();
      var pageH = pdf.internal.pageSize.getHeight();
      var margin = 10;
      var contentW = pageW - margin * 2;
      var imgH = (canvas.height * contentW) / canvas.width;
      var offsetY = margin;
      var availH = pageH - margin * 2;

      // 分頁切片
      if (imgH <= availH) {
        pdf.addImage(imgData, "PNG", margin, margin, contentW, imgH);
      } else {
        var srcPageH = (availH / imgH) * canvas.height;
        var y = 0;
        var pageNum = 0;
        while (y < canvas.height) {
          if (pageNum > 0) pdf.addPage();
          var sliceH = Math.min(srcPageH, canvas.height - y);
          var sliceCanvas = document.createElement("canvas");
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = sliceH;
          var ctx = sliceCanvas.getContext("2d");
          ctx.drawImage(
            canvas,
            0,
            y,
            canvas.width,
            sliceH,
            0,
            0,
            canvas.width,
            sliceH,
          );
          var sliceData = sliceCanvas.toDataURL("image/png");
          var sliceImgH = (sliceH * contentW) / canvas.width;
          pdf.addImage(sliceData, "PNG", margin, margin, contentW, sliceImgH);
          y += srcPageH;
          pageNum++;
        }
      }

      // 下載
      var childCode =
        dom.comparisonMeta.textContent.match(/：(\S+)/)?.[1] || "report";
      pdf.save(
        `TC-CHEXI_比較報告_${childCode}_${formatDateFile(new Date())}.pdf`,
      );
    } catch (err) {
      console.error("PDF 匯出失敗:", err);
      alert("ℹ️ " + (err.message || "PDF 匯出失敗，請稍後再試。"));
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  }

  /* ====================================
     工具函式
     ==================================== */

  function showInfoError(msg) {
    dom.infoError.textContent = msg;
    dom.infoError.style.display = "block";
    setTimeout(() => {
      dom.infoError.style.display = "none";
    }, 3000);
  }

  function formatDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function formatDateFile(d) {
    var y = d.getFullYear();
    var mo = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    var h = String(d.getHours()).padStart(2, "0");
    var mi = String(d.getMinutes()).padStart(2, "0");
    var sec = String(d.getSeconds()).padStart(2, "0");
    return y + mo + day + "_" + h + mi + sec;
  }

  function escHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* ====================================
     啟動
     ==================================== */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
