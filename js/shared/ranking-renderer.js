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
   * @param {string} [options.emptyIcon]    - 空狀態圖示（預設 "📭"）
   * @param {string} [options.emptyText]    - 空狀態文字
   * @param {string} [options.highlightUid] - 高亮顯示的 uid
   * @param {Function} [options.onDelete]   - 刪除回呼 (entryId) => void
   */
  function render(container, entries, options) {
    var opts = options || {};
    var sortBy = opts.sortBy || "score";
    var showAccuracy = opts.showAccuracy !== false;
    var showRT = opts.showRT !== false;
    var showStars = opts.showStars || false;
    var showLevel = opts.showLevel || false;
    var showTime = opts.showTime || false;
    var highlightUid = opts.highlightUid || null;
    var onDelete = opts.onDelete || null;

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

    // 計算欄位數量
    var colCount = 3; // 排名、名稱、分數（基本欄位）
    if (showAccuracy) colCount++;
    if (showRT) colCount++;
    if (showStars) colCount++;
    if (showLevel) colCount++;
    if (showTime) colCount++;
    if (onDelete) colCount++;

    // 建立表頭
    var colTemplate = _buildGridTemplate(
      showAccuracy,
      showRT,
      showStars,
      showLevel,
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
    if (showStars)
      html += '<div class="ranking-cell ranking-cell--stars">⭐</div>';
    if (showLevel)
      html += '<div class="ranking-cell ranking-cell--level">等級</div>';
    if (showTime)
      html += '<div class="ranking-cell ranking-cell--time">時間</div>';
    if (onDelete)
      html += '<div class="ranking-cell ranking-cell--action"></div>';
    html += "</div>";

    // 表身
    for (var i = 0; i < sorted.length; i++) {
      var e = sorted[i];
      var rank = i + 1;
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
        var acc = e.accuracy != null ? e.accuracy : 0;
        html +=
          '<div class="ranking-cell ranking-cell--acc">' +
          (typeof acc === "number" ? acc.toFixed(1) : acc) +
          "%</div>";
      }

      if (showRT) {
        var rt = e.avgRT || 0;
        html +=
          '<div class="ranking-cell ranking-cell--rt">' +
          (rt > 0 ? Math.round(rt) + " ms" : "—") +
          "</div>";
      }

      if (showStars) {
        html +=
          '<div class="ranking-cell ranking-cell--stars">' +
          (e.stars || e.totalStars || 0) +
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
            d.getMonth() +
            1 +
            "/" +
            d.getDate() +
            " " +
            String(d.getHours()).padStart(2, "0") +
            ":" +
            String(d.getMinutes()).padStart(2, "0");
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

    container.innerHTML = html;

    // 綁定刪除事件
    if (onDelete) {
      var deleteButtons = container.querySelectorAll(".ranking-delete-btn");
      deleteButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var entryId = btn.getAttribute("data-entry-id");
          if (entryId && confirm("確定要刪除這筆記錄嗎？")) {
            onDelete(entryId);
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
      totalAcc += e.accuracy || 0;
      if (e.avgRT && e.avgRT > 0) {
        totalRT += e.avgRT;
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
    showStars,
    showLevel,
    showTime,
    hasDelete,
  ) {
    var cols = ["60px", "1fr", "90px"]; // rank, name, score
    if (showAcc) cols.push("90px");
    if (showRT) cols.push("100px");
    if (showStars) cols.push("60px");
    if (showLevel) cols.push("70px");
    if (showTime) cols.push("110px");
    if (hasDelete) cols.push("50px");
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
