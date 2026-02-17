(function () {
  "use strict";

  var _currentBoardId = null;
  var _currentCode = null;
  var _currentShareUrl = null;
  var _unsubscribe = null;
  var _isOwner = false;
  var _importParsedData = null;

  // DOM
  var boardNameInput = document.getElementById("boardNameInput");
  var joinCodeInput = document.getElementById("joinCodeInput");
  var boardSetup = document.getElementById("boardSetup");
  var shareMethods = document.getElementById("shareMethods");
  var liveRankingContainer = document.getElementById("liveRankingContainer");
  var liveStatsContainer = document.getElementById("liveStatsContainer");
  var boardActions = document.getElementById("boardActions");
  var deleteRulesLive = document.getElementById("deleteRulesLive");
  var boardNameDisplay = document.getElementById("boardNameDisplay");
  var myBoardsSection = document.getElementById("myBoardsSection");
  var myBoardsList = document.getElementById("myBoardsList");

  // === 初始化 ===
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      _checkUrlParams();
      _loadMyBoards();
    }
  });

  function _checkUrlParams() {
    var params = new URLSearchParams(window.location.search);
    var boardId = params.get("board");
    var code = params.get("code");
    if (boardId) _openBoard(boardId, code);
  }

  // === Tab 切換 ===
  var tabs = document.querySelectorAll(".mode-tab");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("active");
      });
      tab.classList.add("active");
      document.querySelectorAll(".panel").forEach(function (p) {
        p.classList.remove("active");
      });
      document
        .getElementById(
          tab.getAttribute("data-panel") === "live"
            ? "panelLive"
            : "panelImport",
        )
        .classList.add("active");
    });
  });

  // === 建立看板 ===
  document
    .getElementById("btnCreateBoard")
    .addEventListener("click", function () {
      var name = boardNameInput.value.trim();
      if (!name) {
        boardNameInput.style.borderColor = "#e74c3c";
        boardNameInput.focus();
        return;
      }
      this.disabled = true;
      this.textContent = "建立中…";
      var btn = this;

      FirestoreLeaderboard.createClassBoard(name)
        .then(function (result) {
          _currentBoardId = result.boardId;
          _currentCode = result.code;
          _currentShareUrl = result.shareUrl;
          _isOwner = true;
          _showBoardUI(name, result.code, result.shareUrl);
          _startListening(result.boardId);
          _loadMyBoards();
          _toast("✅ 看板已建立！");
        })
        .catch(function (err) {
          alert("❌ 建立失敗：" + err.message);
        })
        .finally(function () {
          btn.disabled = false;
          btn.textContent = "建立";
        });
    });

  // === 加入看板 ===
  document
    .getElementById("btnJoinBoard")
    .addEventListener("click", function () {
      var code = joinCodeInput.value.trim().toUpperCase();
      if (!code || code.length < 4) {
        joinCodeInput.style.borderColor = "#e74c3c";
        joinCodeInput.focus();
        return;
      }
      this.disabled = true;
      this.textContent = "搜尋中…";
      var btn = this;

      FirestoreLeaderboard.findBoardByCode(code)
        .then(function (board) {
          if (!board) {
            alert("⚠️ 找不到此代碼對應的看板");
            return;
          }
          _currentBoardId = board.boardId;
          _currentCode = board.code;
          _isOwner = board.ownerId === firebase.auth().currentUser.uid;
          var shareUrl =
            window.location.origin +
            "/leaderboard/class.html?board=" +
            board.boardId +
            "&code=" +
            board.code;
          _currentShareUrl = shareUrl;
          _showBoardUI(board.boardName, board.code, shareUrl);
          _startListening(board.boardId);
          _toast("✅ 已加入看板！");
        })
        .catch(function (err) {
          alert("❌ 查詢失敗：" + err.message);
        })
        .finally(function () {
          btn.disabled = false;
          btn.textContent = "加入";
        });
    });

  // === 看板 UI ===
  function _showBoardUI(boardName, code, shareUrl) {
    boardSetup.style.display = "none";
    shareMethods.classList.add("visible");
    boardActions.style.display = "";
    deleteRulesLive.style.display = "";
    boardNameDisplay.textContent = "📋 " + boardName;
    boardNameDisplay.style.display = "";
    document.getElementById("shareCode").textContent = code;
    document.getElementById("shareLink").textContent = shareUrl;

    var qrContainer = document.getElementById("shareQR");
    qrContainer.innerHTML = "";
    if (typeof QRCode !== "undefined") {
      QRCode.toCanvas(
        shareUrl,
        { width: 150, margin: 1 },
        function (err, canvas) {
          if (!err) qrContainer.appendChild(canvas);
        },
      );
    }
    if (!_isOwner) {
      var db = boardActions.querySelector(".btn-danger");
      if (db) db.style.display = "none";
    }
  }

  function _openBoard(boardId, code) {
    FirestoreLeaderboard.findBoardByCode(code || "")
      .then(function (board) {
        // findBoardByCode 可能找不到（如只有 boardId 沒有 code）
        // 此時直接用 boardId 從 Firestore 讀取
        if (board && board.boardId === boardId) {
          _currentBoardId = boardId;
          _currentCode = board.code || code;
          _isOwner = board.ownerId === firebase.auth().currentUser.uid;
          var shareUrl =
            window.location.origin +
            "/leaderboard/class.html?board=" +
            boardId +
            "&code=" +
            _currentCode;
          _currentShareUrl = shareUrl;
          _showBoardUI(board.boardName, _currentCode, shareUrl);
          _startListening(boardId);
          return;
        }
        // Fallback: 直接用 boardId 讀取
        return _openBoardById(boardId, code);
      })
      .catch(function () {
        _openBoardById(boardId, code);
      });
  }

  function _openBoardById(boardId, code) {
    var db = window.firebaseServices.firestore;
    db.collection("classLeaderboards")
      .doc(boardId)
      .get()
      .then(function (doc) {
        if (!doc.exists) {
          _toast("⚠️ 看板不存在或已被刪除");
          return;
        }
        var data = doc.data();
        _currentBoardId = boardId;
        _currentCode = data.code || code;
        _isOwner = data.ownerId === firebase.auth().currentUser.uid;
        var shareUrl =
          window.location.origin +
          "/leaderboard/class.html?board=" +
          boardId +
          "&code=" +
          _currentCode;
        _currentShareUrl = shareUrl;
        _showBoardUI(data.boardName, _currentCode, shareUrl);
        _startListening(boardId);
      })
      .catch(function (err) {
        console.error("開啟看板失敗", err);
        _toast("❌ 開啟看板失敗：" + err.message);
      });
  }

  // === Firestore 即時監聽 ===
  function _startListening(boardId) {
    if (_unsubscribe) _unsubscribe();
    _unsubscribe = FirestoreLeaderboard.listenClassBoard(
      boardId,
      function (entries) {
        RankingRenderer.renderStats(liveStatsContainer, entries);
        var uid = firebase.auth().currentUser
          ? firebase.auth().currentUser.uid
          : null;
        RankingRenderer.render(liveRankingContainer, entries, {
          sortBy: "score",
          showAccuracy: true,
          showRT: true,
          showTime: true,
          highlightUid: uid,
          onDelete: _isOwner
            ? function (entryId) {
                FirestoreLeaderboard.deleteClassEntry(boardId, entryId)
                  .then(function () {
                    _toast("✅ 已刪除");
                  })
                  .catch(function (err) {
                    alert("❌ " + err.message);
                  });
              }
            : null,
          emptyText: "等待學生上傳成績…",
          emptyIcon: "📡",
        });
      },
    );
  }

  // === 我的看板列表 ===
  function _loadMyBoards() {
    FirestoreLeaderboard.getMyBoards().then(function (boards) {
      if (boards.length === 0) {
        myBoardsSection.style.display = "none";
        return;
      }
      myBoardsSection.style.display = "";
      myBoardsList.innerHTML = "";
      boards.forEach(function (board) {
        var item = document.createElement("div");
        item.className = "board-list-item";
        item.innerHTML =
          '<div><div class="board-list-item__name">' +
          _esc(board.boardName) +
          '</div><div class="board-list-item__meta">代碼：<span class="board-list-item__code">' +
          board.code +
          '</span></div></div><div style="font-size:1.2rem">→</div>';
        item.addEventListener("click", function () {
          _openBoard(board.boardId, board.code);
        });
        myBoardsList.appendChild(item);
      });
    });
  }

  // === 分享功能 ===
  window.copyCode = function () {
    if (_currentCode)
      navigator.clipboard.writeText(_currentCode).then(function () {
        _toast("✅ 代碼已複製：" + _currentCode);
      });
  };
  window.copyLink = function () {
    if (_currentShareUrl)
      navigator.clipboard.writeText(_currentShareUrl).then(function () {
        _toast("✅ 連結已複製");
      });
  };
  window.downloadQR = function () {
    var c = document.querySelector("#shareQR canvas");
    if (!c) return;
    var a = document.createElement("a");
    a.download = "班級排行榜_QR_" + _currentCode + ".png";
    a.href = c.toDataURL();
    a.click();
    _toast("✅ QR Code 已下載");
  };

  // === 看板操作 ===
  window.exportBoardCSV = function () {
    if (!_currentBoardId) return;
    FirestoreLeaderboard.getClassBoardEntries(_currentBoardId).then(
      function (entries) {
        if (!entries.length) {
          _toast("⚠️ 無資料");
          return;
        }
        var csv = "排名,暱稱,分數,正確率(%),平均RT(ms),星星,上傳時間\n";
        entries.forEach(function (e, i) {
          var t =
            e.uploadedAt && e.uploadedAt.toDate
              ? e.uploadedAt.toDate().toISOString()
              : "";
          csv +=
            i +
            1 +
            "," +
            e.nickname +
            "," +
            e.score +
            "," +
            (e.accuracy || 0) +
            "," +
            (e.avgRT || 0) +
            "," +
            (e.stars || 0) +
            "," +
            t +
            "\n";
        });
        var blob = new Blob(["\uFEFF" + csv], {
          type: "text/csv;charset=utf-8;",
        });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download =
          "班級排行榜_" +
          _currentCode +
          "_" +
          new Date().toISOString().slice(0, 10) +
          ".csv";
        a.click();
        _toast("✅ CSV 已匯出");
      },
    );
  };
  window.exportBoardPDF = function () {
    if (!liveRankingContainer) return;
    html2pdf()
      .set({
        margin: 10,
        filename: "班級排行榜_" + _currentCode + ".pdf",
        jsPDF: { unit: "mm", format: "a4" },
      })
      .from(liveRankingContainer)
      .save()
      .then(function () {
        _toast("✅ PDF 已匯出");
      });
  };
  window.screenshotBoard = function () {
    if (!liveRankingContainer) return;
    html2pdf()
      .from(liveRankingContainer)
      .toImg()
      .get("img")
      .then(function (img) {
        var a = document.createElement("a");
        a.download = "班級排行榜_" + _currentCode + ".png";
        a.href = img.src;
        a.click();
        _toast("✅ 截圖已下載");
      });
  };
  window.deleteBoard = function () {
    if (!_currentBoardId || !_isOwner) return;
    if (
      !confirm(
        "⚠️ 確定要刪除此看板嗎？\n\n刪除後所有學生成績將永久消失，無法恢復。\n建議先匯出 CSV 備份。",
      )
    )
      return;
    if (!confirm("⚠️⚠️ 再次確認刪除？")) return;
    FirestoreLeaderboard.deleteClassBoard(_currentBoardId)
      .then(function () {
        _toast("✅ 看板已刪除");
        _currentBoardId = null;
        _currentCode = null;
        if (_unsubscribe) _unsubscribe();
        shareMethods.classList.remove("visible");
        boardActions.style.display = "none";
        deleteRulesLive.style.display = "none";
        boardNameDisplay.style.display = "none";
        boardSetup.style.display = "";
        liveRankingContainer.innerHTML =
          '<div class="ranking-empty"><span class="ranking-empty__icon">📡</span><p>建立或加入看板後，排行榜將在此即時更新</p></div>';
        liveStatsContainer.style.display = "none";
        _loadMyBoards();
      })
      .catch(function (err) {
        alert("❌ " + err.message);
      });
  };

  // === 匯入模式 ===
  var importUploadZone = document.getElementById("importUploadZone");
  var importFileInput = document.getElementById("importFileInput");
  var importRankingContainer = document.getElementById(
    "importRankingContainer",
  );
  var importStatsContainer = document.getElementById("importStatsContainer");
  var importReportContainer = document.getElementById("importReportContainer");
  var importActions = document.getElementById("importActions");

  importUploadZone.addEventListener("click", function () {
    importFileInput.click();
  });
  importFileInput.addEventListener("change", function () {
    if (importFileInput.files.length) _handleImport(importFileInput.files);
  });
  importUploadZone.addEventListener("dragover", function (e) {
    e.preventDefault();
    importUploadZone.classList.add("dragover");
  });
  importUploadZone.addEventListener("dragleave", function () {
    importUploadZone.classList.remove("dragover");
  });
  importUploadZone.addEventListener("drop", function (e) {
    e.preventDefault();
    importUploadZone.classList.remove("dragover");
    if (e.dataTransfer.files.length) _handleImport(e.dataTransfer.files);
  });

  function _handleImport(fileList) {
    CsvReport.parseFiles(fileList)
      .then(function (parsed) {
        _importParsedData = parsed;
        importUploadZone.querySelector("p").textContent =
          "✅ 已匯入 " +
          fileList.length +
          " 個檔案（共 " +
          parsed.allData.length +
          " 筆資料）";
        importActions.style.display = "";
        var entries = _csvToRanking(parsed);
        RankingRenderer.renderStats(importStatsContainer, entries);
        RankingRenderer.render(importRankingContainer, entries, {
          sortBy: "score",
          showAccuracy: true,
          showRT: true,
          emptyText: "沒有一般試題資料",
        });
        CsvReport.renderReport(importReportContainer, parsed);
      })
      .catch(function (err) {
        alert("⚠️ " + err.message);
      });
  }

  function _csvToRanking(parsed) {
    var data = parsed.regularTrials || [];
    var pm = {};
    for (var i = 0; i < data.length; i++) {
      var r = data[i];
      var pid = r.Participant || "Unknown";
      if (!pm[pid])
        pm[pid] = {
          name: pid,
          total: 0,
          correct: 0,
          rtSum: 0,
          rtCount: 0,
        };
      pm[pid].total++;
      if (r.Correct === "yes") pm[pid].correct++;
      var rt = parseFloat(r["RT(ms)"]);
      if (!isNaN(rt) && rt > 0) {
        pm[pid].rtSum += rt;
        pm[pid].rtCount++;
      }
    }
    return Object.keys(pm).map(function (k) {
      var p = pm[k];
      var acc = p.total > 0 ? (p.correct / p.total) * 100 : 0;
      var avgRT = p.rtCount > 0 ? p.rtSum / p.rtCount : 0;
      return {
        nickname: p.name,
        score: Math.round(acc * 10 - avgRT / 10),
        accuracy: acc,
        avgRT: avgRT,
      };
    });
  }

  document
    .getElementById("importBtnExport")
    .addEventListener("click", function () {
      if (_importParsedData) CsvReport.exportCsv(_importParsedData);
    });
  document
    .getElementById("importBtnPdf")
    .addEventListener("click", function () {
      if (_importParsedData)
        CsvReport.exportPdf(importReportContainer, _importParsedData);
    });
  document
    .getElementById("importBtnScreenshot")
    .addEventListener("click", function () {
      if (_importParsedData) CsvReport.exportScreenshot(importReportContainer);
    });
  document
    .getElementById("importBtnClear")
    .addEventListener("click", function () {
      CsvReport.destroy();
      _importParsedData = null;
      importRankingContainer.innerHTML =
        '<div class="ranking-empty"><span class="ranking-empty__icon">📁</span><p>匯入 CSV 檔案後，排行榜將顯示在此</p></div>';
      importReportContainer.innerHTML = "";
      importStatsContainer.style.display = "none";
      importActions.style.display = "none";
      importUploadZone.querySelector("p").textContent =
        "📁 拖放 CSV 檔案到此處，或點擊選擇檔案";
      importFileInput.value = "";
      _toast("✅ 已清除");
    });

  // === 工具 ===
  function _toast(msg) {
    var t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(function () {
      t.classList.remove("show");
    }, 2500);
  }
  function _esc(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }
  window.addEventListener("beforeunload", function () {
    if (_unsubscribe) _unsubscribe();
  });
})();
