/**
 * ============================================
 * 觀察紀錄表 — 控制器
 * ============================================
 * 功能：
 *   1. ☁️ 上傳到 Firestore（observationRecords 集合）
 *   2. 💾 儲存到 localStorage
 *   3. 📄 匯出 CSV（含 BOM，Excel 可正確顯示中文）
 *   4. 📋 匯出 JSON
 *
 * 依賴：firebase-bundle.js（window.firebase）
 * ============================================
 */

(function () {
  "use strict";

  var STORAGE_KEY = "ef-observation-records";
  var CSV_HEADERS =
    "回饋者身份,事前準備,日期,時間,兒童/回饋者代碼,年齡(歲),年齡(月),性別,聽力狀況,溝通方式,場域,完成關卡,總耗時(分鐘),休息次數,觀察重點,規則理解度,規則切換適應,操作順暢度,情緒與投入度,UI問題回報,兒童回饋摘要,綜合觀察紀錄,特殊備註,操作易用性回饋,兒童反應觀察,改善建議,施測者,儲存時間";

  var dom = {};

  var _viewingRecord = null;   // { source: "local"|"server", index: number, docId: string|null, data: {} }
  var _isEditing = false;

  // ────────────────────────────────────
  // 初始化
  // ────────────────────────────────────

  function init() {
    cacheDom();
    bindEvents();
    setDefaults();
    renderSavedRecords();
  }

  function cacheDom() {
    dom.obsDate = document.getElementById("obsDate");
    dom.obsTime = document.getElementById("obsTime");
    dom.obsChildCode = document.getElementById("obsChildCode");
    dom.obsRoleOtherText = document.getElementById("obsRoleOtherText");
    dom.obsTester = document.getElementById("obsTester");
    dom.obsAgeY = document.getElementById("obsAgeY");
    dom.obsAgeM = document.getElementById("obsAgeM");
    dom.obsVenueOtherText = document.getElementById("obsVenueOtherText");
    dom.obsTotalTime = document.getElementById("obsTotalTime");
    dom.obsBreaks = document.getElementById("obsBreaks");
    dom.obsRuleUnderstand = document.getElementById("obsRuleUnderstand");
    dom.obsRuleSwitch = document.getElementById("obsRuleSwitch");
    dom.obsOperation = document.getElementById("obsOperation");
    dom.obsEmotion = document.getElementById("obsEmotion");
    dom.obsUIIssue = document.getElementById("obsUIIssue");
    dom.obsChildFeedback = document.getElementById("obsChildFeedback");
    dom.obsNotes = document.getElementById("obsNotes");
    dom.obsSpecial = document.getElementById("obsSpecial");
    dom.obsParentUsability = document.getElementById("obsParentUsability");
    dom.obsParentChildReaction = document.getElementById(
      "obsParentChildReaction",
    );
    dom.obsParentSuggestion = document.getElementById("obsParentSuggestion");
    dom.obsMsg = document.getElementById("obsMsg");
    dom.obsSavedList = document.getElementById("obsSavedList");
    dom.obsSavedCount = document.getElementById("obsSavedCount");
    dom.obsServerList = document.getElementById("obsServerList");
    dom.obsServerCount = document.getElementById("obsServerCount");

    dom.btnObsUpload = document.getElementById("btnObsUpload");
    dom.btnObsSaveLocal = document.getElementById("btnObsSaveLocal");
    dom.btnObsExportCSV = document.getElementById("btnObsExportCSV");
    dom.btnObsExportJSON = document.getElementById("btnObsExportJSON");
    dom.btnObsExportAllCSV = document.getElementById("btnObsExportAllCSV");
    dom.btnObsExportAllJSON = document.getElementById("btnObsExportAllJSON");
    dom.btnObsClearAll = document.getElementById("btnObsClearAll");
    dom.btnObsLoadServer = document.getElementById("btnObsLoadServer");
    dom.btnObsDeleteSelectedServer = document.getElementById(
      "btnObsDeleteSelectedServer",
    );
    dom.btnObsDeleteAllServer = document.getElementById(
      "btnObsDeleteAllServer",
    );

    // Modal elements
    dom.obsDetailModal = document.getElementById("obsDetailModal");
    dom.obsModalTitle = document.getElementById("obsModalTitle");
    dom.obsModalBody = document.getElementById("obsModalBody");
    dom.btnObsEdit = document.getElementById("btnObsEdit");
    dom.btnObsSave = document.getElementById("btnObsSave");
    dom.btnObsCancel = document.getElementById("btnObsCancel");
    dom.btnObsModalClose = document.getElementById("btnObsModalClose");
    dom.btnObsModalDone = document.getElementById("btnObsModalDone");
  }

  function bindEvents() {
    dom.btnObsUpload.addEventListener("click", uploadToServer);
    dom.btnObsSaveLocal.addEventListener("click", saveToLocal);
    dom.btnObsExportCSV.addEventListener("click", exportCurrentCSV);
    dom.btnObsExportJSON.addEventListener("click", exportCurrentJSON);
    dom.btnObsExportAllCSV.addEventListener("click", exportAllCSV);
    dom.btnObsExportAllJSON.addEventListener("click", exportAllJSON);
    dom.btnObsClearAll.addEventListener("click", clearAllLocal);
    dom.btnObsLoadServer.addEventListener("click", loadServerRecords);
    dom.btnObsDeleteSelectedServer.addEventListener(
      "click",
      deleteSelectedServer,
    );
    dom.btnObsDeleteAllServer.addEventListener("click", deleteAllServer);

    // 回饋者身份切換 → 自動預填代碼
    var ROLE_PREFIX = { P0: "P0", P1: "P1", P2: "P2", P9: "P9" };
    document.querySelectorAll('input[name="obsRole"]').forEach(function (r) {
      r.addEventListener("change", function () {
        var prefix = ROLE_PREFIX[r.value] || "P0";
        dom.obsChildCode.value = prefix + "0";
        if (r.value === "P9" && dom.obsRoleOtherText) {
          dom.obsRoleOtherText.focus();
        }
      });
    });
    // 其它身份文字欄 focus 自動選中 P9 radio
    if (dom.obsRoleOtherText) {
      dom.obsRoleOtherText.addEventListener("focus", function () {
        var p9 = document.querySelector('input[name="obsRole"][value="P9"]');
        if (p9 && !p9.checked) {
          p9.checked = true;
          dom.obsChildCode.value = "P90";
        }
      });
    }

    // 「其它」場域：選中 radio 時自動 focus 文字欄
    var venueOtherRadio = document.getElementById("obsVenueOther");
    if (venueOtherRadio) {
      venueOtherRadio.addEventListener("change", function () {
        dom.obsVenueOtherText.focus();
      });
      dom.obsVenueOtherText.addEventListener("focus", function () {
        venueOtherRadio.checked = true;
      });
    }

    // Modal 按鈕事件
    dom.btnObsModalClose.addEventListener("click", closeDetailModal);
    dom.btnObsModalDone.addEventListener("click", closeDetailModal);
    dom.btnObsEdit.addEventListener("click", enterEditMode);
    dom.btnObsCancel.addEventListener("click", exitEditMode);
    dom.btnObsSave.addEventListener("click", saveEditedRecord);
    dom.obsDetailModal.addEventListener("click", function (e) {
      if (e.target === dom.obsDetailModal) closeDetailModal();
    });
  }

  function setDefaults() {
    var now = new Date();
    dom.obsDate.value = fmtDate(now);
    dom.obsTime.value = fmtTime(now);
    if (!dom.obsChildCode.value) dom.obsChildCode.value = "P00";
  }

  // ────────────────────────────────────
  // 收集 / 驗證表單資料
  // ────────────────────────────────────

  function collectFormData() {
    var roleEl = document.querySelector('input[name="obsRole"]:checked');
    var roleVal = roleEl ? roleEl.value : "P0";
    var roleLabel =
      { P0: "兒童", P1: "家長", P2: "教師", P9: "其它" }[roleVal] || "兒童";
    if (roleVal === "P9" && dom.obsRoleOtherText) {
      var rt = dom.obsRoleOtherText.value.trim();
      if (rt) roleLabel = "其它：" + rt;
    }

    var genderEl = document.querySelector('input[name="obsGender"]:checked');
    var venueEl = document.querySelector('input[name="obsVenue"]:checked');
    var focusEls = document.querySelectorAll(
      '.obs-check-group input[type="checkbox"]:checked',
    );

    var focuses = [];
    focusEls.forEach(function (cb) {
      focuses.push(cb.value);
    });

    var venueVal = "";
    if (venueEl) {
      venueVal = venueEl.value;
      if (venueVal === "其它") {
        var other = dom.obsVenueOtherText.value.trim();
        venueVal = other ? "其它：" + other : "其它";
      }
    }

    // 聽力狀況
    var hearingEls = document.querySelectorAll(
      'input[name="obsHearing"]:checked',
    );
    var hearing = [];
    hearingEls.forEach(function (cb) {
      hearing.push(cb.value);
    });

    // 溝通方式
    var commEls = document.querySelectorAll('input[name="obsComm"]:checked');
    var comm = [];
    commEls.forEach(function (cb) {
      comm.push(cb.value);
    });

    // 完成關卡
    var levelEls = document.querySelectorAll('input[name="obsLevels"]:checked');
    var levels = [];
    levelEls.forEach(function (cb) {
      levels.push(cb.value);
    });

    // 事前準備
    var prepEls = document.querySelectorAll('input[name="obsPrep"]:checked');
    var prep = [];
    prepEls.forEach(function (cb) {
      prep.push(cb.value);
    });

    return {
      respondentRole: roleLabel,
      respondentRoleCode: roleVal,
      preparation: prep,
      date: dom.obsDate.value,
      time: dom.obsTime.value,
      childCode: dom.obsChildCode.value.trim() || "P00",
      tester: dom.obsTester.value.trim(),
      ageYears: dom.obsAgeY.value ? parseInt(dom.obsAgeY.value, 10) : null,
      ageMonths: dom.obsAgeM.value ? parseInt(dom.obsAgeM.value, 10) : null,
      gender: genderEl ? genderEl.value : "",
      hearing: hearing,
      communication: comm,
      venue: venueVal,
      completedLevels: levels,
      totalTime: dom.obsTotalTime.value
        ? parseInt(dom.obsTotalTime.value, 10)
        : null,
      breaks: dom.obsBreaks.value ? parseInt(dom.obsBreaks.value, 10) : null,
      observationFocus: focuses,
      ruleUnderstanding: dom.obsRuleUnderstand.value.trim(),
      ruleSwitchAdapt: dom.obsRuleSwitch.value.trim(),
      operationFluency: dom.obsOperation.value.trim(),
      emotionEngagement: dom.obsEmotion.value.trim(),
      uiIssues: dom.obsUIIssue.value.trim(),
      childFeedback: dom.obsChildFeedback.value.trim(),
      notes: dom.obsNotes.value.trim(),
      specialNotes: dom.obsSpecial.value.trim(),
      parentUsability: dom.obsParentUsability.value.trim(),
      parentChildReaction: dom.obsParentChildReaction.value.trim(),
      parentSuggestion: dom.obsParentSuggestion.value.trim(),
    };
  }

  function validate(data) {
    if (!data.date) {
      showMsg("請填寫日期", "err");
      return false;
    }
    if (!data.childCode) {
      showMsg("請填寫兒童代碼", "err");
      return false;
    }
    return true;
  }

  // ────────────────────────────────────
  // ☁️ 上傳到 Firestore
  // ────────────────────────────────────

  function uploadToServer() {
    var data = collectFormData();
    if (!validate(data)) return;

    if (typeof firebase === "undefined" || !firebase.firestore) {
      showMsg("❌ Firebase 未載入，無法上傳", "err");
      return;
    }

    var user = firebase.auth().currentUser;
    if (!user) {
      showMsg("❌ 尚未登入，無法上傳", "err");
      return;
    }

    data.uploadedAt = new Date().toISOString();
    data.uploadedBy = user.uid;

    dom.btnObsUpload.disabled = true;
    dom.btnObsUpload.textContent = "⏳ 上傳中…";

    firebase
      .firestore()
      .collection("observationRecords")
      .add(data)
      .then(function (docRef) {
        showMsg(
          "✅ 已上傳至伺服器（ID: " + docRef.id.substring(0, 8) + "…）",
          "ok",
        );
        dom.btnObsUpload.disabled = false;
        dom.btnObsUpload.textContent = "☁️ 上傳到伺服器";
      })
      .catch(function (err) {
        showMsg("❌ 上傳失敗：" + err.message, "err");
        dom.btnObsUpload.disabled = false;
        dom.btnObsUpload.textContent = "☁️ 上傳到伺服器";
      });
  }

  // ────────────────────────────────────
  // 💾 儲存到 localStorage
  // ────────────────────────────────────

  function saveToLocal() {
    var data = collectFormData();
    if (!validate(data)) return;

    data.savedAt = new Date().toISOString();
    var records = getLocalRecords();
    records.push(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    showMsg("✅ 已儲存到本機（共 " + records.length + " 筆）", "ok");
    renderSavedRecords();
  }

  function getLocalRecords() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  // ────────────────────────────────────
  // 📄 CSV 匯出
  // ────────────────────────────────────

  function recordToCSVRow(rec) {
    var fields = [
      rec.respondentRole || (rec.parentRole ? rec.parentRole : "兒童"),
      (rec.preparation || []).join("; "),
      rec.date || "",
      rec.time || "",
      rec.childCode || "",
      rec.ageYears != null ? rec.ageYears : "",
      rec.ageMonths != null ? rec.ageMonths : "",
      rec.gender || "",
      (rec.hearing || []).join("; "),
      (rec.communication || []).join("; "),
      rec.venue || "",
      (rec.completedLevels || []).join("; "),
      rec.totalTime != null ? rec.totalTime : "",
      rec.breaks != null ? rec.breaks : "",
      (rec.observationFocus || []).join("; "),
      rec.ruleUnderstanding || "",
      rec.ruleSwitchAdapt || "",
      rec.operationFluency || "",
      rec.emotionEngagement || "",
      rec.uiIssues || "",
      rec.childFeedback || "",
      rec.notes || "",
      rec.specialNotes || "",
      rec.parentUsability || "",
      rec.parentChildReaction || "",
      rec.parentSuggestion || "",
      rec.tester || "",
      rec.savedAt || rec.uploadedAt || "",
    ];
    return fields
      .map(function (f) {
        var s = String(f);
        if (
          s.indexOf(",") !== -1 ||
          s.indexOf('"') !== -1 ||
          s.indexOf("\n") !== -1
        ) {
          return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
      })
      .join(",");
  }

  function exportCurrentCSV() {
    var data = collectFormData();
    if (!validate(data)) return;

    data.savedAt = new Date().toISOString();
    var csv = "\uFEFF" + CSV_HEADERS + "\n" + recordToCSVRow(data);
    var filename = "observation_" + data.childCode + "_" + data.date + ".csv";
    downloadFile(filename, csv, "text/csv;charset=utf-8");
    showMsg("✅ 已匯出 CSV：" + filename, "ok");
  }

  function exportAllCSV() {
    var records = getLocalRecords();
    if (records.length === 0) {
      showMsg("⚠️ 本機沒有儲存的紀錄", "err");
      return;
    }
    var rows = records.map(recordToCSVRow);
    var csv = "\uFEFF" + CSV_HEADERS + "\n" + rows.join("\n");
    var filename = "observation_all_" + fmtDate(new Date()) + ".csv";
    downloadFile(filename, csv, "text/csv;charset=utf-8");
    showMsg("✅ 已匯出全部 " + records.length + " 筆 CSV", "ok");
  }

  // ────────────────────────────────────
  // 📋 JSON 匯出
  // ────────────────────────────────────

  function exportCurrentJSON() {
    var data = collectFormData();
    if (!validate(data)) return;

    data.savedAt = new Date().toISOString();
    var json = JSON.stringify(data, null, 2);
    var filename = "observation_" + data.childCode + "_" + data.date + ".json";
    downloadFile(filename, json, "application/json;charset=utf-8");
    showMsg("✅ 已匯出 JSON：" + filename, "ok");
  }

  function exportAllJSON() {
    var records = getLocalRecords();
    if (records.length === 0) {
      showMsg("⚠️ 本機沒有儲存的紀錄", "err");
      return;
    }
    var json = JSON.stringify(records, null, 2);
    var filename = "observation_all_" + fmtDate(new Date()) + ".json";
    downloadFile(filename, json, "application/json;charset=utf-8");
    showMsg("✅ 已匯出全部 " + records.length + " 筆 JSON", "ok");
  }

  // ────────────────────────────────────
  // 🗑️ 清空 / 刪除
  // ────────────────────────────────────

  function clearAllLocal() {
    var records = getLocalRecords();
    if (records.length === 0) {
      showMsg("ℹ️ 本機沒有紀錄可清空", "err");
      return;
    }
    if (
      !confirm(
        "確定要清空本機所有 " +
          records.length +
          " 筆觀察紀錄嗎？此操作不可復原。",
      )
    )
      return;

    localStorage.removeItem(STORAGE_KEY);
    showMsg("✅ 已清空本機所有紀錄", "ok");
    renderSavedRecords();
  }

  function deleteLocalRecord(index) {
    var records = getLocalRecords();
    if (index < 0 || index >= records.length) return;
    if (
      !confirm(
        "確定要刪除 " + (records[index].childCode || "P00") + " 的紀錄嗎？",
      )
    )
      return;

    records.splice(index, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    showMsg("✅ 已刪除 1 筆紀錄", "ok");
    renderSavedRecords();
  }

  // ────────────────────────────────────
  // 渲染已儲存紀錄列表
  // ────────────────────────────────────

  function renderSavedRecords() {
    var records = getLocalRecords();
    dom.obsSavedCount.textContent = records.length + " 筆";

    if (records.length === 0) {
      dom.obsSavedList.innerHTML = '<div class="empty">尚無儲存紀錄</div>';
      return;
    }

    var html = "";
    records.forEach(function (rec, i) {
      var ageStr = "";
      if (rec.ageYears != null) ageStr = rec.ageYears + "歲";
      if (rec.ageMonths != null) ageStr += rec.ageMonths + "月";

      html +=
        '<div class="data-item" style="cursor:pointer;" onclick="ObsTool.viewRecord(\'local\',' +
        i +
        ')">' +
        '<div class="info">' +
        '<div class="name">' +
        escapeHtml(rec.childCode || "P00") +
        (rec.gender ? " · " + rec.gender : "") +
        (ageStr ? " · " + ageStr : "") +
        "</div>" +
        '<div class="meta">' +
        escapeHtml(rec.date || "") +
        " " +
        escapeHtml(rec.time || "") +
        (rec.venue ? " · " + escapeHtml(rec.venue) : "") +
        "</div>" +
        "</div>" +
        '<button class="btn-delete" onclick="ObsTool.deleteRecord(' +
        i +
        ')">刪除</button>' +
        "</div>";
    });

    dom.obsSavedList.innerHTML = html;
  }

  // ────────────────────────────────────
  // 工具函式
  // ────────────────────────────────────

  function showMsg(text, type) {
    dom.obsMsg.textContent = text;
    dom.obsMsg.className = "obs-msg show " + (type || "ok");
    clearTimeout(showMsg._timer);
    showMsg._timer = setTimeout(function () {
      dom.obsMsg.classList.remove("show");
    }, 4000);
  }

  function downloadFile(filename, content, mimeType) {
    var blob = new Blob([content], { type: mimeType });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);
  }

  function fmtDate(d) {
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
  }

  function fmtTime(d) {
    return (
      String(d.getHours()).padStart(2, "0") +
      ":" +
      String(d.getMinutes()).padStart(2, "0")
    );
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ────────────────────────────────────
  // ☁️ 伺服器紀錄管理
  // ────────────────────────────────────

  var _serverRecords = []; // [{ docId, ...data }]

  function loadServerRecords() {
    if (typeof firebase === "undefined" || !firebase.firestore) {
      showMsg("❌ Firebase 未載入", "err");
      return;
    }
    dom.obsServerList.innerHTML = '<div class="empty">載入中…</div>';
    dom.btnObsLoadServer.disabled = true;

    firebase
      .firestore()
      .collection("observationRecords")
      .orderBy("date", "desc")
      .get()
      .then(function (snap) {
        _serverRecords = [];
        snap.forEach(function (doc) {
          var d = doc.data();
          d.docId = doc.id;
          _serverRecords.push(d);
        });
        renderServerRecords();
        dom.btnObsLoadServer.disabled = false;
        showMsg("✅ 已載入 " + _serverRecords.length + " 筆伺服器紀錄", "ok");
      })
      .catch(function (err) {
        dom.obsServerList.innerHTML =
          '<div class="empty">⚠️ 載入失敗：' +
          escapeHtml(err.message) +
          "</div>";
        dom.btnObsLoadServer.disabled = false;
        showMsg("❌ 載入失敗：" + err.message, "err");
      });
  }

  function renderServerRecords() {
    dom.obsServerCount.textContent = _serverRecords.length + " 筆";
    dom.btnObsDeleteAllServer.disabled = _serverRecords.length === 0;

    if (_serverRecords.length === 0) {
      dom.obsServerList.innerHTML =
        '<div class="empty">🎉 伺服器沒有紀錄</div>';
      dom.btnObsDeleteSelectedServer.disabled = true;
      return;
    }

    var html =
      '<div class="select-all-row"><input type="checkbox" onchange="ObsTool.toggleAllServer(this.checked)"> 全選 / 取消全選</div>';
    _serverRecords.forEach(function (rec, i) {
      var roleStr = rec.respondentRole || rec.parentRole || "兒童";
      html +=
        '<div class="data-item">' +
        '<input type="checkbox" class="server-obs-cb" data-idx="' +
        i +
        '" onchange="ObsTool.updateServerSelection()">' +
        '<div class="info" style="cursor:pointer;" onclick="ObsTool.viewRecord(\'server\',' +
        i +
        ',\'' +
        rec.docId +
        '\')">' +
        '<div class="name">' +
        escapeHtml(rec.childCode || "P00") +
        " · " +
        escapeHtml(roleStr) +
        "</div>" +
        '<div class="meta">' +
        escapeHtml(rec.date || "") +
        " " +
        escapeHtml(rec.time || "") +
        (rec.venue ? " · " + escapeHtml(rec.venue) : "") +
        "</div>" +
        "</div>" +
        '<button class="btn-delete" onclick="ObsTool.deleteServerRecord(\'' +
        rec.docId +
        "')\">刪除</button>" +
        "</div>";
    });
    dom.obsServerList.innerHTML = html;
  }

  function updateServerSelection() {
    var checked = document.querySelectorAll(".server-obs-cb:checked");
    dom.btnObsDeleteSelectedServer.disabled = checked.length === 0;
  }

  function toggleAllServer(checked) {
    document.querySelectorAll(".server-obs-cb").forEach(function (cb) {
      cb.checked = checked;
    });
    updateServerSelection();
  }

  function deleteServerRecord(docId) {
    if (!confirm("確定要刪除此筆伺服器紀錄嗎？不可復原。")) return;
    firebase
      .firestore()
      .collection("observationRecords")
      .doc(docId)
      .delete()
      .then(function () {
        _serverRecords = _serverRecords.filter(function (r) {
          return r.docId !== docId;
        });
        renderServerRecords();
        showMsg("✅ 已刪除 1 筆伺服器紀錄", "ok");
      })
      .catch(function (err) {
        showMsg("❌ 刪除失敗：" + err.message, "err");
      });
  }

  function deleteSelectedServer() {
    var cbs = document.querySelectorAll(".server-obs-cb:checked");
    if (cbs.length === 0) return;
    if (
      !confirm("確定要刪除勾選的 " + cbs.length + " 筆伺服器紀錄嗎？不可復原。")
    )
      return;

    var ids = [];
    cbs.forEach(function (cb) {
      var idx = parseInt(cb.getAttribute("data-idx"), 10);
      if (_serverRecords[idx]) ids.push(_serverRecords[idx].docId);
    });

    var db = firebase.firestore();
    var chain = Promise.resolve();
    ids.forEach(function (id) {
      chain = chain.then(function () {
        return db.collection("observationRecords").doc(id).delete();
      });
    });
    chain
      .then(function () {
        showMsg("✅ 已刪除 " + ids.length + " 筆伺服器紀錄", "ok");
        loadServerRecords();
      })
      .catch(function (err) {
        showMsg("❌ 批次刪除失敗：" + err.message, "err");
        loadServerRecords();
      });
  }

  function deleteAllServer() {
    if (_serverRecords.length === 0) return;
    if (
      !confirm(
        "確定要清空伺服器全部 " +
          _serverRecords.length +
          " 筆觀察紀錄嗎？此操作不可復原。",
      )
    )
      return;

    var db = firebase.firestore();
    var chain = Promise.resolve();
    _serverRecords.forEach(function (rec) {
      chain = chain.then(function () {
        return db.collection("observationRecords").doc(rec.docId).delete();
      });
    });
    chain
      .then(function () {
        showMsg("✅ 已清空伺服器全部紀錄", "ok");
        _serverRecords = [];
        renderServerRecords();
      })
      .catch(function (err) {
        showMsg("❌ 清空失敗：" + err.message, "err");
        loadServerRecords();
      });
  }

  // ────────────────────────────────────
  // 紀錄詳情 Modal（查看 / 編輯）
  // ────────────────────────────────────

  var DETAIL_FIELDS = [
    { key: "respondentRole", label: "回饋者身份", type: "text" },
    { key: "preparation", label: "事前準備", type: "array" },
    { key: "date", label: "日期", type: "text" },
    { key: "time", label: "時間", type: "text" },
    { key: "childCode", label: "兒童/回饋者代碼", type: "text" },
    { key: "ageYears", label: "年齡（歲）", type: "number" },
    { key: "ageMonths", label: "年齡（月）", type: "number" },
    { key: "gender", label: "性別", type: "text" },
    { key: "hearing", label: "聽力狀況", type: "array" },
    { key: "communication", label: "溝通方式", type: "array" },
    { key: "venue", label: "場域", type: "text" },
    { key: "completedLevels", label: "完成關卡", type: "array" },
    { key: "totalTime", label: "總耗時（分鐘）", type: "number" },
    { key: "breaks", label: "休息次數", type: "number" },
    { key: "observationFocus", label: "觀察重點", type: "array" },
    { key: "ruleUnderstanding", label: "規則理解度", type: "textarea" },
    { key: "ruleSwitchAdapt", label: "規則切換適應", type: "textarea" },
    { key: "operationFluency", label: "操作順暢度", type: "textarea" },
    { key: "emotionEngagement", label: "情緒與投入度", type: "textarea" },
    { key: "uiIssues", label: "UI 問題回報", type: "textarea" },
    { key: "childFeedback", label: "兒童回饋摘要", type: "textarea" },
    { key: "notes", label: "綜合觀察紀錄", type: "textarea" },
    { key: "specialNotes", label: "特殊備註", type: "textarea" },
    { key: "parentUsability", label: "操作易用性回饋", type: "textarea" },
    { key: "parentChildReaction", label: "兒童反應觀察", type: "textarea" },
    { key: "parentSuggestion", label: "改善建議", type: "textarea" },
    { key: "tester", label: "施測者", type: "text" },
  ];

  function openDetailModal(source, index, docId) {
    var data;
    if (source === "local") {
      data = getLocalRecords()[index];
    } else {
      data = _serverRecords[index];
    }
    if (!data) return;

    _viewingRecord = {
      source: source,
      index: index,
      docId: docId || null,
      data: JSON.parse(JSON.stringify(data)),
    };
    _isEditing = false;

    dom.obsModalTitle.textContent = "📋 紀錄詳情 — " + (data.childCode || "P00");
    renderReadOnly();

    dom.btnObsEdit.style.display = "";
    dom.btnObsSave.style.display = "none";
    dom.btnObsCancel.style.display = "none";
    dom.obsDetailModal.style.display = "";
  }

  function closeDetailModal() {
    dom.obsDetailModal.style.display = "none";
    _viewingRecord = null;
    _isEditing = false;
  }

  function renderReadOnly() {
    var data = _viewingRecord.data;
    var html = "";
    DETAIL_FIELDS.forEach(function (f) {
      var val = data[f.key];
      var display = "";
      if (Array.isArray(val)) {
        display = val.join("、");
      } else if (val != null) {
        display = String(val);
      }
      html +=
        '<div class="obs-detail-row">' +
        '<div class="obs-detail-label">' +
        escapeHtml(f.label) +
        "</div>" +
        '<div class="obs-detail-value">' +
        escapeHtml(display) +
        "</div>" +
        "</div>";
    });
    // 附加：儲存/上傳時間
    var timeStr = data.savedAt || data.uploadedAt || "";
    if (timeStr) {
      html +=
        '<div class="obs-detail-row">' +
        '<div class="obs-detail-label">儲存時間</div>' +
        '<div class="obs-detail-value">' +
        escapeHtml(timeStr) +
        "</div>" +
        "</div>";
    }
    dom.obsModalBody.innerHTML = html;
  }

  function enterEditMode() {
    _isEditing = true;
    dom.btnObsEdit.style.display = "none";
    dom.btnObsSave.style.display = "";
    dom.btnObsCancel.style.display = "";

    var data = _viewingRecord.data;
    var html = "";
    DETAIL_FIELDS.forEach(function (f) {
      var val = data[f.key];
      var inputHtml = "";

      if (f.type === "array") {
        var arrVal = Array.isArray(val) ? val.join("、") : "";
        inputHtml =
          '<input class="obs-detail-input" data-field="' +
          f.key +
          '" data-type="array" value="' +
          escapeAttr(arrVal) +
          '">';
      } else if (f.type === "textarea") {
        inputHtml =
          '<textarea class="obs-detail-input" data-field="' +
          f.key +
          '" data-type="textarea">' +
          escapeHtml(val || "") +
          "</textarea>";
      } else if (f.type === "number") {
        inputHtml =
          '<input type="number" class="obs-detail-input" data-field="' +
          f.key +
          '" data-type="number" value="' +
          (val != null ? val : "") +
          '">';
      } else {
        inputHtml =
          '<input class="obs-detail-input" data-field="' +
          f.key +
          '" data-type="text" value="' +
          escapeAttr(val || "") +
          '">';
      }

      html +=
        '<div class="obs-detail-row">' +
        '<div class="obs-detail-label">' +
        escapeHtml(f.label) +
        "</div>" +
        inputHtml +
        "</div>";
    });
    dom.obsModalBody.innerHTML = html;
  }

  function exitEditMode() {
    _isEditing = false;
    dom.btnObsEdit.style.display = "";
    dom.btnObsSave.style.display = "none";
    dom.btnObsCancel.style.display = "none";
    renderReadOnly();
  }

  function saveEditedRecord() {
    if (
      !confirm("確定要修改這筆紀錄嗎？修改後無法自動復原。")
    )
      return;

    // 收集編輯後的值
    var inputs = dom.obsModalBody.querySelectorAll(".obs-detail-input");
    inputs.forEach(function (el) {
      var field = el.getAttribute("data-field");
      var type = el.getAttribute("data-type");
      if (type === "array") {
        _viewingRecord.data[field] = el.value
          .split(/[、,;；]\s*/)
          .filter(Boolean);
      } else if (type === "number") {
        _viewingRecord.data[field] = el.value ? parseInt(el.value, 10) : null;
      } else if (type === "textarea") {
        _viewingRecord.data[field] = el.value.trim();
      } else {
        _viewingRecord.data[field] = el.value.trim();
      }
    });

    _viewingRecord.data.lastEditedAt = new Date().toISOString();

    if (_viewingRecord.source === "local") {
      // 更新 localStorage
      var records = getLocalRecords();
      records[_viewingRecord.index] = _viewingRecord.data;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      renderSavedRecords();
      showMsg("✅ 本機紀錄已更新", "ok");
    } else {
      // 更新 Firestore
      var docId = _viewingRecord.docId || _viewingRecord.data.docId;
      if (!docId) {
        showMsg("❌ 找不到文件 ID，無法更新", "err");
        return;
      }
      var updateData = JSON.parse(JSON.stringify(_viewingRecord.data));
      delete updateData.docId;

      firebase
        .firestore()
        .collection("observationRecords")
        .doc(docId)
        .set(updateData)
        .then(function () {
          // 同步本地快取
          _serverRecords[_viewingRecord.index] = _viewingRecord.data;
          _serverRecords[_viewingRecord.index].docId = docId;
          renderServerRecords();
          showMsg("✅ 伺服器紀錄已更新", "ok");
        })
        .catch(function (err) {
          showMsg("❌ 更新失敗：" + err.message, "err");
        });
    }

    exitEditMode();
  }

  function escapeAttr(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  // ── 全域匯出（供 onclick 使用）──
  window.ObsTool = {
    deleteRecord: deleteLocalRecord,
    deleteServerRecord: deleteServerRecord,
    toggleAllServer: toggleAllServer,
    updateServerSelection: updateServerSelection,
    viewRecord: openDetailModal,
  };

  // ── 啟動 ──
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
