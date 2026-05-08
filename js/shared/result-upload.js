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
      opts.codeSubmit.textContent = "查詢中…";
      _clearStatus(opts.statusMsg);

      var _boardId = null;

      _ensureAuth()
        .then(function () {
          return FirestoreLeaderboard.findBoardByCode(code);
        })
        .then(function (board) {
          if (!board) throw new Error("找不到此代碼對應的看板");
          _boardId = board.boardId;
          // 不再檢查是否已有舊紀錄，直接上傳（每次都新增）
          opts.codeSubmit.textContent = "上傳中…";
          var entry = opts.getEntry();
          return FirestoreLeaderboard.uploadToClassBoard(_boardId, entry);
        })
        .then(function (result) {
          if (result === "cancelled") return;
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
    opts.confirmBtn.textContent = "查詢中…";
    _clearStatus(opts.statusMsg);

    var _entries = [];

    _ensureAuth()
      .then(function () {
        _entries = opts.getEntries();
        if (!_entries || _entries.length === 0) {
          return Promise.reject(new Error("沒有可上傳的資料"));
        }
        // 查詢是否已有前一筆資料
        return FirestoreLeaderboard.getMyWorldEntries();
      })
      .then(function (existingEntries) {
        if (existingEntries && existingEntries.length > 0) {
          // 有舊資料 → 彈出比較視窗
          var html = _buildWorldCompareHtml(existingEntries, _entries);
          return GameModal.confirm("⚠️ 你已有世界排行榜紀錄", html, {
            icon: "🌍",
            rawHtml: true,
          });
        }
        return true; // 沒有舊資料
      })
      .then(function (ok) {
        if (!ok) {
          _showStatus(opts.statusMsg, "ℹ️ 已取消上傳", "info");
          return "cancelled";
        }
        opts.confirmBtn.textContent = "上傳中…";
        var promises = _entries.map(function (e) {
          return FirestoreLeaderboard.uploadToWorld(e);
        });
        return Promise.all(promises).then(function () {
          return _entries.length;
        });
      })
      .then(function (result) {
        if (result === "cancelled") return;
        var count = result;
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
      })
      .finally(function () {
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

  // =========================================
  // 覆蓋確認比較 HTML 建構
  // =========================================

  /** 格式化時間字串（含毫秒） */
  function _fmtTime(val) {
    if (!val) return "—";
    var d = val.toDate ? val.toDate() : new Date(val);
    if (isNaN(d.getTime())) return "—";
    return (
      d.getFullYear() +
      "/" +
      (d.getMonth() + 1) +
      "/" +
      d.getDate() +
      " " +
      String(d.getHours()).padStart(2, "0") +
      ":" +
      String(d.getMinutes()).padStart(2, "0") +
      ":" +
      String(d.getSeconds()).padStart(2, "0") +
      "." +
      String(d.getMilliseconds()).padStart(3, "0")
    );
  }

  /** 比較值標色：新值較好 → 綠，較差 → 紅，相同 → 灰 */
  function _cmpCell(oldVal, newVal, higherBetter) {
    var o = Number(oldVal) || 0;
    var n = Number(newVal) || 0;
    var color = "#aaa";
    if (higherBetter) {
      if (n > o) color = "#2ecc71";
      else if (n < o) color = "#e74c3c";
    } else {
      if (n < o) color = "#2ecc71";
      else if (n > o) color = "#e74c3c";
    }
    return (
      '<span style="color:' +
      color +
      ';font-weight:bold">' +
      (newVal != null ? newVal : "—") +
      "</span>"
    );
  }

  /** 建構班級排行榜比較 HTML */
  function _buildClassCompareHtml(old, neu) {
    var s = '<div style="text-align:left;font-size:0.85rem;line-height:1.6">';
    s += "<p>以下是你已有的紀錄與本次成績比較，確定要<b>覆蓋</b>嗎？</p>";
    s += '<table style="width:100%;border-collapse:collapse;margin:8px 0">';
    s +=
      '<tr style="border-bottom:1px solid #555"><th style="text-align:left;padding:4px">欄位</th><th style="padding:4px">前一筆</th><th style="padding:4px">本次</th></tr>';

    var rows = [
      ["分數", old.score, neu.score, true],
      [
        "正確率(%)",
        old.accuracy,
        typeof neu.accuracy === "number"
          ? Math.round(neu.accuracy * 10) / 10
          : neu.accuracy,
        true,
      ],
      ["平均RT(ms)", old.avgRT, neu.avgRT, false],
      ["星星", old.stars, neu.stars, true],
      ["總題數", old.totalTrials, neu.totalTrials, true],
    ];

    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      s += "<tr><td style='padding:4px'>" + r[0] + "</td>";
      s +=
        "<td style='padding:4px;text-align:center'>" +
        (r[1] != null ? r[1] : "—") +
        "</td>";
      s +=
        "<td style='padding:4px;text-align:center'>" +
        _cmpCell(r[1], r[2], r[3]) +
        "</td></tr>";
    }

    s += '<tr><td style="padding:4px">遊戲結束時間</td>';
    s +=
      '<td style="padding:4px;text-align:center;font-size:0.75rem">' +
      _fmtTime(old.gameEndTime) +
      "</td>";
    s +=
      '<td style="padding:4px;text-align:center;font-size:0.75rem">' +
      _fmtTime(neu.gameEndTime || new Date()) +
      "</td></tr>";

    s += "</table></div>";
    return s;
  }

  /** 建構世界排行榜比較 HTML */
  function _buildWorldCompareHtml(existingList, newList) {
    var s = '<div style="text-align:left;font-size:0.85rem;line-height:1.6">';
    s += "<p>以下是你已有的紀錄與本次成績比較，確定要<b>覆蓋</b>嗎？</p>";

    // 用 fieldId+ruleId 索引舊資料
    var oldMap = {};
    for (var i = 0; i < existingList.length; i++) {
      var e = existingList[i];
      var key = (e.fieldId || "") + "|" + (e.ruleId || "");
      oldMap[key] = e;
    }

    for (var j = 0; j < newList.length; j++) {
      var n = newList[j];
      var nKey = (n.fieldId || "") + "|" + (n.ruleId || "");
      var old = oldMap[nKey];

      var ruleLabel = (n.fieldId || "") + (n.ruleId ? " / " + n.ruleId : "");
      if (ruleLabel)
        s +=
          '<div style="margin-top:8px;font-weight:bold;color:#3498db">📌 ' +
          ruleLabel +
          "</div>";

      if (!old) {
        s +=
          '<div style="color:#2ecc71;margin:4px 0">🆕 新紀錄（尚無前一筆資料）</div>';
        continue;
      }

      s += '<table style="width:100%;border-collapse:collapse;margin:4px 0">';
      s +=
        '<tr style="border-bottom:1px solid #555"><th style="text-align:left;padding:3px">欄位</th><th style="padding:3px">前一筆</th><th style="padding:3px">本次</th></tr>';

      var rows = [
        ["最高分", old.bestScore, n.bestScore, true],
        ["正確率(%)", old.bestAccuracy, n.bestAccuracy, true],
        ["平均RT(ms)", old.bestAvgRT, n.bestAvgRT, false],
        ["星星", old.totalStars, n.totalStars, true],
        [
          "答對/總題",
          (old.totalCorrect || 0) + "/" + (old.totalTrials || 0),
          (n.totalCorrect || 0) + "/" + (n.totalTrials || 0),
          null,
        ],
      ];

      for (var k = 0; k < rows.length; k++) {
        var r = rows[k];
        s += "<tr><td style='padding:3px'>" + r[0] + "</td>";
        s +=
          "<td style='padding:3px;text-align:center'>" +
          (r[1] != null ? r[1] : "—") +
          "</td>";
        if (r[3] !== null) {
          s +=
            "<td style='padding:3px;text-align:center'>" +
            _cmpCell(r[1], r[2], r[3]) +
            "</td></tr>";
        } else {
          s +=
            "<td style='padding:3px;text-align:center'>" +
            (r[2] != null ? r[2] : "—") +
            "</td></tr>";
        }
      }

      s += '<tr><td style="padding:3px">遊戲結束時間</td>';
      s +=
        '<td style="padding:3px;text-align:center;font-size:0.75rem">' +
        _fmtTime(old.gameEndTime) +
        "</td>";
      s +=
        '<td style="padding:3px;text-align:center;font-size:0.75rem">' +
        _fmtTime(n.gameEndTime || new Date()) +
        "</td></tr>";

      s += "</table>";
    }

    s += "</div>";
    return s;
  }

  return {
    bindClassUpload: bindClassUpload,
    bindWorldUpload: bindWorldUpload,
  };
})();
