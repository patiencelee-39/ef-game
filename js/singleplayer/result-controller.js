/**
 * ResultController — 結算頁面控制器（IIFE）
 * 依據探險 / 自由選擇模式渲染不同的結算畫面
 * 對應需求文件：§3.6, Flow-11, Flow-13
 */
var ResultController = (function () {
  "use strict";

  var dom = {};

  function cacheDom() {
    dom.headerTitle = document.getElementById("resultHeaderTitle");
    dom.body = document.getElementById("resultBody");
    dom.actions = document.getElementById("resultActions");
  }

  // =========================================
  // 工具函式
  // =========================================

  /** 產生星星 HTML（滿星 vs 空星） */
  function starsHTML(earned, max) {
    max = max || 3;
    var html = "";
    for (var i = 0; i < max; i++) {
      html +=
        '<span class="star ' +
        (i < earned ? "star--earned" : "star--empty") +
        '">⭐</span>';
    }
    return html;
  }

  /** 百分比格式化 */
  function pct(value) {
    if (value == null) return "—";
    return Math.round(value * 100) + "%";
  }

  /** 毫秒 → 秒 */
  function msToSec(ms) {
    if (ms == null) return "—";
    return (ms / 1000).toFixed(2) + "s";
  }

  /** escape HTML */
  function esc(text) {
    var d = document.createElement("div");
    d.textContent = text || "";
    return d.innerHTML;
  }

  /** 統計格子 */
  function _statItem(value, label, cls) {
    return (
      '<div class="stat-item">' +
      '<div class="stat-value ' +
      (cls || "") +
      '">' +
      value +
      "</div>" +
      '<div class="stat-label">' +
      label +
      "</div></div>"
    );
  }

  // =========================================
  // 🔊 結算音效
  // =========================================

  /** badge_id → SoundConfig badgeVoice key */
  var BADGE_VOICE_MAP = {
    mouse_adventurer: "mouseAdventurer",
    fishing_adventurer: "fishingAdventurer",
    rule_switch_master: "ruleSwitcher",
    mixed_expert: "mixedMaster",
    memory_master: "memoryExpert",
    speed_king: "speedKing",
    perfectionist: "perfectionist",
    progress_star: "progressStar",
    memory_star: "memoryStar",
    all_clear: "allClear",
    rainbow_collector: "rainbowCollector",
    unyielding: "braveWarrior",
    early_bird: "earlyBird",
    night_owl: "nightOwl",
    game_master: "gameMaster",
    badge_strong: "badgeStrong",
    badge_expert: "badgeExpert",
    badge_grandmaster: "badgeGrandmaster",
  };

  /** level number → SoundConfig levelVoice key */
  var LEVEL_VOICE_MAP = {
    1: "level1",
    2: "level2",
    3: "level3",
    4: "level4",
    5: "level5",
  };

  /**
   * 播放結算音效序列（pass/fail → level-up → badges）
   * 每段語音播完後再播下一段，避免重疊
   */
  function _playResultAudio(passed, levelResult, badges) {
    if (
      typeof AudioPlayer === "undefined" ||
      typeof getSoundFile !== "function"
    )
      return;

    var queue = [];

    // 1. 通過/未通過 SFX
    if (passed) {
      queue.push(function () {
        return AudioPlayer.playSfx(getSoundFile("feedback.complete"), {
          synthPreset: "complete",
        });
      });
    } else {
      queue.push(function () {
        return AudioPlayer.playSfx(null, { synthPreset: "error" });
      });
    }

    // 2. 升級語音
    if (levelResult && levelResult.leveledUp && levelResult.newLevelDef) {
      var lvl = levelResult.newLevelDef.level || 0;
      var lvlKey = LEVEL_VOICE_MAP[lvl];
      if (lvlKey) {
        queue.push(function () {
          return AudioPlayer.playSfx(getSoundFile("feedback.levelUp"), {
            synthPreset: "levelUp",
          });
        });
        queue.push(function () {
          var voicePath = getSoundFile("levelVoice." + lvlKey);
          var voiceText = levelResult.newLevelDef.name
            ? "恭喜升級為" + levelResult.newLevelDef.name + "！"
            : "";
          return AudioPlayer.playVoice(voicePath, { text: voiceText });
        });
      }
    }

    // 3. 新徽章播報
    if (badges && badges.length > 0) {
      badges.forEach(function (badge) {
        queue.push(function () {
          return AudioPlayer.playSfx(getSoundFile("feedback.badge"), {
            synthPreset: "badge",
          });
        });
        var voiceKey = BADGE_VOICE_MAP[badge.id];
        if (voiceKey) {
          queue.push(function () {
            var voicePath = getSoundFile("badgeVoice." + voiceKey);
            return AudioPlayer.playVoice(voicePath, {
              text: badge.voiceText || "獲得" + badge.name + "徽章！",
            });
          });
        }
      });
    }

    // 依序執行
    _runAudioQueue(queue);
  }

  /** 依序執行 Promise 產生器陣列 */
  function _runAudioQueue(queue) {
    if (!queue.length) return;
    var fn = queue.shift();
    fn()
      .then(function () {
        // 短暫間隔，避免太急促
        return new Promise(function (r) {
          setTimeout(r, 200);
        });
      })
      .then(function () {
        _runAudioQueue(queue);
      })
      .catch(function () {
        _runAudioQueue(queue);
      });
  }

  // =========================================
  // 探險模式結算
  // =========================================

  function renderAdventure(data) {
    try {
      dom.headerTitle.textContent = "🗺️ 探險結算";

      var cr = data.comboResult;
      if (!cr) {
        dom.body.innerHTML =
          '<p style="text-align:center;color:var(--error-red);">⚠️ 無結算資料</p>';
        _renderAdventureActions(false);
        return;
      }

      var passed = cr.pointPassed;
      var rule = cr.ruleResult || {};
      var wm = cr.wmResult || null;
      var stars = cr.starsResult || {};
      var level = cr.levelResult || {};
      var badges = cr.newBadges || [];

      var html = "";

      // === 1. 通過 / 未通過 Banner ===
      if (passed) {
        html +=
          '<div class="result-banner result-banner--pass">' +
          '<span class="banner-icon">🎉</span>' +
          '<div class="banner-text">通過！</div>' +
          '<div class="banner-sub">' +
          esc(cr.pointDef ? cr.pointDef.id : "") +
          "</div>" +
          "</div>";
      } else {
        html +=
          '<div class="result-banner result-banner--fail">' +
          '<span class="banner-icon">😢</span>' +
          '<div class="banner-text">再接再厲</div>' +
          '<div class="banner-sub">正確率需達 ' +
          Math.round((GAME_CONFIG.SCORING.PASS_THRESHOLD || 0.83) * 100) +
          "% 才能通過喔！</div>" +
          "</div>";
      }

      // === 2. 星星 ===
      html +=
        '<div style="text-align:center;">' +
        '<div class="star-display">' +
        starsHTML(stars.totalStars || 0, 3) +
        "</div>" +
        '<div class="star-count-text">獲得 ' +
        (stars.totalStars || 0) +
        " 顆星星" +
        (stars.wmStars ? " （含工作記憶 +" + stars.wmStars + "）" : "") +
        "</div>" +
        "</div>";

      // === 3. 數據統計 ===
      html += '<div class="result-card"><h2>📊 統計</h2>';
      html += '<div class="stat-grid">';
      html += _statItem(
        pct(rule.accuracy),
        "正確率",
        rule.passed ? "stat-value--good" : "stat-value--bad",
      );
      html += _statItem(
        (rule.correctCount || 0) + "/" + (rule.totalCount || 0),
        "正確題數",
        "",
      );
      html += _statItem(msToSec(rule.avgRT), "平均反應", "");
      html += _statItem(rule.finalScore || 0, "總分", "stat-value--good");
      html += "</div>"; // stat-grid

      // 加分明細
      var bonuses = [];
      if (rule.perfectBonus) bonuses.push("🎯 全對 +" + rule.perfectBonus);
      if (rule.speedBonus) bonuses.push("⚡ 速度 +" + rule.speedBonus);
      if (rule.firstClearBonus)
        bonuses.push("🏅 首次通過 +" + rule.firstClearBonus);
      if (rule.progressBonus) bonuses.push("📈 進步 +" + rule.progressBonus);
      if (bonuses.length > 0) {
        html +=
          '<div style="margin-top:12px;font-size:var(--font-size-xs);color:var(--text-light);">' +
          bonuses.join("&nbsp;&nbsp;") +
          "</div>";
      }
      html += "</div>"; // result-card

      // === 4. WM 統計 ===
      if (wm) {
        html += '<div class="result-card"><h2>🧠 工作記憶</h2>';
        html += '<div class="stat-grid">';
        html += _statItem(
          (wm.correctCount || 0) + "/" + (wm.totalPositions || 0),
          "正確數",
          "stat-value--wm",
        );
        html += _statItem(pct(wm.accuracy), "正確率", "");
        html += _statItem(wm.direction || "—", "方向", "");
        html += _statItem(wm.finalScore || 0, "WM分數", "stat-value--wm");
        html += "</div></div>";
      }

      // === 5. 等級進度 ===
      html += '<div class="result-card"><h2>📈 等級</h2>';
      html += '<div class="level-section">';

      var currentLevel =
        level.newLevelDef ||
        level.oldLevelDef ||
        (typeof getLevelByStars === "function"
          ? getLevelByStars(cr.totalStars || 0)
          : null);

      if (currentLevel) {
        html +=
          '<div class="level-icon-big">' +
          (currentLevel.icon || "🥚") +
          "</div>";
        html +=
          '<div class="level-name">' +
          esc(currentLevel.name || "蛋寶寶") +
          "</div>";
      }

      if (level.leveledUp) {
        html +=
          '<div class="level-up-badge">🎊 升級！' +
          (level.oldLevelDef ? level.oldLevelDef.icon : "") +
          " → " +
          (level.newLevelDef ? level.newLevelDef.icon : "") +
          "</div>";
      }

      // 等級進度條
      if (
        typeof getProgressToNextLevel === "function" &&
        cr.totalStars != null
      ) {
        var prog = getProgressToNextLevel(cr.totalStars);
        if (prog) {
          var pctVal = prog.isMaxLevel
            ? 100
            : Math.min(100, Math.round(prog.progressPercent));
          html +=
            '<div class="level-progress-bar">' +
            '<div class="level-progress-fill" style="width:' +
            pctVal +
            '%"></div></div>';
          html +=
            '<div class="level-progress-text">' +
            (prog.isMaxLevel
              ? "已達最高等級！"
              : "距離下一級還需 " + prog.starsToNextLevel + " 顆星星") +
            "</div>";
        }
      }

      html += "</div></div>"; // level-section, result-card

      // === 6. 新獲得徽章 ===
      if (badges.length > 0) {
        html += '<div class="result-card"><h2>🏅 獲得新徽章！</h2>';
        html += '<div class="badge-list">';
        for (var i = 0; i < badges.length; i++) {
          html +=
            '<div class="badge-item">' +
            '<span class="badge-icon-lg">' +
            (badges[i].icon || "🏅") +
            "</span>" +
            '<span class="badge-name">' +
            esc(badges[i].name || "徽章") +
            "</span>" +
            "</div>";
        }
        html += "</div></div>";
      }

      // === 7. 地圖進展通知 ===
      if (cr.freeChoiceJustUnlocked) {
        html +=
          '<div class="map-notice map-notice--unlock">' +
          "🔓 自由選擇模式已解鎖！</div>";
      }
      if (cr.mapJustCompleted) {
        html +=
          '<div class="map-notice map-notice--complete">' +
          "🗺️ 地圖「" +
          esc(cr.mapJustCompleted) +
          "」已完成！</div>";
      }
      if (cr.allMapsCompleted) {
        html +=
          '<div class="map-notice map-notice--all-done">' +
          "🏆 恭喜！全部探險地圖已通關！</div>";
      }

      dom.body.innerHTML = html;
      _renderAdventureActions(passed);

      // 🔊 播放結算音效
      _playResultAudio(passed, level, badges);
    } catch (err) {
      console.error("❌ renderAdventure 運行錯誤:", err);
      dom.body.innerHTML =
        '<p style="text-align:center;color:var(--error-red);padding:48px;">' +
        "⚠️ 結算頁面發生錯誤，請返回重試</p>" +
        '<div style="text-align:center;margin-top:16px;">' +
        '<button onclick="ModeController.goToAdventureMap()" style="padding:12px 24px;border-radius:8px;background:var(--primary-blue);color:#fff;border:none;cursor:pointer;font-size:1rem;">返回地圖</button></div>';
    }
  }

  function _renderAdventureActions(passed) {
    var html = "";
    if (passed) {
      html += '<button id="btnNext" class="btn btn-next">➡️ 下一關</button>';
    } else {
      html +=
        '<button id="btnRetry" class="btn btn-retry">🔄 再試一次</button>';
    }
    html +=
      '<button id="btnReport" class="btn btn-map" style="background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none!important;">📊 查看分析報告</button>';
    html += '<button id="btnMap" class="btn btn-map">🗺️ 回到地圖</button>';
    html +=
      '<button id="btnUploadClass" class="btn btn-upload-class">📤 上傳至班級排行榜</button>';
    html +=
      '<div id="uploadCodeRow" class="upload-code-input-row" style="display:none"><input id="uploadCodeInput" placeholder="輸入 6 位代碼" maxlength="6" /><button id="uploadCodeSubmit">上傳</button></div>';
    html += '<div id="uploadStatusMsg" class="upload-status-msg"></div>';
    html +=
      '<button id="btnUploadWorld" class="btn btn-upload-world">🌐 上傳至世界排行榜</button>';
    html +=
      '<div id="worldUploadConfirmRow" class="world-upload-confirm-row" style="display:none">' +
      '<div class="upload-world-notice">📋 上傳後，你的暱稱與本次成績將公開顯示於世界排行榜。<br>相同裝置再次上傳會覆蓋先前紀錄。</div>' +
      '<div class="world-upload-btn-pair">' +
      '<button id="worldCancelBtn" class="btn btn-world-cancel">取消</button>' +
      '<button id="worldConfirmBtn" class="btn btn-world-confirm">上傳</button>' +
      "</div></div>";
    html += '<div id="worldUploadStatus" class="upload-status-msg"></div>';
    dom.actions.innerHTML = html;

    var btnNext = document.getElementById("btnNext");
    var btnRetry = document.getElementById("btnRetry");
    var btnMap = document.getElementById("btnMap");

    if (btnNext) {
      btnNext.addEventListener("click", function () {
        ModeController.clearSession();
        ModeController.goToAdventureMap();
      });
    }
    if (btnRetry) {
      btnRetry.addEventListener("click", function () {
        ModeController.retryCurrentPoint();
      });
    }
    if (btnMap) {
      btnMap.addEventListener("click", function () {
        ModeController.goToAdventureMap();
      });
    }

    var btnReport = document.getElementById("btnReport");
    if (btnReport) {
      btnReport.addEventListener("click", function () {
        toggleReport();
      });
    }
    _bindUploadClassBtn();
    _bindUploadWorldBtn();
  }

  // =========================================
  // 自由選擇模式結算
  // =========================================

  function renderFreeSelect(data) {
    try {
      dom.headerTitle.textContent = "🎯 自由選擇結算";

      var all = data.allComboResults || [];
      if (all.length === 0) {
        dom.body.innerHTML =
          '<p style="text-align:center;color:var(--text-light);">沒有遊戲紀錄</p>';
        _renderFreeSelectActions();
        return;
      }

      var html = "";
      var totalStarsSum = 0;
      var allNewBadges = [];

      // === 1. 各 Combo 結果列表 ===
      html += '<div class="result-card"><h2>📋 組合結果</h2>';
      html += '<div class="combo-result-list">';

      for (var i = 0; i < all.length; i++) {
        var entry = all[i];
        var combo = entry.combo || {};
        var result = entry.result || {};
        var rr = result.ruleResult || {};
        var ss = result.starsResult || {};
        var p = rr.passed;

        totalStarsSum += ss.totalStars || 0;
        if (result.newBadges)
          allNewBadges = allNewBadges.concat(result.newBadges);

        var itemCls = p
          ? "combo-result-item combo-result-item--pass"
          : "combo-result-item combo-result-item--fail";
        html += '<div class="' + itemCls + '">';
        html +=
          '<span class="combo-result-icon">' + (p ? "✅" : "❌") + "</span>";
        html += '<div class="combo-result-info">';
        html +=
          '<div class="combo-result-name">' +
          esc(combo.displayName || "組合 " + (i + 1)) +
          "</div>";
        html +=
          '<div class="combo-result-detail">' +
          "正確 " +
          (rr.correctCount || 0) +
          "/" +
          (rr.totalCount || 0) +
          "（" +
          pct(rr.accuracy) +
          "）" +
          (rr.avgRT ? "・" + msToSec(rr.avgRT) : "") +
          "</div>";

        // WM 結果
        if (result.wmResult) {
          html +=
            '<div class="combo-result-detail" style="color:var(--wm-color);">' +
            "🧠 WM " +
            (result.wmResult.correctCount || 0) +
            "/" +
            (result.wmResult.totalPositions || 0) +
            "・" +
            (result.wmResult.finalScore || 0) +
            "分</div>";
        }

        html += "</div>"; // info
        html +=
          '<span class="combo-result-stars">' +
          starsHTML(ss.totalStars || 0, 3) +
          "</span>";
        html += "</div>"; // item
      }

      html += "</div></div>"; // list, card

      // === 2. 總計 ===
      html += '<div class="result-card" style="text-align:center;">';
      html += '<h2 style="justify-content:center;">⭐ 總計</h2>';
      html +=
        '<div style="font-size:var(--font-size-xxl);font-weight:700;color:var(--accent-yellow);">' +
        totalStarsSum +
        " 顆星星</div>";
      html +=
        '<div style="font-size:var(--font-size-sm);color:var(--text-light);margin-top:4px;">' +
        "共完成 " +
        all.length +
        " 個組合</div>";
      html += "</div>";

      // === 3. 等級 ===
      var lastResult = all[all.length - 1].result || {};
      if (lastResult.levelResult) {
        var lr = lastResult.levelResult;
        var cl = lr.newLevelDef || lr.oldLevelDef;
        html += '<div class="result-card"><h2>📈 等級</h2>';
        html += '<div class="level-section">';
        if (cl) {
          html += '<div class="level-icon-big">' + (cl.icon || "🥚") + "</div>";
          html += '<div class="level-name">' + esc(cl.name || "") + "</div>";
        }
        if (lr.leveledUp) {
          html +=
            '<div class="level-up-badge">🎊 升級！' +
            (lr.oldLevelDef ? lr.oldLevelDef.icon : "") +
            " → " +
            (lr.newLevelDef ? lr.newLevelDef.icon : "") +
            "</div>";
        }
        html += "</div></div>";
      }

      // === 4. 新徽章（去重）===
      var uniqueBadges = [];
      var seenIds = {};
      for (var j = 0; j < allNewBadges.length; j++) {
        var bid = allNewBadges[j].id || allNewBadges[j].name;
        if (!seenIds[bid]) {
          seenIds[bid] = true;
          uniqueBadges.push(allNewBadges[j]);
        }
      }
      if (uniqueBadges.length > 0) {
        html += '<div class="result-card"><h2>🏅 獲得新徽章！</h2>';
        html += '<div class="badge-list">';
        for (var k = 0; k < uniqueBadges.length; k++) {
          html +=
            '<div class="badge-item">' +
            '<span class="badge-icon-lg">' +
            (uniqueBadges[k].icon || "🏅") +
            "</span>" +
            '<span class="badge-name">' +
            esc(uniqueBadges[k].name || "徽章") +
            "</span>" +
            "</div>";
        }
        html += "</div></div>";
      }

      dom.body.innerHTML = html;
      _renderFreeSelectActions();

      // 🔊 播放結算音效
      var lastLr =
        all.length > 0 && all[all.length - 1].result
          ? all[all.length - 1].result.levelResult
          : null;
      _playResultAudio(true, lastLr, uniqueBadges);
    } catch (err) {
      console.error("❌ renderFreeSelect 運行錯誤:", err);
      dom.body.innerHTML =
        '<p style="text-align:center;color:var(--error-red);padding:48px;">' +
        "⚠️ 結算頁面發生錯誤，請返回重試</p>" +
        '<div style="text-align:center;margin-top:16px;">' +
        '<button onclick="ModeController.goToAdventureMap()" style="padding:12px 24px;border-radius:8px;background:var(--primary-blue);color:#fff;border:none;cursor:pointer;font-size:1rem;">返回地圖</button></div>';
    }
  }

  function _renderFreeSelectActions() {
    var html = "";
    html +=
      '<button id="btnFreeSelect" class="btn btn-next">🎯 再選一次</button>';
    html +=
      '<button id="btnReport" class="btn btn-map" style="background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none!important;">📊 查看分析報告</button>';
    html += '<button id="btnMap" class="btn btn-map">🗺️ 回到地圖</button>';
    html +=
      '<button id="btnUploadClass" class="btn btn-upload-class">📤 上傳至班級排行榜</button>';
    html +=
      '<div id="uploadCodeRow" class="upload-code-input-row" style="display:none"><input id="uploadCodeInput" placeholder="輸入 6 位代碼" maxlength="6" /><button id="uploadCodeSubmit">上傳</button></div>';
    html += '<div id="uploadStatusMsg" class="upload-status-msg"></div>';
    html +=
      '<button id="btnUploadWorld" class="btn btn-upload-world">🌐 上傳至世界排行榜</button>';
    html +=
      '<div id="worldUploadConfirmRow" class="world-upload-confirm-row" style="display:none">' +
      '<div class="upload-world-notice">📋 上傳後，你的暱稱與本次成績將公開顯示於世界排行榜。<br>相同裝置再次上傳會覆蓋先前紀錄。</div>' +
      '<div class="world-upload-btn-pair">' +
      '<button id="worldCancelBtn" class="btn btn-world-cancel">取消</button>' +
      '<button id="worldConfirmBtn" class="btn btn-world-confirm">上傳</button>' +
      "</div></div>";
    html += '<div id="worldUploadStatus" class="upload-status-msg"></div>';
    dom.actions.innerHTML = html;

    document
      .getElementById("btnFreeSelect")
      .addEventListener("click", function () {
        ModeController.goToFreeSelect();
      });
    document.getElementById("btnMap").addEventListener("click", function () {
      ModeController.goToAdventureMap();
    });
    document.getElementById("btnReport").addEventListener("click", function () {
      toggleReport();
    });
    _bindUploadClassBtn();
    _bindUploadWorldBtn();
  }

  // =========================================
  // 分析報告：轉換 + 展開/收合
  // =========================================

  var _reportVisible = false;
  var _reportContainer = null;

  /**
   * 將 game.html 的 trialDetails 轉為 csv-report.js 接受的格式
   * trialDetails 欄位: trialIndex, stimulus, context, isGo,
   *   correctAction, playerAction, result, isCorrect, rt, timestamp
   * CSV 欄位: 由 GameConstants.CSV_FIELDS 定義（single source of truth）
   */
  function _convertTrials(trialDetails, participantId, roundIndex) {
    if (!trialDetails || trialDetails.length === 0) return [];

    var GC = window.GameConstants || {};
    var F = GC.CSV_FIELDS || {};
    var CV = GC.CSV_VALUES || {};
    var FN = GC.CSV_FILE_NAMING || {};

    // Bug #1 修正：優先從 playerProfile 取暱稱
    var pid = participantId;
    if (!pid || pid === "Player") {
      try {
        var profile = getPlayerProfile ? getPlayerProfile() : null;
        if (profile && profile.nickname) pid = profile.nickname;
      } catch (e) {
        /* ignore */
      }
    }
    pid = pid || FN.DEFAULT_PARTICIPANT || "Player";

    var now = new Date();
    var dateStr =
      now.getFullYear().toString() +
      _padZ(now.getMonth() + 1) +
      _padZ(now.getDate());
    var timeStr =
      _padZ(now.getHours()) + _padZ(now.getMinutes()) + _padZ(now.getSeconds());

    var sep = FN.SEPARATOR || "_";
    var prefix = FN.DATA_PREFIX || "EF訓練遊戲數據";
    var fileName = prefix + sep + pid + sep + dateStr + sep + timeStr + ".csv";

    // Bug #2+10 修正：支援多 combo 時各自有不同 Round 值
    var roundStr = String(roundIndex != null ? roundIndex : 1);

    return trialDetails.map(function (t, i) {
      var hasPerson =
        t.context === "hasPerson" ||
        t.context === "person" ||
        (typeof t.context === "string" &&
          t.context.toLowerCase().indexOf("person") >= 0);
      var isNight =
        t.context === "night" ||
        t.context === "isNightTime" ||
        (typeof t.context === "string" &&
          t.context.toLowerCase().indexOf("night") >= 0);

      var row = {};
      row[F.FILE_NAME || "FileName"] = fileName;
      row[F.PARTICIPANT || "Participant"] = pid;
      row[F.ROUND || "Round"] = roundStr;
      row[F.TRIAL || "Trial"] = String(i + 1);
      row[F.STIMULUS || "Stimulus"] = t.stimulus || "";
      row[F.HAS_PERSON || "HasPerson"] = String(hasPerson);
      row[F.IS_NIGHT_TIME || "IsNightTime"] = String(isNight);
      row[F.INPUT_KEY || "InputKey"] =
        t.playerAction === "press"
          ? "Space"
          : t.playerAction === "nopress"
            ? "Timeout"
            : t.playerAction || "";
      row[F.CORRECT || "Correct"] = t.isCorrect
        ? CV.CORRECT_YES || "yes"
        : CV.CORRECT_NO || "no";
      // Bug #3 修正：RT null（No-Go 正確）→ 空字串而非 "0"
      row[F.RT_MS || "RT(ms)"] = t.rt != null ? String(Math.round(t.rt)) : "";
      // Bug #4 修正：用易讀格式取代 ISO，讓 tooltip 正確拆分
      row[F.TIMESTAMP || "Timestamp"] = t.timestamp
        ? _formatTimestamp(new Date(t.timestamp))
        : _formatTimestamp(now);
      return row;
    });
  }

  /** 格式化時間戳為 YYYY-MM-DD HH:MM:SS */
  function _formatTimestamp(d) {
    return (
      d.getFullYear() +
      "-" +
      _padZ(d.getMonth() + 1) +
      "-" +
      _padZ(d.getDate()) +
      " " +
      _padZ(d.getHours()) +
      ":" +
      _padZ(d.getMinutes()) +
      ":" +
      _padZ(d.getSeconds())
    );
  }

  function _padZ(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  /** 切換分析報告顯示 */
  function toggleReport() {
    if (_reportVisible) {
      // 收合
      if (_reportContainer) {
        _reportContainer.style.display = "none";
      }
      CsvReport.destroy();
      _reportVisible = false;
      var btn = document.getElementById("btnReport");
      if (btn) btn.textContent = "📊 查看分析報告";
      return;
    }

    // 展開
    var data = ModeController.getResultData();
    if (!data) return;

    // 收集所有 trialDetails
    var csvData = [];
    var pid = "Player";

    // 從 playerProfile 取暱稱
    try {
      var prof = getPlayerProfile ? getPlayerProfile() : null;
      if (prof && prof.nickname) pid = prof.nickname;
    } catch (e) {
      /* ignore */
    }

    if (data.mode === "adventure") {
      var allTrials = data.trialDetails || [];
      if (allTrials.length === 0) {
        alert("沒有逐題資料可供分析");
        return;
      }
      csvData = _convertTrials(allTrials, pid, 1);
    } else {
      // free-select: 各 combo 分別轉換，Round 遞增
      var results = data.allComboResults || [];
      for (var i = 0; i < results.length; i++) {
        var td = results[i].trialDetails || [];
        var comboRows = _convertTrials(td, pid, i + 1);
        csvData = csvData.concat(comboRows);
      }
      if (csvData.length === 0) {
        alert("沒有逐題資料可供分析");
        return;
      }
    }
    var parsed = CsvReport.parseRawData(csvData);

    // 建立或顯示容器
    if (!_reportContainer) {
      _reportContainer = document.createElement("div");
      _reportContainer.id = "reportContainer";
      _reportContainer.style.cssText =
        "padding:16px;background:var(--bg-dark);";

      // 匯出按鈕
      var exportBar = document.createElement("div");
      exportBar.style.cssText =
        "text-align:center;margin-bottom:16px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;";
      var exportBtn = document.createElement("button");
      exportBtn.className = "csv-report__btn csv-report__btn--export";
      exportBtn.textContent = "💾 匯出 CSV";
      exportBtn.addEventListener("click", function () {
        CsvReport.exportCsv(parsed);
      });
      exportBar.appendChild(exportBtn);

      var pdfBtn = document.createElement("button");
      pdfBtn.className = "csv-report__btn csv-report__btn--primary";
      pdfBtn.textContent = "📄 匯出 PDF";
      pdfBtn.addEventListener("click", function () {
        var content = document.getElementById("reportContent");
        pdfBtn.textContent = "⏳ 產生中…";
        pdfBtn.disabled = true;
        CsvReport.exportPdf(content, parsed)
          .then(function () {
            pdfBtn.textContent = "📄 匯出 PDF";
            pdfBtn.disabled = false;
          })
          .catch(function () {
            pdfBtn.textContent = "📄 匯出 PDF";
            pdfBtn.disabled = false;
          });
      });
      exportBar.appendChild(pdfBtn);

      var ssBtn = document.createElement("button");
      ssBtn.className = "csv-report__btn csv-report__btn--secondary";
      ssBtn.textContent = "📸 截圖";
      ssBtn.addEventListener("click", function () {
        var content = document.getElementById("reportContent");
        ssBtn.textContent = "⏳ 擷取中…";
        ssBtn.disabled = true;
        CsvReport.exportScreenshot(content)
          .then(function () {
            ssBtn.textContent = "📸 截圖";
            ssBtn.disabled = false;
          })
          .catch(function () {
            ssBtn.textContent = "📸 截圖";
            ssBtn.disabled = false;
          });
      });
      exportBar.appendChild(ssBtn);

      _reportContainer.appendChild(exportBar);

      // 報告內容
      var reportContent = document.createElement("div");
      reportContent.id = "reportContent";
      _reportContainer.appendChild(reportContent);

      dom.body.appendChild(_reportContainer);
    } else {
      _reportContainer.style.display = "block";
    }

    CsvReport.renderReport(document.getElementById("reportContent"), parsed);
    _reportVisible = true;

    var btn2 = document.getElementById("btnReport");
    if (btn2) btn2.textContent = "📊 收合分析報告";

    // 滾到報告區域
    _reportContainer.scrollIntoView({ behavior: "smooth" });
  }

  // =========================================
  // 上傳至班級排行榜
  // =========================================

  var _uploadData = null; // 快取目前結算資料

  function _bindUploadClassBtn() {
    var btn = document.getElementById("btnUploadClass");
    var codeRow = document.getElementById("uploadCodeRow");
    var codeInput = document.getElementById("uploadCodeInput");
    var codeSubmit = document.getElementById("uploadCodeSubmit");
    var statusMsg = document.getElementById("uploadStatusMsg");
    if (!btn) return;

    btn.addEventListener("click", function () {
      codeRow.style.display =
        codeRow.style.display === "none" ? "flex" : "none";
      if (codeRow.style.display === "flex") codeInput.focus();
    });

    if (codeSubmit) {
      codeSubmit.addEventListener("click", function () {
        _doUploadToClass(codeInput, codeSubmit, statusMsg);
      });
    }
    if (codeInput) {
      codeInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter")
          _doUploadToClass(codeInput, codeSubmit, statusMsg);
      });
    }
  }

  function _doUploadToClass(codeInput, codeSubmit, statusMsg) {
    var code = codeInput.value.trim().toUpperCase();
    if (!code || code.length < 4) {
      codeInput.style.borderColor = "#e74c3c";
      codeInput.focus();
      return;
    }
    if (typeof FirestoreLeaderboard === "undefined") {
      statusMsg.textContent = "❌ 上傳模組未載入";
      statusMsg.className = "upload-status-msg error";
      return;
    }

    codeSubmit.disabled = true;
    codeSubmit.textContent = "上傳中…";
    statusMsg.textContent = "";
    statusMsg.className = "upload-status-msg";

    // 確保匿名登入
    var authPromise = firebase.auth().currentUser
      ? Promise.resolve()
      : firebase.auth().signInAnonymously();

    authPromise
      .then(function () {
        return FirestoreLeaderboard.findBoardByCode(code);
      })
      .then(function (board) {
        if (!board) throw new Error("找不到此代碼對應的看板");
        var data = _uploadData || ModeController.getResultData() || {};
        // Bug #6 修正：從巢狀結構正確提取資料
        var profile = null;
        try {
          profile = getPlayerProfile ? getPlayerProfile() : null;
        } catch (e) {}
        var cr = data.comboResult || {};
        var rr = cr.ruleResult || {};
        // 自由選擇模式：合計各 combo
        var totalStarsVal = 0;
        var totalAccuracy = rr.accuracy || 0;
        var totalAvgRT = rr.avgRT || 0;
        if (data.allComboResults && data.allComboResults.length > 0) {
          var accSum = 0,
            rtSum = 0,
            rtCount = 0;
          data.allComboResults.forEach(function (c) {
            var r = (c.result || {}).ruleResult || {};
            totalStarsVal +=
              ((c.result || {}).starsResult || {}).totalStars || 0;
            accSum += r.accuracy || 0;
            if (r.avgRT) {
              rtSum += r.avgRT;
              rtCount++;
            }
          });
          totalAccuracy = accSum / data.allComboResults.length;
          totalAvgRT = rtCount > 0 ? Math.round(rtSum / rtCount) : 0;
        } else {
          totalStarsVal =
            cr.totalStars || (cr.starsResult || {}).totalStars || 0;
        }
        var entry = {
          nickname: (profile && profile.nickname) || "玩家",
          score: rr.finalScore || 0,
          accuracy: totalAccuracy,
          avgRT: totalAvgRT,
          stars: totalStarsVal,
          level: (profile && profile.level) || "",
          mode: "singleplayer",
        };
        return FirestoreLeaderboard.uploadToClassBoard(board.boardId, entry);
      })
      .then(function () {
        statusMsg.textContent = "✅ 上傳成功！老師的看板已收到你的成績";
        statusMsg.className = "upload-status-msg success";
      })
      .catch(function (err) {
        statusMsg.textContent = "❌ " + err.message;
        statusMsg.className = "upload-status-msg error";
      })
      .finally(function () {
        codeSubmit.disabled = false;
        codeSubmit.textContent = "上傳";
      });
  }

  // =========================================
  // 上傳至世界排行榜
  // =========================================

  function _bindUploadWorldBtn() {
    var btn = document.getElementById("btnUploadWorld");
    var confirmRow = document.getElementById("worldUploadConfirmRow");
    var cancelBtn = document.getElementById("worldCancelBtn");
    var confirmBtn = document.getElementById("worldConfirmBtn");
    var statusMsg = document.getElementById("worldUploadStatus");
    if (!btn || !confirmRow) return;

    btn.addEventListener("click", function () {
      // 點擊後隱藏原按鈕，顯示確認列（取消 + 上傳）
      btn.style.display = "none";
      confirmRow.style.display = "";
    });

    if (cancelBtn) {
      cancelBtn.addEventListener("click", function () {
        confirmRow.style.display = "none";
        btn.style.display = "";
      });
    }

    if (confirmBtn) {
      confirmBtn.addEventListener("click", function () {
        _doUploadToWorld(confirmBtn, statusMsg, confirmRow);
      });
    }
  }

  function _doUploadToWorld(btn, statusMsg, notice) {
    if (typeof FirestoreLeaderboard === "undefined") {
      statusMsg.textContent = "❌ 上傳模組未載入";
      statusMsg.className = "upload-status-msg error";
      return;
    }

    btn.disabled = true;
    btn.textContent = "上傳中…";
    statusMsg.textContent = "";
    statusMsg.className = "upload-status-msg";

    var authPromise = firebase.auth().currentUser
      ? Promise.resolve()
      : firebase.auth().signInAnonymously();

    authPromise
      .then(function () {
        var data = _uploadData || ModeController.getResultData() || {};

        // 從 player-profile 取得暱稱
        var nickname = "玩家";
        try {
          var profileRaw =
            sessionStorage.getItem("efgame-player-profile") ||
            localStorage.getItem("efgame-player-profile");
          if (profileRaw) {
            var profile = JSON.parse(profileRaw);
            nickname = profile.nickname || profile.name || nickname;
          }
        } catch (e) {
          /* ignore */
        }

        // 根據模式正確提取數據
        var bestScore = 0;
        var bestAccuracy = 0;
        var bestAvgRT = 0;
        var totalStars = 0;

        if (data.mode === "adventure" && data.comboResult) {
          var cr = data.comboResult;
          var rr = cr.ruleResult || {};
          bestScore = rr.finalScore || rr.correctCount || 0;
          bestAccuracy =
            rr.accuracy != null ? Math.round(rr.accuracy * 100) : 0;
          bestAvgRT = rr.avgRT ? Math.round(rr.avgRT) : 0;
          totalStars = cr.totalStars || 0;
          if (cr.starsResult) {
            totalStars = totalStars || cr.starsResult.totalStars || 0;
          }
        } else if (data.allComboResults) {
          // 自由選擇模式：合併所有 combo 結果
          var allCombos = data.allComboResults;
          var totalCorrect = 0;
          var totalCount = 0;
          var rtSum = 0;
          var rtCount = 0;
          for (var ci = 0; ci < allCombos.length; ci++) {
            var entry = allCombos[ci];
            var er = (entry.result || {}).ruleResult || {};
            totalCorrect += er.correctCount || 0;
            totalCount += er.totalCount || 0;
            if (er.avgRT) {
              rtSum += er.avgRT;
              rtCount++;
            }
            totalStars +=
              ((entry.result || {}).starsResult || {}).totalStars || 0;
          }
          bestScore = totalCorrect;
          bestAccuracy =
            totalCount > 0 ? Math.round((totalCorrect / totalCount) * 100) : 0;
          bestAvgRT = rtCount > 0 ? Math.round(rtSum / rtCount) : 0;
        }

        var worldData = {
          nickname: nickname,
          totalStars: totalStars,
          level: "",
          bestScore: bestScore,
          bestAccuracy: bestAccuracy,
          bestAvgRT: bestAvgRT,
          gamesPlayed: 1,
        };

        // 嘗試從 player-profile 取得等級
        try {
          var pRaw =
            sessionStorage.getItem("efgame-player-profile") ||
            localStorage.getItem("efgame-player-profile");
          if (pRaw) {
            var p = JSON.parse(pRaw);
            worldData.level = p.level || "";
          }
        } catch (e) {
          /* ignore */
        }

        return FirestoreLeaderboard.uploadToWorld(worldData);
      })
      .then(function () {
        statusMsg.textContent = "✅ 已上傳至世界排行榜！";
        statusMsg.className = "upload-status-msg success";
        notice.style.display = "none";
        // 隱藏確認列，顯示已完成狀態
        var origBtn = document.getElementById("btnUploadWorld");
        if (origBtn) {
          origBtn.style.display = "";
          origBtn.textContent = "🌐 已上傳";
          origBtn.disabled = true;
          origBtn.style.opacity = "0.6";
        }
      })
      .catch(function (err) {
        statusMsg.textContent = "❌ " + err.message;
        statusMsg.className = "upload-status-msg error";
        btn.disabled = false;
        btn.textContent = "上傳";
      });
  }

  // =========================================
  // 初始化
  // =========================================

  function init() {
    cacheDom();

    var mode = ModeController.getCurrentMode();
    var data = ModeController.getResultData();

    if (!data) {
      dom.body.innerHTML =
        '<p style="text-align:center;color:var(--error-red);padding:48px;">⚠️ 無結算資料，請從遊戲頁面進入</p>';
      return;
    }

    if (mode === "adventure") {
      renderAdventure(data);
    } else {
      renderFreeSelect(data);
    }

    // 快取上傳資料
    _uploadData = data;

    // 寫入排行榜（P0-3 修復：排行榜資料從未被寫入）
    if (typeof LeaderboardWriter !== "undefined") {
      LeaderboardWriter.recordFromSingleplayer(data);
    }

    // 初始化音訊（播放結算音效用）
    if (typeof AudioPlayer !== "undefined" && AudioPlayer.init) {
      AudioPlayer.init();
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    init();
  });

  return { init: init };
})();
