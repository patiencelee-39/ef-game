/**
 * csv-report.js — CSV 資料分析報告生成器（共用模組）
 *
 * 功能：解析遊戲 CSV 資料，生成 Chart.js 圖表分析報告
 * 使用位置：
 *   1. singleplayer/result.html — 成績結算頁（從逐題資料生成報告）
 *   2. leaderboard/class.html  — 班級排行榜（匯入 CSV 後生成報告）
 *   3. leaderboard/live.html   — 即時排行看板（老師端查看報告）
 *
 * 外部依賴（需在引入本檔之前載入）：
 *   - Chart.js 4.x：https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js
 *   - PapaParse 5.x：https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js
 *   - html2pdf.js 0.10.x（PDF 匯出用）：https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js
 *
 * API：
 *   CsvReport.parseFiles(fileList)          → Promise<ParsedData>
 *   CsvReport.parseRawData(dataArray)       → ParsedData
 *   CsvReport.convertTrialsToCsvData(trials, participantId) → dataArray
 *   CsvReport.renderReport(container, parsedData) → void
 *   CsvReport.exportCsv(parsedData, filename)     → void（觸發下載）
 *   CsvReport.exportPdf(container, parsedData, filename) → Promise<void>（觸發 PDF 下載）
 *   CsvReport.exportScreenshot(container, filename) → Promise<void>（觸發 PNG 截圖下載）
 *   CsvReport.destroy()                           → void（銷毀所有圖表）
 *
 * @version 1.2.0
 * @date 2026/02/14
 */

// eslint-disable-next-line no-unused-vars
var CsvReport = (function () {
  "use strict";

  // ═══════════════════════════════════════════════════════════════
  // 常數（從 GameConstants 取得 single source of truth）
  // ═══════════════════════════════════════════════════════════════

  var GC = window.GameConstants || {};
  var F = GC.CSV_FIELDS || {};
  var FO = GC.CSV_FIELD_ORDER || [];
  var CV = GC.CSV_VALUES || {};
  var FN = GC.CSV_FILE_NAMING || {};
  var RM = GC.REPORT_META || {};

  var ROUND_COLORS = GC.ROUND_CHART_COLORS || {
    1: "rgba(255, 99, 132, 0.8)",
    2: "rgba(54, 162, 235, 0.8)",
    3: "rgba(255, 206, 86, 0.8)",
    4: "rgba(75, 192, 192, 0.8)",
  };
  var REGULAR_ROUNDS = GC.REGULAR_ROUND_IDS || [1, 2, 3, 4];
  var WM_ROUNDS = GC.WM_ROUND_IDS || ["WM1", "WM2", "WM3", "WM4"];
  var WM_PREFIX = GC.WM_ROUND_PREFIX || "WM";
  var ROUND_NAMES = GC.ROUND_DISPLAY_NAMES || {};
  var ROUND_LABELS = GC.ROUND_SHORT_LABELS || {};
  var FILENAME_REGEX =
    GC.CSV_FILENAME_REGEX || /^EF訓練遊戲數據_(.+)_(\d{8})_(\d{6})\.csv$/;

  var SESSION_COLORS = [
    "#667eea",
    "#ff9800",
    "#e91e63",
    "#00bcd4",
    "#9c27b0",
    "#3f51b5",
    "#4caf50",
  ];

  var charts = {};

  // ═══════════════════════════════════════════════════════════════
  // 解析：從 File 物件解析 CSV
  // ═══════════════════════════════════════════════════════════════

  /**
   * 從上傳的檔案列表解析 CSV
   * @param {FileList|File[]} fileList
   * @returns {Promise<ParsedData>}
   */
  function parseFiles(fileList) {
    return new Promise(function (resolve, reject) {
      var files = Array.from(fileList);
      if (files.length === 0) {
        reject(new Error("沒有選擇檔案"));
        return;
      }

      var completed = 0;
      var parsedFiles = [];

      files.forEach(function (file) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: function (results) {
            parsedFiles.push({ uploadName: file.name, data: results.data });
            completed++;
            if (completed === files.length) {
              try {
                var result = _processParsedFiles(parsedFiles);
                resolve(result);
              } catch (e) {
                reject(e);
              }
            }
          },
          error: function (error) {
            console.error("CSV 解析錯誤:", file.name, error);
            completed++;
            if (completed === files.length) {
              try {
                var result = _processParsedFiles(parsedFiles);
                resolve(result);
              } catch (e) {
                reject(e);
              }
            }
          },
        });
      });
    });
  }

  /**
   * 處理解析後的多檔案資料
   * @private
   */
  function _processParsedFiles(fileList) {
    var validSessions = [];

    for (var i = 0; i < fileList.length; i++) {
      var f = fileList[i];
      if (!f.data || f.data.length === 0) continue;

      var internalFileName = f.data[0][F.FILE_NAME] || f.uploadName;
      var match = internalFileName.match(FILENAME_REGEX);

      if (!match) {
        // 嘗試使用上傳檔名
        match = f.uploadName.match(FILENAME_REGEX);
        if (!match) {
          throw new Error(
            '檔案 "' +
              f.uploadName +
              '" 格式不符。預期格式：' +
              FN.DATA_PREFIX +
              "_ID_YYYYMMDD_HHMMSS.csv",
          );
        }
      }

      validSessions.push({
        data: f.data,
        timestamp: match[2] + match[3],
        fileName: internalFileName,
      });
    }

    if (validSessions.length === 0) {
      throw new Error("沒有有效的資料");
    }

    // 依時間排序
    validSessions.sort(function (a, b) {
      return a.timestamp.localeCompare(b.timestamp);
    });

    // 合併資料，確保每列有 FileName
    var aggregated = [];
    for (var j = 0; j < validSessions.length; j++) {
      var s = validSessions[j];
      for (var k = 0; k < s.data.length; k++) {
        s.data[k][F.FILE_NAME] = s.fileName;
        aggregated.push(s.data[k]);
      }
    }

    return _classifyData(aggregated);
  }

  // ═══════════════════════════════════════════════════════════════
  // 解析：從原始資料陣列解析
  // ═══════════════════════════════════════════════════════════════

  /**
   * 直接從資料陣列解析（不需要 PapaParse）
   * @param {Object[]} dataArray - CSV 列物件陣列
   * @returns {ParsedData}
   */
  function parseRawData(dataArray) {
    if (!dataArray || dataArray.length === 0) {
      throw new Error("資料為空");
    }
    return _classifyData(dataArray);
  }

  /**
   * 分類資料為一般試題和 WM 試題
   * @private
   */
  function _classifyData(data) {
    var regularTrials = [];
    var wmTrials = [];

    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      if (!row[F.ROUND]) continue;
      if (row[F.ROUND].toString().indexOf(WM_PREFIX) === 0) {
        wmTrials.push(row);
      } else {
        regularTrials.push(row);
      }
    }

    // 取得參與者
    var participantSet = {};
    for (var j = 0; j < data.length; j++) {
      if (data[j][F.PARTICIPANT]) participantSet[data[j][F.PARTICIPANT]] = true;
    }
    var participants = Object.keys(participantSet);

    return {
      allData: data,
      regularTrials: regularTrials,
      wmTrials: wmTrials,
      participants: participants,
      totalTrials: regularTrials.length,
      stats: _calculateBasicStats(regularTrials),
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // 轉換：逐題結果 → CSV 資料格式
  // ═══════════════════════════════════════════════════════════════

  /**
   * 將 singleplayer game.html 的逐題結果轉為 CSV 資料格式
   * @param {Object[]} trials - 逐題結果陣列
   * @param {string} participantId - 參與者 ID
   * @returns {Object[]} CSV 列物件陣列
   */
  function convertTrialsToCsvData(trials, participantId) {
    if (!trials || trials.length === 0) return [];

    var now = new Date();
    var pid = participantId || FN.DEFAULT_PARTICIPANT;
    var dateStr =
      now.getFullYear().toString() +
      _pad(now.getMonth() + 1) +
      _pad(now.getDate());
    var timeStr =
      _pad(now.getHours()) + _pad(now.getMinutes()) + _pad(now.getSeconds());
    var fileName = _buildFileName(pid, dateStr, timeStr);

    return trials.map(function (t, index) {
      var row = {};
      row[F.FILE_NAME] = fileName;
      row[F.PARTICIPANT] = pid;
      row[F.ROUND] = t.round || t[F.ROUND] || "1";
      row[F.TRIAL] = t.trial || t[F.TRIAL] || index + 1;
      row[F.STIMULUS] = t.stimulus || t[F.STIMULUS] || "";
      row[F.HAS_PERSON] = String(t.hasPerson || t[F.HAS_PERSON] || false);
      row[F.IS_NIGHT_TIME] = String(
        t.isNightTime || t[F.IS_NIGHT_TIME] || false,
      );
      row[F.INPUT_KEY] = t.input || t[F.INPUT_KEY] || "";
      row[F.CORRECT] =
        t.correct === true || t[F.CORRECT] === CV.CORRECT_YES
          ? CV.CORRECT_YES
          : CV.CORRECT_NO;
      row[F.RT_MS] = t.rt || t[F.RT_MS] || 0;
      row[F.TIMESTAMP] = t.timestamp || t[F.TIMESTAMP] || now.toISOString();
      return row;
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 統計計算
  // ═══════════════════════════════════════════════════════════════

  function _calculateBasicStats(data) {
    var totalTrials = data.length;
    var correctTrials = 0;
    for (var i = 0; i < data.length; i++) {
      var c = data[i][F.CORRECT];
      if (c === CV.CORRECT_YES || c === "true" || c === "1") correctTrials++;
    }
    var correctRate = totalTrials > 0 ? (correctTrials / totalTrials) * 100 : 0;

    var rtData = [];
    for (var j = 0; j < data.length; j++) {
      var rt = parseFloat(data[j][F.RT_MS]);
      if (!isNaN(rt) && rt > 0) rtData.push(rt);
    }
    var avgRT =
      rtData.length > 0
        ? rtData.reduce(function (s, v) {
            return s + v;
          }, 0) / rtData.length
        : 0;

    return {
      totalTrials: totalTrials,
      correctRate: correctRate,
      avgRT: avgRT,
      correctTrials: correctTrials,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // 渲染報告
  // ═══════════════════════════════════════════════════════════════

  /**
   * 在指定容器中渲染完整分析報告
   * @param {HTMLElement} container - 報告容器
   * @param {ParsedData} parsedData - 解析後的資料
   */
  function renderReport(container, parsedData) {
    if (!container || !parsedData) return;

    // 銷毀舊圖表
    destroy();

    var reg = parsedData.regularTrials;
    var wm = parsedData.wmTrials;
    var stats = parsedData.stats;

    // 建立報告 HTML 結構
    var html = "";

    // — 概覽卡片 —
    html += '<div class="csv-report">';
    html += '<div class="csv-report__overview">';
    html += _statCard("📝", stats.totalTrials, "一般試題總數");
    html += _statCard("🎯", stats.correctRate.toFixed(1) + "%", "整體正確率");
    html += _statCard("⏱️", Math.round(stats.avgRT) + " ms", "平均反應時間");
    html += _statCard("🧠", wm.length, "工作記憶測試數");
    html += "</div>";

    // — 參與者摘要 —
    if (parsedData.participants && parsedData.participants.length > 0) {
      html += '<div class="csv-report__participants">';
      html += "<strong>參與者：</strong>" + parsedData.participants.join("、");
      html += "</div>";
    }

    // — 各回合圖表 —
    REGULAR_ROUNDS.forEach(function (r) {
      var roundData = _filterRound(reg, r);
      if (roundData.length === 0) return;
      html += '<div class="csv-report__section">';
      html +=
        '<div class="csv-report__round-header">' +
        (ROUND_NAMES[r] || "回合 " + r) +
        "</div>";
      html +=
        '<div class="csv-report__chart-box"><h3>📈 反應時間趨勢</h3><canvas id="csvR' +
        r +
        'Chart"></canvas></div>';
      html += "</div>";
    });

    // — 綜合比較 —
    html += '<div class="csv-report__section">';
    html += '<div class="csv-report__round-header">📊 綜合分析</div>';
    html +=
      '<div class="csv-report__chart-box"><h3>🎯 各回合正確率比較</h3><canvas id="csvAccChart"></canvas></div>';
    html +=
      '<div class="csv-report__chart-box"><h3>⏱️ 各回合平均反應時間</h3><canvas id="csvRTChart"></canvas></div>';
    html += "</div>";

    // — 工作記憶測試 —
    if (wm.length > 0) {
      html += '<div class="csv-report__section">';
      html += '<div class="csv-report__round-header">🧠 工作記憶測試</div>';
      html += '<div class="csv-report__wm-results" id="csvWmResults"></div>';
      html +=
        '<div class="csv-report__chart-box"><h3>📊 WM 正確率分析</h3><canvas id="csvWmAccChart"></canvas></div>';
      html +=
        '<div class="csv-report__chart-box"><h3>⏱️ WM 反應時間分析</h3><canvas id="csvWmRTChart"></canvas></div>';
      html += "</div>";
    }

    html += "</div>"; // .csv-report

    container.innerHTML = html;

    // 延遲一幀讓 DOM 渲染後再畫圖
    requestAnimationFrame(function () {
      _drawRoundCharts(reg);
      _drawAccuracyComparison(reg);
      _drawRTComparison(reg);
      if (wm.length > 0) {
        _displayWMResults(wm, parsedData.allData);
        _drawWMCharts(wm, parsedData.allData);
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 渲染 — 輔助函數
  // ═══════════════════════════════════════════════════════════════

  function _statCard(emoji, value, label) {
    return (
      '<div class="csv-report__stat-card">' +
      '<div class="csv-report__stat-emoji">' +
      emoji +
      "</div>" +
      '<div class="csv-report__stat-value">' +
      value +
      "</div>" +
      '<div class="csv-report__stat-label">' +
      label +
      "</div>" +
      "</div>"
    );
  }

  function _filterRound(data, roundNum) {
    return data.filter(function (row) {
      return parseInt(row[F.ROUND]) === roundNum;
    });
  }

  function _pad(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  /**
   * 組合標準 CSV 檔名
   * @private
   */
  function _buildFileName(participantId, dateStr, timeStr) {
    var sep = FN.SEPARATOR || "_";
    var prefix = FN.DATA_PREFIX || "EF訓練遊戲數據";
    return (
      prefix + sep + participantId + sep + dateStr + sep + timeStr + ".csv"
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // 圖表 — 各回合反應時間
  // ═══════════════════════════════════════════════════════════════

  function _drawRoundCharts(regularTrials) {
    REGULAR_ROUNDS.forEach(function (r) {
      var canvasId = "csvR" + r + "Chart";
      var canvas = document.getElementById(canvasId);
      if (!canvas) return;

      var roundData = _filterRound(regularTrials, r);
      if (roundData.length === 0) return;

      var labels = roundData.map(function (row, i) {
        var ts = row[F.TIMESTAMP] || "";
        var parts = ts.split(" ");
        return [
          "第 " + (i + 1) + " 題",
          row[F.PARTICIPANT] || "",
          parts[0] || ts,
          parts[1] || "",
        ];
      });

      // 依 FileName 分組
      var uniqueFiles = _unique(roundData, F.FILE_NAME);
      var datasets = uniqueFiles.map(function (fileName, fi) {
        var data = new Array(roundData.length).fill(null);
        var pointColors = new Array(roundData.length).fill(null);

        roundData.forEach(function (row, ri) {
          if (row[F.FILE_NAME] === fileName) {
            var rt = parseFloat(row[F.RT_MS]);
            data[ri] = !isNaN(rt) ? rt : 0;
            pointColors[ri] = ROUND_COLORS[r];
          }
        });

        var color = SESSION_COLORS[fi % SESSION_COLORS.length];
        return {
          label: fileName,
          data: data,
          borderColor: color,
          backgroundColor: color,
          pointBackgroundColor: pointColors,
          pointBorderColor: "#fff",
          pointRadius: 6,
          borderWidth: 2,
          tension: 0.3,
          spanGaps: false,
        };
      });

      // Dummy dataset for round legend
      datasets.push({
        label: (ROUND_LABELS[r] || "Round " + r) + " 試題",
        data: [],
        borderColor: ROUND_COLORS[r],
        backgroundColor: ROUND_COLORS[r],
        pointBackgroundColor: ROUND_COLORS[r],
        pointBorderColor: "#fff",
        pointRadius: 6,
        borderWidth: 0,
      });

      if (charts[canvasId]) charts[canvasId].destroy();
      charts[canvasId] = new Chart(canvas.getContext("2d"), {
        type: "line",
        data: { labels: labels, datasets: datasets },
        options: _lineChartOptions(
          "反應時間 (毫秒)",
          "試題編號",
          function (context) {
            var idx = context.dataIndex;
            var row = roundData[idx];
            if (!row) return "";
            var isCorrect = row[F.CORRECT] === CV.CORRECT_YES;
            var info = isCorrect ? "✅ 正確" : "❌ 錯誤";
            info += "\n刺激物：" + (row[F.STIMULUS] || "");
            if (row[F.HAS_PERSON] === CV.BOOL_TRUE) info += "\n👤 有人出現";
            if (row[F.IS_NIGHT_TIME] === CV.BOOL_TRUE) info += "\n🌙 晚上";
            info += "\n按鍵：" + (row[F.INPUT_KEY] || "");
            return info;
          },
        ),
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 圖表 — 正確率比較
  // ═══════════════════════════════════════════════════════════════

  function _drawAccuracyComparison(regularTrials) {
    var canvas = document.getElementById("csvAccChart");
    if (!canvas) return;

    var accuracies = REGULAR_ROUNDS.map(function (r) {
      var rd = _filterRound(regularTrials, r);
      if (rd.length === 0) return 0;
      var correct = rd.filter(function (row) {
        return row[F.CORRECT] === CV.CORRECT_YES;
      }).length;
      return (correct / rd.length) * 100;
    });

    var barLabels = REGULAR_ROUNDS.map(function (r) {
      return ROUND_LABELS[r] || "回合 " + r;
    });
    var barColors = REGULAR_ROUNDS.map(function (r) {
      return ROUND_COLORS[r];
    });

    if (charts.csvAccChart) charts.csvAccChart.destroy();
    charts.csvAccChart = new Chart(canvas.getContext("2d"), {
      type: "bar",
      data: {
        labels: barLabels,
        datasets: [
          {
            label: "正確率 (%)",
            data: accuracies,
            backgroundColor: barColors,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: "正確率 (%)",
              font: { size: 14, weight: "bold" },
            },
          },
        },
        plugins: { legend: { display: false } },
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 圖表 — 反應時間比較
  // ═══════════════════════════════════════════════════════════════

  function _drawRTComparison(regularTrials) {
    var canvas = document.getElementById("csvRTChart");
    if (!canvas) return;

    var avgRTs = REGULAR_ROUNDS.map(function (r) {
      var rd = _filterRound(regularTrials, r);
      var rtData = [];
      for (var i = 0; i < rd.length; i++) {
        var rt = parseFloat(rd[i][F.RT_MS]);
        if (!isNaN(rt) && rt > 0) rtData.push(rt);
      }
      return rtData.length > 0
        ? rtData.reduce(function (s, v) {
            return s + v;
          }, 0) / rtData.length
        : 0;
    });

    var lineLabels = REGULAR_ROUNDS.map(function (r) {
      return ROUND_LABELS[r] || "回合 " + r;
    });
    var pointColors = REGULAR_ROUNDS.map(function (r) {
      return ROUND_COLORS[r];
    });

    if (charts.csvRTChart) charts.csvRTChart.destroy();
    charts.csvRTChart = new Chart(canvas.getContext("2d"), {
      type: "line",
      data: {
        labels: lineLabels,
        datasets: [
          {
            label: "平均反應時間 (ms)",
            data: avgRTs,
            borderColor: "#667eea",
            backgroundColor: "rgba(102, 126, 234, 0.1)",
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointRadius: 10,
            pointBackgroundColor: pointColors,
            pointBorderColor: "#fff",
            pointBorderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "平均反應時間 (毫秒)",
              font: { size: 14, weight: "bold" },
            },
          },
        },
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 工作記憶 — 詳細結果
  // ═══════════════════════════════════════════════════════════════

  function _displayWMResults(wmTrials, allData) {
    var container = document.getElementById("csvWmResults");
    if (!container) return;

    var uniqueFiles = _unique(allData, F.FILE_NAME);
    var html = "";

    wmTrials.forEach(function (row) {
      var correctAnswer = (row[F.STIMULUS] || "").split("-");
      var userAnswer = (row[F.INPUT_KEY] || "").split("-");
      var correctCount = 0;
      var comparisonHTML = '<div style="display:flex;gap:10px;margin:10px 0;">';

      for (var i = 0; i < correctAnswer.length; i++) {
        var isCorrect = correctAnswer[i] === userAnswer[i];
        if (isCorrect) correctCount++;
        var bgColor = isCorrect ? "#c8e6c9" : "#ffcdd2";
        var icon = isCorrect ? "✓" : "✗";
        comparisonHTML +=
          '<div style="flex:1;background:' +
          bgColor +
          ';padding:10px;border-radius:5px;text-align:center;">' +
          '<div style="font-size:1.2em;font-weight:bold;color:#333;">位置 ' +
          (i + 1) +
          " " +
          icon +
          "</div>" +
          '<div style="font-size:0.9em;color:#666;margin-top:5px;">正確：' +
          correctAnswer[i] +
          "<br>回答：" +
          (userAnswer[i] || "-") +
          "</div>" +
          "</div>";
      }
      comparisonHTML += "</div>";

      var accuracy =
        correctAnswer.length > 0
          ? ((correctCount / correctAnswer.length) * 100).toFixed(1)
          : "0.0";
      var isFullyCorrect = correctCount === correctAnswer.length;
      var fileIndex = uniqueFiles.indexOf(row[F.FILE_NAME]);
      var fileColor = SESSION_COLORS[fileIndex % SESSION_COLORS.length];
      var rt = parseFloat(row[F.RT_MS]);

      html +=
        '<div style="background:white;padding:20px;border-radius:10px;margin-bottom:15px;border-left:8px solid ' +
        fileColor +
        ';box-shadow:0 2px 5px rgba(0,0,0,0.1);">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">' +
        '<div><h4 style="color:#333;margin:0;">🧠 工作記憶測試 ' +
        row[F.ROUND].replace(WM_PREFIX, "") +
        ' <span style="color:' +
        (isFullyCorrect ? "#4CAF50" : "#ff9800") +
        ';margin-left:10px;">' +
        accuracy +
        "% (" +
        correctCount +
        "/" +
        correctAnswer.length +
        ")</span></h4>" +
        '<div style="font-size:0.9em;color:#666;margin-top:5px;">👤 ' +
        (row[F.PARTICIPANT] || "") +
        " | 📅 " +
        (row[F.TIMESTAMP] || "") +
        "</div></div>" +
        '<div style="font-size:0.8em;color:' +
        fileColor +
        ";border:1px solid " +
        fileColor +
        ';padding:2px 8px;border-radius:12px;">' +
        (row[F.FILE_NAME] || "") +
        "</div></div>" +
        comparisonHTML +
        '<div style="margin-top:15px;padding:10px;background:#f5f5f5;border-radius:5px;">' +
        '<p style="color:#666;margin:5px 0;"><strong>🎯 正確率：</strong> ' +
        accuracy +
        "% " +
        (isFullyCorrect
          ? "🎉 完全正確！"
          : parseFloat(accuracy) >= 60
            ? "👍 部分正確"
            : "❌ 需要加強") +
        "</p>" +
        '<p style="color:#666;margin:5px 0;"><strong>⏱️ 反應時間：</strong> ' +
        Math.round(rt) +
        " 毫秒 (約 " +
        (rt / 1000).toFixed(1) +
        " 秒)</p>" +
        "</div></div>";
    });

    container.innerHTML = html;
  }

  // ═══════════════════════════════════════════════════════════════
  // 工作記憶 — 圖表
  // ═══════════════════════════════════════════════════════════════

  function _drawWMCharts(wmTrials, allData) {
    var wmRoundColors = {};
    WM_ROUNDS.forEach(function (wmId, idx) {
      wmRoundColors[wmId] =
        ROUND_COLORS[REGULAR_ROUNDS[idx]] || "rgba(201,203,207,0.8)";
    });
    var uniqueFiles = _unique(allData, F.FILE_NAME);

    // 計算正確率
    var wmAccuracies = wmTrials.map(function (row) {
      var ca = (row[F.STIMULUS] || "").split("-");
      var ua = (row[F.INPUT_KEY] || "").split("-");
      if (ca.length !== ua.length) return 0;
      var correct = 0;
      for (var i = 0; i < ca.length; i++) {
        if (ca[i] === ua[i]) correct++;
      }
      return (correct / ca.length) * 100;
    });

    var wmLabels = wmTrials.map(function (row) {
      var ts = row[F.TIMESTAMP] || "";
      var parts = ts.split(" ");
      return [
        row[F.ROUND],
        row[F.PARTICIPANT] || "",
        parts[0] || ts,
        parts[1] || "",
      ];
    });

    // === WM 正確率圖 ===
    var accCanvas = document.getElementById("csvWmAccChart");
    if (accCanvas) {
      var accDatasets = _buildWmDatasets(
        wmTrials,
        wmAccuracies,
        uniqueFiles,
        wmRoundColors,
      );
      if (charts.csvWmAccChart) charts.csvWmAccChart.destroy();
      charts.csvWmAccChart = new Chart(accCanvas.getContext("2d"), {
        type: "line",
        data: { labels: wmLabels, datasets: accDatasets },
        options: _lineChartOptions("正確率 (%)", "工作記憶測試", null, 100),
      });
    }

    // === WM 反應時間圖 ===
    var rtCanvas = document.getElementById("csvWmRTChart");
    if (rtCanvas) {
      var wmRTs = wmTrials.map(function (row) {
        var rt = parseFloat(row[F.RT_MS]);
        return !isNaN(rt) ? rt : 0;
      });
      var rtDatasets = _buildWmDatasets(
        wmTrials,
        wmRTs,
        uniqueFiles,
        wmRoundColors,
      );
      if (charts.csvWmRTChart) charts.csvWmRTChart.destroy();
      charts.csvWmRTChart = new Chart(rtCanvas.getContext("2d"), {
        type: "line",
        data: { labels: wmLabels, datasets: rtDatasets },
        options: _lineChartOptions("反應時間 (毫秒)", "工作記憶測試"),
      });
    }
  }

  function _buildWmDatasets(wmTrials, values, uniqueFiles, wmRoundColors) {
    var datasets = uniqueFiles.map(function (fileName, fi) {
      var data = new Array(wmTrials.length).fill(null);
      var pointColors = new Array(wmTrials.length).fill(null);

      wmTrials.forEach(function (row, ri) {
        if (row[F.FILE_NAME] === fileName) {
          data[ri] = values[ri];
          pointColors[ri] =
            wmRoundColors[row[F.ROUND]] || "rgba(201,203,207,0.8)";
        }
      });

      var color = SESSION_COLORS[fi % SESSION_COLORS.length];
      return {
        label: fileName,
        data: data,
        borderColor: color,
        backgroundColor: color,
        pointBackgroundColor: pointColors,
        pointBorderColor: "#fff",
        pointRadius: 6,
        borderWidth: 2,
        tension: 0.3,
        spanGaps: false,
      };
    });

    // Dummy datasets for WM round legend
    Object.keys(wmRoundColors).forEach(function (round) {
      datasets.push({
        label: round,
        data: [],
        borderColor: wmRoundColors[round],
        backgroundColor: wmRoundColors[round],
        pointRadius: 6,
        borderWidth: 0,
      });
    });

    return datasets;
  }

  // ═══════════════════════════════════════════════════════════════
  // 圖表選項工廠
  // ═══════════════════════════════════════════════════════════════

  function _lineChartOptions(yLabel, xLabel, afterLabelCallback, yMax) {
    var opts = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          labels: {
            usePointStyle: true,
            generateLabels: function (chart) {
              var original =
                Chart.defaults.plugins.legend.labels.generateLabels(chart);
              original.forEach(function (label) {
                var ds = chart.data.datasets[label.datasetIndex];
                var isRoundLegend =
                  label.text.indexOf(WM_PREFIX) === 0 ||
                  REGULAR_ROUNDS.some(function (r) {
                    var rl = ROUND_LABELS[r] || "Round " + r;
                    return label.text.indexOf(rl) >= 0;
                  });
                if (isRoundLegend) {
                  label.pointStyle = "circle";
                } else {
                  label.pointStyle = "rectRounded";
                  if (ds) {
                    label.fillStyle = ds.borderColor;
                    label.strokeStyle = ds.borderColor;
                  }
                }
              });
              return original;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: yLabel,
            font: { size: 14, weight: "bold" },
          },
        },
        x: {
          title: {
            display: true,
            text: xLabel,
            font: { size: 14, weight: "bold" },
          },
        },
      },
    };

    if (yMax) opts.scales.y.max = yMax;

    if (afterLabelCallback) {
      opts.plugins.tooltip = { callbacks: { afterLabel: afterLabelCallback } };
    }

    return opts;
  }

  // ═══════════════════════════════════════════════════════════════
  // 匯出 CSV
  // ═══════════════════════════════════════════════════════════════

  /**
   * 匯出 CSV 並觸發下載
   * @param {ParsedData} parsedData
   * @param {string} [filename] - 自訂檔名
   */
  function exportCsv(parsedData, filename) {
    if (!parsedData || !parsedData.allData || parsedData.allData.length === 0) {
      console.warn("CsvReport.exportCsv: 沒有資料可匯出");
      return;
    }

    var headers =
      FO.length > 0
        ? FO
        : [
            "FileName",
            "Participant",
            "Round",
            "Trial",
            "Stimulus",
            "HasPerson",
            "IsNightTime",
            "InputKey",
            "Correct",
            "RT(ms)",
            "Timestamp",
          ];
    var csvContent = headers.join(",") + "\n";

    parsedData.allData.forEach(function (row) {
      var line = headers
        .map(function (h) {
          var val = row[h] || "";
          // 如果值包含逗號或引號，用引號包裹
          if (String(val).indexOf(",") >= 0 || String(val).indexOf('"') >= 0) {
            return '"' + String(val).replace(/"/g, '""') + '"';
          }
          return val;
        })
        .join(",");
      csvContent += line + "\n";
    });

    var defaultName =
      filename ||
      FN.MERGE_PREFIX +
        FN.SEPARATOR +
        _pad(new Date().getMonth() + 1) +
        _pad(new Date().getDate()) +
        ".csv";

    var blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = defaultName;
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ═══════════════════════════════════════════════════════════════
  // 工具函數
  // ═══════════════════════════════════════════════════════════════

  function _unique(dataArray, key) {
    var seen = {};
    var result = [];
    for (var i = 0; i < dataArray.length; i++) {
      var val = dataArray[i][key];
      if (val && !seen[val]) {
        seen[val] = true;
        result.push(val);
      }
    }
    return result;
  }

  /**
   * 銷毀所有已建立的圖表
   */
  function destroy() {
    Object.keys(charts).forEach(function (key) {
      if (charts[key] && typeof charts[key].destroy === "function") {
        charts[key].destroy();
      }
    });
    charts = {};
  }

  // ═══════════════════════════════════════════════════════════════
  // PDF 匯出（專業排版）
  // ═══════════════════════════════════════════════════════════════

  /**
   * 將報告匯出為排版精美的 A4 PDF
   * 流程：建立列印專用 DOM → html2canvas → jsPDF 分頁排版
   *
   * @param {HTMLElement} container - 包含報告的 DOM 元素
   * @param {ParsedData} [parsedData] - 解析後的資料（用於封面資訊）
   * @param {string} [filename] - 自訂檔名（不含 .pdf）
   * @returns {Promise<void>}
   */
  function exportPdf(container, parsedData, filename) {
    if (typeof html2pdf === "undefined") {
      alert("PDF 匯出功能尚未載入，請確認 html2pdf.js 已引入");
      return Promise.reject(new Error("html2pdf not loaded"));
    }

    if (!container) {
      return Promise.reject(new Error("沒有報告內容可匯出"));
    }

    var now = new Date();
    var dateStr =
      now.getFullYear() +
      "/" +
      _pad(now.getMonth() + 1) +
      "/" +
      _pad(now.getDate());
    var fileDate =
      now.getFullYear().toString() +
      _pad(now.getMonth() + 1) +
      _pad(now.getDate());
    var defaultName = filename || FN.PDF_PREFIX + FN.SEPARATOR + fileDate;

    // === 建立列印專用包裝容器 ===
    var wrapper = document.createElement("div");
    wrapper.className = "csv-report-pdf-wrapper";
    wrapper.style.cssText =
      "position:absolute;left:-9999px;top:0;" +
      "width:794px;" /* A4 寬度 210mm ≈ 794px @96dpi */ +
      "background:#fff;color:#333;" +
      "font-family:'Noto Sans TC','Microsoft JhengHei','PingFang TC',sans-serif;" +
      "padding:0;margin:0;";

    // --- 封面標題區 ---
    var header = document.createElement("div");
    header.style.cssText =
      "padding:40px 40px 30px;border-bottom:3px solid #667eea;" +
      "margin-bottom:20px;";
    header.innerHTML =
      '<div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;">' +
      '<div style="width:50px;height:50px;border-radius:12px;' +
      "background:linear-gradient(135deg,#667eea,#764ba2);" +
      "display:flex;align-items:center;justify-content:center;" +
      'font-size:28px;color:#fff;">📊</div>' +
      "<div>" +
      '<h1 style="margin:0;font-size:24px;color:#333;letter-spacing:1px;">' +
      (RM.APP_NAME || "EF 執行功能訓練遊戲") +
      "</h1>" +
      '<h2 style="margin:4px 0 0;font-size:16px;color:#667eea;font-weight:600;">' +
      (RM.REPORT_SUBTITLE || "資料分析報告") +
      "</h2>" +
      "</div>" +
      "</div>" +
      '<div style="display:flex;gap:24px;font-size:13px;color:#666;">' +
      "<span>📅 報告日期：" +
      dateStr +
      "</span>" +
      (parsedData &&
      parsedData.participants &&
      parsedData.participants.length > 0
        ? "<span>👤 參與者：" + parsedData.participants.join("、") + "</span>"
        : "") +
      (parsedData
        ? "<span>📝 試題總數：" + (parsedData.totalTrials || 0) + "</span>"
        : "") +
      "</div>";
    wrapper.appendChild(header);

    // --- 報告內容（深度複製） ---
    var contentClone = container.cloneNode(true);
    contentClone.style.cssText = "padding:0 30px 20px;background:#fff;";

    // 清除深色背景文字色，讓圖表底色為白色
    var allEls = contentClone.querySelectorAll("*");
    for (var i = 0; i < allEls.length; i++) {
      var el = allEls[i];
      var cs = el.style;
      // 把 var(--xxx) 色彩改為具體值
      if (cs.color && cs.color.indexOf("var(") >= 0) {
        cs.color = "#333";
      }
      if (cs.background && cs.background.indexOf("var(") >= 0) {
        cs.background = "#f8f9fa";
      }
    }
    wrapper.appendChild(contentClone);

    // --- 頁尾 ---
    var footer = document.createElement("div");
    footer.style.cssText =
      "padding:16px 40px;border-top:2px solid #eee;font-size:11px;" +
      "color:#999;text-align:center;margin-top:20px;";
    footer.textContent = (
      RM.COPYRIGHT_TEMPLATE ||
      "© {year} 執行功能訓練遊戲 ─ 本報告由系統自動產生"
    ).replace("{year}", now.getFullYear());
    wrapper.appendChild(footer);

    document.body.appendChild(wrapper);

    // === 等 canvas 重繪後再匯出 ===
    return new Promise(function (resolve) {
      // 給 Chart.js 重繪 canvas 的時間
      setTimeout(resolve, 500);
    })
      .then(function () {
        var opt = {
          margin: [8, 8, 12, 8],
          filename: defaultName + ".pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
            width: 794,
            windowWidth: 794,
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: {
            mode: ["css"],
            before: ".csv-report__section",
            avoid: [
              ".csv-report__chart-box",
              ".csv-report__stat-card",
              ".csv-report__overview",
            ],
          },
        };

        return html2pdf().set(opt).from(wrapper).save();
      })
      .then(function () {
        document.body.removeChild(wrapper);
      })
      .catch(function (err) {
        if (wrapper.parentNode) document.body.removeChild(wrapper);
        console.error("PDF 匯出錯誤:", err);
        throw err;
      });
  }

  // ═══════════════════════════════════════════════════════════════
  // 截圖匯出（PNG）
  // ═══════════════════════════════════════════════════════════════

  /**
   * 將報告截圖為 PNG 並觸發下載
   * @param {HTMLElement} container - 包含報告的 DOM 元素
   * @param {string} [filename] - 自訂檔名（不含 .png）
   * @returns {Promise<void>}
   */
  function exportScreenshot(container, filename) {
    if (typeof html2canvas === "undefined") {
      alert("截圖功能尚未載入，請確認 html2pdf.js 已引入");
      return Promise.reject(new Error("html2canvas not loaded"));
    }

    if (!container) {
      return Promise.reject(new Error("沒有報告內容可截圖"));
    }

    var now = new Date();
    var fileDate =
      now.getFullYear().toString() +
      _pad(now.getMonth() + 1) +
      _pad(now.getDate());
    var defaultName =
      (filename || FN.SCREENSHOT_PREFIX + FN.SEPARATOR + fileDate) + ".png";

    // 暫時設白底以確保截圖乾淨
    var origBg = container.style.background;
    container.style.background = "#ffffff";

    return html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    })
      .then(function (canvas) {
        container.style.background = origBg;

        // 轉換為 Blob 並下載
        return new Promise(function (resolve) {
          canvas.toBlob(function (blob) {
            var url = URL.createObjectURL(blob);
            var link = document.createElement("a");
            link.href = url;
            link.download = defaultName;
            link.style.display = "none";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(function () {
              URL.revokeObjectURL(url);
            }, 1000);
            resolve();
          }, "image/png");
        });
      })
      .catch(function (err) {
        container.style.background = origBg;
        console.error("截圖匯出錯誤:", err);
        throw err;
      });
  }

  // ═══════════════════════════════════════════════════════════════
  // 公開 API
  // ═══════════════════════════════════════════════════════════════

  return {
    parseFiles: parseFiles,
    parseRawData: parseRawData,
    convertTrialsToCsvData: convertTrialsToCsvData,
    renderReport: renderReport,
    exportCsv: exportCsv,
    exportPdf: exportPdf,
    exportScreenshot: exportScreenshot,
    destroy: destroy,
  };
})();
