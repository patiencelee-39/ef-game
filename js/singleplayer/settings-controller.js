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
  var themeSelector = document.getElementById("themeSelector");
  var btnExport = document.getElementById("btnExport");
  var btnImport = document.getElementById("btnImport");
  var btnClearAll = document.getElementById("btnClearAll");
  var importFileInput = document.getElementById("importFileInput");
  var toast = document.getElementById("toast");

  // ----- 初始化 -----
  function init() {
    loadPlayerInfo();
    loadAudioSettings();
    loadGameSettings();
    loadThemeSettings();
    bindEvents();
  }

  // =========================================
  // 👤 玩家資訊
  // =========================================
  function loadPlayerInfo() {
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
        : 6;
    var btns = countSelector.querySelectorAll(".count-btn");
    btns.forEach(function (b) {
      var c = parseInt(b.getAttribute("data-count"), 10);
      b.classList.toggle("active", c === count);
    });
  }

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
    btnExport.addEventListener("click", handleExport);

    // --- 匯入 ---
    btnImport.addEventListener("click", function () {
      importFileInput.click();
    });
    importFileInput.addEventListener("change", handleImport);

    // --- 清除所有資料 ---
    btnClearAll.addEventListener("click", handleClearAll);
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
      console.error("匯出失敗:", e);
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
      "此操作將刪除所有遊戲紀錄、進度、星星和徽章，且無法復原。建議先匯出備份。",
      function () {
        if (typeof clearAllGameData === "function") {
          clearAllGameData();
          showToast("✅ 所有資料已清除，重新載入中…");
          setTimeout(function () {
            location.reload();
          }, 1200);
        } else {
          showToast("❌ 清除功能不可用");
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
