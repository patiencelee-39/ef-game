/**
 * analysis-controller.js — 訓練效果分析控制器
 *
 * 功能：
 *   1. 上傳並解析遊戲 CSV（PapaParse）
 *   2. 從 localStorage 讀取 TC-CHEXI 評估記錄
 *   3. 依 ChildCode 匹配遊戲資料 ↔ 量表記錄
 *   4. 產製整合分析報告（Chart.js 圖表）
 *
 * 外部依賴（需先載入）：
 *   - Chart.js 4.x
 *   - PapaParse 5.x
 *   - js/utils/constants.js（GameConstants）
 *
 * @version 1.0.0
 */

(function () {
  "use strict";

  /* ====================================
     常數
     ==================================== */

  var STORAGE_KEY = "efgame-chexi-records";
  var GC = window.GameConstants || {};
  var F = GC.CSV_FIELDS || {};
  var WM_PREFIX = GC.WM_ROUND_PREFIX || "WM";

  // TC-CHEXI 分量表
  var SUBSCALES = [
    { id: "wm", name: "工作記憶", nameEn: "Working Memory", maxScore: 40 },
    { id: "plan", name: "計畫", nameEn: "Planning", maxScore: 30 },
    { id: "reg", name: "調適", nameEn: "Regulation", maxScore: 25 },
    { id: "inhib", name: "抑制", nameEn: "Inhibition", maxScore: 25 },
  ];
  var TOTAL_MAX = 120;

  // 圖表色彩
  var COLORS = {
    blue: "rgba(102, 126, 234, 1)",
    blueFill: "rgba(102, 126, 234, 0.15)",
    green: "rgba(46, 204, 113, 1)",
    greenFill: "rgba(46, 204, 113, 0.15)",
    orange: "rgba(255, 152, 0, 1)",
    orangeFill: "rgba(255, 152, 0, 0.15)",
    red: "rgba(244, 67, 54, 1)",
    redFill: "rgba(244, 67, 54, 0.15)",
    purple: "rgba(155, 89, 182, 1)",
    purpleFill: "rgba(155, 89, 182, 0.15)",
    cyan: "rgba(0, 188, 212, 1)",
    cyanFill: "rgba(0, 188, 212, 0.15)",
    yellow: "rgba(255, 206, 86, 1)",
    yellowFill: "rgba(255, 206, 86, 0.15)",
  };

  // CSV 檔名正則
  var FILENAME_REGEX =
    GC.CSV_FILENAME_REGEX || /^EF訓練遊戲數據_(.+?)_(\d{8})_(\d{6})\.csv$/;

  /* ====================================
     統計工具 — 配對樣本 t 檢定
     ==================================== */

  /** Lanczos 近似法計算 ln(Γ(x)) */
  function _lnGamma(x) {
    var coef = [
      0.99999999999980993, 676.5203681218851, -1259.1392167224028,
      771.32342877765313, -176.61502916214059, 12.507343278686905,
      -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
    ];
    if (x < 0.5) {
      return Math.log(Math.PI / Math.sin(Math.PI * x)) - _lnGamma(1 - x);
    }
    x -= 1;
    var a = coef[0];
    var t = x + 7.5;
    for (var i = 1; i < coef.length; i++) a += coef[i] / (x + i);
    return (
      0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a)
    );
  }

  /** 正則化不完全 Beta 函數 I_x(a,b)，用連分數法 */
  function _betaReg(x, a, b) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    if (x > (a + 1) / (a + b + 2)) return 1 - _betaReg(1 - x, b, a);

    var lnBeta = _lnGamma(a) + _lnGamma(b) - _lnGamma(a + b);
    var front = Math.exp(a * Math.log(x) + b * Math.log(1 - x) - lnBeta) / a;

    var TINY = 1e-30;
    var f = 1,
      c = 1,
      d = 1;
    for (var i = 0; i <= 200; i++) {
      var m = i;
      var num;
      if (i === 0) {
        num = 1;
      } else if (i % 2 === 0) {
        var k = i / 2;
        num = (k * (b - k) * x) / ((a + 2 * k - 1) * (a + 2 * k));
      } else {
        var k2 = (i - 1) / 2;
        num =
          -((a + k2) * (a + b + k2) * x) / ((a + 2 * k2) * (a + 2 * k2 + 1));
      }
      d = 1 + num * d;
      if (Math.abs(d) < TINY) d = TINY;
      c = 1 + num / c;
      if (Math.abs(c) < TINY) c = TINY;
      d = 1 / d;
      var delta = c * d;
      f *= delta;
      if (Math.abs(delta - 1) < 1e-10) break;
    }
    return front * (f - 1);
  }

  /** 雙尾 p 值：t 分佈 */
  function _tTestPValue(tStat, df) {
    if (!isFinite(tStat)) return tStat === 0 ? 1 : 0;
    var x = df / (df + tStat * tStat);
    return _betaReg(x, df / 2, 0.5);
  }

  /**
   * 配對樣本 t 檢定
   * @param {number[]} pre  前測數值陣列
   * @param {number[]} post 後測數值陣列（與 pre 一一配對）
   * @returns {{ t:number, df:number, p:number, meanDiff:number, sd:number, n:number }|null}
   */
  function pairedTTest(pre, post) {
    var n = pre.length;
    if (n < 2 || n !== post.length) return null;

    var diffs = [];
    var sum = 0;
    for (var i = 0; i < n; i++) {
      var d = post[i] - pre[i];
      diffs.push(d);
      sum += d;
    }
    var meanDiff = sum / n;

    var ssq = 0;
    for (var i = 0; i < n; i++)
      ssq += (diffs[i] - meanDiff) * (diffs[i] - meanDiff);
    var sd = Math.sqrt(ssq / (n - 1));

    if (sd === 0) {
      return {
        t: 0,
        df: n - 1,
        p: meanDiff === 0 ? 1 : 0,
        meanDiff: meanDiff,
        sd: 0,
        n: n,
      };
    }
    var se = sd / Math.sqrt(n);
    var t = meanDiff / se;
    return {
      t: t,
      df: n - 1,
      p: _tTestPValue(t, n - 1),
      meanDiff: meanDiff,
      sd: sd,
      n: n,
    };
  }

  /** 顯著性星號 */
  function _sigStars(p) {
    if (p < 0.001) return "***";
    if (p < 0.01) return "**";
    if (p < 0.05) return "*";
    return "n.s.";
  }

  /** 計算平均數與標準差 */
  function _meanSD(arr) {
    var n = arr.length;
    if (n === 0) return { m: 0, sd: 0 };
    var sum = 0;
    for (var i = 0; i < n; i++) sum += arr[i];
    var m = sum / n;
    var ssq = 0;
    for (var i = 0; i < n; i++) ssq += (arr[i] - m) * (arr[i] - m);
    return { m: m, sd: Math.sqrt(ssq / (n > 1 ? n - 1 : 1)) };
  }

  /** 產生 t 檢定結果表格一列 */
  function _buildTTestRow(label, result, preVals, postVals) {
    if (!result) {
      return (
        "<tr><td>" +
        label +
        "</td><td colspan='8' style='text-align:center;color:rgba(255,255,255,0.4)'>資料不足</td></tr>"
      );
    }
    var preStat = _meanSD(preVals);
    var postStat = _meanSD(postVals);
    var sig = _sigStars(result.p);
    var sigCls = sig !== "n.s." ? "ttest-sig" : "ttest-ns";
    var pStr = result.p < 0.001 ? "< .001" : result.p.toFixed(3);

    return (
      "<tr>" +
      "<td>" +
      label +
      "</td>" +
      "<td>" +
      result.n +
      "</td>" +
      "<td>" +
      preStat.m.toFixed(2) +
      " (" +
      preStat.sd.toFixed(2) +
      ")</td>" +
      "<td>" +
      postStat.m.toFixed(2) +
      " (" +
      postStat.sd.toFixed(2) +
      ")</td>" +
      "<td>" +
      result.meanDiff.toFixed(2) +
      " (" +
      result.sd.toFixed(2) +
      ")</td>" +
      "<td>" +
      result.t.toFixed(3) +
      "</td>" +
      "<td>" +
      result.df +
      "</td>" +
      "<td>" +
      pStr +
      "</td>" +
      '<td class="' +
      sigCls +
      '">' +
      sig +
      "</td>" +
      "</tr>"
    );
  }

  /* ====================================
     狀態
     ==================================== */

  var uploadedFiles = []; // { file: File, name: string }
  var parsedSessions = []; // [{ fileName, participantId, date, data[] }]
  var matchedChildCode = ""; // 從 CSV 偵測到的代碼
  var matchedAssessments = []; // 匹配的量表記錄
  var charts = {}; // Chart.js 實例

  /* ====================================
     DOM 參照
     ==================================== */

  var dom = {};

  function $(sel) {
    return document.querySelector(sel);
  }

  function cacheDom() {
    dom.uploadArea = $("#uploadArea");
    dom.csvFileInput = $("#csvFileInput");
    dom.csvFileInputAdditional = $("#csvFileInputAdditional");
    dom.fileList = $("#fileList");
    dom.fileListUl = $("#fileListUl");
    dom.btnClearFiles = $("#btnClearFiles");
    dom.btnAddMore = $("#btnAddMore");

    dom.matchSection = $("#matchSection");
    dom.matchInfo = $("#matchInfo");

    dom.reportSection = $("#reportSection");
    dom.reportMeta = $("#reportMeta");
    dom.preTestBlock = $("#preTestBlock");
    dom.preTestSummary = $("#preTestSummary");
    dom.postTestBlock = $("#postTestBlock");
    dom.postTestSummary = $("#postTestSummary");
    dom.assessmentBlock = $("#assessmentBlock");
    dom.assessmentSummary = $("#assessmentSummary");
    dom.gameBlock = $("#gameBlock");
    dom.gameStatsRow = $("#gameStatsRow");
    dom.thetaBlock = $("#thetaBlock");
    dom.wmBlock = $("#wmBlock");
    dom.integrationBlock = $("#integrationBlock");
    dom.integrationContent = $("#integrationContent");
    dom.toast = $("#toast");
  }

  /* ====================================
     初始化
     ==================================== */

  document.addEventListener("DOMContentLoaded", function () {
    cacheDom();
    bindEvents();
  });

  function bindEvents() {
    // 上傳區域拖曳
    dom.uploadArea.addEventListener("dragover", function (e) {
      e.preventDefault();
      dom.uploadArea.classList.add("dragover");
    });
    dom.uploadArea.addEventListener("dragleave", function () {
      dom.uploadArea.classList.remove("dragover");
    });
    dom.uploadArea.addEventListener("drop", function (e) {
      e.preventDefault();
      dom.uploadArea.classList.remove("dragover");
      handleFiles(e.dataTransfer.files);
    });

    // 點擊上傳
    dom.csvFileInput.addEventListener("change", function () {
      handleFiles(this.files);
      this.value = "";
    });

    // 追加檔案
    dom.btnAddMore.addEventListener("click", function () {
      dom.csvFileInputAdditional.click();
    });
    dom.csvFileInputAdditional.addEventListener("change", function () {
      handleFiles(this.files);
      this.value = "";
    });

    // 清除
    dom.btnClearFiles.addEventListener("click", clearAll);
  }

  /* ====================================
     檔案處理
     ==================================== */

  function handleFiles(fileListObj) {
    var files = Array.from(fileListObj);
    if (files.length === 0) return;

    files.forEach(function (file) {
      if (!file.name.endsWith(".csv")) {
        showToast("⚠️ 略過非 CSV 檔：" + file.name);
        return;
      }
      // 避免重複
      var dup = uploadedFiles.some(function (u) {
        return u.name === file.name;
      });
      if (dup) {
        showToast("⚠️ 已有同名檔案：" + file.name);
        return;
      }
      uploadedFiles.push({ file: file, name: file.name });
    });

    renderFileList();
    parseAllCsv();
  }

  function renderFileList() {
    if (uploadedFiles.length === 0) {
      dom.fileList.style.display = "none";
      return;
    }

    dom.fileList.style.display = "";
    dom.fileListUl.innerHTML = "";

    uploadedFiles.forEach(function (u, idx) {
      var li = document.createElement("li");
      li.innerHTML =
        '<span class="file-name">📄 ' +
        escapeHtml(u.name) +
        "</span>" +
        '<button class="file-remove" data-idx="' +
        idx +
        '" title="移除">✕</button>';
      dom.fileListUl.appendChild(li);
    });

    // 綁定移除鈕
    dom.fileListUl.querySelectorAll(".file-remove").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var i = parseInt(this.dataset.idx, 10);
        uploadedFiles.splice(i, 1);
        renderFileList();
        if (uploadedFiles.length > 0) {
          parseAllCsv();
        } else {
          clearAll();
        }
      });
    });
  }

  function clearAll() {
    uploadedFiles = [];
    parsedSessions = [];
    matchedChildCode = "";
    matchedAssessments = [];
    destroyCharts();

    dom.fileList.style.display = "none";
    dom.fileListUl.innerHTML = "";
    dom.matchSection.style.display = "none";
    dom.reportSection.style.display = "none";
    dom.preTestBlock.style.display = "none";
    dom.postTestBlock.style.display = "none";
  }

  /* ====================================
     CSV 解析
     ==================================== */

  function parseAllCsv() {
    var pending = uploadedFiles.length;
    var results = [];

    uploadedFiles.forEach(function (u) {
      Papa.parse(u.file, {
        header: true,
        skipEmptyLines: true,
        complete: function (res) {
          results.push({ uploadName: u.name, data: res.data });
          pending--;
          if (pending === 0) onAllParsed(results);
        },
        error: function () {
          showToast("❌ 解析失敗：" + u.name);
          pending--;
          if (pending === 0) onAllParsed(results);
        },
      });
    });
  }

  function onAllParsed(results) {
    parsedSessions = [];
    var detectedParticipants = {};
    var detectedChildCodes = {};

    results.forEach(function (r) {
      if (!r.data || r.data.length === 0) return;

      // 從檔名或資料取得資訊
      var internalName = r.data[0][F.FILE_NAME] || r.uploadName;
      var match = internalName.match(FILENAME_REGEX);
      if (!match) {
        match = r.uploadName.match(FILENAME_REGEX);
      }

      var participantId = "";
      var dateStr = "";
      if (match) {
        participantId = match[1];
        dateStr = match[2] + "_" + match[3];
      } else {
        // 從資料列取得
        participantId =
          r.data[0][F.CHILD_CODE] || r.data[0][F.PARTICIPANT] || "unknown";
        dateStr = r.data[0][F.GAME_END_TIME] || r.data[0][F.TIMESTAMP] || "";
      }

      if (participantId) {
        detectedParticipants[participantId.toLowerCase()] = participantId;
      }

      // 讀取 ChildCode（量表配對用欄位，優先作為匹配依據）
      var childCodeFromCsv = "";
      for (var ci = 0; ci < r.data.length; ci++) {
        var ccVal = r.data[ci][F.CHILD_CODE];
        if (ccVal && ccVal.trim()) {
          childCodeFromCsv = ccVal.trim();
          break;
        }
      }
      if (childCodeFromCsv) {
        detectedChildCodes[childCodeFromCsv.toLowerCase()] = childCodeFromCsv;
      }

      // 分離一般試題 vs WM 試題，跳過 SDT_Summary
      var regularTrials = [];
      var wmTrials = [];
      r.data.forEach(function (row) {
        if (!row[F.ROUND]) return;
        if (row[F.FILE_NAME] === "SDT_Summary") return;
        if (row[F.ROUND].toString().indexOf(WM_PREFIX) === 0) {
          wmTrials.push(row);
        } else {
          regularTrials.push(row);
        }
      });

      parsedSessions.push({
        fileName: internalName,
        uploadName: r.uploadName,
        participantId: participantId,
        childCode: childCodeFromCsv,
        dateStr: dateStr,
        date: parseDateStr(dateStr),
        regularTrials: regularTrials,
        wmTrials: wmTrials,
        allData: r.data,
      });
    });

    // 按日期排序
    parsedSessions.sort(function (a, b) {
      return (a.date || 0) - (b.date || 0);
    });

    // 偵測主要 ChildCode：優先使用 ChildCode 欄位，其次用 Participant
    var childCodes = Object.keys(detectedChildCodes);
    var participantCodes = Object.keys(detectedParticipants);
    if (childCodes.length > 0) {
      matchedChildCode = detectedChildCodes[childCodes[0]];
    } else if (participantCodes.length > 0) {
      matchedChildCode = detectedParticipants[participantCodes[0]];
    } else {
      matchedChildCode = "";
    }

    // 匹配量表
    matchAssessment();

    // 顯示分析
    generateReport();
  }

  function parseDateStr(s) {
    if (!s) return null;
    // 嘗試 YYYYMMDD_HHMMSS 或 YYYYMMDD
    var m = s.match(/(\d{4})(\d{2})(\d{2})(?:_(\d{2})(\d{2})(\d{2}))?/);
    if (!m) {
      // 嘗試 ISO 或其他格式
      var d = new Date(s);
      return isNaN(d.getTime()) ? null : d;
    }
    return new Date(
      parseInt(m[1]),
      parseInt(m[2]) - 1,
      parseInt(m[3]),
      parseInt(m[4] || 0),
      parseInt(m[5] || 0),
      parseInt(m[6] || 0),
    );
  }

  /* ====================================
     量表匹配
     ==================================== */

  function matchAssessment() {
    matchedAssessments = [];
    if (!matchedChildCode) return;

    var records = loadAssessmentRecords();
    var codeLower = matchedChildCode.toLowerCase();

    matchedAssessments = records.filter(function (r) {
      var base = getBaseCode(r.childCode).toLowerCase();
      // 也嘗試比對 baseCode 欄位（較新版存的）
      var baseAlt = (r.baseCode || "").toLowerCase();
      return base === codeLower || baseAlt === codeLower;
    });

    // 若主要 ChildCode 無匹配，嘗試用各 session 的 participantId 匹配
    if (matchedAssessments.length === 0) {
      var triedCodes = {};
      triedCodes[codeLower] = true;
      for (var si = 0; si < parsedSessions.length; si++) {
        var altCode = (parsedSessions[si].participantId || "").toLowerCase();
        if (altCode && !triedCodes[altCode]) {
          triedCodes[altCode] = true;
          var altMatch = records.filter(function (r) {
            var base = getBaseCode(r.childCode).toLowerCase();
            var baseAlt = (r.baseCode || "").toLowerCase();
            return base === altCode || baseAlt === altCode;
          });
          if (altMatch.length > 0) {
            matchedAssessments = altMatch;
            matchedChildCode = parsedSessions[si].participantId;
            break;
          }
        }
      }
    }

    // 按日期排序
    matchedAssessments.sort(function (a, b) {
      return new Date(a.date) - new Date(b.date);
    });
  }

  function loadAssessmentRecords() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

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

  /* ====================================
     報告生成
     ==================================== */

  function generateReport() {
    destroyCharts();

    if (parsedSessions.length === 0) {
      showToast("⚠️ 無有效的 CSV 資料");
      return;
    }

    // 顯示匹配區
    renderMatchInfo();

    // 顯示報告區
    dom.reportSection.style.display = "";

    // 報告元資訊
    renderReportMeta();

    // ① 前測
    if (matchedAssessments.length > 0) {
      renderPreTest();
    } else {
      dom.preTestBlock.style.display = "none";
    }

    // ② 遊戲訓練數據
    renderGameTrends();

    // ③ 後測
    if (matchedAssessments.length >= 2) {
      renderPostTest();
    } else {
      dom.postTestBlock.style.display = "none";
    }

    // ④ 前後測比較 + 圖表
    if (matchedAssessments.length >= 2) {
      renderAssessmentComparison();
    } else {
      dom.assessmentBlock.style.display = "none";
    }

    // ⑤ 整合對照
    if (matchedAssessments.length >= 2) {
      renderIntegration();
    } else {
      dom.integrationBlock.style.display = "none";
    }

    // 滾動到報告
    dom.reportSection.scrollIntoView({ behavior: "smooth" });
  }

  /* ====================================
     匹配資訊
     ==================================== */

  function renderMatchInfo() {
    dom.matchSection.style.display = "";

    // 收集所有偵測到的代碼供除錯
    var allChildCodes = [];
    var allParticipants = [];
    parsedSessions.forEach(function (s) {
      if (s.childCode && allChildCodes.indexOf(s.childCode) === -1) {
        allChildCodes.push(s.childCode);
      }
      if (s.participantId && allParticipants.indexOf(s.participantId) === -1) {
        allParticipants.push(s.participantId);
      }
    });

    var html = '<div class="match-card">';
    html += '<div class="match-label">👤 偵測到的兒童代碼</div>';
    html +=
      '<div style="font-weight:700">' +
      escapeHtml(matchedChildCode || "（無法偵測）") +
      "</div>";
    // 顯示完整偵測資訊
    if (allChildCodes.length > 0 || allParticipants.length > 0) {
      html +=
        '<div style="font-size:0.78rem;color:rgba(255,255,255,0.4);margin-top:4px">';
      if (allChildCodes.length > 0) {
        html += "CSV ChildCode 欄：" + escapeHtml(allChildCodes.join(", "));
      }
      if (allParticipants.length > 0) {
        html +=
          (allChildCodes.length > 0 ? " ｜ " : "") +
          "Participant 欄：" +
          escapeHtml(allParticipants.join(", "));
      }
      html += "</div>";
    }
    html += "</div>";

    html += '<div class="match-card">';
    html += '<div class="match-label">📋 量表評估記錄</div>';

    if (matchedAssessments.length > 0) {
      html +=
        '<span class="match-status matched">✅ 找到 ' +
        matchedAssessments.length +
        " 筆記錄</span>";
      html += "<ul style='margin-top:8px;padding-left:20px;'>";
      matchedAssessments.forEach(function (r) {
        html +=
          "<li>" +
          getTestLabel(r.testType) +
          " — " +
          (r.dateDisplay || r.date) +
          " — 總分 " +
          r.scores.total +
          "</li>";
      });
      html += "</ul>";
    } else {
      html +=
        '<span class="match-status no-match">⚠️ 未找到匹配的量表記錄</span>';
      // 顯示 localStorage 中有哪些量表記錄，方便除錯
      var allRecords = loadAssessmentRecords();
      if (allRecords.length > 0) {
        html +=
          '<p style="margin-top:6px;font-size:0.78rem;color:rgba(255,255,255,0.4)">' +
          "目前 localStorage 中有 " +
          allRecords.length +
          " 筆量表記錄（代碼：";
        var existingCodes = [];
        allRecords.forEach(function (r) {
          var bc = getBaseCode(r.childCode) || r.baseCode || "?";
          if (existingCodes.indexOf(bc) === -1) existingCodes.push(bc);
        });
        html += escapeHtml(existingCodes.join(", ")) + "）</p>";
      }
      html +=
        '<p style="margin-top:6px;font-size:0.8rem;color:rgba(255,255,255,0.5)">將僅顯示遊戲效能趨勢分析。如需整合分析，請先在「量表評估」填寫 TC-CHEXI 量表，且兒童代碼需與遊戲 CSV 的 ChildCode 欄位一致。</p>';
    }
    html += "</div>";

    html += '<div class="match-card">';
    html += '<div class="match-label">🎮 遊戲 CSV 場次</div>';
    html += "<div>" + parsedSessions.length + " 個場次</div>";
    html += "<ul style='margin-top:6px;padding-left:20px;'>";
    parsedSessions.forEach(function (s, i) {
      var d = s.date ? formatDate(s.date) : s.dateStr;
      html +=
        "<li>場次 " +
        (i + 1) +
        "：" +
        d +
        " — " +
        s.regularTrials.length +
        " 題 + " +
        s.wmTrials.length +
        " WM 題</li>";
    });
    html += "</ul></div>";

    dom.matchInfo.innerHTML = html;
  }

  /* ====================================
     報告元資訊
     ==================================== */

  function renderReportMeta() {
    var lines = [];
    lines.push(
      "👤 兒童代碼：<strong>" + escapeHtml(matchedChildCode) + "</strong>",
    );
    lines.push("🎮 遊戲場次數：<strong>" + parsedSessions.length + "</strong>");

    if (matchedAssessments.length > 0) {
      lines.push(
        "📋 量表評估：<strong>" + matchedAssessments.length + " 筆</strong>",
      );
    }

    if (parsedSessions.length > 0) {
      var first = parsedSessions[0].date;
      var last = parsedSessions[parsedSessions.length - 1].date;
      if (first && last) {
        var diffDays = Math.round((last - first) / (1000 * 60 * 60 * 24));
        lines.push(
          "📅 訓練期間：" +
            formatDate(first) +
            " ～ " +
            formatDate(last) +
            "（" +
            diffDays +
            " 天）",
        );
      }
    }

    dom.reportMeta.innerHTML = lines.join("<br>");
  }

  /* ====================================
     遊戲效能趨勢
     ==================================== */

  function renderGameTrends() {
    // 計算每個 session 的統計
    var sessionStats = parsedSessions.map(function (s, idx) {
      var correct = 0;
      var total = s.regularTrials.length;
      var rtSum = 0;
      var rtCount = 0;
      var hits = 0;
      var fa = 0;
      var misses = 0;
      var cr = 0;
      var thetas = [];

      s.regularTrials.forEach(function (row) {
        if (
          row[F.CORRECT] === "yes" ||
          row[F.CORRECT] === "true" ||
          row[F.CORRECT] === "1"
        ) {
          correct++;
        }

        var rt = parseFloat(row[F.RT_MS]);
        if (rt > 0) {
          rtSum += rt;
          rtCount++;
        }

        // SDT
        var result = row[F.RESULT] || "";
        if (result === "Hit") hits++;
        else if (result === "FA") fa++;
        else if (result === "Miss") misses++;
        else if (result === "CR") cr++;

        // Theta
        var theta = parseFloat(row[F.THETA]);
        if (!isNaN(theta)) thetas.push(theta);
      });

      // WM 正確率
      var wmCorrect = 0;
      var wmTotal = s.wmTrials.length;
      s.wmTrials.forEach(function (row) {
        if (
          row[F.CORRECT] === "yes" ||
          row[F.CORRECT] === "true" ||
          row[F.CORRECT] === "1"
        ) {
          wmCorrect++;
        }
      });

      var acc = total > 0 ? ((correct / total) * 100).toFixed(1) : 0;
      var avgRt = rtCount > 0 ? Math.round(rtSum / rtCount) : 0;

      // d'
      var goTotal = hits + misses;
      var noGoTotal = fa + cr;
      var dPrime = calculateDPrime(hits, fa, goTotal, noGoTotal);

      // 取最後一個 theta
      var lastTheta = thetas.length > 0 ? thetas[thetas.length - 1] : null;

      var wmAcc = wmTotal > 0 ? ((wmCorrect / wmTotal) * 100).toFixed(1) : null;

      return {
        label: "場次 " + (idx + 1),
        date: s.date,
        dateStr: s.date ? formatDate(s.date) : s.dateStr,
        accuracy: parseFloat(acc),
        avgRT: avgRt,
        dPrime: dPrime,
        theta: lastTheta,
        wmAccuracy: wmAcc !== null ? parseFloat(wmAcc) : null,
        totalTrials: total,
        wmTrials: wmTotal,
        hits: hits,
        fa: fa,
        misses: misses,
        cr: cr,
      };
    });

    // 概覽卡片
    renderGameStats(sessionStats);

    // 圖表標籤
    var labels = sessionStats.map(function (s) {
      return s.dateStr || s.label;
    });

    // 正確率趨勢
    renderLineChart(
      "chartAccuracy",
      labels,
      [
        {
          label: "正確率 (%)",
          data: sessionStats.map(function (s) {
            return s.accuracy;
          }),
          borderColor: COLORS.blue,
          backgroundColor: COLORS.blueFill,
        },
      ],
      { yMin: 0, yMax: 100, yLabel: "正確率 (%)" },
    );

    // RT 趨勢
    renderLineChart(
      "chartRT",
      labels,
      [
        {
          label: "平均 RT (ms)",
          data: sessionStats.map(function (s) {
            return s.avgRT;
          }),
          borderColor: COLORS.orange,
          backgroundColor: COLORS.orangeFill,
        },
      ],
      { yLabel: "反應時間 (ms)" },
    );

    // d' 趨勢
    renderLineChart(
      "chartDPrime",
      labels,
      [
        {
          label: "d' (辨別力)",
          data: sessionStats.map(function (s) {
            return s.dPrime;
          }),
          borderColor: COLORS.green,
          backgroundColor: COLORS.greenFill,
        },
      ],
      { yLabel: "d'" },
    );

    // Theta 趨勢（如有）
    var hasTheta = sessionStats.some(function (s) {
      return s.theta !== null;
    });
    if (hasTheta) {
      dom.thetaBlock.style.display = "";
      renderLineChart(
        "chartTheta",
        labels,
        [
          {
            label: "θ (能力估計值)",
            data: sessionStats.map(function (s) {
              return s.theta;
            }),
            borderColor: COLORS.purple,
            backgroundColor: COLORS.purpleFill,
          },
        ],
        { yLabel: "θ" },
      );
    } else {
      dom.thetaBlock.style.display = "none";
    }

    // WM 趨勢（如有）
    var hasWm = sessionStats.some(function (s) {
      return s.wmAccuracy !== null;
    });
    if (hasWm) {
      dom.wmBlock.style.display = "";
      renderLineChart(
        "chartWM",
        labels,
        [
          {
            label: "WM 正確率 (%)",
            data: sessionStats.map(function (s) {
              return s.wmAccuracy;
            }),
            borderColor: COLORS.cyan,
            backgroundColor: COLORS.cyanFill,
          },
        ],
        { yMin: 0, yMax: 100, yLabel: "WM 正確率 (%)" },
      );
    } else {
      dom.wmBlock.style.display = "none";
    }
  }

  function renderGameStats(sessionStats) {
    if (sessionStats.length === 0) {
      dom.gameStatsRow.innerHTML = "";
      return;
    }

    var first = sessionStats[0];
    var last = sessionStats[sessionStats.length - 1];
    var totalTrials = sessionStats.reduce(function (sum, s) {
      return sum + s.totalTrials;
    }, 0);
    var avgAcc = (
      sessionStats.reduce(function (sum, s) {
        return sum + s.accuracy;
      }, 0) / sessionStats.length
    ).toFixed(1);

    var cards = [
      { val: sessionStats.length, label: "總場次" },
      { val: totalTrials, label: "總題數" },
      { val: avgAcc + "%", label: "平均正確率" },
      { val: Math.round(last.avgRT) + "ms", label: "最近 RT" },
      { val: last.dPrime.toFixed(2), label: "最近 d'" },
    ];

    // 正確率變化
    if (sessionStats.length >= 2) {
      var accChange = last.accuracy - first.accuracy;
      var changeStr = (accChange >= 0 ? "+" : "") + accChange.toFixed(1) + "%";
      cards.push({
        val: changeStr,
        label: "正確率變化",
        cls:
          accChange > 0
            ? "change-positive"
            : accChange < 0
              ? "change-negative"
              : "",
      });
    }

    dom.gameStatsRow.innerHTML = cards
      .map(function (c) {
        return (
          '<div class="stat-mini"><div class="stat-val ' +
          (c.cls || "") +
          '">' +
          c.val +
          '</div><div class="stat-label">' +
          c.label +
          "</div></div>"
        );
      })
      .join("");
  }

  /* ====================================
     前測顯示
     ==================================== */

  function renderPreTest() {
    dom.preTestBlock.style.display = "";
    var preRecord = matchedAssessments[0];
    dom.preTestSummary.innerHTML = _buildSingleTestCard(preRecord);
  }

  /* ====================================
     後測顯示
     ==================================== */

  function renderPostTest() {
    dom.postTestBlock.style.display = "";
    var postRecord = matchedAssessments[matchedAssessments.length - 1];
    dom.postTestSummary.innerHTML = _buildSingleTestCard(postRecord);
  }

  /**
   * 為單一次量表測量建立資訊卡片
   */
  function _buildSingleTestCard(record) {
    var html = '<div class="single-test-card">';
    html += '<div class="test-meta">';
    html +=
      '<span class="test-type-badge">' +
      getTestLabel(record.testType) +
      "</span>";
    html +=
      '<span class="test-date">' +
      (record.dateDisplay || record.date) +
      "</span>";
    if (record.fillerRole) {
      html +=
        '<span class="test-role">' +
        (record.fillerRole === "parent"
          ? "家長"
          : record.fillerRole === "teacher"
            ? "教師"
            : record.fillerRole) +
        "填寫</span>";
    }
    html += "</div>";

    // 分量表分數
    html += '<div class="test-scores-grid">';
    SUBSCALES.forEach(function (sub) {
      var score = record.scores[sub.id] || 0;
      var pct = ((score / sub.maxScore) * 100).toFixed(0);
      html += '<div class="test-score-item">';
      html += '<div class="test-score-label">' + sub.name + "</div>";
      html +=
        '<div class="test-score-value">' +
        score +
        "<small> / " +
        sub.maxScore +
        "</small></div>";
      html +=
        '<div class="test-score-bar"><div class="test-score-fill" style="width:' +
        pct +
        '%"></div></div>';
      html += "</div>";
    });
    html += "</div>";

    // 總分
    html += '<div class="test-total">';
    html += "總分：<strong>" + record.scores.total + "</strong> / " + TOTAL_MAX;
    html += "</div>";

    html += "</div>";
    return html;
  }

  /* ====================================
     量表前後測比較
     ==================================== */

  function renderAssessmentComparison() {
    dom.assessmentBlock.style.display = "";

    // 構建表格
    var html = '<table class="assess-table">';
    html += "<thead><tr><th>分量表</th>";

    matchedAssessments.forEach(function (r) {
      html +=
        "<th>" +
        getTestLabel(r.testType) +
        "<br><small>" +
        (r.dateDisplay || r.date) +
        "</small></th>";
    });

    if (matchedAssessments.length >= 2) {
      html += "<th>變化量</th>";
    }
    html += "</tr></thead><tbody>";

    // 分量表
    SUBSCALES.forEach(function (sub) {
      html +=
        "<tr><td>" +
        sub.name +
        " (" +
        sub.nameEn +
        ")<br><small>滿分 " +
        sub.maxScore +
        "</small></td>";
      matchedAssessments.forEach(function (r) {
        html += "<td>" + (r.scores[sub.id] || 0) + "</td>";
      });
      if (matchedAssessments.length >= 2) {
        var first = matchedAssessments[0].scores[sub.id] || 0;
        var last =
          matchedAssessments[matchedAssessments.length - 1].scores[sub.id] || 0;
        var diff = last - first;
        var cls =
          diff < 0
            ? "change-positive"
            : diff > 0
              ? "change-negative"
              : "change-neutral";
        html +=
          '<td class="' + cls + '">' + (diff > 0 ? "+" : "") + diff + "</td>";
      }
      html += "</tr>";
    });

    // 總分
    html +=
      "<tr style='font-weight:600'><td>總分 (Total)<br><small>滿分 " +
      TOTAL_MAX +
      "</small></td>";
    matchedAssessments.forEach(function (r) {
      html += "<td>" + r.scores.total + "</td>";
    });
    if (matchedAssessments.length >= 2) {
      var fTotal = matchedAssessments[0].scores.total;
      var lTotal =
        matchedAssessments[matchedAssessments.length - 1].scores.total;
      var tDiff = lTotal - fTotal;
      var tCls =
        tDiff < 0
          ? "change-positive"
          : tDiff > 0
            ? "change-negative"
            : "change-neutral";
      html +=
        '<td class="' + tCls + '">' + (tDiff > 0 ? "+" : "") + tDiff + "</td>";
    }
    html += "</tr></tbody></table>";

    html +=
      '<p style="font-size:0.75rem;color:rgba(255,255,255,0.45);margin-top:8px">※ TC-CHEXI 分數越低表示執行功能表現越好（改善方向為負值）</p>';

    // ── 配對樣本 t 檢定 ──
    if (matchedAssessments.length >= 2) {
      var preRec = matchedAssessments[0];
      var postRec = matchedAssessments[matchedAssessments.length - 1];

      if (
        preRec.responses &&
        postRec.responses &&
        preRec.responses.length &&
        postRec.responses.length
      ) {
        // 建立 itemId → value 的映射
        var preMap = {};
        preRec.responses.forEach(function (r) {
          preMap[r.itemId] = r.value;
        });
        var postMap = {};
        postRec.responses.forEach(function (r) {
          postMap[r.itemId] = r.value;
        });

        html += '<div class="ttest-section">';
        html +=
          '<h4 class="ttest-title">配對樣本 t 檢定 (Paired-samples t-test)</h4>';
        html +=
          '<p class="ttest-desc">以題目為配對單位，比較' +
          getTestLabel(preRec.testType) +
          "與" +
          getTestLabel(postRec.testType) +
          "各題項得分差異。</p>";
        html += '<table class="ttest-table">';
        html +=
          "<thead><tr>" +
          "<th>分量表</th>" +
          "<th>n (題數)</th>" +
          "<th>前測 M(SD)</th>" +
          "<th>後測 M(SD)</th>" +
          "<th>差異 M(SD)</th>" +
          "<th><i>t</i></th>" +
          "<th><i>df</i></th>" +
          "<th><i>p</i></th>" +
          "<th>顯著性</th>" +
          "</tr></thead><tbody>";

        var allPre = [],
          allPost = [];

        SUBSCALES.forEach(function (sub) {
          var preVals = [],
            postVals = [];
          // 收集該分量表所有題目的前後測分數
          preRec.responses.forEach(function (r) {
            if (
              r.subscale === sub.id &&
              preMap[r.itemId] != null &&
              postMap[r.itemId] != null
            ) {
              preVals.push(preMap[r.itemId]);
              postVals.push(postMap[r.itemId]);
            }
          });

          allPre = allPre.concat(preVals);
          allPost = allPost.concat(postVals);

          var result = pairedTTest(preVals, postVals);
          html += _buildTTestRow(sub.name, result, preVals, postVals);
        });

        // 總分列
        var totalResult = pairedTTest(allPre, allPost);
        html += _buildTTestRow(
          "<b>總量表 (Total)</b>",
          totalResult,
          allPre,
          allPost,
        );

        html += "</tbody></table>";
        html +=
          '<p class="ttest-note">※ * <i>p</i> < .05 &nbsp; ** <i>p</i> < .01 &nbsp; *** <i>p</i> < .001 &nbsp; n.s. = not significant</p>';
        html +=
          '<p class="ttest-note">※ 差異 = 後測 − 前測；負值表示分數下降（改善）</p>';
        html += "</div>";
      }
    }

    dom.assessmentSummary.innerHTML = html;

    // 長條圖
    if (matchedAssessments.length >= 2) {
      var assessLabels = SUBSCALES.map(function (s) {
        return s.name;
      });
      assessLabels.push("總分");

      var datasets = matchedAssessments.map(function (r, idx) {
        var palette = [
          COLORS.blue,
          COLORS.green,
          COLORS.orange,
          COLORS.purple,
          COLORS.cyan,
          COLORS.red,
        ];
        var color = palette[idx % palette.length];
        var fillPalette = [
          COLORS.blueFill,
          COLORS.greenFill,
          COLORS.orangeFill,
          COLORS.purpleFill,
          COLORS.cyanFill,
          COLORS.redFill,
        ];
        var fillColor = fillPalette[idx % fillPalette.length];

        var data = SUBSCALES.map(function (s) {
          return r.scores[s.id] || 0;
        });
        data.push(r.scores.total);

        return {
          label: getTestLabel(r.testType),
          data: data,
          backgroundColor: fillColor,
          borderColor: color,
          borderWidth: 2,
        };
      });

      renderBarChart("chartAssessment", assessLabels, datasets);
    }
  }

  /* ====================================
     整合對照分析
     ==================================== */

  function renderIntegration() {
    dom.integrationBlock.style.display = "";

    // 量表 × 遊戲指標的自然映射
    var pairs = [
      {
        subscale: "wm",
        name: "工作記憶 (Working Memory)",
        gameMetric: "wmAccuracy",
        gameLabel: "WM 測驗正確率 (%)",
        desc: "TC-CHEXI 工作記憶分量表分數 vs. 遊戲工作記憶測驗正確率。理想情境：量表分數下降 + 遊戲正確率上升。",
      },
      {
        subscale: "inhib",
        name: "抑制 (Inhibition)",
        gameMetric: "dPrime",
        gameLabel: "d' (辨別力)",
        desc: "TC-CHEXI 抑制分量表分數 vs. 遊戲 Go/No-Go 辨別力 d'。理想情境：量表分數下降 + d' 上升。",
      },
      {
        subscale: "inhib",
        name: "抑制 × 虛報率",
        gameMetric: "faRate",
        gameLabel: "FA 虛報率",
        desc: "TC-CHEXI 抑制分量表 vs. No-Go 試題虛報率。理想情境：兩者均下降。",
        customCalc: function (stats) {
          return stats.map(function (s) {
            var noGoTotal = s.fa + s.cr;
            return noGoTotal > 0 ? ((s.fa / noGoTotal) * 100).toFixed(1) : null;
          });
        },
      },
    ];

    var html = "";

    pairs.forEach(function (pair) {
      html += '<div class="integration-pair">';
      html += "<h4>🔗 " + pair.name + "</h4>";
      html += '<p class="pair-desc">' + pair.desc + "</p>";

      // 量表數據
      var preAssess = matchedAssessments[0];
      var postAssess = matchedAssessments[matchedAssessments.length - 1];
      var preScore = preAssess.scores[pair.subscale] || 0;
      var postScore = postAssess.scores[pair.subscale] || 0;
      var scoreDiff = postScore - preScore;
      var scoreCls =
        scoreDiff < 0
          ? "change-positive"
          : scoreDiff > 0
            ? "change-negative"
            : "change-neutral";

      html +=
        "<div style='display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px'>";
      html += "<div>";
      html +=
        "<strong>量表 " +
        getTestLabel(preAssess.testType) +
        "：</strong>" +
        preScore;
      html +=
        " → <strong>" +
        getTestLabel(postAssess.testType) +
        "：</strong>" +
        postScore;
      html +=
        ' <span class="' +
        scoreCls +
        '">(' +
        (scoreDiff > 0 ? "+" : "") +
        scoreDiff +
        ")</span>";
      html += "</div>";

      // 遊戲數據
      if (parsedSessions.length >= 2) {
        var sessionStats = parsedSessions.map(function (s) {
          // 快速計算
          var correct = 0;
          var total = s.regularTrials.length;
          var hits = 0;
          var fa = 0;
          var misses = 0;
          var cr = 0;
          var wmCorrect = 0;
          var wmTotal = s.wmTrials.length;

          s.regularTrials.forEach(function (row) {
            if (
              row[F.CORRECT] === "yes" ||
              row[F.CORRECT] === "true" ||
              row[F.CORRECT] === "1"
            )
              correct++;
            var result = row[F.RESULT] || "";
            if (result === "Hit") hits++;
            else if (result === "FA") fa++;
            else if (result === "Miss") misses++;
            else if (result === "CR") cr++;
          });

          s.wmTrials.forEach(function (row) {
            if (
              row[F.CORRECT] === "yes" ||
              row[F.CORRECT] === "true" ||
              row[F.CORRECT] === "1"
            )
              wmCorrect++;
          });

          var goTotal = hits + misses;
          var noGoTotal = fa + cr;
          return {
            accuracy: total > 0 ? (correct / total) * 100 : 0,
            dPrime: calculateDPrime(hits, fa, goTotal, noGoTotal),
            wmAccuracy: wmTotal > 0 ? (wmCorrect / wmTotal) * 100 : null,
            fa: fa,
            cr: cr,
          };
        });

        var firstGame, lastGame;
        if (pair.customCalc) {
          var vals = pair.customCalc(sessionStats);
          firstGame = vals[0];
          lastGame = vals[vals.length - 1];
        } else {
          firstGame = sessionStats[0][pair.gameMetric];
          lastGame = sessionStats[sessionStats.length - 1][pair.gameMetric];
        }

        if (
          firstGame !== null &&
          firstGame !== undefined &&
          lastGame !== null &&
          lastGame !== undefined
        ) {
          var gameDiff = (parseFloat(lastGame) - parseFloat(firstGame)).toFixed(
            2,
          );
          var isImprove =
            pair.gameMetric === "faRate"
              ? parseFloat(gameDiff) < 0
              : parseFloat(gameDiff) > 0;
          var gameCls = isImprove
            ? "change-positive"
            : parseFloat(gameDiff) === 0
              ? "change-neutral"
              : "change-negative";

          html += "<div>";
          html +=
            "<strong>遊戲（首次）：</strong>" +
            parseFloat(firstGame).toFixed(2);
          html +=
            " → <strong>（最近）：</strong>" + parseFloat(lastGame).toFixed(2);
          html +=
            ' <span class="' +
            gameCls +
            '">(' +
            (parseFloat(gameDiff) > 0 ? "+" : "") +
            gameDiff +
            ")</span>";
          html += "</div>";
        }
      }

      html += "</div></div>";
    });

    dom.integrationContent.innerHTML = html;
  }

  /* ====================================
     Chart.js 渲染
     ==================================== */

  function renderLineChart(canvasId, labels, datasets, options) {
    var ctx = document.getElementById(canvasId);
    if (!ctx) return;

    destroyChart(canvasId);

    var opts = options || {};

    var cfg = {
      type: "line",
      data: {
        labels: labels,
        datasets: datasets.map(function (ds) {
          return {
            label: ds.label,
            data: ds.data,
            borderColor: ds.borderColor,
            backgroundColor: ds.backgroundColor,
            fill: true,
            tension: 0.3,
            pointRadius: 5,
            pointHoverRadius: 7,
            borderWidth: 2,
          };
        }),
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            labels: { color: "rgba(255,255,255,0.7)", font: { size: 12 } },
          },
          tooltip: {
            backgroundColor: "rgba(0,0,0,0.85)",
            titleColor: "#fff",
            bodyColor: "#ddd",
          },
        },
        scales: {
          x: {
            ticks: { color: "rgba(255,255,255,0.5)", font: { size: 10 } },
            grid: { color: "rgba(255,255,255,0.05)" },
          },
          y: {
            min: opts.yMin,
            max: opts.yMax,
            title: {
              display: !!opts.yLabel,
              text: opts.yLabel || "",
              color: "rgba(255,255,255,0.6)",
            },
            ticks: { color: "rgba(255,255,255,0.5)" },
            grid: { color: "rgba(255,255,255,0.05)" },
          },
        },
      },
    };

    charts[canvasId] = new Chart(ctx, cfg);
  }

  function renderBarChart(canvasId, labels, datasets) {
    var ctx = document.getElementById(canvasId);
    if (!ctx) return;

    destroyChart(canvasId);

    var cfg = {
      type: "bar",
      data: { labels: labels, datasets: datasets },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            labels: { color: "rgba(255,255,255,0.7)", font: { size: 12 } },
          },
          tooltip: {
            backgroundColor: "rgba(0,0,0,0.85)",
            titleColor: "#fff",
            bodyColor: "#ddd",
          },
        },
        scales: {
          x: {
            ticks: { color: "rgba(255,255,255,0.5)" },
            grid: { color: "rgba(255,255,255,0.05)" },
          },
          y: {
            beginAtZero: true,
            ticks: { color: "rgba(255,255,255,0.5)" },
            grid: { color: "rgba(255,255,255,0.05)" },
          },
        },
      },
    };

    charts[canvasId] = new Chart(ctx, cfg);
  }

  function destroyChart(id) {
    if (charts[id]) {
      charts[id].destroy();
      delete charts[id];
    }
  }

  function destroyCharts() {
    Object.keys(charts).forEach(function (id) {
      charts[id].destroy();
    });
    charts = {};
  }

  /* ====================================
     SDT 計算
     ==================================== */

  function calculateDPrime(hits, fa, goTotal, noGoTotal) {
    if (goTotal === 0 && noGoTotal === 0) return 0;

    // Log-linear 校正
    var hitRate = (hits + 0.5) / (goTotal + 1);
    var faRate = (fa + 0.5) / (noGoTotal + 1);

    var zHit = probit(hitRate);
    var zFa = probit(faRate);

    return parseFloat((zHit - zFa).toFixed(3));
  }

  /**
   * Probit 函數（Abramowitz & Stegun 有理近似）
   */
  function probit(p) {
    if (p <= 0) return -5;
    if (p >= 1) return 5;

    if (p < 0.5) return -probit(1 - p);

    var t = Math.sqrt(-2 * Math.log(1 - p));
    var c0 = 2.515517;
    var c1 = 0.802853;
    var c2 = 0.010328;
    var d1 = 1.432788;
    var d2 = 0.189269;
    var d3 = 0.001308;

    var z =
      t -
      (c0 + c1 * t + c2 * t * t) / (1 + d1 * t + d2 * t * t + d3 * t * t * t);
    return Math.max(-5, Math.min(5, z));
  }

  /* ====================================
     工具函式
     ==================================== */

  function formatDate(d) {
    if (!d) return "";
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return y + "/" + m + "/" + day;
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function showToast(msg) {
    if (!dom.toast) return;
    dom.toast.textContent = msg;
    dom.toast.classList.add("show");
    clearTimeout(dom.toast._timer);
    dom.toast._timer = setTimeout(function () {
      dom.toast.classList.remove("show");
    }, 3000);
  }
})();
