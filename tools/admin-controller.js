/**
 * ============================================
 * 開發者工具 — 管理控制器
 * ============================================
 * 功能：
 *   1. 🏠 RTDB 多人房間 — 列表 / 刪除單筆 / 清空全部
 *   2. 📚 Firestore 班級看板 — 列表 / 刪除單筆 / 清空全部
 *   3. 🌍 Firestore 世界排行榜 — 列表 / 刪除單筆 / 清空全部
 *
 * 安全說明：
 *   ─ RTDB rooms：需要 rooms/.read = "auth != null"
 *   ─ Firestore classLeaderboards：僅擁有者可刪除（ownerId == auth.uid）
 *   ─ Firestore worldLeaderboard：僅上傳者可刪除（uid == auth.uid）
 *   ─ 若當前用戶非擁有者，刪除會失敗（顯示錯誤提示）
 *
 * 依賴：firebase-bundle.js（window.firebase / window.firebaseServices）
 * ============================================
 */

(function () {
  "use strict";

  // ─── DOM 快取 ───
  var dom = {};
  var _currentUser = null;

  // ─── 狀態 ───
  var _rooms = {}; // { roomCode: roomData }
  var _boards = []; // [{ boardId, boardName, code, ownerId, ... }]
  var _worldEntries = []; // [{ docId, nickname, bestScore, uid, ... }]

  // ────────────────────────────────────
  // 初始化
  // ────────────────────────────────────

  function init() {
    cacheDom();
    bindEvents();
    waitForAuth();
  }

  function cacheDom() {
    dom.authStatus = document.getElementById("authStatus");
    dom.logArea = document.getElementById("logArea");

    // 房間
    dom.roomList = document.getElementById("roomList");
    dom.roomCount = document.getElementById("roomCount");
    dom.btnRefreshRooms = document.getElementById("btnRefreshRooms");
    dom.btnDeleteSelectedRooms = document.getElementById(
      "btnDeleteSelectedRooms",
    );
    dom.btnDeleteAllRooms = document.getElementById("btnDeleteAllRooms");

    // 班級看板
    dom.boardList = document.getElementById("boardList");
    dom.boardCount = document.getElementById("boardCount");
    dom.btnRefreshBoards = document.getElementById("btnRefreshBoards");
    dom.btnDeleteSelectedBoards = document.getElementById(
      "btnDeleteSelectedBoards",
    );
    dom.btnDeleteAllBoards = document.getElementById("btnDeleteAllBoards");

    // 世界排行榜
    dom.worldList = document.getElementById("worldList");
    dom.worldCount = document.getElementById("worldCount");
    dom.btnRefreshWorld = document.getElementById("btnRefreshWorld");
    dom.btnDeleteSelectedWorld = document.getElementById(
      "btnDeleteSelectedWorld",
    );
    dom.btnDeleteAllWorld = document.getElementById("btnDeleteAllWorld");
    dom.btnTrimWorld = document.getElementById("btnTrimWorld");

    // 本機快取清除
    dom.btnClearLocal = document.getElementById("btnClearLocal");
    dom.btnClearSession = document.getElementById("btnClearSession");
    dom.btnClearSwCache = document.getElementById("btnClearSwCache");
    dom.btnClearAll = document.getElementById("btnClearAll");
    dom.cacheLog = document.getElementById("cacheLog");
  }

  function bindEvents() {
    // 房間
    dom.btnRefreshRooms.addEventListener("click", loadRooms);
    dom.btnDeleteSelectedRooms.addEventListener("click", deleteSelectedRooms);
    dom.btnDeleteAllRooms.addEventListener("click", deleteAllRooms);

    // 班級看板
    dom.btnRefreshBoards.addEventListener("click", loadBoards);
    dom.btnDeleteSelectedBoards.addEventListener("click", deleteSelectedBoards);
    dom.btnDeleteAllBoards.addEventListener("click", deleteAllBoards);

    // 世界排行榜
    dom.btnRefreshWorld.addEventListener("click", loadWorldEntries);
    dom.btnDeleteSelectedWorld.addEventListener("click", deleteSelectedWorld);
    dom.btnDeleteAllWorld.addEventListener("click", deleteAllWorld);
    dom.btnTrimWorld.addEventListener("click", trimWorldToTop10);

    // 本機快取清除
    dom.btnClearLocal.addEventListener("click", clearLocalStorage);
    dom.btnClearSession.addEventListener("click", clearSessionStorage);
    dom.btnClearSwCache.addEventListener("click", clearSwCache);
    dom.btnClearAll.addEventListener("click", clearAllCaches);
  }

  function waitForAuth() {
    if (typeof firebase === "undefined" || !firebase.auth) {
      dom.authStatus.textContent = "❌ Firebase 未載入";
      logMsg("Firebase 未載入，請確認 firebase-bundle.js 路徑正確", "err");
      return;
    }

    firebase.auth().onAuthStateChanged(function (user) {
      _currentUser = user;
      if (user) {
        var label = user.isAnonymous
          ? "匿名使用者 (" + user.uid.substring(0, 8) + "…)"
          : user.displayName || user.email || user.uid;
        dom.authStatus.innerHTML = "✅ 已登入：<strong>" + label + "</strong>";
        logMsg("已登入：" + user.uid, "ok");

        // 自動載入所有資料
        loadRooms();
        loadBoards();
        loadWorldEntries();
      } else {
        dom.authStatus.textContent = "⏳ 等待登入…";
      }
    });
  }

  // ────────────────────────────────────
  // 📋 操作記錄
  // ────────────────────────────────────

  function logMsg(msg, type) {
    var span = document.createElement("span");
    span.className = "log-" + (type || "info");
    var now = new Date();
    var time =
      String(now.getHours()).padStart(2, "0") +
      ":" +
      String(now.getMinutes()).padStart(2, "0") +
      ":" +
      String(now.getSeconds()).padStart(2, "0");
    span.textContent = "[" + time + "] " + msg;

    // 移除初始提示
    if (
      dom.logArea.firstChild &&
      dom.logArea.children.length === 1 &&
      dom.logArea.firstChild.textContent === "等待操作…"
    ) {
      dom.logArea.innerHTML = "";
    }

    dom.logArea.appendChild(span);
    dom.logArea.appendChild(document.createElement("br"));
    dom.logArea.scrollTop = dom.logArea.scrollHeight;
  }

  // ════════════════════════════════════
  // 🏠 RTDB 多人房間
  // ════════════════════════════════════

  function loadRooms() {
    dom.roomList.innerHTML = '<div class="empty">載入中…</div>';
    logMsg("正在載入房間資料…", "info");

    var db = firebase.database();
    db.ref("rooms")
      .once("value")
      .then(function (snapshot) {
        _rooms = snapshot.val() || {};
        renderRooms();
        var count = Object.keys(_rooms).length;
        dom.roomCount.textContent = count + " 筆";
        logMsg("房間載入完成：" + count + " 筆", "ok");
      })
      .catch(function (err) {
        dom.roomList.innerHTML =
          '<div class="empty">⚠️ 無法讀取房間（可能需要更新 RTDB 規則）<br><small>' +
          err.message +
          "</small></div>";
        dom.roomCount.textContent = "讀取失敗";
        logMsg("房間載入失敗：" + err.message, "err");
      });
  }

  function renderRooms() {
    var codes = Object.keys(_rooms);
    if (codes.length === 0) {
      dom.roomList.innerHTML = '<div class="empty">🎉 沒有任何房間</div>';
      dom.btnDeleteSelectedRooms.disabled = true;
      dom.btnDeleteAllRooms.disabled = true;
      return;
    }

    dom.btnDeleteAllRooms.disabled = false;

    // 全選列
    var html =
      '<div class="select-all-row">' +
      '<input type="checkbox" id="selectAllRooms" onchange="AdminTool.toggleAllRooms(this.checked)">' +
      '<label for="selectAllRooms">全選</label></div>';

    codes.forEach(function (code) {
      var room = _rooms[code];
      var now = Date.now();
      var isExpired = room.expiresAt && room.expiresAt < now;
      var statusLabel = isExpired
        ? "🔴 已過期"
        : room.status === "playing"
          ? "🟢 進行中"
          : room.status === "finished"
            ? "🏁 已結束"
            : "🟡 等候中";

      var playerCount = room.players ? Object.keys(room.players).length : 0;
      var createdStr = room.createdAt
        ? new Date(room.createdAt).toLocaleString("zh-TW")
        : "—";

      html +=
        '<div class="data-item">' +
        '<input type="checkbox" class="room-cb" value="' +
        code +
        '" onchange="AdminTool.updateRoomSelection()">' +
        '<div class="info">' +
        '<div class="name">🏠 ' +
        code +
        " " +
        statusLabel +
        "</div>" +
        '<div class="meta">' +
        "建立：" +
        createdStr +
        " ｜ 玩家：" +
        playerCount +
        (room.roomName ? " ｜ " + room.roomName : "") +
        "</div></div>" +
        '<button class="btn-delete" onclick="AdminTool.deleteRoom(\'' +
        code +
        "')\">" +
        "刪除</button></div>";
    });

    dom.roomList.innerHTML = html;
  }

  function deleteRoom(code) {
    if (!confirm("確定刪除房間 " + code + "？")) return;
    logMsg("正在刪除房間 " + code + "…", "info");

    firebase
      .database()
      .ref("rooms/" + code)
      .remove()
      .then(function () {
        delete _rooms[code];
        renderRooms();
        dom.roomCount.textContent = Object.keys(_rooms).length + " 筆";
        logMsg("✅ 房間 " + code + " 已刪除", "ok");
      })
      .catch(function (err) {
        logMsg("❌ 刪除房間 " + code + " 失敗：" + err.message, "err");
      });
  }

  function deleteSelectedRooms() {
    var checked = document.querySelectorAll(".room-cb:checked");
    if (checked.length === 0) return;
    if (!confirm("確定刪除 " + checked.length + " 個房間？")) return;

    logMsg("正在刪除 " + checked.length + " 個房間…", "info");
    var promises = [];
    checked.forEach(function (cb) {
      var code = cb.value;
      promises.push(
        firebase
          .database()
          .ref("rooms/" + code)
          .remove()
          .then(function () {
            delete _rooms[code];
            logMsg("✅ " + code + " 已刪除", "ok");
          })
          .catch(function (err) {
            logMsg("❌ " + code + " 刪除失敗：" + err.message, "err");
          }),
      );
    });

    Promise.all(promises).then(function () {
      renderRooms();
      dom.roomCount.textContent = Object.keys(_rooms).length + " 筆";
      logMsg("批次刪除完成", "ok");
    });
  }

  function deleteAllRooms() {
    var count = Object.keys(_rooms).length;
    if (count === 0) return;
    if (
      !confirm(
        "⚠️ 即將刪除全部 " + count + " 個房間！\n\n此操作不可復原，確定嗎？",
      )
    )
      return;

    logMsg("正在清空全部房間…", "info");

    // 逐筆刪除（避免整個 rooms 節點被權限阻擋）
    var promises = [];
    Object.keys(_rooms).forEach(function (code) {
      promises.push(
        firebase
          .database()
          .ref("rooms/" + code)
          .remove()
          .then(function () {
            logMsg("✅ " + code, "ok");
          })
          .catch(function (err) {
            logMsg("❌ " + code + "：" + err.message, "err");
          }),
      );
    });

    Promise.all(promises).then(function () {
      _rooms = {};
      renderRooms();
      dom.roomCount.textContent = "0 筆";
      logMsg("全部房間清空完成", "ok");
    });
  }

  function toggleAllRooms(checked) {
    var cbs = document.querySelectorAll(".room-cb");
    cbs.forEach(function (cb) {
      cb.checked = checked;
    });
    updateRoomSelection();
  }

  function updateRoomSelection() {
    var checked = document.querySelectorAll(".room-cb:checked");
    dom.btnDeleteSelectedRooms.disabled = checked.length === 0;
  }

  // ════════════════════════════════════
  // 📚 Firestore 班級看板
  // ════════════════════════════════════

  function loadBoards() {
    dom.boardList.innerHTML = '<div class="empty">載入中…</div>';
    logMsg("正在載入班級看板…", "info");

    var db = firebase.firestore();
    db.collection("classLeaderboards")
      .get()
      .then(function (snapshot) {
        _boards = [];
        snapshot.forEach(function (doc) {
          var data = doc.data();
          data.boardId = doc.id;
          _boards.push(data);
        });
        renderBoards();
        dom.boardCount.textContent = _boards.length + " 筆";
        logMsg("班級看板載入完成：" + _boards.length + " 筆", "ok");
      })
      .catch(function (err) {
        dom.boardList.innerHTML =
          '<div class="empty">⚠️ 無法讀取班級看板<br><small>' +
          err.message +
          "</small></div>";
        dom.boardCount.textContent = "讀取失敗";
        logMsg("班級看板載入失敗：" + err.message, "err");
      });
  }

  function renderBoards() {
    if (_boards.length === 0) {
      dom.boardList.innerHTML = '<div class="empty">🎉 沒有任何班級看板</div>';
      dom.btnDeleteSelectedBoards.disabled = true;
      dom.btnDeleteAllBoards.disabled = true;
      return;
    }

    dom.btnDeleteAllBoards.disabled = false;

    var html =
      '<div class="select-all-row">' +
      '<input type="checkbox" id="selectAllBoards" onchange="AdminTool.toggleAllBoards(this.checked)">' +
      '<label for="selectAllBoards">全選</label></div>';

    _boards.forEach(function (board, idx) {
      var isOwner = _currentUser && board.ownerId === _currentUser.uid;
      var createdStr =
        board.createdAt && board.createdAt.toDate
          ? board.createdAt.toDate().toLocaleString("zh-TW")
          : "—";

      html +=
        '<div class="data-item">' +
        '<input type="checkbox" class="board-cb" value="' +
        idx +
        '" onchange="AdminTool.updateBoardSelection()">' +
        '<div class="info">' +
        '<div class="name">📚 ' +
        (board.boardName || "未命名") +
        (isOwner
          ? ' <span style="color:#81c784;font-size:0.7rem">👤 我的</span>'
          : "") +
        "</div>" +
        '<div class="meta">' +
        "代碼：" +
        (board.code || "—") +
        " ｜ 建立：" +
        createdStr +
        " ｜ 紀錄：" +
        (board.entryCount || 0) +
        " 筆" +
        " ｜ ID：" +
        board.boardId.substring(0, 8) +
        "…" +
        "</div></div>" +
        '<button class="btn-delete" onclick="AdminTool.deleteBoard(' +
        idx +
        ')">' +
        "刪除</button></div>";
    });

    dom.boardList.innerHTML = html;
  }

  function deleteBoard(idx) {
    var board = _boards[idx];
    if (!board) return;
    if (
      !confirm(
        "確定刪除看板「" +
          board.boardName +
          "」（" +
          board.code +
          "）？\n含所有成績紀錄，不可復原。",
      )
    )
      return;

    logMsg("正在刪除看板 " + board.boardName + "…", "info");

    var db = firebase.firestore();

    // 先刪所有 entries，再刪看板本身
    db.collection("classLeaderboards")
      .doc(board.boardId)
      .collection("entries")
      .get()
      .then(function (snapshot) {
        var batch = db.batch();
        snapshot.forEach(function (doc) {
          batch.delete(doc.ref);
        });
        return batch.commit();
      })
      .then(function () {
        return db.collection("classLeaderboards").doc(board.boardId).delete();
      })
      .then(function () {
        _boards.splice(idx, 1);
        renderBoards();
        dom.boardCount.textContent = _boards.length + " 筆";
        logMsg("✅ 看板「" + board.boardName + "」已刪除", "ok");
      })
      .catch(function (err) {
        logMsg("❌ 刪除看板失敗：" + err.message, "err");
        if (err.code === "permission-denied") {
          logMsg(
            "💡 提示：只有看板擁有者可刪除。可用 Firebase CLI：firebase firestore:delete classLeaderboards/" +
              board.boardId +
              " -r",
            "info",
          );
        }
      });
  }

  function deleteSelectedBoards() {
    var checked = document.querySelectorAll(".board-cb:checked");
    if (checked.length === 0) return;
    if (
      !confirm(
        "確定刪除 " + checked.length + " 個看板及其所有成績？\n不可復原。",
      )
    )
      return;

    logMsg("正在批次刪除 " + checked.length + " 個看板…", "info");

    // 收集需要刪除的索引（由大到小排序，避免 splice 影響索引）
    var indices = [];
    checked.forEach(function (cb) {
      indices.push(parseInt(cb.value, 10));
    });
    indices.sort(function (a, b) {
      return b - a;
    });

    var chain = Promise.resolve();
    indices.forEach(function (idx) {
      chain = chain.then(function () {
        return deleteBoardByIndex(idx);
      });
    });

    chain.then(function () {
      renderBoards();
      dom.boardCount.textContent = _boards.length + " 筆";
      logMsg("批次刪除完成", "ok");
    });
  }

  function deleteBoardByIndex(idx) {
    var board = _boards[idx];
    if (!board) return Promise.resolve();

    var db = firebase.firestore();
    return db
      .collection("classLeaderboards")
      .doc(board.boardId)
      .collection("entries")
      .get()
      .then(function (snapshot) {
        var batch = db.batch();
        snapshot.forEach(function (doc) {
          batch.delete(doc.ref);
        });
        return batch.commit();
      })
      .then(function () {
        return db.collection("classLeaderboards").doc(board.boardId).delete();
      })
      .then(function () {
        _boards.splice(idx, 1);
        logMsg("✅ " + board.boardName, "ok");
      })
      .catch(function (err) {
        logMsg("❌ " + board.boardName + "：" + err.message, "err");
      });
  }

  function deleteAllBoards() {
    if (_boards.length === 0) return;
    if (
      !confirm(
        "⚠️ 即將刪除全部 " +
          _boards.length +
          " 個班級看板！\n\n含所有成績紀錄，此操作不可復原，確定嗎？",
      )
    )
      return;

    logMsg("正在清空全部看板…", "info");

    var chain = Promise.resolve();
    // 逐筆刪除（從最後一筆開始）
    for (var i = _boards.length - 1; i >= 0; i--) {
      (function (idx) {
        chain = chain.then(function () {
          return deleteBoardByIndex(idx);
        });
      })(i);
    }

    chain.then(function () {
      _boards = [];
      renderBoards();
      dom.boardCount.textContent = "0 筆";
      logMsg("全部看板清空完成", "ok");
    });
  }

  function toggleAllBoards(checked) {
    var cbs = document.querySelectorAll(".board-cb");
    cbs.forEach(function (cb) {
      cb.checked = checked;
    });
    updateBoardSelection();
  }

  function updateBoardSelection() {
    var checked = document.querySelectorAll(".board-cb:checked");
    dom.btnDeleteSelectedBoards.disabled = checked.length === 0;
  }

  // ════════════════════════════════════
  // 🌍 世界排行榜
  // ════════════════════════════════════

  function loadWorldEntries() {
    dom.worldList.innerHTML = '<div class="empty">載入中…</div>';
    logMsg("正在載入世界排行榜…", "info");

    var db = firebase.firestore();
    db.collection("worldLeaderboard")
      .get()
      .then(function (snapshot) {
        _worldEntries = [];
        snapshot.forEach(function (doc) {
          var data = doc.data();
          data.docId = doc.id;
          _worldEntries.push(data);
        });
        // 按 bestScore 降序排列
        _worldEntries.sort(function (a, b) {
          return (b.bestScore || 0) - (a.bestScore || 0);
        });
        renderWorldEntries();
        dom.worldCount.textContent = _worldEntries.length + " 筆";
        logMsg("世界排行榜載入完成：" + _worldEntries.length + " 筆", "ok");
      })
      .catch(function (err) {
        dom.worldList.innerHTML =
          '<div class="empty">⚠️ 無法讀取世界排行榜<br><small>' +
          err.message +
          "</small></div>";
        dom.worldCount.textContent = "讀取失敗";
        logMsg("世界排行榜載入失敗：" + err.message, "err");
      });
  }

  function renderWorldEntries() {
    if (_worldEntries.length === 0) {
      dom.worldList.innerHTML =
        '<div class="empty">🎉 沒有任何排行榜紀錄</div>';
      dom.btnDeleteSelectedWorld.disabled = true;
      dom.btnDeleteAllWorld.disabled = true;
      return;
    }

    dom.btnDeleteAllWorld.disabled = false;

    var html =
      '<div class="select-all-row">' +
      '<input type="checkbox" id="selectAllWorld" onchange="AdminTool.toggleAllWorld(this.checked)">' +
      '<label for="selectAllWorld">全選</label></div>';

    _worldEntries.forEach(function (entry, idx) {
      var isOwner = _currentUser && entry.uid === _currentUser.uid;
      var updatedStr =
        entry.updatedAt && entry.updatedAt.toDate
          ? entry.updatedAt.toDate().toLocaleString("zh-TW") +
            "." + String(entry.updatedAt.toDate().getMilliseconds()).padStart(3, "0")
          : "—";

      var gameEndStr = entry.gameEndTime
        ? new Date(entry.gameEndTime).toLocaleString("zh-TW") +
          "." + String(new Date(entry.gameEndTime).getMilliseconds()).padStart(3, "0")
        : "—";

      var ruleLabel = entry.fieldId
        ? entry.fieldId + "/" + entry.ruleId
        : "舊版格式";

      html +=
        '<div class="data-item">' +
        '<input type="checkbox" class="world-cb" value="' +
        idx +
        '" onchange="AdminTool.updateWorldSelection()">' +
        '<div class="info">' +
        '<div class="name">🌍 ' +
        (entry.nickname || "匿名") +
        " — " +
        (entry.bestScore || 0) +
        " 分" +
        (isOwner
          ? ' <span style="color:#81c784;font-size:0.7rem">👤 我的</span>'
          : "") +
        "</div>" +
        '<div class="meta">' +
        "規則：" +
        ruleLabel +
        " ｜ 遊戲結束：" +
        gameEndStr +
        " ｜ 更新：" +
        updatedStr +
        " ｜ UID：" +
        (entry.uid || "—").substring(0, 8) +
        "…" +
        "</div></div>" +
        '<button class="btn-delete" onclick="AdminTool.deleteWorldEntry(' +
        idx +
        ')">' +
        "刪除</button></div>";
    });

    dom.worldList.innerHTML = html;
  }

  function deleteWorldEntry(idx) {
    var entry = _worldEntries[idx];
    if (!entry) return;
    if (!confirm("確定刪除「" + entry.nickname + "」的紀錄？")) return;

    logMsg("正在刪除世界排行榜紀錄…", "info");

    firebase
      .firestore()
      .collection("worldLeaderboard")
      .doc(entry.docId)
      .delete()
      .then(function () {
        _worldEntries.splice(idx, 1);
        renderWorldEntries();
        dom.worldCount.textContent = _worldEntries.length + " 筆";
        logMsg("✅ 「" + entry.nickname + "」紀錄已刪除", "ok");
      })
      .catch(function (err) {
        logMsg("❌ 刪除失敗：" + err.message, "err");
        if (err.code === "permission-denied") {
          logMsg(
            "💡 提示：只能刪除自己的紀錄。可用 Firebase CLI：firebase firestore:delete worldLeaderboard/" +
              entry.docId,
            "info",
          );
        }
      });
  }

  function deleteSelectedWorld() {
    var checked = document.querySelectorAll(".world-cb:checked");
    if (checked.length === 0) return;
    if (!confirm("確定刪除 " + checked.length + " 筆排行榜紀錄？")) return;

    logMsg("正在批次刪除 " + checked.length + " 筆…", "info");

    var indices = [];
    checked.forEach(function (cb) {
      indices.push(parseInt(cb.value, 10));
    });
    indices.sort(function (a, b) {
      return b - a;
    });

    var chain = Promise.resolve();
    indices.forEach(function (idx) {
      chain = chain.then(function () {
        var entry = _worldEntries[idx];
        if (!entry) return Promise.resolve();
        return firebase
          .firestore()
          .collection("worldLeaderboard")
          .doc(entry.docId)
          .delete()
          .then(function () {
            _worldEntries.splice(idx, 1);
            logMsg("✅ " + entry.nickname, "ok");
          })
          .catch(function (err) {
            logMsg("❌ " + entry.nickname + "：" + err.message, "err");
          });
      });
    });

    chain.then(function () {
      renderWorldEntries();
      dom.worldCount.textContent = _worldEntries.length + " 筆";
      logMsg("批次刪除完成", "ok");
    });
  }

  function deleteAllWorld() {
    if (_worldEntries.length === 0) return;
    if (
      !confirm(
        "⚠️ 即將刪除全部 " +
          _worldEntries.length +
          " 筆世界排行榜紀錄！\n\n此操作不可復原，確定嗎？",
      )
    )
      return;

    logMsg("正在清空世界排行榜…", "info");

    var chain = Promise.resolve();
    for (var i = _worldEntries.length - 1; i >= 0; i--) {
      (function (idx) {
        chain = chain.then(function () {
          var entry = _worldEntries[idx];
          if (!entry) return Promise.resolve();
          return firebase
            .firestore()
            .collection("worldLeaderboard")
            .doc(entry.docId)
            .delete()
            .then(function () {
              logMsg("✅ " + entry.nickname, "ok");
            })
            .catch(function (err) {
              logMsg("❌ " + entry.nickname + "：" + err.message, "err");
            });
        });
      })(i);
    }

    chain.then(function () {
      _worldEntries = [];
      renderWorldEntries();
      dom.worldCount.textContent = "0 筆";
      logMsg("世界排行榜清空完成", "ok");
    });
  }

  function toggleAllWorld(checked) {
    var cbs = document.querySelectorAll(".world-cb");
    cbs.forEach(function (cb) {
      cb.checked = checked;
    });
    updateWorldSelection();
  }

  function updateWorldSelection() {
    var checked = document.querySelectorAll(".world-cb:checked");
    dom.btnDeleteSelectedWorld.disabled = checked.length === 0;
  }

  // ────────────────────────────────────
  // 全域匯出（供 onclick 使用）
  // ────────────────────────────────────

  // ────────────────────────────────────
  // ✂️ 世界排行榜修剪至前 10 名
  // ────────────────────────────────────

  function trimWorldToTop10() {
    if (
      typeof FirestoreLeaderboard === "undefined" ||
      !FirestoreLeaderboard.trimWorldToTop10
    ) {
      logMsg("FirestoreLeaderboard.trimWorldToTop10 不可用", "err");
      return;
    }
    logMsg("✂️ 開始修剪世界排行榜至前 10 名…", "info");
    FirestoreLeaderboard.trimWorldToTop10()
      .then(function () {
        logMsg("✅ 世界排行榜修剪完成（僅保留前 10 名）", "ok");
        loadWorldEntries(); // 重新整理列表
      })
      .catch(function (e) {
        logMsg("❌ 修剪失敗：" + e.message, "err");
      });
  }

  // ────────────────────────────────────
  // 🧹 本機快取清除
  // ────────────────────────────────────

  function cacheLog(msg, type) {
    var span = document.createElement("span");
    span.className = "log-" + (type || "info");
    var now = new Date();
    var time =
      String(now.getHours()).padStart(2, "0") +
      ":" +
      String(now.getMinutes()).padStart(2, "0") +
      ":" +
      String(now.getSeconds()).padStart(2, "0");
    span.textContent = "[" + time + "] " + msg;
    dom.cacheLog.appendChild(document.createElement("br"));
    dom.cacheLog.appendChild(span);
    dom.cacheLog.scrollTop = dom.cacheLog.scrollHeight;
  }

  function clearLocalStorage() {
    try {
      var count = localStorage.length;
      localStorage.clear();
      cacheLog("✅ localStorage 已清除（" + count + " 筆）", "ok");
      logMsg("localStorage 已清除（" + count + " 筆）", "ok");
    } catch (e) {
      cacheLog("❌ localStorage 清除失敗：" + e.message, "err");
    }
  }

  function clearSessionStorage() {
    try {
      var count = sessionStorage.length;
      sessionStorage.clear();
      cacheLog("✅ sessionStorage 已清除（" + count + " 筆）", "ok");
      logMsg("sessionStorage 已清除（" + count + " 筆）", "ok");
    } catch (e) {
      cacheLog("❌ sessionStorage 清除失敗：" + e.message, "err");
    }
  }

  function clearSwCache() {
    if (!("caches" in window)) {
      cacheLog("⚠️ 此瀏覽器不支援 Cache API", "err");
      return Promise.resolve();
    }
    return caches
      .keys()
      .then(function (names) {
        if (names.length === 0) {
          cacheLog("ℹ️ 沒有找到任何 SW 快取", "info");
          return;
        }
        return Promise.all(
          names.map(function (name) {
            return caches.delete(name).then(function () {
              cacheLog("✅ 已刪除快取：" + name, "ok");
            });
          }),
        ).then(function () {
          cacheLog("✅ 全部 SW 快取已清除（" + names.length + " 個）", "ok");
          logMsg("SW 快取已清除（" + names.length + " 個）", "ok");
          // 同時取消 Service Worker 註冊
          if ("serviceWorker" in navigator) {
            return navigator.serviceWorker
              .getRegistrations()
              .then(function (regs) {
                return Promise.all(
                  regs.map(function (reg) {
                    return reg.unregister().then(function () {
                      cacheLog(
                        "✅ 已取消 SW 註冊：" +
                          ((reg.active && reg.active.scriptURL) || "unknown"),
                        "ok",
                      );
                    });
                  }),
                );
              });
          }
        });
      })
      .catch(function (e) {
        cacheLog("❌ SW 快取清除失敗：" + e.message, "err");
      });
  }

  function clearAllCaches() {
    cacheLog("🔄 開始一鍵全部清除…", "info");
    clearLocalStorage();
    clearSessionStorage();
    clearSwCache().then(function () {
      cacheLog("🎉 全部清除完成！", "ok");
      logMsg(
        "一鍵清除全部完成（localStorage + sessionStorage + SW 快取）",
        "ok",
      );
    });
  }

  window.AdminTool = {
    deleteRoom: deleteRoom,
    deleteBoard: deleteBoard,
    deleteWorldEntry: deleteWorldEntry,
    toggleAllRooms: toggleAllRooms,
    toggleAllBoards: toggleAllBoards,
    toggleAllWorld: toggleAllWorld,
    updateRoomSelection: updateRoomSelection,
    updateBoardSelection: updateBoardSelection,
    updateWorldSelection: updateWorldSelection,
  };

  // ── 啟動 ──
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
