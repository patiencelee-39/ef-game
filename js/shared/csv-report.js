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
 *   CsvReport.calculateSDT(trialDetails)            → { dPrime, criterion, beta, ... }
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
  var FR2R = GC.FIELD_RULE_TO_ROUND || {};

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
            Logger.error("CSV 解析錯誤:", file.name, error);
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
      // 跳過 SDT 摘要列（匯出時附加的統計列）
      if (row[F.FILE_NAME] === "SDT_Summary") continue;
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
      // 兒童代碼（研究用，與量表配對）
      row[F.CHILD_CODE] = t.childCode || t[F.CHILD_CODE] || "";
      row[F.SESSION_ID] = t.sessionId || t[F.SESSION_ID] || "";
      row[F.MODE] = t.mode || t[F.MODE] || "";
      row[F.FIELD_ID] = t.fieldId || t[F.FIELD_ID] || "";
      row[F.RULE_ID] = t.ruleId || t[F.RULE_ID] || "";
      // 自動偵測 Round：優先使用 trial 自帶的 round，否則由 fieldId+ruleId 查表
      var detectedRound = t.round || t[F.ROUND];
      if (!detectedRound && t.fieldId && t.ruleId) {
        detectedRound = FR2R[t.fieldId + "_" + t.ruleId];
      }
      row[F.ROUND] = detectedRound || "1";
      row[F.TRIAL] = t.trial || t[F.TRIAL] || index + 1;
      row[F.STIMULUS] = t.stimulus || t[F.STIMULUS] || "";
      row[F.IS_GO] = t.isGo != null ? String(t.isGo) : t[F.IS_GO] || "";
      row[F.CONTEXT] = t.context || t[F.CONTEXT] || "";
      row[F.INPUT_KEY] = t.input || t.playerAction || t[F.INPUT_KEY] || "";
      row[F.CORRECT] =
        t.correct === true ||
        t.isCorrect === true ||
        t[F.CORRECT] === CV.CORRECT_YES
          ? CV.CORRECT_YES
          : CV.CORRECT_NO;
      row[F.RESULT] = t.result || t[F.RESULT] || "";
      row[F.RT_MS] = t.rt || t[F.RT_MS] || 0;
      row[F.STIMULUS_DURATION] =
        t.stimulusDurationMs != null
          ? String(t.stimulusDurationMs)
          : t[F.STIMULUS_DURATION] || "";
      row[F.ISI] = t.isiMs != null ? String(t.isiMs) : t[F.ISI] || "";
      row[F.WM_SPAN] = t.wmSpan != null ? String(t.wmSpan) : t[F.WM_SPAN] || "";
      row[F.WM_DIRECTION] = t.wmDirection || t[F.WM_DIRECTION] || "";
      row[F.WM_COMPLETION_TIME] =
        t.wmCompletionTime != null
          ? String(t.wmCompletionTime)
          : t[F.WM_COMPLETION_TIME] || "";
      row[F.TIMESTAMP] = t.timestamp || t[F.TIMESTAMP] || now.toISOString();
      row[F.GAME_END_TIME] = t[F.GAME_END_TIME] || t.gameEndTime || "";
      // v4.7 自適應難度欄位
      row[F.ADAPTIVE_ENGINE] = t.adaptiveEngine || t[F.ADAPTIVE_ENGINE] || "";
      row[F.DIFFICULTY_LEVEL] =
        t.difficultyLevel != null
          ? String(t.difficultyLevel)
          : t[F.DIFFICULTY_LEVEL] || "";
      row[F.THETA] =
        t.theta != null && t.theta !== "" ? String(t.theta) : t[F.THETA] || "";
      return row;
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 統計計算
  // ═══════════════════════════════════════════════════════════════

  /**
   * 標準常態分布反函數（Probit / Z-score）
   * 使用 Abramowitz & Stegun 近似法 (誤差 < 4.5e-4)
   * @param {number} p - 機率值 (0 < p < 1)
   * @returns {number} Z 值
   */
  function _probit(p) {
    if (p <= 0) return -5;
    if (p >= 1) return 5;
    if (p < 0.5) return -_probit(1 - p);
    // Rational approximation for upper half
    var t = Math.sqrt(-2 * Math.log(1 - p));
    var c0 = 2.515517;
    var c1 = 0.802853;
    var c2 = 0.010328;
    var d1 = 1.432788;
    var d2 = 0.189269;
    var d3 = 0.001308;
    return (
      t -
      (c0 + c1 * t + c2 * t * t) / (1 + d1 * t + d2 * t * t + d3 * t * t * t)
    );
  }

  /**
   * 標準常態密度函數 φ(z)
   * @param {number} z
   * @returns {number}
   */
  function _phi(z) {
    return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
  }

  /**
   * 計算 SDT 指標（Signal Detection Theory）
   * @param {Object[]} data - CSV 列物件陣列（僅一般試驗，不含 WM）
   * @returns {Object} { hits, fa, misses, cr, goTotal, noGoTotal, hitRate, faRate, dPrime, criterion, beta }
   */
  function _calculateSDTStats(data) {
    var hits = 0,
      fa = 0,
      misses = 0,
      cr = 0;

    for (var i = 0; i < data.length; i++) {
      var result = data[i][F.RESULT] || "";
      switch (result) {
        case "Hit":
          hits++;
          break;
        case "FA":
          fa++;
          break;
        case "Miss":
          misses++;
          break;
        case "CR":
          cr++;
          break;
      }
    }

    var goTotal = hits + misses;
    var noGoTotal = fa + cr;

    // log-linear 校正：(count + 0.5) / (total + 1)，避免 0% 或 100% 導致 Z → ±∞
    var hitRate = goTotal > 0 ? (hits + 0.5) / (goTotal + 1) : 0.5;
    var faRate = noGoTotal > 0 ? (fa + 0.5) / (noGoTotal + 1) : 0.5;

    var zHit = _probit(hitRate);
    var zFA = _probit(faRate);

    var dPrime = zHit - zFA;
    var criterion = -0.5 * (zHit + zFA);
    var beta = _phi(zFA) !== 0 ? _phi(zHit) / _phi(zFA) : 1;

    return {
      hits: hits,
      fa: fa,
      misses: misses,
      cr: cr,
      goTotal: goTotal,
      noGoTotal: noGoTotal,
      hitRate: hitRate,
      faRate: faRate,
      dPrime: dPrime,
      criterion: criterion,
      beta: beta,
    };
  }

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

    // SDT 指標
    var sdt = _calculateSDTStats(data);

    return {
      totalTrials: totalTrials,
      correctRate: correctRate,
      avgRT: avgRT,
      correctTrials: correctTrials,
      // SDT
      hits: sdt.hits,
      fa: sdt.fa,
      misses: sdt.misses,
      cr: sdt.cr,
      goTotal: sdt.goTotal,
      noGoTotal: sdt.noGoTotal,
      hitRate: sdt.hitRate,
      faRate: sdt.faRate,
      dPrime: sdt.dPrime,
      criterion: sdt.criterion,
      beta: sdt.beta,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // 渲染報告
  // ═══════════════════════════════════════════════════════════════

  /**
   * 在指定容器中渲染完整分析報告
   * @param {HTMLElement} container - 報告容器
   * @param {ParsedData} parsedData - 解析後的資料
   * @param {Object} [options] - 選項
   * @param {string} [options.mode] - 遊戲模式（'adventure' | 'free-select'）
   */
  function renderReport(container, parsedData, options) {
    if (!container || !parsedData) return;
    var opts = options || {};
    var gameMode = opts.mode || "";

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

    // — SDT 信號偵測論指標 —
    if (stats.goTotal > 0 || stats.noGoTotal > 0) {
      html += '<div class="csv-report__section">';
      html +=
        '<div class="csv-report__round-header">📐 信號偵測論 (SDT) 指標</div>';
      html += '<div class="csv-report__overview">';
      html += _statCard("✅", stats.hits + "/" + stats.goTotal, "Hit (命中)");
      html += _statCard("❌", stats.fa + "/" + stats.noGoTotal, "FA (虛報)");
      html += _statCard(
        "😶",
        stats.misses + "/" + stats.goTotal,
        "Miss (漏失)",
      );
      html += _statCard(
        "🛡️",
        stats.cr + "/" + stats.noGoTotal,
        "CR (正確拒絕)",
      );
      html += "</div>";
      html += '<div class="csv-report__overview">';
      html += _statCard("📊", stats.dPrime.toFixed(2), "d′ 敏感度");
      html += _statCard("⚖️", stats.criterion.toFixed(2), "c 決策準則");
      html += _statCard("🎚️", stats.beta.toFixed(2), "β 決策權重");
      html += _statCard(
        "📈",
        (stats.hitRate * 100).toFixed(1) + "%",
        "Hit Rate",
      );
      html += "</div>";
      html +=
        '<div style="padding:8px 16px;font-size:0.85em;color:var(--text-light,#888);">';
      html +=
        "<p>💡 <strong>d′</strong>：越高表示辨識 Go/NoGo 的能力越強。<strong>c</strong>：正值=保守（傾向不按），負值=衝動（傾向按）。<strong>β</strong>：>1=保守，<1=冒險。</p>";
      html += "</div>";
      html += "</div>";
    }

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

    // — 綜合比較（僅自由選擇模式顯示） —
    if (gameMode === "free-select") {
      html += '<div class="csv-report__section">';
      html += '<div class="csv-report__round-header">📊 綜合分析</div>';
      html +=
        '<div class="csv-report__chart-box"><h3>🎯 各回合正確率比較</h3><canvas id="csvAccChart"></canvas></div>';
      html +=
        '<div class="csv-report__chart-box"><h3>⏱️ 各回合平均反應時間</h3><canvas id="csvRTChart"></canvas></div>';
      html += "</div>";
    }

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
      if (gameMode === "free-select") {
        _drawAccuracyComparison(reg);
        _drawRTComparison(reg);
      }
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
        var ts = String(row[F.TIMESTAMP] || "");
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
            if (row[F.CONTEXT]) info += "\n情境：" + row[F.CONTEXT];
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

    // 動態偵測實際有資料的回合（支援自由選擇最多 12 回合）
    var MAX_ROUNDS = 12;
    var activeRounds = [];
    for (var rr = 1; rr <= MAX_ROUNDS; rr++) {
      if (_filterRound(regularTrials, rr).length > 0) activeRounds.push(rr);
    }
    if (activeRounds.length === 0) return;

    var accuracies = activeRounds.map(function (r) {
      var rd = _filterRound(regularTrials, r);
      if (rd.length === 0) return 0;
      var correct = rd.filter(function (row) {
        return row[F.CORRECT] === CV.CORRECT_YES;
      }).length;
      return (correct / rd.length) * 100;
    });

    var barLabels = activeRounds.map(function (r) {
      return ROUND_LABELS[r] || "回合 " + r;
    });
    var barColors = activeRounds.map(function (r) {
      return ROUND_COLORS[r] || "rgba(201,203,207,0.8)";
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

    // 動態偵測實際有資料的回合（支援自由選擇最多 12 回合）
    var MAX_ROUNDS = 12;
    var activeRounds = [];
    for (var rr = 1; rr <= MAX_ROUNDS; rr++) {
      if (_filterRound(regularTrials, rr).length > 0) activeRounds.push(rr);
    }
    if (activeRounds.length === 0) return;

    var avgRTs = activeRounds.map(function (r) {
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

    var lineLabels = activeRounds.map(function (r) {
      return ROUND_LABELS[r] || "回合 " + r;
    });
    var pointColors = activeRounds.map(function (r) {
      return ROUND_COLORS[r] || "rgba(201,203,207,0.8)";
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
      var ts = String(row[F.TIMESTAMP] || "");
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
      Logger.warn("CsvReport.exportCsv: 沒有資料可匯出");
      return;
    }

    var headers =
      FO.length > 0
        ? FO
        : [
            "FileName",
            "Participant",
            "SessionId",
            "Mode",
            "FieldId",
            "RuleId",
            "Round",
            "Trial",
            "Stimulus",
            "IsGo",
            "Context",
            "InputKey",
            "Correct",
            "Result",
            "RT(ms)",
            "StimulusDuration",
            "ISI",
            "WMSpan",
            "WMDirection",
            "WMCompletionTime",
            "Timestamp",
            "GameEndTime",
          ];
    var csvContent = headers.join(",") + "\n";

    parsedData.allData.forEach(function (row) {
      var line = headers
        .map(function (h) {
          var raw = row[h];
          // 空值（null / undefined / ""）一律填入 "-"
          var val = raw === null || raw === undefined || raw === "" ? "-" : raw;
          // 如果值包含逗號或引號，用引號包裹
          if (String(val).indexOf(",") >= 0 || String(val).indexOf('"') >= 0) {
            return '"' + String(val).replace(/"/g, '""') + '"';
          }
          return val;
        })
        .join(",");
      csvContent += line + "\n";
    });

    // === SDT 摘要列 ===
    try {
      var sdtStats = _calculateSDTStats(parsedData.allData);
      // 計算平均 RT
      var totalRT = 0,
        rtCount = 0;
      parsedData.allData.forEach(function (row) {
        var rt = parseFloat(row["RT(ms)"]);
        if (!isNaN(rt) && rt > 0) {
          totalRT += rt;
          rtCount++;
        }
      });
      var avgRT = rtCount > 0 ? (totalRT / rtCount).toFixed(1) : "-";

      var sdtRow = headers
        .map(function (h) {
          switch (h) {
            case "FileName":
              return "SDT_Summary";
            case "Participant":
              return parsedData.allData[0]
                ? parsedData.allData[0]["Participant"] || "-"
                : "-";
            case "Result":
              return (
                "Hit:" +
                sdtStats.hits +
                "/FA:" +
                sdtStats.fa +
                "/Miss:" +
                sdtStats.misses +
                "/CR:" +
                sdtStats.cr
              );
            case "RT(ms)":
              return "avg:" + avgRT;
            case "Correct":
              return (
                "d':" +
                sdtStats.dPrime.toFixed(3) +
                "/c:" +
                sdtStats.criterion.toFixed(3) +
                "/β:" +
                sdtStats.beta.toFixed(3)
              );
            case "Context":
              return "HitRate:" + (sdtStats.hitRate * 100).toFixed(1) + "%";
            default:
              return "-";
          }
        })
        .join(",");
      csvContent += sdtRow + "\n";
    } catch (sdtErr) {
      Logger.warn("SDT 摘要列產生失敗:", sdtErr);
    }

    // 預設檔名：從 parsedData 提取 participant + 完整時間戳
    var defaultName = filename;
    if (!defaultName) {
      var now = new Date();
      var dateStr =
        now.getFullYear().toString() +
        _pad(now.getMonth() + 1) +
        _pad(now.getDate());
      var timeStr =
        _pad(now.getHours()) + _pad(now.getMinutes()) + _pad(now.getSeconds());
      var pid =
        (parsedData.participants && parsedData.participants[0]) ||
        FN.DEFAULT_PARTICIPANT ||
        "Player";
      defaultName =
        FN.DATA_PREFIX +
        FN.SEPARATOR +
        pid +
        FN.SEPARATOR +
        dateStr +
        FN.SEPARATOR +
        timeStr +
        ".csv";
    }
    // 確保副檔名
    if (defaultName.indexOf(".csv") === -1) defaultName += ".csv";

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
    // html2canvas 用於擷取 DOM → Canvas
    var hasH2C = typeof html2canvas !== "undefined";
    // html2pdf 用於 Canvas → PDF 分頁
    var hasH2P = typeof html2pdf !== "undefined";

    if (!hasH2C && !hasH2P) {
      GameModal.alert(
        "PDF 匯出失敗",
        "PDF 匯出功能尚未載入，請確認 html2pdf.js 與 html2canvas 已引入",
        { icon: "📄" },
      );
      return Promise.reject(new Error("html2pdf/html2canvas not loaded"));
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
    var timeStr =
      _pad(now.getHours()) + _pad(now.getMinutes()) + _pad(now.getSeconds());

    // 若無自訂檔名，從 parsedData 提取參與者作為預設
    var defaultName = filename;
    if (
      !defaultName &&
      parsedData &&
      parsedData.participants &&
      parsedData.participants.length > 0
    ) {
      var pid = parsedData.participants[0] || "Data";
      defaultName =
        FN.PDF_PREFIX +
        FN.SEPARATOR +
        pid +
        FN.SEPARATOR +
        fileDate +
        FN.SEPARATOR +
        timeStr;
    }
    if (!defaultName) {
      defaultName =
        FN.PDF_PREFIX + FN.SEPARATOR + fileDate + FN.SEPARATOR + timeStr;
    }

    // ======================================================
    // 策略：normal-flow 元素（不用 position:fixed / absolute）
    //       手動 html2canvas → jsPDF 分頁，完全繞過 html2pdf 管線
    // ======================================================

    // (1) 注入臨時淺色主題到 <head>
    var tempStyle = document.createElement("style");
    tempStyle.id = "csv-report-pdf-light-override";
    tempStyle.textContent =
      "#csvPdfWrapper,#csvPdfWrapper *{color:#333!important;}" +
      "#csvPdfWrapper{background:#fff!important;width:794px!important;}" +
      ".csv-report__stat-value{color:#222!important;font-weight:700!important;}" +
      ".csv-report__stat-label{color:#555!important;}" +
      ".csv-report__round-header{color:#333!important;background:#f0f1f3!important;}" +
      ".csv-report__overview{background:#f8f9fa!important;}" +
      ".csv-report__section{background:#fff!important;border:1px solid #eee!important;}" +
      ".csv-report__stat-card{background:#f0f1f3!important;}" +
      ".csv-report__chart-box{background:#fff!important;}" +
      "#csvPdfWrapper canvas{background:#1a1a2e!important;border-radius:8px!important;padding:4px!important;}";
    document.head.appendChild(tempStyle);

    // (2) 建立 normal-flow wrapper（不使用任何定位）
    var wrapper = document.createElement("div");
    wrapper.id = "csvPdfWrapper";
    wrapper.style.cssText =
      "width:794px;background:#fff;color:#333;" +
      "font-family:'Noto Sans TC','Microsoft JhengHei','PingFang TC',sans-serif;" +
      "padding:0;margin:0;";

    // (3) 封面標題區
    var header = document.createElement("div");
    header.style.cssText =
      "padding:40px 40px 30px;border-bottom:3px solid #667eea;" +
      "margin-bottom:20px;background:#fff;";
    header.innerHTML =
      '<div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;">' +
      '<div style="width:50px;height:50px;border-radius:12px;' +
      "background:linear-gradient(135deg,#667eea,#764ba2);" +
      "display:flex;align-items:center;justify-content:center;" +
      'font-size:28px;color:#fff;">📊</div>' +
      "<div>" +
      '<h1 style="margin:0;font-size:24px;color:#333!important;letter-spacing:1px;">' +
      (RM.APP_NAME || "EF 執行功能訓練遊戲") +
      "</h1>" +
      '<h2 style="margin:4px 0 0;font-size:16px;color:#667eea!important;font-weight:600;">' +
      (RM.REPORT_SUBTITLE || "資料分析報告") +
      "</h2>" +
      "</div>" +
      "</div>" +
      '<div style="display:flex;gap:24px;font-size:13px;color:#666!important;">' +
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

    // (4) 深度複製報告內容
    var contentClone = container.cloneNode(true);
    contentClone.style.cssText = "padding:0 30px 20px;background:#fff;";

    // cloneNode 不複製 Canvas 像素，手動繪製
    var origCanvases = container.querySelectorAll("canvas");
    var clonedCanvases = contentClone.querySelectorAll("canvas");
    for (var ci = 0; ci < origCanvases.length; ci++) {
      try {
        clonedCanvases[ci].width = origCanvases[ci].width;
        clonedCanvases[ci].height = origCanvases[ci].height;
        clonedCanvases[ci].getContext("2d").drawImage(origCanvases[ci], 0, 0);
      } catch (e) {
        console.warn("PDF canvas copy failed for index " + ci, e);
      }
    }
    wrapper.appendChild(contentClone);

    // (5) 頁尾
    var footer = document.createElement("div");
    footer.style.cssText =
      "padding:16px 40px;border-top:2px solid #eee;font-size:11px;" +
      "color:#999!important;text-align:center;margin-top:20px;background:#fff;";
    footer.textContent = (
      RM.COPYRIGHT_TEMPLATE ||
      "© {year} 執行功能訓練遊戲 ─ 本報告由系統自動產生"
    ).replace("{year}", now.getFullYear());
    wrapper.appendChild(footer);

    // (6) 插入 body 最前面（normal flow，無定位）
    document.body.insertBefore(wrapper, document.body.firstChild);
    var savedScrollX = window.scrollX;
    var savedScrollY = window.scrollY;
    window.scrollTo(0, 0);

    // 清理函式
    function _cleanup() {
      if (wrapper.parentNode) document.body.removeChild(wrapper);
      if (tempStyle.parentNode) document.head.removeChild(tempStyle);
      window.scrollTo(savedScrollX, savedScrollY);
    }

    // (7) 等 DOM 渲染後，手動 html2canvas → jsPDF 分頁
    return new Promise(function (resolve) {
      setTimeout(resolve, 1000);
    })
      .then(function () {
        console.log(
          "[PDF] wrapper offset:",
          wrapper.offsetWidth,
          "x",
          wrapper.offsetHeight,
        );

        // 極簡 html2canvas 呼叫 — 不傳 x/y/scrollX/scrollY
        // html2canvas 會根據元素的 bounding rect 自動定位
        if (hasH2C) {
          return html2canvas(wrapper, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
          });
        }
        return html2pdf()
          .set({
            html2canvas: {
              scale: 2,
              useCORS: true,
              logging: false,
              backgroundColor: "#ffffff",
            },
          })
          .from(wrapper)
          .toCanvas();
      })
      .then(function (canvas) {
        console.log("[PDF] canvas:", canvas.width, "x", canvas.height);

        // 取得 jsPDF 建構式
        var JsPDFClass =
          (window.jspdf && window.jspdf.jsPDF) || window.jsPDF || null;

        if (!JsPDFClass) {
          throw new Error("jsPDF 未載入，無法產生 PDF");
        }

        // A4 尺寸 mm
        var pageW = 210;
        var pageH = 297;
        var mg = 8; // 統一邊距
        var contentW = pageW - mg * 2; // 194mm
        var contentH = pageH - mg * 2; // 281mm

        // 整張 canvas 縮放到 contentW mm 寬度時的高度
        var totalImgH = (canvas.height / canvas.width) * contentW;

        var doc = new JsPDFClass("portrait", "mm", "a4");
        var pageCount = Math.ceil(totalImgH / contentH);
        console.log(
          "[PDF] pages:",
          pageCount,
          "totalImgH:",
          totalImgH.toFixed(1) + "mm",
        );

        for (var p = 0; p < pageCount; p++) {
          if (p > 0) doc.addPage();

          // canvas 中這一頁對應的像素範圍
          var srcY = Math.round(((p * contentH) / totalImgH) * canvas.height);
          var srcH = Math.round((contentH / totalImgH) * canvas.height);
          if (srcY + srcH > canvas.height) srcH = canvas.height - srcY;
          if (srcH <= 0) break;

          // 切出這一頁的子 canvas
          var slice = document.createElement("canvas");
          slice.width = canvas.width;
          slice.height = srcH;
          var sCtx = slice.getContext("2d");
          sCtx.fillStyle = "#ffffff";
          sCtx.fillRect(0, 0, slice.width, slice.height);
          sCtx.drawImage(
            canvas,
            0,
            srcY,
            canvas.width,
            srcH,
            0,
            0,
            canvas.width,
            srcH,
          );

          // 子 canvas 寫入 PDF（寬度 = contentW，高度按比例）
          var sliceH = (srcH / canvas.width) * contentW;
          doc.addImage(
            slice.toDataURL("image/jpeg", 0.95),
            "JPEG",
            mg,
            mg,
            contentW,
            sliceH,
          );
        }

        doc.save(defaultName + ".pdf");
        _cleanup();
      })
      .catch(function (err) {
        _cleanup();
        Logger.error("PDF 匯出錯誤:", err);
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
    // 支援兩種方式：獨立 html2canvas 或 html2pdf 內建的 toCanvas
    var hasHtml2canvas = typeof html2canvas !== "undefined";
    var hasHtml2pdf = typeof html2pdf !== "undefined";
    if (!hasHtml2canvas && !hasHtml2pdf) {
      GameModal.alert(
        "截圖失敗",
        "截圖功能尚未載入，請確認 html2pdf.js 已引入",
        { icon: "📸" },
      );
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
    var timeStr =
      _pad(now.getHours()) + _pad(now.getMinutes()) + _pad(now.getSeconds());
    var defaultName;
    if (filename) {
      defaultName = filename + ".png";
    } else {
      // 未提供檔名時，使用預設格式（含日期和時間）
      defaultName =
        FN.SCREENSHOT_PREFIX +
        FN.SEPARATOR +
        fileDate +
        FN.SEPARATOR +
        timeStr +
        ".png";
    }

    // 保留深色背景（避免白底白字問題）
    var bgColor = "#1a1a2e";

    // 優先使用獨立 html2canvas
    if (hasHtml2canvas) {
      return html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: bgColor,
      })
        .then(function (canvas) {
          return _downloadCanvasAsPng(canvas, defaultName);
        })
        .catch(function (err) {
          Logger.error("截圖匯出錯誤:", err);
          throw err;
        });
    }

    // 備援：透過 html2pdf 內建的 html2canvas
    return html2pdf()
      .set({
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: bgColor,
        },
      })
      .from(container)
      .toCanvas()
      .then(function (canvas) {
        return _downloadCanvasAsPng(canvas, defaultName);
      })
      .catch(function (err) {
        Logger.error("截圖匯出錯誤:", err);
        throw err;
      });
  }

  /** 將 Canvas 轉為 PNG 並觸發下載 */
  function _downloadCanvasAsPng(canvas, filename) {
    return new Promise(function (resolve) {
      canvas.toBlob(function (blob) {
        var url = URL.createObjectURL(blob);
        var link = document.createElement("a");
        link.href = url;
        link.download = filename;
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

    /**
     * 從逐題 trialDetails 計算 SDT 指標（供外部模組使用）
     * @param {Object[]} trialDetails - 原始 trialDetails（含 result 欄位）
     * @returns {Object} { dPrime, criterion, beta, hits, fa, misses, cr, hitRate, faRate }
     */
    calculateSDT: function (trialDetails) {
      if (!trialDetails || trialDetails.length === 0) {
        return { dPrime: null, criterion: null, beta: null };
      }
      // 轉為 csv-report 內部格式
      var data = trialDetails.map(function (t) {
        var row = {};
        row[F.RESULT] = t.result || "";
        return row;
      });
      return _calculateSDTStats(data);
    },
  };
})();
