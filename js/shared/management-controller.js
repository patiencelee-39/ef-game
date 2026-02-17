/**
 * ============================================
 * 教師管理後台控制器 v2
 * ============================================
 * 資料來源：
 *   - 班級看板：Firestore classLeaderboards（via FirestoreLeaderboard）
 *   - 學生成績：Firestore entries（via getClassBoardEntries）
 *   - 本地匯出/匯入：保留 JSON 功能
 * ============================================
 */
(function () {
  "use strict";

  // =========================================
  // 狀態
  // =========================================
  var _boards = []; // 教師的所有看板
  var _currentBoardId = null; // 當前選中的看板
  var _allEntries = []; // 當前看板的所有成績
  var _isLoggedIn = false;

  // =========================================
  // DOM refs
  // =========================================
  var els = {};

  function cacheDom() {
    els = {
      statStudents: document.getElementById("statStudents"),
      statClasses: document.getElementById("statClasses"),
      statGames: document.getElementById("statGames"),
      statAvgAcc: document.getElementById("statAvgAcc"),
      boardNameInput: document.getElementById("newClassName"),
      btnAddClass: document.getElementById("btnAddClass"),
      classList: document.getElementById("classList"),
      filterRow: document.getElementById("filterRow"),
      studentArea: document.getElementById("studentArea"),
      btnExport: document.getElementById("btnExport"),
      btnImport: document.getElementById("btnImport"),
      btnClearAll: document.getElementById("btnClearAll"),
      importFileInput: document.getElementById("importFileInput"),
      toast: document.getElementById("toast"),
      authStatus: document.getElementById("authStatus"),
    };
  }

  // =========================================
  // Firebase 驗證
  // =========================================
  function initAuth() {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        _isLoggedIn = true;
        if (els.authStatus) {
          els.authStatus.textContent = "✅ 已連線";
          els.authStatus.style.color = "#81c784";
        }
        loadBoards();
      } else {
        // 匿名登入
        firebase
          .auth()
          .signInAnonymously()
          .catch(function (err) {
            console.error("❌ 匿名登入失敗:", err);
            if (els.authStatus) {
              els.authStatus.textContent = "❌ 連線失敗";
              els.authStatus.style.color = "#e74c3c";
            }
            showToast("❌ Firebase 連線失敗，部分功能可能無法使用");
          });
      }
    });
  }

  // =========================================
  // 看板（班級）管理
  // =========================================
  function loadBoards() {
    FirestoreLeaderboard.getMyBoards()
      .then(function (boards) {
        _boards = boards;
        renderAll();
      })
      .catch(function (err) {
        console.error("❌ 載入看板失敗:", err);
        showToast("❌ 載入班級看板失敗");
      });
  }

  function addBoard() {
    var name = (els.boardNameInput.value || "").trim();
    if (!name) {
      showToast("⚠️ 請輸入班級名稱");
      return;
    }
    // 重名檢查
    for (var i = 0; i < _boards.length; i++) {
      if (_boards[i].boardName === name) {
        showToast("⚠️ 此班級名稱已存在");
        return;
      }
    }
    els.btnAddClass.disabled = true;
    els.btnAddClass.textContent = "建立中…";

    FirestoreLeaderboard.createClassBoard(name)
      .then(function (board) {
        els.boardNameInput.value = "";
        showToast("✅ 已建立班級「" + name + "」\n代碼：" + board.code);
        loadBoards();
      })
      .catch(function (err) {
        showToast("❌ 建立失敗：" + err.message);
      })
      .finally(function () {
        els.btnAddClass.disabled = false;
        els.btnAddClass.textContent = "➕ 新增";
      });
  }

  function deleteBoard(boardId, boardName) {
    showConfirm(
      "🗑️",
      "刪除班級看板",
      "確定要刪除「" +
        boardName +
        "」嗎？\n所有學生成績將一併刪除，此操作無法復原。",
      function () {
        FirestoreLeaderboard.deleteClassBoard(boardId)
          .then(function () {
            if (_currentBoardId === boardId) {
              _currentBoardId = null;
              _allEntries = [];
            }
            showToast("✅ 已刪除「" + boardName + "」");
            loadBoards();
          })
          .catch(function (err) {
            showToast("❌ 刪除失敗：" + err.message);
          });
      },
    );
  }

  function renderBoards() {
    if (_boards.length === 0) {
      els.classList.innerHTML =
        '<div class="empty-state" style="padding:16px">' +
        '<p class="empty-state__text">尚未建立班級看板<br>點擊上方「➕ 新增」建立第一個班級</p>' +
        "</div>";
      return;
    }

    var html = "";
    for (var i = 0; i < _boards.length; i++) {
      var b = _boards[i];
      html +=
        '<div class="class-chip" data-board-id="' +
        _escAttr(b.boardId) +
        '">' +
        '<div class="class-chip__info">' +
        "<span>📖</span>" +
        "<span>" +
        _escHtml(b.boardName) +
        "</span>" +
        '<span class="class-chip__count">' +
        '代碼：<strong style="color:#c9a0dc;letter-spacing:1px;">' +
        _escHtml(b.code) +
        "</strong>" +
        " · " +
        (b.entryCount || 0) +
        " 筆成績</span>" +
        "</div>" +
        '<button class="class-chip__del" data-board-id="' +
        _escAttr(b.boardId) +
        '" data-board-name="' +
        _escAttr(b.boardName) +
        '" title="刪除">🗑️</button>' +
        "</div>";
    }
    els.classList.innerHTML = html;
  }

  // =========================================
  // 篩選（選擇看板）
  // =========================================
  function renderFilters() {
    var html =
      '<button class="filter-chip' +
      (_currentBoardId === null ? " active" : "") +
      '" data-filter="all">全部</button>';

    for (var i = 0; i < _boards.length; i++) {
      var b = _boards[i];
      html +=
        '<button class="filter-chip' +
        (_currentBoardId === b.boardId ? " active" : "") +
        '" data-filter="' +
        _escAttr(b.boardId) +
        '">' +
        _escHtml(b.boardName) +
        "</button>";
    }
    els.filterRow.innerHTML = html;
  }

  // =========================================
  // 學生成績
  // =========================================
  function loadEntries(boardId) {
    _currentBoardId = boardId;
    els.studentArea.innerHTML =
      '<div class="empty-state" style="padding:20px">' +
      '<p class="empty-state__text">⏳ 載入中…</p></div>';

    if (!boardId) {
      // 全部模式：載入所有看板的成績
      var promises = _boards.map(function (b) {
        return FirestoreLeaderboard.getClassBoardEntries(b.boardId).then(
          function (entries) {
            entries.forEach(function (e) {
              e._boardName = b.boardName;
            });
            return entries;
          },
        );
      });
      Promise.all(promises)
        .then(function (results) {
          _allEntries = [];
          results.forEach(function (arr) {
            _allEntries = _allEntries.concat(arr);
          });
          renderStudents();
          updateStats();
        })
        .catch(function (err) {
          console.error("❌ 載入成績失敗:", err);
          els.studentArea.innerHTML =
            '<div class="empty-state" style="padding:20px">' +
            '<p class="empty-state__text">❌ 載入失敗：' +
            _escHtml(err.message) +
            "</p></div>";
        });
    } else {
      var boardObj = _boards.find(function (b) {
        return b.boardId === boardId;
      });
      FirestoreLeaderboard.getClassBoardEntries(boardId)
        .then(function (entries) {
          entries.forEach(function (e) {
            e._boardName = boardObj ? boardObj.boardName : "未知";
          });
          _allEntries = entries;
          renderStudents();
          updateStats();
        })
        .catch(function (err) {
          console.error("❌ 載入成績失敗:", err);
          els.studentArea.innerHTML =
            '<div class="empty-state" style="padding:20px">' +
            '<p class="empty-state__text">❌ 載入失敗</p></div>';
        });
    }
  }

  function renderStudents() {
    if (_allEntries.length === 0) {
      els.studentArea.innerHTML =
        '<div class="empty-state">' +
        '<div class="empty-state__icon">📭</div>' +
        '<p class="empty-state__text">' +
        "尚無學生成績<br>學生在結算頁面上傳後，成績將出現於此" +
        "</p></div>";
      return;
    }

    // 排序：分數降序
    var sorted = _allEntries.slice().sort(function (a, b) {
      return (b.score || 0) - (a.score || 0);
    });

    var html =
      '<div class="student-table-wrap"><table class="student-table">' +
      "<thead><tr>" +
      "<th>#</th><th>暱稱</th><th>班級</th><th>分數</th><th>準確率</th><th>平均RT</th><th>⭐</th>" +
      "</tr></thead><tbody>";

    for (var i = 0; i < sorted.length; i++) {
      var s = sorted[i];
      var rankText = "";
      if (i === 0) rankText = '<span class="rank-medal">🥇</span>';
      else if (i === 1) rankText = '<span class="rank-medal">🥈</span>';
      else if (i === 2) rankText = '<span class="rank-medal">🥉</span>';
      else rankText = String(i + 1);

      var accDisplay =
        s.accuracy != null
          ? (typeof s.accuracy === "number" && s.accuracy <= 1
              ? Math.round(s.accuracy * 100)
              : Math.round(s.accuracy)) + "%"
          : "-";

      html +=
        "<tr>" +
        "<td>" +
        rankText +
        "</td>" +
        "<td>" +
        _escHtml(s.nickname || "匿名") +
        "</td>" +
        "<td>" +
        _escHtml(s._boardName || "-") +
        "</td>" +
        "<td>" +
        (s.score || 0) +
        "</td>" +
        "<td>" +
        accDisplay +
        "</td>" +
        "<td>" +
        (s.avgRT ? Math.round(s.avgRT) + "ms" : "-") +
        "</td>" +
        "<td>" +
        (s.stars || 0) +
        "</td>" +
        "</tr>";
    }

    html += "</tbody></table></div>";
    els.studentArea.innerHTML = html;
  }

  // =========================================
  // 統計摘要
  // =========================================
  function updateStats() {
    var totalGames = _allEntries.length;
    var totalAcc = 0;
    var accCount = 0;
    for (var i = 0; i < _allEntries.length; i++) {
      var acc = _allEntries[i].accuracy;
      if (acc != null) {
        // 統一為百分比
        totalAcc += typeof acc === "number" && acc <= 1 ? acc * 100 : acc;
        accCount++;
      }
    }
    var avgAcc = accCount > 0 ? Math.round(totalAcc / accCount) : 0;

    // 學生人數去重（按 nickname）
    var uniqueNames = {};
    for (var j = 0; j < _allEntries.length; j++) {
      var name = _allEntries[j].nickname || "匿名";
      uniqueNames[name] = true;
    }

    els.statStudents.textContent = Object.keys(uniqueNames).length;
    els.statClasses.textContent = _boards.length;
    els.statGames.textContent = totalGames;
    els.statAvgAcc.textContent = accCount > 0 ? avgAcc + "%" : "-";
  }

  // =========================================
  // 資料管理（JSON 匯出/匯入）
  // =========================================
  function handleExport() {
    if (_allEntries.length === 0 && _boards.length === 0) {
      showToast("⚠️ 沒有可匯出的資料");
      return;
    }
    var data = {
      exportDate: new Date().toISOString(),
      boards: _boards.map(function (b) {
        return {
          boardId: b.boardId,
          boardName: b.boardName,
          code: b.code,
        };
      }),
      entries: _allEntries,
      version: "6.0-firestore",
    };
    var blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download =
      "efgame-teacher-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("✅ 資料已匯出（含 " + _allEntries.length + " 筆成績）");
  }

  function handleImport(e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".json")) {
      showToast("❌ 請選擇 .json 檔案");
      els.importFileInput.value = "";
      return;
    }
    var reader = new FileReader();
    reader.onload = function (ev) {
      try {
        var data = JSON.parse(ev.target.result);
        // 向後相容：舊版匯出格式
        if (data.classes && !data.boards) {
          showToast(
            "ℹ️ 偵測到舊版格式。班級名稱已載入，但學生資料需從雲端讀取。",
          );
        } else if (data.boards) {
          showToast(
            "✅ 匯入成功！看板資訊已載入。\n注意：雲端資料以 Firestore 為準。",
          );
        }
        loadBoards(); // 重新從 Firestore 載入
      } catch (err) {
        showToast("❌ 匯入失敗：" + err.message);
      }
    };
    reader.readAsText(file);
    els.importFileInput.value = "";
  }

  function handleRefresh() {
    showToast("🔄 重新載入中…");
    loadBoards();
  }

  // =========================================
  // Toast
  // =========================================
  var _toastTimer = null;
  function showToast(msg) {
    if (_toastTimer) clearTimeout(_toastTimer);
    els.toast.textContent = msg;
    els.toast.classList.add("show");
    _toastTimer = setTimeout(function () {
      els.toast.classList.remove("show");
    }, 3000);
  }

  // =========================================
  // 確認彈窗
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

  // =========================================
  // Util
  // =========================================
  function _escHtml(s) {
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }
  function _escAttr(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // =========================================
  // 事件綁定
  // =========================================
  function bindEvents() {
    // 新增看板
    els.btnAddClass.addEventListener("click", addBoard);
    els.boardNameInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") addBoard();
    });

    // 刪除看板（事件委派）
    els.classList.addEventListener("click", function (e) {
      var btn = e.target.closest(".class-chip__del");
      if (!btn) return;
      var boardId = btn.getAttribute("data-board-id");
      var boardName = btn.getAttribute("data-board-name");
      if (boardId) deleteBoard(boardId, boardName);
    });

    // 篩選（事件委派）
    els.filterRow.addEventListener("click", function (e) {
      var chip = e.target.closest(".filter-chip");
      if (!chip) return;
      var filter = chip.getAttribute("data-filter");
      if (filter === "all") {
        _currentBoardId = null;
      } else {
        _currentBoardId = filter;
      }
      renderFilters();
      loadEntries(_currentBoardId);
    });

    // 匯出
    els.btnExport.addEventListener("click", handleExport);

    // 匯入（改為重新整理）
    els.btnImport.addEventListener("click", function () {
      els.importFileInput.click();
    });
    els.importFileInput.addEventListener("change", handleImport);

    // 清除改為重新整理
    els.btnClearAll.addEventListener("click", handleRefresh);
  }

  // =========================================
  // 渲染全部
  // =========================================
  function renderAll() {
    renderBoards();
    renderFilters();
    // 自動載入所有看板的成績
    loadEntries(_currentBoardId);
  }

  // =========================================
  // Init
  // =========================================
  function init() {
    cacheDom();
    bindEvents();
    initAuth();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
