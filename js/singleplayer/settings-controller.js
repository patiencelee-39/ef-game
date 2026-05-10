// =========================================
// ⚙️ 設定頁面控制器
// =========================================
(function () {
  "use strict";

  // ----- DOM 元素 -----
  var volumeSlider = document.getElementById("volumeSlider");
  var volumePercent = document.getElementById("volumePercent");
  var sfxToggle = document.getElementById("sfxToggle");
  var voiceToggle = document.getElementById("voiceToggle");
  var rateSelector = document.getElementById("rateSelector");
  var countSelector = document.getElementById("countSelector");
  var engineSelector = document.getElementById("engineSelector");
  var themeSelector = document.getElementById("themeSelector");
  var btnExport = document.getElementById("btnExport");
  var btnImport = document.getElementById("btnImport");
  var btnClearAll = document.getElementById("btnClearAll");
  var btnClearCache = document.getElementById("btnClearCache");
  var importFileInput = document.getElementById("importFileInput");
  var toast = document.getElementById("toast");

  // ----- 初始化 -----
  function init() {
    loadPlayerInfo();
    loadAudioSettings();
    loadGameSettings();
    loadEngineSettings();
    renderEngineDetailPanel(
      localStorage.getItem("ef_engine_choice") || "simple"
    );
    loadStaticParams();
    loadMonitorOpacity();
    loadThemeSettings();
    bindEvents();
  }

  // =========================================
  // 👤 玩家資訊
  // =========================================
  function loadPlayerInfo() {
    // 玩家資訊已移至「玩家資訊」頁面（stats.html）
    // 若 DOM 元素不存在則跳過
    if (!document.getElementById("infoSeatNumber")) return;

    var profile =
      typeof getPlayerProfile === "function" ? getPlayerProfile() : null;
    if (!profile) {
      document.getElementById("infoSeatNumber").textContent = "未設定";
      document.getElementById("infoNickname").textContent = "未設定";
      document.getElementById("infoLevel").textContent = "1";
      document.getElementById("infoTotalStars").textContent = "0";
      document.getElementById("infoAvailStars").textContent = "0";
      document.getElementById("infoBadgeCount").textContent = "0";
      return;
    }

    document.getElementById("infoSeatNumber").textContent =
      profile.seatNumber || "--";
    document.getElementById("infoNickname").textContent =
      profile.nickname || "--";
    document.getElementById("infoLevel").textContent =
      "Lv." +
      (typeof getLevel === "function" ? getLevel() : profile.level || 1);
    document.getElementById("infoTotalStars").textContent =
      typeof getTotalStars === "function"
        ? getTotalStars()
        : profile.totalStars || 0;
    document.getElementById("infoAvailStars").textContent =
      typeof getAvailableStars === "function" ? getAvailableStars() : 0;

    var badges =
      typeof getBadges === "function" ? getBadges() : profile.badges || [];
    document.getElementById("infoBadgeCount").textContent = badges.length;

    // 訪客標記
    var isGuest = typeof isGuestPlayer === "function" && isGuestPlayer();
    document.getElementById("guestInfoRow").style.display = isGuest
      ? "flex"
      : "none";
  }

  // =========================================
  // 🔊 音效設定
  // =========================================
  function loadAudioSettings() {
    // 確保 AudioPlayer 已初始化（從 localStorage 載入持久化設定）
    if (typeof AudioPlayer !== "undefined") {
      AudioPlayer.init();
      // 音量
      var vol = AudioPlayer.getVolume();
      var pct = Math.round(vol * 100);
      volumeSlider.value = pct;
      volumePercent.textContent = pct + "%";

      // SFX / Voice 開關
      sfxToggle.checked = AudioPlayer.isSfxEnabled();
      voiceToggle.checked = AudioPlayer.isVoiceEnabled();

      // 語速
      var rate = AudioPlayer.getVoiceRate();
      updateRateButtons(rate);
    }
  }

  function updateRateButtons(rate) {
    var btns = rateSelector.querySelectorAll(".rate-btn");
    // 找最接近的
    var closest = 1.0;
    var minDiff = 999;
    btns.forEach(function (b) {
      var r = parseFloat(b.getAttribute("data-rate"));
      var diff = Math.abs(r - rate);
      if (diff < minDiff) {
        minDiff = diff;
        closest = r;
      }
    });
    btns.forEach(function (b) {
      var r = parseFloat(b.getAttribute("data-rate"));
      b.classList.toggle("active", r === closest);
    });
  }

  // =========================================
  // 🎯 遊戲設定
  // =========================================
  function loadGameSettings() {
    var count =
      typeof getQuestionCountPreference === "function"
        ? getQuestionCountPreference()
        : 50;
    var input = document.getElementById("countInput");
    if (input) input.value = count;
  }

  // =========================================
  // 🧠 難度調整引擎設定
  // =========================================
  function loadEngineSettings() {
    if (!engineSelector) return;
    var choice;
    try {
      choice = localStorage.getItem("ef_engine_choice");
    } catch (e) {
      Logger.warn("[Settings] localStorage read failed:", e);
    }
    if (!choice) {
      var cfg = (typeof GAME_CONFIG !== "undefined" && GAME_CONFIG.DEV) || {};
      choice = cfg.ADAPTIVE_ENGINE || "simple";
    }
    engineSelector.querySelectorAll(".engine-btn").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-engine") === choice);
    });
  }

  /** 讀取 localStorage 存儲的難度等級 */
  function getStoredLevel() {
    try {
      var raw = localStorage.getItem("ef_adaptive_level");
      if (!raw) return 5;
      var data = JSON.parse(raw);
      var level = Number(data.level);
      if (level >= 1 && level <= 10) return level;
    } catch (e) { /* ignore */ }
    return 5;
  }

  /**
   * 從引擎取得參數表（Single Source of Truth）
   * 回傳格式轉換成 UI 用的 key 名稱
   */
  function _getEngineLevelData() {
    if (typeof SimpleAdaptiveEngine === "undefined" || !SimpleAdaptiveEngine.getAllLevelParams) {
      return null;
    }
    var raw = SimpleAdaptiveEngine.getAllLevelParams();
    var timing = {};
    var wm = {};
    for (var lv in raw.timing) {
      var t = raw.timing[lv];
      timing[lv] = {
        stimulus: t.stimulusDurationMs,
        grace: t.responseGraceMs,
        isiMin: t.isiMinMs,
        isiMax: t.isiMaxMs,
        feedback: t.feedbackDurationMs,
      };
    }
    for (var lv2 in raw.wm) {
      var w = raw.wm[lv2];
      wm[lv2] = {
        minPos: w.minPositions,
        maxPos: w.maxPositions,
        reverse: w.reverseProbability,
        timeout: w.responseTimeoutMs,
      };
    }
    return { timing: timing, wm: wm };
  }

  /** 渲染動態詳細面板 */
  function renderEngineDetailPanel(engine) {
    var panel = document.getElementById("engineDetailPanel");
    var staticPanel = document.getElementById("staticDetailPanel");

    // 固定模式面板
    if (staticPanel) {
      staticPanel.style.display = (engine === "static") ? "" : "none";
    }

    // 動態面板
    if (!panel) return;
    if (engine !== "simple") {
      panel.style.display = "none";
      return;
    }
    panel.style.display = "";

    // 更新規則說明文字
    var ruleText = document.getElementById("edRuleText");
    if (ruleText && typeof SimpleAdaptiveEngine !== "undefined") {
      var streak = SimpleAdaptiveEngine.getStreakThreshold();
      ruleText.textContent = "※ 連對 " + streak +
        " 題升一級，連錯 " + streak +
        " 題降一級（Level " + SimpleAdaptiveEngine.MIN_LEVEL + "～" +
        SimpleAdaptiveEngine.MAX_LEVEL + "）";
    }

    // streak threshold 從引擎抓值
    var streakInput = document.getElementById("edStreakInput");
    if (streakInput && typeof SimpleAdaptiveEngine !== "undefined") {
      streakInput.value = SimpleAdaptiveEngine.getStreakThreshold();
      streakInput.onchange = function () {
        var val = parseInt(streakInput.value, 10);
        if (isNaN(val) || val < 1) val = 1;
        if (val > 10) val = 10;
        streakInput.value = val;
        SimpleAdaptiveEngine.setStreakThreshold(val);
        showToast("🎯 連續 " + val + " 題觸發升/降級");
        // 重新渲染（更新規則文字）
        renderEngineDetailPanel("simple");
      };
    }

    var lv = getStoredLevel();
    var data = _getEngineLevelData();
    if (!data) return;
    var t = data.timing[lv];
    var w = data.wm[lv];
    if (!t || !w) return;

    // 等級顯示（改用數字而非星星，10顆太多）
    document.getElementById("edLevelStars").textContent = "Level " + lv + " / 10";
    document.getElementById("edLevelTag").textContent = "";

    // 進度條百分比（L1=0%, L10=100%）
    var pct = ((lv - 1) / 9) * 100;

    document.getElementById("edBarStimulus").style.width = pct + "%";
    document.getElementById("edValStimulus").textContent = (t.stimulus / 1000).toFixed(1) + " 秒";

    document.getElementById("edBarGrace").style.width = pct + "%";
    document.getElementById("edValGrace").textContent = (t.grace / 1000).toFixed(1) + " 秒";

    document.getElementById("edBarIsi").style.width = pct + "%";
    document.getElementById("edValIsi").textContent =
      (t.isiMin / 1000).toFixed(1) + "～" + (t.isiMax / 1000).toFixed(1) + " 秒";

    document.getElementById("edBarFeedback").style.width = pct + "%";
    document.getElementById("edValFeedback").textContent = (t.feedback / 1000).toFixed(1) + " 秒";

    document.getElementById("edBarGoRatio").style.width = pct + "%";
    if (t.goRatio != null) {
      document.getElementById("edValGoRatio").textContent = Math.round(t.goRatio * 100) + "%";
    }

    document.getElementById("edBarWmPos").style.width = pct + "%";
    document.getElementById("edValWmPos").textContent = w.minPos + "～" + w.maxPos + " 個";

    document.getElementById("edBarReverse").style.width = pct + "%";
    document.getElementById("edValReverse").textContent = Math.round(w.reverse * 100) + "%";

    document.getElementById("edBarTimeout").style.width = pct + "%";
    document.getElementById("edValTimeout").textContent = (w.timeout / 1000).toFixed(0) + " 秒";

    // 動態生成完整參數表格
    var tableWrap = document.getElementById("edTableWrap");
    if (tableWrap) {
      var maxLv = SimpleAdaptiveEngine.MAX_LEVEL || 10;

      // 表頭
      var html = '<table class="engine-detail-table"><thead><tr><th></th>';
      for (var i = 1; i <= maxLv; i++) {
        html += "<th>L" + i + "</th>";
      }
      html += "</tr></thead><tbody>";

      // 📷 圖片顯示
      html += "<tr><td>📷 圖片</td>";
      for (var i = 1; i <= maxLv; i++) {
        html += "<td>" + (data.timing[i].stimulus / 1000).toFixed(1) + "s</td>";
      }
      html += "</tr>";

      // ⏳ 額外反應
      html += "<tr><td>⏳ 額外反應</td>";
      for (var i = 1; i <= maxLv; i++) {
        html += "<td>" + (data.timing[i].grace / 1000).toFixed(2).replace(/0$/, "") + "s</td>";
      }
      html += "</tr>";

      // ⏱️ 間隔
      html += "<tr><td>⏱️ 間隔</td>";
      for (var i = 1; i <= maxLv; i++) {
        html += "<td>" + (data.timing[i].isiMin / 1000).toFixed(1) + "～" + (data.timing[i].isiMax / 1000).toFixed(1) + "s</td>";
      }
      html += "</tr>";

      // 💬 提示
      html += "<tr><td>💬 提示</td>";
      for (var i = 1; i <= maxLv; i++) {
        html += "<td>" + (data.timing[i].feedback / 1000).toFixed(1) + "s</td>";
      }
      html += "</tr>";

      // 🧠 位置
      html += "<tr><td>🧠 位置</td>";
      for (var i = 1; i <= maxLv; i++) {
        html += "<td>" + data.wm[i].minPos + "～" + data.wm[i].maxPos + "</td>";
      }
      html += "</tr>";

      // 🔄 逆向
      html += "<tr><td>🔄 逆向</td>";
      for (var i = 1; i <= maxLv; i++) {
        html += "<td>" + Math.round(data.wm[i].reverse * 100) + "%</td>";
      }
      html += "</tr>";

      // ⏰ WM作答
      html += "<tr><td>⏰ WM作答</td>";
      for (var i = 1; i <= maxLv; i++) {
        html += "<td>" + (data.wm[i].timeout / 1000).toFixed(0) + "s</td>";
      }
      html += "</tr>";

      html += "</tbody></table>";
      tableWrap.innerHTML = html;

      // 當前等級高亮
      var table = tableWrap.querySelector("table");
      if (table) {
        table.querySelectorAll("thead th").forEach(function (th, idx) {
          if (idx >= 1) {
            th.style.color = (idx === lv) ? "#c39bd3" : "";
            th.style.fontWeight = (idx === lv) ? "900" : "";
          }
        });
        table.querySelectorAll("tbody tr").forEach(function (row) {
          row.querySelectorAll("td").forEach(function (cell, idx) {
            if (idx >= 1) {
              cell.style.color = (idx === lv) ? "#c39bd3" : "";
              cell.style.fontWeight = (idx === lv) ? "700" : "";
            }
          });
        });
      }
    }
  }

  // =========================================
  // 📊 固定模式參數自訂
  // =========================================

  var SP_KEY = "ef_static_params";

  var SP_DEFAULTS = {
    stimulusMs: 2000,
    graceMs: 1000,
    isiMinMs: 800,
    isiMaxMs: 1200,
    feedbackMs: 800,
    goRatio: 75,
    wmMinPos: 2,
    wmMaxPos: 4,
    wmReverse: 30,
    wmTimeoutMs: 60000,
  };

  var SP_FIELDS = [
    { id: "spStimulus",   key: "stimulusMs"  },
    { id: "spFeedback",   key: "feedbackMs"  },
    { id: "spGoRatio",    key: "goRatio"     },
    { id: "spGrace",      key: "graceMs"     },
    { id: "spIsiMin",     key: "isiMinMs"    },
    { id: "spIsiMax",     key: "isiMaxMs"    },
    { id: "spWmMin",      key: "wmMinPos"    },
    { id: "spWmMax",      key: "wmMaxPos"    },
    { id: "spReverse",    key: "wmReverse"   },
    { id: "spWmTimeout",  key: "wmTimeoutMs" },
  ];

  function loadStaticParams() {
    var saved = {};
    try {
      var raw = localStorage.getItem(SP_KEY);
      if (raw) saved = JSON.parse(raw);
    } catch (e) { /* ignore */ }

    SP_FIELDS.forEach(function (f) {
      var el = document.getElementById(f.id);
      if (el) {
        el.value = saved[f.key] != null ? saved[f.key] : SP_DEFAULTS[f.key];
      }
    });

  }

  function saveStaticParams() {
    var data = {};
    SP_FIELDS.forEach(function (f) {
      var el = document.getElementById(f.id);
      if (el) {
        var val = parseInt(el.value, 10);
        var min = parseInt(el.min, 10);
        var max = parseInt(el.max, 10);
        if (isNaN(val) || val < min) val = min;
        if (val > max) val = max;
        el.value = val;
        data[f.key] = val;
      }
    });

    // 驗證：isiMin 不能大於 isiMax
    if (data.isiMinMs > data.isiMaxMs) {
      data.isiMaxMs = data.isiMinMs;
      var isiMaxEl = document.getElementById("spIsiMax");
      if (isiMaxEl) isiMaxEl.value = data.isiMaxMs;
    }

    // 驗證：wmMinPos 不能大於 wmMaxPos
    if (data.wmMinPos > data.wmMaxPos) {
      data.wmMaxPos = data.wmMinPos;
      var wmMaxEl = document.getElementById("spWmMax");
      if (wmMaxEl) wmMaxEl.value = data.wmMaxPos;
    }

    try {
      localStorage.setItem(SP_KEY, JSON.stringify(data));
    } catch (e) { /* ignore */ }

  }

  function resetStaticParams() {
    try {
      localStorage.removeItem(SP_KEY);
      localStorage.removeItem("ef_adaptive_streak");
      localStorage.removeItem("ef_adaptive_level");
    } catch (e) { /* ignore */ }

    SP_FIELDS.forEach(function (f) {
      var el = document.getElementById(f.id);
      if (el) el.value = SP_DEFAULTS[f.key];
    });

    // 重設 streak threshold 回預設值 2
    if (typeof SimpleAdaptiveEngine !== "undefined" && SimpleAdaptiveEngine.setStreakThreshold) {
      SimpleAdaptiveEngine.setStreakThreshold(2);
    }
    var streakInput = document.getElementById("edStreakInput");
    if (streakInput) streakInput.value = 2;
  }

  // =========================================
  // ⏱️ 監控面板設定（開關 + 透明度，獨立於難度參數）
  // =========================================
  function loadMonitorOpacity() {
    // 開關
    var toggle = document.getElementById("monitorToggle");
    if (toggle) {
      var enabled = localStorage.getItem("ef_monitor_enabled");
      toggle.checked = enabled !== "false";
      toggle.addEventListener("change", function () {
        localStorage.setItem("ef_monitor_enabled", toggle.checked ? "true" : "false");
        showToast(toggle.checked ? "⏱️ 監控面板已開啟" : "⏱️ 監控面板已關閉");
      });
    }

    // 透明度
    var el = document.getElementById("spMonitorOpacity");
    if (!el) return;
    var saved = localStorage.getItem("ef_monitor_opacity");
    el.value = saved != null ? Math.round(parseFloat(saved) * 100) : 30;
  }

  window.saveMonitorOpacity = function (val) {
    var v = parseInt(val, 10);
    if (isNaN(v) || v < 0) v = 0;
    if (v > 100) v = 100;
    var el = document.getElementById("spMonitorOpacity");
    if (el) el.value = v;
    localStorage.setItem("ef_monitor_opacity", (v / 100).toString());
    showToast("👁️ 監控面板透明度已儲存：" + v + "%");
  };

  // =========================================
  // 🎨 配色主題
  // =========================================
  function loadThemeSettings() {
    var theme =
      typeof getThemePreference === "function"
        ? getThemePreference()
        : "field-primary";
    if (themeSelector) {
      themeSelector.querySelectorAll(".theme-option").forEach(function (opt) {
        var isActive = opt.dataset.theme === theme;
        opt.classList.toggle("active", isActive);
        opt.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
    }
    // 套用到 <html>
    document.documentElement.setAttribute("data-theme", theme);
  }

  // =========================================
  // 事件綁定
  // =========================================
  function bindEvents() {
    // --- 音量滑桿 ---
    volumeSlider.addEventListener("input", function () {
      var pct = parseInt(this.value, 10);
      volumePercent.textContent = pct + "%";
      if (typeof AudioPlayer !== "undefined") {
        AudioPlayer.setVolume(pct / 100);
      }
      // 同步到 profile
      if (typeof saveSoundSettings === "function") {
        saveSoundSettings({ masterVolume: pct / 100 });
      }
    });

    // --- SFX 開關 ---
    sfxToggle.addEventListener("change", function () {
      if (typeof AudioPlayer !== "undefined") {
        AudioPlayer.setSfxEnabled(this.checked);
      }
      if (typeof saveSoundSettings === "function") {
        saveSoundSettings({ sfx: this.checked });
      }
    });

    // --- 語音開關 ---
    voiceToggle.addEventListener("change", function () {
      if (typeof AudioPlayer !== "undefined") {
        AudioPlayer.setVoiceEnabled(this.checked);
      }
      if (typeof saveSoundSettings === "function") {
        saveSoundSettings({ voice: this.checked });
      }
    });

    // --- 語速按鈕 ---
    rateSelector.addEventListener("click", function (e) {
      var btn = e.target.closest(".rate-btn");
      if (!btn) return;
      var rate = parseFloat(btn.getAttribute("data-rate"));
      if (typeof AudioPlayer !== "undefined") {
        AudioPlayer.setVoiceRate(rate);
      }
      // 同步到 profile
      if (typeof saveSoundSettings === "function") {
        saveSoundSettings({ voiceRate: rate });
      }
      updateRateButtons(rate);
      showToast("語速已設定為 " + btn.textContent.trim());
    });

    // --- 題數按鈕 ---
    var countInput = document.getElementById("countInput");
    if (countInput) {
      countInput.addEventListener("change", function (e) {
        var count = parseInt(e.target.value, 10);
        if (typeof saveQuestionCountPreference === "function") {
          saveQuestionCountPreference(count);
        }
        document.getElementById("count-value").textContent = count;
        showToast("每回合題數已設定為 " + count + " 題");
      });
    }

    // 舊的按鈕邏輯保留作為 fallback（如有其他頁面使用）
    if (countSelector && countSelector.querySelectorAll(".count-btn").length > 0) {
      countSelector.addEventListener("click", function (e) {
        var btn = e.target.closest(".count-btn");
        if (!btn) return;
        var count = parseInt(btn.getAttribute("data-count"), 10);
        if (typeof saveQuestionCountPreference === "function") {
          saveQuestionCountPreference(count);
        }
        var btns = countSelector.querySelectorAll(".count-btn");
        btns.forEach(function (b) {
          b.classList.toggle(
            "active",
            parseInt(b.getAttribute("data-count"), 10) === count,
          );
        });
        showToast("每回合題數已設定為 " + count + " 題");
    });
    }

    // --- 難度引擎選擇 ---
    if (engineSelector) {
      engineSelector.addEventListener("click", function (e) {
        var btn = e.target.closest(".engine-btn");
        if (!btn) return;
        var engine = btn.getAttribute("data-engine");
        try {
          localStorage.setItem("ef_engine_choice", engine);
        } catch (ex) {
          Logger.warn("[Settings] localStorage write failed:", ex);
        }
        engineSelector.querySelectorAll(".engine-btn").forEach(function (b) {
          b.classList.toggle(
            "active",
            b.getAttribute("data-engine") === engine,
          );
        });
        var names = {
          static: "📊 固定難度",
          simple: "🎯 簡易自適應",
          irt: "🧠 IRT 智慧調整",
        };
        showToast(
          "已切換為「" + (names[engine] || engine) + "」，下次遊戲生效",
        );
        renderEngineDetailPanel(engine);
      });
    }

    // --- 配色主題 ---
    if (themeSelector) {
      themeSelector.addEventListener("click", function (e) {
        var opt = e.target.closest(".theme-option");
        if (!opt) return;
        var theme = opt.dataset.theme;
        if (typeof saveThemePreference === "function") {
          saveThemePreference(theme);
        }
        document.documentElement.setAttribute("data-theme", theme);
        themeSelector.querySelectorAll(".theme-option").forEach(function (o) {
          var isActive = o.dataset.theme === theme;
          o.classList.toggle("active", isActive);
          o.setAttribute("aria-pressed", isActive ? "true" : "false");
        });
        var names = {
          "field-primary": "遊戲場配色",
          "rule-independent": "規則配色",
        };
        showToast("🎨 已切換為「" + (names[theme] || theme) + "」");
      });
    }

    // --- 匯出 ---
    if (btnExport) btnExport.addEventListener("click", handleExport);

    // --- 匯入 ---
    if (btnImport) {
      btnImport.addEventListener("click", function () {
        importFileInput.click();
      });
    }
    if (importFileInput)
      importFileInput.addEventListener("change", handleImport);

    // --- 清除所有資料 ---
    if (btnClearAll) btnClearAll.addEventListener("click", handleClearAll);

    // --- 僅清除快取 ---
    if (btnClearCache)
      btnClearCache.addEventListener("click", handleClearCache);

    // --- 動態完整參數表展開 ---
    var edToggle = document.getElementById("edToggleTable");
    var edTableWrap = document.getElementById("edTableWrap");
    if (edToggle && edTableWrap) {
      edToggle.addEventListener("click", function () {
        var isHidden = edTableWrap.style.display === "none";
        edTableWrap.style.display = isHidden ? "" : "none";
        edToggle.textContent = isHidden ? "▲ 收合參數表" : "▼ 查看完整參數表";
      });
    }

    // --- 固定模式參數輸入 ---
    SP_FIELDS.forEach(function (f) {
      var el = document.getElementById(f.id);
      if (el) {
        el.addEventListener("change", function () {
          saveStaticParams();
          showToast("📊 固定模式參數已儲存");
        });
      }
    });

    // --- 固定模式恢復預設 ---
    var spResetBtn = document.getElementById("spResetBtn");
    if (spResetBtn) {
      spResetBtn.addEventListener("click", function () {
        resetStaticParams();
        showToast("📊 已恢復預設參數");
      });
    }
  }

  // =========================================
  // 📤 匯出
  // =========================================
  function handleExport() {
    if (typeof exportGameData !== "function") {
      showToast("❌ 匯出功能不可用");
      return;
    }
    try {
      var json = exportGameData();
      var blob = new Blob([json], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      var profile =
        typeof getPlayerProfile === "function" ? getPlayerProfile() : null;
      var name = profile ? profile.seatNumber + "_" + profile.nickname : "game";
      var date = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = "efgame-backup-" + name + "-" + date + ".json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("✅ 遊戲紀錄已匯出");
    } catch (e) {
      Logger.error("匯出失敗:", e);
      showToast("❌ 匯出失敗");
    }
  }

  // =========================================
  // 📥 匯入
  // =========================================
  function handleImport(e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".json")) {
      showToast("❌ 請選擇 .json 檔案");
      importFileInput.value = "";
      return;
    }
    var reader = new FileReader();
    reader.onload = function (ev) {
      if (typeof importGameData !== "function") {
        showToast("❌ 匯入功能不可用");
        return;
      }
      var ok = importGameData(ev.target.result);
      if (ok) {
        showToast("✅ 遊戲紀錄已匯入，重新載入中…");
        setTimeout(function () {
          location.reload();
        }, 1200);
      } else {
        showToast("❌ 匯入失敗，檔案格式不正確");
      }
    };
    reader.readAsText(file);
    importFileInput.value = "";
  }

  // =========================================
  // 🗑️ 清除所有資料
  // =========================================
  function handleClearAll() {
    showConfirm(
      "⚠️",
      "清除所有資料",
      "此操作將刪除所有遊戲紀錄、進度、星星、徽章和快取，且無法復原。建議先匯出備份。",
      function () {
        if (typeof clearAllGameData === "function") {
          clearAllGameData();
          showToast("✅ 所有資料已清除，重新載入中…");
          setTimeout(function () {
            location.reload();
          }, 1500);
        } else {
          showToast("❌ 清除功能不可用");
        }
      },
    );
  }

  // =========================================
  // 🧹 僅清除快取儲存空間
  // =========================================
  function handleClearCache() {
    showConfirm(
      "🧹",
      "清除快取儲存空間",
      "僅清除離線快取（不影響遊戲紀錄和進度）。清除後頁面會重新載入以重建快取。",
      function () {
        if (typeof clearCacheStorage === "function") {
          clearCacheStorage();
          showToast("✅ 快取已清除，重新載入中…");
          setTimeout(function () {
            location.reload();
          }, 1500);
        } else {
          // fallback: 直接用 caches API
          if ("caches" in window) {
            caches.keys().then(function (names) {
              Promise.all(
                names.map(function (n) {
                  return caches.delete(n);
                }),
              ).then(function () {
                showToast("✅ 快取已清除，重新載入中…");
                setTimeout(function () {
                  location.reload();
                }, 1500);
              });
            });
          } else {
            showToast("❌ 此瀏覽器不支援快取清除");
          }
        }
      },
    );
  }

  // =========================================
  // 🔔 Toast 提示
  // =========================================
  var _toastTimer = null;
  function showToast(msg) {
    if (_toastTimer) clearTimeout(_toastTimer);
    toast.textContent = msg;
    toast.classList.add("show");
    _toastTimer = setTimeout(function () {
      toast.classList.remove("show");
    }, 2200);
  }

  // =========================================
  // ⚠️ 確認彈窗
  // =========================================
  function showConfirm(icon, title, msg, onOk) {
    var overlay = document.getElementById("confirmOverlay");
    document.getElementById("confirmIcon").textContent = icon;
    document.getElementById("confirmTitle").textContent = title;
    document.getElementById("confirmMsg").textContent = msg;
    overlay.classList.add("show");

    var okBtn = document.getElementById("confirmOk");
    var cancelBtn = document.getElementById("confirmCancel");

    function cleanup() {
      overlay.classList.remove("show");
      okBtn.removeEventListener("click", onConfirm);
      cancelBtn.removeEventListener("click", onCancel);
    }
    function onConfirm() {
      cleanup();
      if (onOk) onOk();
    }
    function onCancel() {
      cleanup();
    }
    okBtn.addEventListener("click", onConfirm);
    cancelBtn.addEventListener("click", onCancel);
  }

  // ----- 啟動 -----
  document.addEventListener("DOMContentLoaded", init);
})();
