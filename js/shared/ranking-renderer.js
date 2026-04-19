/**
 * ============================================
 * 共用排行表渲染器 — RankingRenderer
 * ============================================
 * 說明：接受統一資料格式，輸出排行表 HTML
 *       班級排行看板、多人結算、世界排行榜共用
 *
 * 匯出：window.RankingRenderer
 * ============================================
 */

var RankingRenderer = (function () {
  "use strict";

  /**
   * 渲染排行表到指定容器
   *
   * @param {HTMLElement} container - 要渲染進的 DOM 元素
   * @param {Array} entries - 排行資料陣列
   * @param {Object} [options]
   * @param {string} [options.sortBy]      - 排序欄位 "score" | "accuracy" | "avgRT"（預設 "score"）
   * @param {boolean} [options.showAccuracy] - 顯示正確率欄（預設 true）
   * @param {boolean} [options.showRT]      - 顯示反應時間欄（預設 true）
   * @param {boolean} [options.showStars]   - 顯示星星欄（預設 false）
   * @param {boolean} [options.showLevel]   - 顯示等級欄（預設 false）
   * @param {boolean} [options.showTime]    - 顯示上傳時間（預設 false）
   * @param {boolean} [options.showGameEndTime] - 顯示遊戲結束時間（預設 false）
   * @param {string} [options.emptyIcon]    - 空狀態圖示（預設 "📭"）
   * @param {string} [options.emptyText]    - 空狀態文字
   * @param {string} [options.highlightUid] - 高亮顯示的 uid
   * @param {Function} [options.onDelete]   - 刪除回呼 (entryId) => void
   * @param {number} [options.pageSize]     - 每頁筆數（預設 0 = 全部顯示，不分頁）
   */
  function render(container, entries, options) {
    var opts = options || {};
    var sortBy = opts.sortBy || "score";
    var showAccuracy = opts.showAccuracy !== false;
    var showRT = opts.showRT !== false;
    var showStars = opts.showStars || false;
    var showLevel = opts.showLevel || false;
    var showTime = opts.showTime || false;
    var showGameEndTime = opts.showGameEndTime || false;
    var showCorrect = opts.showCorrect || false;
    var showMode = opts.showMode || false;
    var highlightUid = opts.highlightUid || null;
    var onDelete = opts.onDelete || null;
    var pageSize = opts.pageSize || 0;

    if (!container) return;

    // 空狀態
    if (!entries || entries.length === 0) {
      container.innerHTML =
        '<div class="ranking-empty">' +
        '<span class="ranking-empty__icon">' +
        (opts.emptyIcon || "📭") +
        "</span>" +
        "<p>" +
        (opts.emptyText || "尚無排行資料") +
        "</p>" +
        "</div>";
      return;
    }

    // 排序
    var sorted = entries.slice().sort(function (a, b) {
      if (sortBy === "accuracy") {
        return (b.accuracy || 0) - (a.accuracy || 0);
      } else if (sortBy === "avgRT") {
        var aRT = a.avgRT || 99999;
        var bRT = b.avgRT || 99999;
        return aRT - bRT; // RT 越低越好
      } else {
        // score
        return (b.score || b.bestScore || 0) - (a.score || a.bestScore || 0);
      }
    });

    // 分頁
    var totalPages = 1;
    var currentPage = 1;
    if (pageSize > 0 && sorted.length > pageSize) {
      totalPages = Math.ceil(sorted.length / pageSize);
      // 儲存分頁狀態到容器上
      if (!container._rankingPage || container._rankingPage > totalPages) {
        container._rankingPage = 1;
      }
      currentPage = container._rankingPage;
    }

    var startIdx = pageSize > 0 ? (currentPage - 1) * pageSize : 0;
    var endIdx =
      pageSize > 0
        ? Math.min(startIdx + pageSize, sorted.length)
        : sorted.length;
    var pageEntries = sorted.slice(startIdx, endIdx);

    // 計算欄位數量
    var colCount = 3; // 排名、名稱、分數（基本欄位）
    if (showAccuracy) colCount++;
    if (showRT) colCount++;
    if (showCorrect) colCount++;
    if (showStars) colCount++;
    if (showLevel) colCount++;
    if (showMode) colCount++;
    if (showGameEndTime) colCount++;
    if (showTime) colCount++;
    if (onDelete) colCount++;

    // 建立表頭
    var colTemplate = _buildGridTemplate(
      showAccuracy,
      showRT,
      showCorrect,
      showStars,
      showLevel,
      showMode,
      showGameEndTime,
      showTime,
      onDelete,
    );

    var html = "";
    html += '<div class="ranking-table" style="' + colTemplate + '">';

    // 表頭
    html += '<div class="ranking-header">';
    html += '<div class="ranking-cell ranking-cell--rank">排名</div>';
    html += '<div class="ranking-cell ranking-cell--name">玩家</div>';
    html += '<div class="ranking-cell ranking-cell--score">分數</div>';
    if (showAccuracy)
      html += '<div class="ranking-cell ranking-cell--acc">正確率</div>';
    if (showRT)
      html += '<div class="ranking-cell ranking-cell--rt">平均 RT</div>';
    if (showCorrect)
      html += '<div class="ranking-cell ranking-cell--correct">答對</div>';
    if (showStars)
      html += '<div class="ranking-cell ranking-cell--stars">⭐</div>';
    if (showLevel)
      html += '<div class="ranking-cell ranking-cell--level">等級</div>';
    if (showMode)
      html += '<div class="ranking-cell ranking-cell--mode">模式</div>';
    if (showGameEndTime)
      html +=
        '<div class="ranking-cell ranking-cell--game-end-time">遊戲結束時間</div>';
    if (showTime)
      html += '<div class="ranking-cell ranking-cell--time">時間</div>';
    if (onDelete)
      html += '<div class="ranking-cell ranking-cell--action"></div>';
    html += "</div>";

    // 表身（只渲染當前頁）
    for (var i = 0; i < pageEntries.length; i++) {
      var e = pageEntries[i];
      var rank = startIdx + i + 1; // 真實排名
      var rankIcon =
        rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank;
      var rankClass =
        rank === 1
          ? "gold"
          : rank === 2
            ? "silver"
            : rank === 3
              ? "bronze"
              : "";
      var isHighlight =
        highlightUid &&
        (e.uid === highlightUid ||
          e.entryId === highlightUid ||
          e.docId === highlightUid);

      html += '<div class="ranking-row';
      if (isHighlight) html += " ranking-row--highlight";
      html += '">';
      html +=
        '<div class="ranking-cell ranking-cell--rank ' +
        rankClass +
        '">' +
        rankIcon +
        "</div>";
      html +=
        '<div class="ranking-cell ranking-cell--name">' +
        _escapeHtml(e.nickname || e.name || "匿名") +
        "</div>";
      html +=
        '<div class="ranking-cell ranking-cell--score">' +
        (e.score || e.bestScore || 0) +
        "</div>";

      if (showAccuracy) {
        var acc =
          e.accuracy != null
            ? e.accuracy
            : e.bestAccuracy != null
              ? e.bestAccuracy
              : 0;
        html +=
          '<div class="ranking-cell ranking-cell--acc">' +
          (typeof acc === "number" ? acc.toFixed(1) : acc) +
          "%</div>";
      }

      if (showRT) {
        var rt = e.avgRT || e.bestAvgRT || 0;
        html +=
          '<div class="ranking-cell ranking-cell--rt">' +
          (rt > 0 ? Math.round(rt) + " ms" : "—") +
          "</div>";
      }

      if (showCorrect) {
        var tc = e.totalCorrect != null ? e.totalCorrect : e.bestScore || 0;
        var tt = e.totalTrials || "—";
        html +=
          '<div class="ranking-cell ranking-cell--correct">' +
          tc +
          "/" +
          tt +
          "</div>";
      }

      if (showStars) {
        var starVal = e.stars || e.totalStars || 0;
        html +=
          '<div class="ranking-cell ranking-cell--stars">' +
          (starVal > 0 ? starVal : "—") +
          "</div>";
      }

      if (showMode) {
        var modeLabel =
          e.mode === "multiplayer"
            ? "競賽"
            : e.mode === "adventure"
              ? "冒險"
              : e.mode || "—";
        html +=
          '<div class="ranking-cell ranking-cell--mode">' +
          modeLabel +
          "</div>";
      }

      if (showGameEndTime) {
        var getStr = "—";
        if (e.gameEndTime) {
          var gd = new Date(e.gameEndTime);
          getStr =
            gd.getFullYear() +
            "/" +
            (gd.getMonth() + 1) +
            "/" +
            gd.getDate() +
            " " +
            String(gd.getHours()).padStart(2, "0") +
            ":" +
            String(gd.getMinutes()).padStart(2, "0") +
            ":" +
            String(gd.getSeconds()).padStart(2, "0") +
            "." +
            String(gd.getMilliseconds()).padStart(3, "0");
        }
        html +=
          '<div class="ranking-cell ranking-cell--game-end-time">' +
          getStr +
          "</div>";
      }

      if (showLevel) {
        html +=
          '<div class="ranking-cell ranking-cell--level">' +
          (e.level || "—") +
          "</div>";
      }

      if (showTime) {
        var t = e.uploadedAt;
        var timeStr = "—";
        if (t) {
          // Firestore Timestamp 或 Date 或 ISO string
          var d = t.toDate ? t.toDate() : new Date(t);
          timeStr =
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
            String(d.getMilliseconds()).padStart(3, "0");
        }
        html +=
          '<div class="ranking-cell ranking-cell--time">' + timeStr + "</div>";
      }

      if (onDelete) {
        var entryKey = e.entryId || e.docId || "";
        html +=
          '<div class="ranking-cell ranking-cell--action">' +
          '<button class="ranking-delete-btn" data-entry-id="' +
          _escapeHtml(entryKey) +
          '" title="刪除">🗑️</button>' +
          "</div>";
      }

      html += "</div>";
    }

    html += "</div>";

    // 分頁控制列
    if (totalPages > 1) {
      html += '<div class="ranking-pagination">';
      html +=
        '<button class="ranking-page-btn" data-page="prev"' +
        (currentPage === 1 ? " disabled" : "") +
        ">‹</button>";
      for (var p = 1; p <= totalPages; p++) {
        html +=
          '<button class="ranking-page-btn' +
          (p === currentPage ? " active" : "") +
          '" data-page="' +
          p +
          '">' +
          p +
          "</button>";
      }
      html +=
        '<button class="ranking-page-btn" data-page="next"' +
        (currentPage === totalPages ? " disabled" : "") +
        ">›</button>";
      html +=
        '<span class="ranking-page-info">' +
        currentPage +
        "/" +
        totalPages +
        "（共 " +
        sorted.length +
        " 筆）</span>";
      html += "</div>";
    }

    container.innerHTML = html;

    // 綁定分頁事件
    if (totalPages > 1) {
      var pageBtns = container.querySelectorAll(".ranking-page-btn");
      pageBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var target = btn.getAttribute("data-page");
          if (target === "prev") {
            container._rankingPage = Math.max(1, currentPage - 1);
          } else if (target === "next") {
            container._rankingPage = Math.min(totalPages, currentPage + 1);
          } else {
            container._rankingPage = parseInt(target, 10);
          }
          render(container, entries, options);
        });
      });
    }

    // 綁定刪除事件
    if (onDelete) {
      var deleteButtons = container.querySelectorAll(".ranking-delete-btn");
      deleteButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var entryId = btn.getAttribute("data-entry-id");
          if (entryId) {
            GameModal.confirm("刪除記錄", "確定要刪除這筆記錄嗎？", {
              icon: "🗑️",
            }).then(function (ok) {
              if (ok) onDelete(entryId);
            });
          }
        });
      });
    }
  }

  /**
   * 渲染統計卡片
   * @param {HTMLElement} container
   * @param {Array} entries
   */
  function renderStats(container, entries) {
    if (!container || !entries || entries.length === 0) {
      if (container) container.style.display = "none";
      return;
    }

    container.style.display = "";

    var totalPlayers = entries.length;
    var totalScore = 0;
    var totalAcc = 0;
    var totalRT = 0;
    var rtCount = 0;

    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      totalScore += e.score || e.bestScore || 0;
      totalAcc += e.accuracy || e.bestAccuracy || 0;
      var eRT = e.avgRT || e.bestAvgRT || 0;
      if (eRT > 0) {
        totalRT += eRT;
        rtCount++;
      }
    }

    var avgAcc = totalPlayers > 0 ? totalAcc / totalPlayers : 0;
    var avgRT = rtCount > 0 ? totalRT / rtCount : 0;

    container.innerHTML =
      '<div class="ranking-stats">' +
      _statCard("👥", totalPlayers, "參與人數") +
      _statCard("🎯", avgAcc.toFixed(1) + "%", "平均正確率") +
      _statCard(
        "⏱️",
        avgRT > 0 ? Math.round(avgRT) + " ms" : "—",
        "平均反應時間",
      ) +
      "</div>";
  }

  function _statCard(icon, value, label) {
    return (
      '<div class="ranking-stat-card">' +
      '<div class="ranking-stat-card__icon">' +
      icon +
      "</div>" +
      '<div class="ranking-stat-card__val">' +
      value +
      "</div>" +
      '<div class="ranking-stat-card__lbl">' +
      label +
      "</div>" +
      "</div>"
    );
  }

  function _buildGridTemplate(
    showAcc,
    showRT,
    showCorrect,
    showStars,
    showLevel,
    showMode,
    showGameEndTime,
    showTime,
    hasDelete,
  ) {
    var cols = [
      "36px",    // rank    排名
      "72px",    // name    玩家
      "44px",    // score   分數
    ];
    if (showAcc)         cols.push("52px");    // 正確率
    if (showRT)          cols.push("58px");    // 平均RT
    if (showCorrect)     cols.push("48px");    // 答對
    if (showStars)       cols.push("30px");    // ⭐
    if (showLevel)       cols.push("40px");    // 等級
    if (showMode)        cols.push("90px");    // 模式
    if (showGameEndTime) cols.push("155px");   // 遊戲結束時間（含毫秒）
    if (showTime)        cols.push("155px");   // 上傳時間
    if (hasDelete)       cols.push("36px");    // 刪除
    return "--ranking-cols: " + cols.join(" ") + ";";
  }

  function _escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  return {
    render: render,
    renderStats: renderStats,
  };
})();

// 匯出
if (typeof window !== "undefined") {
  window.RankingRenderer = RankingRenderer;
}
