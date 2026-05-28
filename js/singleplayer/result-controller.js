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

  function getMaxStars(pointDef, wmResult) {
    var max = 1; // 規則通過⭐
    if (pointDef && pointDef.hasWM) {
      max += 1; // WM 通過⭐
      if (wmResult && wmResult.totalPositions) {
        max += getWMBonus(wmResult.direction || "forward", wmResult.totalPositions);
      }
    }
    return max;
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

  /**
   * 產生 SDT 信號偵測理論統計卡片 HTML
   * @param {Object[]} trialDetails — 原始 trialDetails 陣列
   * @returns {string} HTML 字串（若無資料或 CsvReport 不存在則為空字串）
   */
  function _renderSDTSection(trialDetails) {
    if (
      !trialDetails ||
      trialDetails.length === 0 ||
      typeof CsvReport === "undefined" ||
      !CsvReport.calculateSDT
    ) {
      return "";
    }

    var sdt = CsvReport.calculateSDT(trialDetails);
    if (!sdt || sdt.dPrime == null) return "";

    var html =
      '<div class="result-card sdt-card"><h2>🎯 信號偵測理論 (SDT)</h2>';

    // d' 解讀
    var dClass = "";
    var dNote = "";
    if (sdt.dPrime >= 2.0) {
      dClass = "stat-value--good";
      dNote = "優秀的辨別力！";
    } else if (sdt.dPrime >= 1.0) {
      dClass = "";
      dNote = "不錯的辨別力";
    } else {
      dClass = "stat-value--bad";
      dNote = "還需加強辨別力";
    }

    // c 解讀（策略傾向）
    var cNote = "";
    if (sdt.criterion > 0.3) {
      cNote = "偏保守（傾向不按）";
    } else if (sdt.criterion < -0.3) {
      cNote = "偏冒險（傾向按）";
    } else {
      cNote = "策略平衡";
    }

    // 上半：SDT 核心指標
    html += '<div class="stat-grid">';
    html += _statItem(sdt.dPrime.toFixed(2), "d\u2032 敏感度", dClass);
    html += _statItem(sdt.criterion.toFixed(2), "c 反應偏向", "");
    html += _statItem(sdt.beta.toFixed(2), "\u03B2 決策權重", "");
    html += _statItem(
      Math.round(sdt.hitRate * 100) + "%",
      "Hit Rate 命中率",
      sdt.hitRate >= 0.8 ? "stat-value--good" : "",
    );
    html += "</div>"; // stat-grid

    // 下半：原始計數 + 解讀
    html += '<div class="sdt-detail-row">';
    html +=
      '<span class="sdt-count sdt-hit">Hit ' +
      sdt.hits +
      "</span>" +
      '<span class="sdt-count sdt-miss">Miss ' +
      sdt.misses +
      "</span>" +
      '<span class="sdt-count sdt-fa">FA ' +
      sdt.fa +
      "</span>" +
      '<span class="sdt-count sdt-cr">CR ' +
      sdt.cr +
      "</span>";
    html += "</div>";

    html += '<div class="sdt-notes">';
    html += "<div>" + dNote + "</div>";
    html += "<div>" + cNote + "</div>";
    html += "</div>";

    html += "</div>"; // result-card
    return html;
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
        // comboResult 為 null 可能是 processAdventureResult 出錯
        // 嘗試從 trialDetails 產生基本結算
        Logger.warn("⚠️ comboResult 為 null，嘗試從 trialDetails 重建");
        var td = data.trialDetails || [];
        if (td.length > 0) {
          var correctCount = 0;
          var totalRT = 0;
          var rtCount = 0;
          for (var ti = 0; ti < td.length; ti++) {
            if (td[ti].isCorrect) correctCount++;
            if (td[ti].rt != null && td[ti].rt > 0) {
              totalRT += td[ti].rt;
              rtCount++;
            }
          }
          var acc = td.length > 0 ? correctCount / td.length : 0;
          var fbPassed = acc >= 0.83;
          cr = {
            pointPassed: fbPassed,
            ruleResult: {
              correctCount: correctCount,
              totalCount: td.length,
              accuracy: acc,
              avgRT: rtCount > 0 ? totalRT / rtCount : 0,
              finalScore: correctCount,
              passed: fbPassed,
            },
            wmResult: null,
            starsResult: { totalStars: 0, ruleStars: 0, wmStars: 0 },
            levelResult: { leveledUp: false },
            newBadges: [],
            pointDef: {},
            mapDef: {},
          };
          data.comboResult = cr;
        } else {
          dom.body.innerHTML =
            '<p style="text-align:center;color:var(--error-red);">⚠️ 無結算資料，請從遊戲頁面進入</p>';
          _renderAdventureActions(false);
          return;
        }
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

      // 預先取得 pointDef
      var _pointDef = cr.pointDef || {};

      // === 2. 星星 ===
      html +=
        '<div style="text-align:center;">' +
        '<div class="star-display">' +
        starsHTML(stars.totalStars || 0, getMaxStars(_pointDef, wm)) +
        "</div>" +
        '<div class="star-count-text">獲得 ' +
        (stars.totalStars || 0) +
        " 顆星星" +
        (stars.wmStars ? " （含工作記憶 +" + stars.wmStars + "）" : "") +
        "</div>" +
        "</div>";

      // === 2.5 場地資訊 ===
      var _fieldId = _pointDef.field || "";
      var _ruleLabel = _pointDef.label || _pointDef.id || "";
      var _fieldName =
        typeof GAME_CONFIG !== "undefined" &&
        GAME_CONFIG.FIELDS &&
        GAME_CONFIG.FIELDS[_fieldId]
          ? GAME_CONFIG.FIELDS[_fieldId].name
          : _fieldId;
      var _fieldIcon =
        _fieldId === "mouse" ? "🐭" : _fieldId === "fishing" ? "🐟" : "🎮";
      if (_fieldName || _ruleLabel) {
        html += '<div class="result-card"><h2>🎮 場地資訊</h2>';
        html +=
          '<div style="display:flex;align-items:center;gap:12px;justify-content:center;padding:8px 0;">';
        html += '<span style="font-size:2rem;">' + _fieldIcon + "</span>";
        html += "<div>";
        if (_fieldName)
          html +=
            '<div style="font-weight:700;font-size:1.05rem;">' +
            esc(_fieldName) +
            "</div>";
        if (_ruleLabel)
          html +=
            '<div style="font-size:0.85rem;color:var(--text-light);margin-top:2px;">' +
            esc(_ruleLabel) +
            (_pointDef.hasWM ? " + 🧠工作記憶" : "") +
            "</div>";
        html += "</div></div></div>";
      }

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

      // === 4.5 SDT 信號偵測理論 ===
      html += _renderSDTSection(data.trialDetails);

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

      // 🏅 徽章慶祝彈窗
      if (badges.length > 0) {
        _showBadgeCelebration(badges);
      }
    } catch (err) {
      Logger.error("❌ renderAdventure 運行錯誤:", err);
      dom.body.innerHTML =
        '<p style="text-align:center;color:var(--error-red);padding:48px;">' +
        "⚠️ 結算頁面發生錯誤，請返回重試</p>" +
        '<div style="text-align:center;margin-top:16px;">' +
        '<button onclick="ModeController.goToAdventureMap()" style="padding:12px 24px;border-radius:8px;background:var(--primary-blue);color:#fff;border:none;cursor:pointer;font-size:1rem;">返回地圖</button></div>';
    }
  }

  /**
   * 🏅 徽章解鎖慶祝彈窗 — 全螢幕覆蓋 + 粒子效果
   */
  function _showBadgeCelebration(badges) {
    if (!badges || badges.length === 0) return;
    var overlay = document.createElement("div");
    overlay.style.cssText =
      "position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.8);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;opacity:0;transition:opacity .4s ease;cursor:pointer;";

    var inner =
      '<div style="font-size:2.8rem;animation:badge-bounce 0.6s ease-out;">🎉</div>';
    inner +=
      '<div style="color:#ffd700;font-size:1.4rem;font-weight:700;text-shadow:0 0 12px rgba(255,215,0,0.5);">獲得新徽章！</div>';
    inner +=
      '<div style="display:flex;flex-wrap:wrap;gap:16px;justify-content:center;margin:12px 0;">';
    for (var i = 0; i < badges.length; i++) {
      inner +=
        '<div style="text-align:center;animation:badge-pop 0.5s ease-out ' +
        (i * 0.2 + 0.3) +
        's both;">' +
        '<div style="font-size:3rem;">' +
        (badges[i].icon || "🏅") +
        "</div>" +
        '<div style="color:#fff;font-size:0.9rem;font-weight:600;margin-top:4px;">' +
        (badges[i].name || "徽章") +
        "</div>" +
        "</div>";
    }
    inner += "</div>";
    inner +=
      '<div style="color:rgba(255,255,255,0.5);font-size:0.8rem;margin-top:8px;">點擊任意處關閉</div>';
    overlay.innerHTML = inner;

    // 注入動畫
    if (!document.getElementById("badge-celebration-style")) {
      var s = document.createElement("style");
      s.id = "badge-celebration-style";
      s.textContent =
        "@keyframes badge-bounce{0%{transform:scale(0) rotate(-15deg)}60%{transform:scale(1.3) rotate(5deg)}100%{transform:scale(1) rotate(0)}}" +
        "@keyframes badge-pop{0%{transform:scale(0);opacity:0}60%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}" +
        "@keyframes confetti-fall{0%{transform:translateY(-10px) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}";
      document.head.appendChild(s);
    }

    // 五彩紙屑粒子
    var colors = [
      "#ffd700",
      "#ff6b6b",
      "#51cf66",
      "#339af0",
      "#cc5de8",
      "#ff922b",
    ];
    for (var c = 0; c < 20; c++) {
      var p = document.createElement("div");
      p.style.cssText =
        "position:absolute;top:-10px;left:" +
        Math.random() * 100 +
        "%;width:" +
        (6 + Math.random() * 6) +
        "px;height:" +
        (6 + Math.random() * 6) +
        "px;background:" +
        colors[c % colors.length] +
        ";border-radius:" +
        (Math.random() > 0.5 ? "50%" : "2px") +
        ";animation:confetti-fall " +
        (1.5 + Math.random() * 2) +
        "s ease-in " +
        Math.random() * 0.8 +
        "s forwards;";
      overlay.appendChild(p);
    }

    document.body.appendChild(overlay);
    requestAnimationFrame(function () {
      overlay.style.opacity = "1";
    });

    // 點擊或 4 秒後自動關閉
    function dismiss() {
      overlay.style.opacity = "0";
      setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 400);
    }
    overlay.addEventListener("click", dismiss);
    setTimeout(dismiss, 4000);
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
        var session = ModeController.getSession();
        var mapIdx =
          session && typeof session.mapIndex === "number"
            ? session.mapIndex
            : 0;
        ModeController.clearSession();
        ModeController.goToAdventureMap(mapIdx);
      });
    }
    if (btnRetry) {
      btnRetry.addEventListener("click", function () {
        ModeController.retryCurrentPoint();
      });
    }
    if (btnMap) {
      btnMap.addEventListener("click", function () {
        var session = ModeController.getSession();
        var mapIdx =
          session && typeof session.mapIndex === "number"
            ? session.mapIndex
            : 0;
        ModeController.goToAdventureMap(mapIdx);
      });
    }

    var btnReport = document.getElementById("btnReport");
    if (btnReport) {
      btnReport.addEventListener("click", function () {
        toggleReport();
      });
    }
    _bindUploads();
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
          starsHTML(ss.totalStars || 0, getMaxStars(combo, result.wmResult)) +
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

      // === 2.5 SDT 信號偵測理論（合併所有 combo 的 trialDetails）===
      var allFsTrials = [];
      for (var si = 0; si < all.length; si++) {
        var sTd = all[si].trialDetails || [];
        allFsTrials = allFsTrials.concat(sTd);
      }
      html += _renderSDTSection(allFsTrials);

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
      Logger.error("❌ renderFreeSelect 運行錯誤:", err);
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
    _bindUploads();
  }

  // =========================================
  // 分析報告：轉換 + 展開/收合
  // =========================================

  var _reportVisible = false;
  var _reportContainer = null;

  /**
   * 將 game.html 的 trialDetails 轉為 csv-report.js 接受的格式
   * trialDetails 欄位: trialIndex, stimulus, context, isGo,
   *   correctAction, playerAction, result, isCorrect, rt, timestamp,
   *   sessionId, mode, stimulusDurationMs, isiMs, wmSpan, wmDirection, wmCompletionTime
   * CSV 欄位: 由 GameConstants.CSV_FIELDS 定義（single source of truth）
   */
  function _convertTrials(trialDetails, participantId, roundIndex, mode) {
    if (!trialDetails || trialDetails.length === 0) return [];

    var GC = window.GameConstants || {};
    var F = GC.CSV_FIELDS || {};
    var CV = GC.CSV_VALUES || {};
    var FN = GC.CSV_FILE_NAMING || {};
    var WM_PREFIX = GC.WM_ROUND_PREFIX || "WM";

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
    // Bug #5 修正：冒險模式依 fieldId+ruleId 自動推算回合編號
    var FRTM = GC.FIELD_RULE_TO_ROUND || {};
    var roundStr = String(roundIndex != null ? roundIndex : 1);

    // 從首筆試驗取得 sessionId（若有），避免依賴外部變數
    var sessionId = (trialDetails[0] && trialDetails[0].sessionId) || "";
    var trialMode = mode || (trialDetails[0] && trialDetails[0].mode) || "";

    // 遊戲結束時間 = 最後一題的 timestamp
    var gameEndTime = "";
    if (trialDetails.length > 0) {
      var lastTrial = trialDetails[trialDetails.length - 1];
      if (lastTrial.timestamp) {
        gameEndTime = _formatTimestamp(new Date(lastTrial.timestamp));
      }
    }

    return trialDetails.map(function (t, i) {
      var isWmRow = t._isWmSummary || t.stimulus === "WM";

      var row = {};
      // 依 fieldId + ruleId 推算回合編號（若映射表有定義）
      var derivedRound = roundStr;
      if (t.fieldId && t.ruleId) {
        var key = t.fieldId + "_" + t.ruleId;
        if (FRTM[key]) {
          derivedRound = String(FRTM[key]);
        }
      }
      row[F.FILE_NAME || "FileName"] = fileName;
      row[F.PARTICIPANT || "Participant"] = pid;
      // 兒童代碼（研究用，與量表配對）
      row[F.CHILD_CODE || "ChildCode"] = (function () {
        try {
          var prof = getPlayerProfile ? getPlayerProfile() : null;
          return (prof && prof.childCode) || "";
        } catch (e) {
          return "";
        }
      })();
      row[F.SESSION_ID || "SessionId"] = t.sessionId || sessionId;
      row[F.MODE || "Mode"] = t.mode || trialMode;
      row[F.FIELD_ID || "FieldId"] = t.fieldId || "";
      row[F.RULE_ID || "RuleId"] = t.ruleId || "";
      row[F.ROUND || "Round"] = isWmRow
        ? WM_PREFIX + derivedRound
        : derivedRound;
      row[F.TRIAL || "Trial"] = isWmRow ? "1" : String(i + 1);
      row[F.STIMULUS || "Stimulus"] = t.stimulus || "";
      row[F.IS_GO || "IsGo"] = t.isGo != null ? String(t.isGo) : "";
      row[F.CONTEXT || "Context"] = t.context || "";
      row[F.INPUT_KEY || "InputKey"] =
        t.playerAction === "press"
          ? "Space"
          : t.playerAction === "nopress"
            ? "Timeout"
            : t.playerAction || "";
      row[F.CORRECT || "Correct"] = t.isCorrect
        ? CV.CORRECT_YES || "yes"
        : CV.CORRECT_NO || "no";
      row[F.RESULT || "Result"] = t.result || "";
      // Bug #3 修正：RT null（No-Go 正確）→ 空字串而非 "0"
      row[F.RT_MS || "RT(ms)"] = t.rt != null ? String(Math.round(t.rt)) : "";
      // 新增：時間參數
      row[F.STIMULUS_DURATION || "StimulusDuration"] =
        t.stimulusDurationMs != null ? String(t.stimulusDurationMs) : "";
      row[F.ISI || "ISI"] = t.isiMs != null ? String(t.isiMs) : "";
      // 新增：WM 欄位（非 WM 試驗留空）
      row[F.WM_SPAN || "WMSpan"] = t.wmSpan != null ? String(t.wmSpan) : "";
      row[F.WM_DIRECTION || "WMDirection"] = t.wmDirection || "";
      row[F.WM_COMPLETION_TIME || "WMCompletionTime"] =
        t.wmCompletionTime != null ? String(t.wmCompletionTime) : "";
      // Bug #4 修正：用易讀格式取代 ISO，讓 tooltip 正確拆分
      row[F.TIMESTAMP || "Timestamp"] = t.timestamp
        ? _formatTimestamp(new Date(t.timestamp))
        : _formatTimestamp(now);
      row[F.GAME_END_TIME || "GameEndTime"] = gameEndTime;
      return row;
    });
  }

  /** 格式化時間戳為 YYYY-MM-DD HH:MM:SS.mmm */
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
      _padZ(d.getSeconds()) +
      "." +
      String(d.getMilliseconds()).padStart(3, "0")
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
        GameModal.alert("無資料", "沒有逐題資料可供分析", { icon: "📊" });
        return;
      }
      csvData = _convertTrials(allTrials, pid, 1, data.mode);
    } else {
      // free-select: 各 combo 分別轉換，Round 遞增
      var results = data.allComboResults || [];
      for (var i = 0; i < results.length; i++) {
        var td = results[i].trialDetails || [];
        var comboRows = _convertTrials(td, pid, i + 1, data.mode);
        csvData = csvData.concat(comboRows);
      }
      if (csvData.length === 0) {
        GameModal.alert("無資料", "沒有逐題資料可供分析", { icon: "📊" });
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
        // 從 CSV 資料第一列取得原始檔名
        var csvFilename = null;
        if (parsed.allData && parsed.allData.length > 0) {
          var fn = parsed.allData[0]["FileName"];
          if (fn && fn !== "-" && fn !== "SDT_Summary") {
            csvFilename = fn;
          }
        }
        CsvReport.exportCsv(parsed, csvFilename);
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

        // 生成截圖檔名（含暱稱和時間戳）
        var screenshotFilename = (function () {
          var GC = window.GameConstants || {};
          var FN = GC.CSV_FILE_NAMING || {};
          var now = new Date();
          var fileDate =
            now.getFullYear().toString() +
            String(now.getMonth() + 1).padStart(2, "0") +
            String(now.getDate()).padStart(2, "0");
          var timeStr =
            String(now.getHours()).padStart(2, "0") +
            String(now.getMinutes()).padStart(2, "0") +
            String(now.getSeconds()).padStart(2, "0");
          var pid = "Data";
          try {
            var profile =
              typeof getPlayerProfile === "function"
                ? getPlayerProfile()
                : null;
            if (profile && profile.nickname) pid = profile.nickname;
          } catch (e) {}
          return (
            (FN.SCREENSHOT_PREFIX || "EF單人冒險分析截圖") +
            (FN.SEPARATOR || "_") +
            pid +
            "_" +
            fileDate +
            "_" +
            timeStr
          );
        })();

        CsvReport.exportScreenshot(content, screenshotFilename)
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

    CsvReport.renderReport(document.getElementById("reportContent"), parsed, {
      mode: data.mode || "",
    });
    _reportVisible = true;

    var btn2 = document.getElementById("btnReport");
    if (btn2) btn2.textContent = "📊 收合分析報告";

    // 滾到報告區域
    _reportContainer.scrollIntoView({ behavior: "smooth" });
  }

  // =========================================
  // 上傳至排行榜（委託 ResultUpload 共用模組）
  // =========================================

  var _uploadData = null; // 快取目前結算資料

  function _bindUploads() {
    // === 班級排行榜 ===
    var uploadCodeInput = document.getElementById("uploadCodeInput");

    // 自動填入已儲存的看板代碼
    if (uploadCodeInput) {
      try {
        var savedProfile =
          typeof getPlayerProfile === "function" ? getPlayerProfile() : null;
        if (savedProfile && savedProfile.boardCode) {
          uploadCodeInput.value = savedProfile.boardCode;
        }
      } catch (e) {
        /* ignore */
      }
    }

    ResultUpload.bindClassUpload({
      btn: document.getElementById("btnUploadClass"),
      codeRow: document.getElementById("uploadCodeRow"),
      codeInput: document.getElementById("uploadCodeInput"),
      codeSubmit: document.getElementById("uploadCodeSubmit"),
      statusMsg: document.getElementById("uploadStatusMsg"),
      getEntry: function () {
        var data = _uploadData || ModeController.getResultData() || {};
        var profile = null;
        try {
          profile = getPlayerProfile ? getPlayerProfile() : null;
        } catch (e) {
          Logger.warn("[Result] getPlayerProfile failed:", e);
        }
        var cr = data.comboResult || {};
        var rr = cr.ruleResult || {};
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
        // 計算 SDT 指標（從 trialDetails）
        var sdtStats = { dPrime: null, criterion: null, beta: null };
        var allTrials = data.trialDetails || [];
        if (data.allComboResults && data.allComboResults.length > 0) {
          allTrials = [];
          data.allComboResults.forEach(function (c) {
            allTrials = allTrials.concat(c.trialDetails || []);
          });
        }
        if (
          allTrials.length > 0 &&
          typeof CsvReport !== "undefined" &&
          CsvReport.calculateSDT
        ) {
          sdtStats = CsvReport.calculateSDT(allTrials);
        }

        // 組合順序描述
        var comboOrder = "";
        if (data.allComboResults && data.allComboResults.length > 0) {
          comboOrder = data.allComboResults
            .map(function (c) {
              var cb = c.combo || {};
              var wm = cb.enableWm || cb.hasWM ? "+WM" : "";
              return (cb.fieldId || "") + "/" + (cb.ruleId || "") + wm;
            })
            .join(" → ");
        } else if (data.comboResult) {
          var _pd = data.comboResult.pointDef || {};
          comboOrder =
            (_pd.field || "") +
            "/" +
            (_pd.rule || "") +
            (_pd.hasWM ? "+WM" : "");
        }

        // 總花費時間
        var totalTimeMs = null;
        if (allTrials.length > 0) {
          var firstTs = allTrials[0].timestamp;
          var lastTs = allTrials[allTrials.length - 1].timestamp;
          if (firstTs && lastTs) totalTimeMs = lastTs - firstTs;
        }

        return {
          nickname: (profile && profile.nickname) || "玩家",
          score: rr.finalScore || 0,
          accuracy: totalAccuracy,
          avgRT: totalAvgRT,
          stars: totalStarsVal,
          level: (profile && profile.level) || "",
          mode: "singleplayer",
          dPrime: sdtStats.dPrime,
          criterion: sdtStats.criterion,
          beta: sdtStats.beta,
          comboOrder: comboOrder,
          totalTimeMs: totalTimeMs,
          gameEndTime: new Date().toISOString(),
          // v4.7 自適應難度欄位
          engineName:
            typeof DifficultyProvider !== "undefined"
              ? DifficultyProvider.getEngineName()
              : "",
          finalLevel: (function () {
            var en =
              typeof DifficultyProvider !== "undefined"
                ? DifficultyProvider.getEngineName()
                : "";
            if (
              en === "IRTSimpleEngine" &&
              typeof IRTSimpleEngine !== "undefined"
            )
              return IRTSimpleEngine.getCurrentLevel();
            if (typeof SimpleAdaptiveEngine !== "undefined")
              return SimpleAdaptiveEngine.getCurrentLevel();
            return "";
          })(),
          finalTheta: (function () {
            var en =
              typeof DifficultyProvider !== "undefined"
                ? DifficultyProvider.getEngineName()
                : "";
            if (
              en === "IRTSimpleEngine" &&
              typeof IRTSimpleEngine !== "undefined"
            ) {
              var s = IRTSimpleEngine.getIRTState();
              return s && s.theta != null
                ? Math.round(s.theta * 1000) / 1000
                : null;
            }
            return null;
          })(),
        };
      },
    });

    // === 世界排行榜 ===
    ResultUpload.bindWorldUpload({
      btn: document.getElementById("btnUploadWorld"),
      confirmRow: document.getElementById("worldUploadConfirmRow"),
      cancelBtn: document.getElementById("worldCancelBtn"),
      confirmBtn: document.getElementById("worldConfirmBtn"),
      statusMsg: document.getElementById("worldUploadStatus"),
      getEntries: function () {
        var data = _uploadData || ModeController.getResultData() || {};
        var nickname = "玩家";
        var level = "";
        try {
          var profileRaw =
            sessionStorage.getItem("efgame-player-profile") ||
            localStorage.getItem("efgame-player-profile");
          if (profileRaw) {
            var profile = JSON.parse(profileRaw);
            nickname = profile.nickname || profile.name || nickname;
            level = profile.level || "";
          }
        } catch (e) {
          /* ignore */
        }

        var entries = [];

        // v4.7 自適應難度共用擷取
        var _adEn =
          typeof DifficultyProvider !== "undefined"
            ? DifficultyProvider.getEngineName()
            : "";
        var _adLv = (function () {
          if (
            _adEn === "IRTSimpleEngine" &&
            typeof IRTSimpleEngine !== "undefined"
          )
            return IRTSimpleEngine.getCurrentLevel();
          if (typeof SimpleAdaptiveEngine !== "undefined")
            return SimpleAdaptiveEngine.getCurrentLevel();
          return "";
        })();
        var _adTh = (function () {
          if (
            _adEn === "IRTSimpleEngine" &&
            typeof IRTSimpleEngine !== "undefined"
          ) {
            var s = IRTSimpleEngine.getIRTState();
            return s && s.theta != null
              ? Math.round(s.theta * 1000) / 1000
              : null;
          }
          return null;
        })();

        if (data.mode === "adventure" && data.comboResult) {
          var cr = data.comboResult;
          var rr = cr.ruleResult || {};
          var comboData = {
            nickname: nickname,
            level: level,
            fieldId:
              (cr.pointDef || {}).field ||
              cr.fieldId ||
              (cr.combo || {}).fieldId ||
              "",
            ruleId:
              (cr.pointDef || {}).rule ||
              cr.ruleId ||
              (cr.combo || {}).ruleId ||
              "",
            bestScore: rr.finalScore || rr.correctCount || 0,
            bestAccuracy:
              rr.accuracy != null ? Math.round(rr.accuracy * 100) : 0,
            bestAvgRT: rr.avgRT ? Math.round(rr.avgRT) : 0,
            totalStars: cr.totalStars || 0,
            totalCorrect: rr.correctCount || 0,
            totalTrials: rr.totalCount || 0,
            mode: "adventure",
            gamesPlayed: 1,
            gameEndTime: new Date().toISOString(),
            engineName: _adEn,
            finalLevel: _adLv,
            finalTheta: _adTh,
          };
          if (cr.starsResult) {
            comboData.totalStars =
              comboData.totalStars || cr.starsResult.totalStars || 0;
          }
          entries.push(comboData);
        } else if (data.allComboResults && data.allComboResults.length > 0) {
          for (var ci = 0; ci < data.allComboResults.length; ci++) {
            var entry = data.allComboResults[ci];
            var er = (entry.result || {}).ruleResult || {};
            var combo = entry.combo || entry;
            var stars =
              ((entry.result || {}).starsResult || {}).totalStars || 0;
            entries.push({
              nickname: nickname,
              level: level,
              fieldId: combo.fieldId || "",
              ruleId: combo.ruleId || "",
              bestScore: er.finalScore || er.correctCount || 0,
              bestAccuracy:
                er.accuracy != null ? Math.round(er.accuracy * 100) : 0,
              bestAvgRT: er.avgRT ? Math.round(er.avgRT) : 0,
              totalStars: stars,
              totalCorrect: er.correctCount || 0,
              totalTrials: er.totalCount || 0,
              mode: "free-select",
              gamesPlayed: 1,
              gameEndTime: new Date().toISOString(),
              engineName: _adEn,
              finalLevel: _adLv,
              finalTheta: _adTh,
            });
          }
        }

        return entries;
      },
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
