/**
 * ============================================
 * 故事對話控制器
 * ============================================
 * 說明：管理探險地圖上的故事對話顯示
 *       - 完成對話（返回地圖時自動播放）
 *       - 進化動畫（完成里程碑關卡時觸發）
 *       - 開場對話（注入 point-info popup）
 *
 * 依賴：STORY_CONFIG (js/story-config.js)
 *       AudioPlayer (js/shared/audio-player.js) — 選用
 *       FocusTrap (js/shared/focus-trap.js) — 選用
 * ============================================
 */

(function () {
  "use strict";

  // ─── sessionStorage 鍵名 ───
  var SS_COMPLETED_POINT = "story_completedPointId";
  var SS_POINT_PASSED = "story_pointPassed";

  // ─── 內部狀態 ───
  var _overlayEl = null;
  var _evolutionEl = null;
  var _isShowing = false;
  var _typewriterTimer = null; // 打字機計時器
  var _typewriterDone = false; // 打字機是否已完成

  // ─── 打字機設定 ───
  var TYPEWRITER_SPEED = 40; // 每字 40ms（幼兒友善速度）

  // =========================================
  // 公用 API
  // =========================================

  /**
   * 在遊戲結束後儲存故事事件到 sessionStorage
   * 供返回探險地圖時讀取並顯示對話
   *
   * @param {string} pointId - 完成的探險點 ID (e.g. "mouse_r1")
   * @param {boolean} passed - 是否通過
   */
  function saveStoryEvent(pointId, passed) {
    try {
      sessionStorage.setItem(SS_COMPLETED_POINT, pointId);
      sessionStorage.setItem(SS_POINT_PASSED, passed ? "1" : "0");
    } catch (e) {
      Logger.warn("⚠️ 無法儲存故事事件:", e);
    }
  }

  /**
   * 檢查是否有待播放的故事事件
   * 在探險地圖 _initMap() 時呼叫
   * 若有事件 → 自動顯示對話 → 清除 sessionStorage
   *
   * @param {Function} [onComplete] - 所有對話結束後的回呼
   */
  function checkPendingEvent(onComplete) {
    try {
      var pointId = sessionStorage.getItem(SS_COMPLETED_POINT);
      var passed = sessionStorage.getItem(SS_POINT_PASSED) === "1";

      // 清除（避免重複觸發）
      sessionStorage.removeItem(SS_COMPLETED_POINT);
      sessionStorage.removeItem(SS_POINT_PASSED);

      if (!pointId) {
        if (onComplete) onComplete();
        return;
      }

      if (typeof STORY_CONFIG === "undefined") {
        if (onComplete) onComplete();
        return;
      }

      var dialogue = STORY_CONFIG.getDialogue(pointId);
      if (!dialogue) {
        if (onComplete) onComplete();
        return;
      }

      // 選擇對話類型
      var dialogueData = passed ? dialogue.completion : dialogue.failure;
      if (!dialogueData) {
        if (onComplete) onComplete();
        return;
      }

      // 檢查是否觸發進化
      var evolution = passed ? STORY_CONFIG.getEvolution(pointId) : null;

      // 顯示完成對話
      _showCompletionDialogue(dialogueData, function () {
        if (evolution) {
          // 顯示進化動畫
          _showEvolution(evolution, function () {
            if (onComplete) onComplete();
          });
        } else {
          if (onComplete) onComplete();
        }
      });
    } catch (e) {
      Logger.warn("⚠️ checkPendingEvent 錯誤:", e);
      if (onComplete) onComplete();
    }
  }

  /**
   * 取得開場對話的 HTML（注入到 point-info popup）
   * @param {string} pointId
   * @returns {string} HTML 字串，無對話時回傳空字串
   */
  function getOpeningHTML(pointId) {
    if (typeof STORY_CONFIG === "undefined") return "";

    var dialogue = STORY_CONFIG.getDialogue(pointId);
    if (!dialogue || !dialogue.opening) return "";

    var opening = dialogue.opening;
    var character = STORY_CONFIG.getCharacter(opening.speaker);
    if (!character) return "";

    var speakerClass = "";
    if (opening.speaker === "villain") speakerClass = " villain-speaking";
    if (opening.speaker === "legendaryEagle")
      speakerClass = " legendary-speaking";

    var nameClass = "";
    if (opening.speaker === "villain") nameClass = " villain";
    if (opening.speaker === "legendaryEagle") nameClass = " legendary";

    return (
      '<div class="popup-story-opening' +
      speakerClass +
      '">' +
      '<div class="popup-story-speaker">' +
      '<span class="popup-story-speaker-icon">' +
      character.icon +
      "</span>" +
      '<span class="popup-story-speaker-name' +
      nameClass +
      '">' +
      character.name +
      "（" +
      character.role +
      "）" +
      "</span>" +
      "</div>" +
      '<div class="popup-story-text">' +
      _escapeHTML(opening.text) +
      "</div>" +
      "</div>"
    );
  }

  // =========================================
  // 內部函式 — 完成對話
  // =========================================

  function _showCompletionDialogue(dialogueData, onDone) {
    if (_isShowing) {
      if (onDone) onDone();
      return;
    }
    _isShowing = true;
    _typewriterDone = false;
    _typewriterTimer = null;

    var character = STORY_CONFIG.getCharacter(dialogueData.speaker);
    if (!character) {
      _isShowing = false;
      if (onDone) onDone();
      return;
    }

    // 建立覆蓋層
    _overlayEl = document.createElement("div");
    _overlayEl.className = "story-overlay";
    _overlayEl.setAttribute("role", "dialog");
    _overlayEl.setAttribute("aria-modal", "true");
    _overlayEl.setAttribute("aria-label", "故事對話");

    var nameClass = "";
    var isVillain = dialogueData.speaker === "villain";
    var isLegendary = dialogueData.speaker === "legendaryEagle";
    if (isVillain) nameClass = " villain";
    if (isLegendary) nameClass = " legendary";

    // 反派卡片加 shake class
    var cardClass = "story-dialogue-card";
    if (isVillain) cardClass += " villain-shake";

    _overlayEl.innerHTML =
      // 浮動光點背景
      '<div class="story-floating-dots">' +
      '<div class="story-dot"></div>' +
      '<div class="story-dot"></div>' +
      '<div class="story-dot"></div>' +
      '<div class="story-dot"></div>' +
      '<div class="story-dot"></div>' +
      '<div class="story-dot"></div>' +
      "</div>" +
      '<div class="' +
      cardClass +
      '">' +
      '<div class="story-character">' +
      '<div class="story-character-icon">' +
      character.icon +
      "</div>" +
      '<div class="story-character-info">' +
      '<div class="story-character-name' +
      nameClass +
      '">' +
      character.name +
      "</div>" +
      '<div class="story-character-role">' +
      character.role +
      "</div>" +
      "</div>" +
      "</div>" +
      '<div class="story-dialogue-text" id="story-typewriter-target"></div>' +
      '<span class="story-cursor"></span>' +
      '<div class="story-tap-hint" id="story-tap-hint">👆 點一下跳過</div>' +
      "</div>";

    document.body.appendChild(_overlayEl);

    // 音效
    _playSfx("transition");

    // 🔊 播放故事語音
    _playVoice(dialogueData);

    // 顯示動畫
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        _overlayEl.classList.add("visible");

        // 等卡片滑入後啟動打字機
        setTimeout(function () {
          _startTypewriter(
            _escapeHTML(dialogueData.text),
            document.getElementById("story-typewriter-target"),
            function () {
              _typewriterDone = true;
              // 隱藏游標、更新提示
              var cursor = _overlayEl
                ? _overlayEl.querySelector(".story-cursor")
                : null;
              if (cursor) cursor.style.display = "none";
              var hint = document.getElementById("story-tap-hint");
              if (hint) hint.textContent = "👆 點一下繼續";
            },
          );
        }, 400);
      });
    });

    // 兩段式點擊：第一次跳過打字機 → 第二次關閉
    var dismissed = false;
    _overlayEl.addEventListener("click", function () {
      if (dismissed) return;

      if (!_typewriterDone) {
        // 第一次點擊：跳過打字機，立即顯示全文
        _skipTypewriter(
          _escapeHTML(dialogueData.text),
          document.getElementById("story-typewriter-target"),
        );
        return;
      }

      // 第二次點擊：關閉
      dismissed = true;
      _dismissOverlay(_overlayEl, function () {
        _overlayEl = null;
        _isShowing = false;
        if (onDone) onDone();
      });
    });

    // 鍵盤（Enter / Space / Escape）
    function _onKeyDown(e) {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
        e.preventDefault();
        if (dismissed) return;

        if (!_typewriterDone) {
          _skipTypewriter(
            _escapeHTML(dialogueData.text),
            document.getElementById("story-typewriter-target"),
          );
          return;
        }

        dismissed = true;
        document.removeEventListener("keydown", _onKeyDown);
        _dismissOverlay(_overlayEl, function () {
          _overlayEl = null;
          _isShowing = false;
          if (onDone) onDone();
        });
      }
    }
    document.addEventListener("keydown", _onKeyDown);
  }

  // =========================================
  // 內部函式 — 進化動畫
  // =========================================

  function _showEvolution(evolution, onDone) {
    _isShowing = true;
    _typewriterDone = false;
    _typewriterTimer = null;

    var character = STORY_CONFIG.getCharacter(evolution.dialogue.speaker);
    var speakerIcon = character ? character.icon : "🦉";

    _evolutionEl = document.createElement("div");
    _evolutionEl.className = "story-evolution-overlay";
    _evolutionEl.setAttribute("role", "dialog");
    _evolutionEl.setAttribute("aria-modal", "true");
    _evolutionEl.setAttribute("aria-label", "角色進化");

    // 產生 confetti 粒子（12 個）
    var confettiHTML = '<div class="evolution-confetti">';
    for (var ci = 0; ci < 12; ci++) {
      confettiHTML += '<div class="confetti-piece"></div>';
    }
    confettiHTML += "</div>";

    _evolutionEl.innerHTML =
      confettiHTML +
      '<div class="evolution-title">✨ 進化 ✨</div>' +
      '<div class="evolution-icons" style="position:relative;">' +
      '<div class="evolution-from">' +
      '<div class="evolution-emoji">' +
      evolution.from.icon +
      "</div>" +
      '<div class="evolution-label">' +
      evolution.from.name +
      "</div>" +
      "</div>" +
      '<div class="evolution-arrow">➜</div>' +
      '<div class="evolution-to">' +
      '<div class="evolution-emoji">' +
      evolution.to.icon +
      "</div>" +
      '<div class="evolution-label">' +
      evolution.to.name +
      "</div>" +
      "</div>" +
      // 閃光粒子
      '<div class="evolution-sparkles">' +
      '<div class="evolution-sparkle"></div>' +
      '<div class="evolution-sparkle"></div>' +
      '<div class="evolution-sparkle"></div>' +
      '<div class="evolution-sparkle"></div>' +
      '<div class="evolution-sparkle"></div>' +
      '<div class="evolution-sparkle"></div>' +
      "</div>" +
      "</div>" +
      '<div class="evolution-dialogue" id="evolution-typewriter-target">' +
      speakerIcon +
      " " +
      "</div>" +
      '<div class="evolution-tap-hint" id="evolution-tap-hint">👆 點一下繼續</div>';

    document.body.appendChild(_evolutionEl);

    // 音效
    _playSfx("levelUp");

    // 🔊 播放進化語音（延遲 1s 配合 levelUp 音效）
    setTimeout(function () {
      _playVoice(evolution.dialogue);
    }, 1000);

    // 顯示
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        _evolutionEl.classList.add("visible");
      });
    });

    // 進化對話打字機（延遲 2.4s 配合 CSS 動畫時序）
    var fullDialogueHTML =
      speakerIcon + " " + _escapeHTML(evolution.dialogue.text);
    setTimeout(function () {
      var target = document.getElementById("evolution-typewriter-target");
      if (target) {
        target.innerHTML = speakerIcon + " ";
        _startTypewriter(
          _escapeHTML(evolution.dialogue.text),
          target,
          function () {
            _typewriterDone = true;
          },
          true, // append mode
        );
      }
    }, 2400);

    // 延遲允許點擊（避免動畫還沒播完就被誤點）
    var canDismiss = false;
    setTimeout(function () {
      canDismiss = true;
    }, 2800);

    var dismissed = false;
    _evolutionEl.addEventListener("click", function () {
      if (!canDismiss || dismissed) return;

      if (!_typewriterDone) {
        var target = document.getElementById("evolution-typewriter-target");
        if (target) {
          _skipTypewriter(fullDialogueHTML, target);
        }
        return;
      }

      dismissed = true;
      _dismissOverlay(_evolutionEl, function () {
        _evolutionEl = null;
        _isShowing = false;
        if (onDone) onDone();
      });
    });

    function _onKeyDown(e) {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
        e.preventDefault();
        if (!canDismiss || dismissed) return;

        if (!_typewriterDone) {
          var target = document.getElementById("evolution-typewriter-target");
          if (target) {
            _skipTypewriter(fullDialogueHTML, target);
          }
          return;
        }

        dismissed = true;
        document.removeEventListener("keydown", _onKeyDown);
        _dismissOverlay(_evolutionEl, function () {
          _evolutionEl = null;
          _isShowing = false;
          if (onDone) onDone();
        });
      }
    }
    document.addEventListener("keydown", _onKeyDown);
  }

  // =========================================
  // 工具函式 — 打字機效果
  // =========================================

  /**
   * 逐字顯示文字（HTML-safe，不拆 HTML entity）
   * @param {string} html - 已 escape 過的 HTML 文字
   * @param {HTMLElement} target - 輸出目標元素
   * @param {Function} onComplete - 完成回呼
   * @param {boolean} [append] - 是否附加在現有內容後
   */
  function _startTypewriter(html, target, onComplete, append) {
    if (!target) {
      if (onComplete) onComplete();
      return;
    }

    // 將 HTML 拆為可渲染的單元（保留 HTML entities 完整）
    var units = [];
    var i = 0;
    while (i < html.length) {
      if (html[i] === "&") {
        // HTML entity → 整個取出
        var semiIdx = html.indexOf(";", i);
        if (semiIdx !== -1 && semiIdx - i < 10) {
          units.push(html.substring(i, semiIdx + 1));
          i = semiIdx + 1;
          continue;
        }
      }
      units.push(html[i]);
      i++;
    }

    var current = 0;
    var baseHTML = append ? target.innerHTML : "";

    function tick() {
      if (current >= units.length) {
        _typewriterTimer = null;
        if (onComplete) onComplete();
        return;
      }
      current++;
      target.innerHTML = baseHTML + units.slice(0, current).join("");
      _typewriterTimer = setTimeout(tick, TYPEWRITER_SPEED);
    }

    tick();
  }

  /**
   * 跳過打字機，立即顯示全文
   */
  function _skipTypewriter(fullHTML, target) {
    if (_typewriterTimer) {
      clearTimeout(_typewriterTimer);
      _typewriterTimer = null;
    }
    if (target) {
      target.innerHTML = fullHTML;
    }
    _typewriterDone = true;
    // 更新提示
    var hint =
      document.getElementById("story-tap-hint") ||
      document.getElementById("evolution-tap-hint");
    if (hint) hint.textContent = "👆 點一下繼續";
    // 隱藏游標
    var cursor = document.querySelector(".story-cursor");
    if (cursor) cursor.style.display = "none";
  }

  // =========================================
  // 工具函式 — 通用
  // =========================================

  function _dismissOverlay(el, callback) {
    // 強制停止語音播放，避免語音延續到下一個動作
    if (typeof AudioPlayer !== "undefined" && AudioPlayer.stopVoice) {
      AudioPlayer.stopVoice();
    }
    if (!el) {
      if (callback) callback();
      return;
    }
    el.classList.remove("visible");
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
      if (callback) callback();
    }, 450);
  }

  function _escapeHTML(str) {
    if (!str) return "";
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function _playSfx(preset) {
    try {
      if (typeof AudioPlayer !== "undefined" && AudioPlayer.playSfx) {
        var file = null;
        if (typeof getSoundFile === "function") {
          if (preset === "levelUp") {
            file = getSoundFile("sfx.levelUp");
          } else if (preset === "transition") {
            file = getSoundFile("sfx.pageTransition");
          }
        }
        AudioPlayer.playSfx(file, { synthPreset: preset });
      }
    } catch (e) {
      // 靜默失敗
    }
  }

  /**
   * 播放故事語音（voiceFile 欄位）
   * @param {Object} dialogueData - { text, voiceFile, ... }
   */
  function _playVoice(dialogueData) {
    try {
      if (
        dialogueData &&
        dialogueData.voiceFile &&
        typeof AudioPlayer !== "undefined" &&
        AudioPlayer.playVoice
      ) {
        AudioPlayer.playVoice(dialogueData.voiceFile, {
          text: dialogueData.text || "",
        });
      }
    } catch (e) {
      // 靜默失敗
    }
  }

  // =========================================
  // 匯出
  // =========================================

  /**
   * 播放開場對話語音
   * @param {string} pointId - 探險點 ID
   */
  function playOpeningVoice(pointId) {
    if (typeof STORY_CONFIG === "undefined") return;
    var dialogue = STORY_CONFIG.getDialogue(pointId);
    if (dialogue && dialogue.opening) {
      _playVoice(dialogue.opening);
    }
  }

  var StoryDialogue = {
    saveStoryEvent: saveStoryEvent,
    checkPendingEvent: checkPendingEvent,
    getOpeningHTML: getOpeningHTML,
    playOpeningVoice: playOpeningVoice,
  };

  if (typeof window !== "undefined") {
    window.StoryDialogue = StoryDialogue;
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = StoryDialogue;
  }
})();
