/**
 * ResultUpload — 共用上傳模組（班級排行榜 & 世界排行榜）
 * 統一 singleplayer / multiplayer 兩端 result-controller 的上傳邏輯
 *
 * 依賴：firebase-bundle.js, firestore-leaderboard.js
 * 使用方式：
 *   ResultUpload.bindClassUpload({ btn, codeRow, codeInput, codeSubmit, statusMsg, getEntry })
 *   ResultUpload.bindWorldUpload({ btn, confirmRow?, cancelBtn?, confirmBtn?, statusMsg, noticeEl?, getEntries, onSuccess? })
 */
var ResultUpload = (function () {
  "use strict";

  // =========================================
  // 班級排行榜上傳
  // =========================================

  /**
   * 綁定「上傳至班級排行榜」功能
   * @param {Object} opts
   * @param {HTMLElement}  opts.btn         - 主按鈕
   * @param {HTMLElement}  opts.codeRow     - 代碼輸入列
   * @param {HTMLElement}  opts.codeInput   - 代碼輸入框
   * @param {HTMLElement}  opts.codeSubmit  - 提交按鈕
   * @param {HTMLElement}  opts.statusMsg   - 狀態訊息
   * @param {Function}     opts.getEntry    - 回傳 {nickname, score, accuracy, avgRT, stars, level, mode}
   */
  function bindClassUpload(opts) {
    if (!opts.btn) return;

    opts.btn.addEventListener("click", function () {
      opts.codeRow.style.display =
        opts.codeRow.style.display === "none" ? "flex" : "none";
      if (opts.codeRow.style.display === "flex") opts.codeInput.focus();
    });

    function doUpload() {
      var code = opts.codeInput.value.trim().toUpperCase();
      if (!code || code.length < 4) {
        opts.codeInput.style.borderColor = "#e74c3c";
        opts.codeInput.focus();
        return;
      }
      if (typeof FirestoreLeaderboard === "undefined") {
        _showStatus(opts.statusMsg, "❌ 上傳模組未載入", "error");
        return;
      }

      opts.codeSubmit.disabled = true;
      opts.codeSubmit.textContent = "上傳中…";
      _clearStatus(opts.statusMsg);

      _ensureAuth()
        .then(function () {
          return FirestoreLeaderboard.findBoardByCode(code);
        })
        .then(function (board) {
          if (!board) throw new Error("找不到此代碼對應的看板");
          var entry = opts.getEntry();
          return FirestoreLeaderboard.uploadToClassBoard(board.boardId, entry);
        })
        .then(function () {
          _showStatus(
            opts.statusMsg,
            "✅ 上傳成功！老師的看板已收到你的成績",
            "success",
          );
        })
        .catch(function (err) {
          _showStatus(opts.statusMsg, "❌ " + err.message, "error");
        })
        .finally(function () {
          opts.codeSubmit.disabled = false;
          opts.codeSubmit.textContent = "上傳";
        });
    }

    if (opts.codeSubmit) {
      opts.codeSubmit.addEventListener("click", doUpload);
    }
    if (opts.codeInput) {
      opts.codeInput.addEventListener("keydown", function (e) {
        if (e.isComposing) return; // 防止中文輸入法 composing 階段觸發
        if (e.key === "Enter") doUpload();
      });
    }
  }

  // =========================================
  // 世界排行榜上傳
  // =========================================

  /**
   * 綁定「上傳至世界排行榜」功能
   * @param {Object} opts
   * @param {HTMLElement}  opts.btn          - 主按鈕 (#btnUploadWorld)
   * @param {HTMLElement}  [opts.confirmRow] - 確認列容器；若不傳則自動建立
   * @param {HTMLElement}  [opts.cancelBtn]  - 取消按鈕
   * @param {HTMLElement}  [opts.confirmBtn] - 確認上傳按鈕
   * @param {HTMLElement}  opts.statusMsg    - 狀態訊息 (#worldUploadStatus)
   * @param {HTMLElement}  [opts.noticeEl]   - 外部提示文字容器（可選）
   * @param {Function}     opts.getEntries   - 回傳 Array<WorldEntry>
   * @param {Function}     [opts.onSuccess]  - 自訂成功回呼 (count) => void
   */
  function bindWorldUpload(opts) {
    if (!opts.btn) return;

    var needBuild = !opts.confirmRow;

    opts.btn.addEventListener("click", function () {
      opts.btn.style.display = "none";
      if (opts.noticeEl) opts.noticeEl.style.display = "block";

      // 動態建立確認列（僅首次）
      if (needBuild && !opts.confirmRow) {
        var built = _buildConfirmRow(opts);
        opts.confirmRow = built.row;
        opts.cancelBtn = built.cancelBtn;
        opts.confirmBtn = built.confirmBtn;
        _bindConfirmEvents(opts);
      }

      if (opts.confirmRow) opts.confirmRow.style.display = "";
    });

    // 若確認列已存在於 DOM，直接綁定事件
    if (!needBuild) {
      _bindConfirmEvents(opts);
    }
  }

  /** 綁定確認列的取消 / 確認事件 */
  function _bindConfirmEvents(opts) {
    if (opts.cancelBtn) {
      opts.cancelBtn.addEventListener("click", function () {
        if (opts.confirmRow) opts.confirmRow.style.display = "none";
        if (opts.noticeEl) opts.noticeEl.style.display = "none";
        opts.btn.style.display = "";
      });
    }
    if (opts.confirmBtn) {
      opts.confirmBtn.addEventListener("click", function () {
        _doWorldUpload(opts);
      });
    }
  }

  /** 執行世界排行榜上傳 */
  function _doWorldUpload(opts) {
    if (typeof FirestoreLeaderboard === "undefined") {
      _showStatus(opts.statusMsg, "❌ 上傳模組未載入", "error");
      return;
    }

    opts.confirmBtn.disabled = true;
    opts.confirmBtn.textContent = "上傳中…";
    _clearStatus(opts.statusMsg);

    _ensureAuth()
      .then(function () {
        var entries = opts.getEntries();
        if (!entries || entries.length === 0) {
          return Promise.reject(new Error("沒有可上傳的資料"));
        }
        var promises = entries.map(function (e) {
          return FirestoreLeaderboard.uploadToWorld(e);
        });
        return Promise.all(promises).then(function () {
          return entries.length;
        });
      })
      .then(function (count) {
        // 自訂或預設成功訊息
        if (typeof opts.onSuccess === "function") {
          opts.onSuccess(count);
        } else {
          var countText = count > 1 ? "（共 " + count + " 筆）" : "";
          _showStatus(
            opts.statusMsg,
            "✅ 已上傳至世界排行榜！" + countText,
            "success",
          );
        }
        // 禁用主按鈕
        if (opts.confirmRow) opts.confirmRow.style.display = "none";
        if (opts.noticeEl) opts.noticeEl.style.display = "none";
        opts.btn.style.display = "";
        opts.btn.textContent = "🌐 已上傳";
        opts.btn.disabled = true;
        opts.btn.style.opacity = "0.6";
      })
      .catch(function (err) {
        _showStatus(opts.statusMsg, "❌ " + err.message, "error");
        opts.confirmBtn.disabled = false;
        opts.confirmBtn.textContent = "上傳";
      });
  }

  // =========================================
  // 內部工具
  // =========================================

  function _ensureAuth() {
    return firebase.auth().currentUser
      ? Promise.resolve()
      : firebase.auth().signInAnonymously();
  }

  function _showStatus(el, msg, type) {
    if (!el) return;
    el.textContent = msg;
    el.className = "upload-status-msg " + (type || "");
  }

  function _clearStatus(el) {
    if (!el) return;
    el.textContent = "";
    el.className = "upload-status-msg";
  }

  /** 動態建立確認列（取消 + 上傳按鈕） */
  function _buildConfirmRow(opts) {
    var row = document.createElement("div");
    row.id = "worldUploadConfirmRow";
    row.className = "world-upload-confirm-row";

    // 只有在沒有外部 noticeEl 時才在 row 內建立提示文字
    if (!opts.noticeEl) {
      var notice = document.createElement("div");
      notice.className = "upload-world-notice";
      notice.innerHTML =
        "📋 上傳後，你的暱稱與本次成績將公開顯示於世界排行榜。<br>相同裝置再次上傳會覆蓋先前紀錄。";
      row.appendChild(notice);
    }

    var btnPair = document.createElement("div");
    btnPair.className = "world-upload-btn-pair";

    var cancelBtn = document.createElement("button");
    cancelBtn.id = "worldCancelBtn";
    cancelBtn.className = "btn btn-world-cancel";
    cancelBtn.textContent = "取消";

    var confirmBtn = document.createElement("button");
    confirmBtn.id = "worldConfirmBtn";
    confirmBtn.className = "btn btn-world-confirm";
    confirmBtn.textContent = "上傳";

    btnPair.appendChild(cancelBtn);
    btnPair.appendChild(confirmBtn);
    row.appendChild(btnPair);

    // 插入到 statusMsg 之前
    if (opts.statusMsg && opts.statusMsg.parentNode) {
      opts.statusMsg.parentNode.insertBefore(row, opts.statusMsg);
    } else if (opts.btn && opts.btn.parentNode) {
      opts.btn.parentNode.appendChild(row);
    }

    return { row: row, cancelBtn: cancelBtn, confirmBtn: confirmBtn };
  }

  return {
    bindClassUpload: bindClassUpload,
    bindWorldUpload: bindWorldUpload,
  };
})();
