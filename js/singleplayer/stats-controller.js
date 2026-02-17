(function () {
  "use strict";

  // ─── 徽章定義（直接使用 badge-checker.js 的全域 BADGE_DEFINITIONS）───

  // ─── 顏色 ───
  var COLORS = [
    "#4fc3f7",
    "#81c784",
    "#ffb74d",
    "#e57373",
    "#ba68c8",
    "#4db6ac",
  ];

  // ─── 初始化 ───
  document.addEventListener("DOMContentLoaded", function () {
    renderOverview();
    renderProgress();
    renderRuleCompare();
    renderChart();
    renderBadges();
  });

  // ─── 1. 總覽 ───
  function renderOverview() {
    var profile = getPlayerProfile();
    var progress = getAdventureProgress();
    var leaderboard = _loadLeaderboard();
    var counters =
      typeof getBadgeCounters === "function" ? getBadgeCounters() : {};

    var totalStars = profile ? profile.totalStars || 0 : 0;
    var level =
      typeof getLevelByStars === "function"
        ? getLevelByStars(totalStars)
        : null;
    var gamesPlayed = counters.totalGamesCompleted || 0;
    if (!gamesPlayed && leaderboard.length > 0) {
      gamesPlayed = leaderboard.reduce(function (s, e) {
        return s + (e.gamesPlayed || 0);
      }, 0);
    }

    // 計算已通過探險點
    var statuses =
      typeof ProgressTracker !== "undefined"
        ? ProgressTracker.getAllPointStatuses()
        : [];
    var passedCount = statuses.filter(function (s) {
      return s.status === "passed";
    }).length;

    // 最佳正確率
    var bestAcc = 0;
    if (leaderboard.length > 0) {
      bestAcc = leaderboard.reduce(function (max, e) {
        return Math.max(max, e.accuracy || 0);
      }, 0);
    }

    var items = [
      {
        icon: level ? level.icon : "🥚",
        value: level ? level.name : "蛋寶寶",
        label: "目前等級",
      },
      { icon: "⭐", value: totalStars, label: "累計星星" },
      {
        icon: "🗺️",
        value: passedCount + "/12",
        label: "探險進度",
      },
      { icon: "🎮", value: gamesPlayed, label: "累計場次" },
      {
        icon: "🎯",
        value: bestAcc ? Math.round(bestAcc) + "%" : "—",
        label: "最佳正確率",
      },
      {
        icon: "🏅",
        value: profile ? (profile.badges || []).length : 0,
        label: "已獲徽章",
      },
    ];

    var grid = document.getElementById("overviewGrid");
    grid.innerHTML = items
      .map(function (item) {
        return (
          '<div class="overview-item">' +
          '<div class="overview-item__icon">' +
          item.icon +
          "</div>" +
          '<div class="overview-item__value">' +
          item.value +
          "</div>" +
          '<div class="overview-item__label">' +
          item.label +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  // ─── 2. 探險進度表 ───
  function renderProgress() {
    var container = document.getElementById("progressContent");

    if (typeof ProgressTracker === "undefined") {
      container.innerHTML =
        '<div class="empty-state"><div class="empty-state__icon">🗺️</div><div class="empty-state__text">尚無探險資料</div></div>';
      return;
    }

    var statuses = ProgressTracker.getAllPointStatuses();
    if (!statuses.length) {
      container.innerHTML =
        '<div class="empty-state"><div class="empty-state__icon">🗺️</div><div class="empty-state__text">尚無探險資料</div></div>';
      return;
    }

    var html =
      '<table class="progress-table"><thead><tr>' +
      "<th>探險點</th><th>狀態</th><th>最高分</th><th>⭐</th>" +
      "</tr></thead><tbody>";

    statuses.forEach(function (p) {
      var statusClass =
        p.status === "passed"
          ? "passed"
          : p.status === "current"
            ? "current"
            : "locked";
      var statusText =
        p.status === "passed"
          ? "✅ 通過"
          : p.status === "current"
            ? "🔶 當前"
            : "🔒 鎖定";
      var stars = (p.starsEarned || 0) + (p.wmStarsEarned || 0);

      html +=
        "<tr>" +
        "<td>" +
        _esc(p.pointLabel.replace(/[①②③④⑤⑥⑦⑧⑨⑩⑪⑫]\s*/, "")) +
        "</td>" +
        '<td><span class="status-badge status-badge--' +
        statusClass +
        '">' +
        statusText +
        "</span></td>" +
        "<td>" +
        (p.bestScore || "—") +
        "</td>" +
        "<td>" +
        (stars > 0 ? "⭐×" + stars : "—") +
        "</td>" +
        "</tr>";
    });

    html += "</tbody></table>";
    container.innerHTML = html;
  }

  // ─── 3. 規則表現比較 ───
  function renderRuleCompare() {
    var container = document.getElementById("ruleCompareContent");
    var progress = getAdventureProgress();
    var records =
      progress && progress.fieldRuleRecords
        ? progress.fieldRuleRecords
        : {};

    // 從探險進度取各探險點的 bestScore
    var statuses =
      typeof ProgressTracker !== "undefined"
        ? ProgressTracker.getAllPointStatuses()
        : [];

    // 按 field_rule 分組，取最佳分數
    var ruleScores = {};
    statuses.forEach(function (p) {
      var key = p.field + "_" + p.rule;
      if (!ruleScores[key] || p.bestScore > ruleScores[key].score) {
        ruleScores[key] = {
          score: p.bestScore || 0,
          field: p.field,
          rule: p.rule,
        };
      }
    });

    var keys = Object.keys(ruleScores);
    if (keys.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><div class="empty-state__icon">📊</div><div class="empty-state__text">完成遊戲後才能看到規則比較</div></div>';
      return;
    }

    // 找最高分用於百分比計算
    var maxScore = Math.max.apply(
      null,
      keys.map(function (k) {
        return ruleScores[k].score;
      }),
    );
    if (maxScore === 0) maxScore = 1;

    var FIELD_NAMES = { mouse: "🐭", fishing: "🐟" };
    var RULE_NAMES = {
      rule1: "規則一",
      rule2: "規則二",
      mixed: "混合",
    };

    var html = '<div class="rule-compare">';
    keys.forEach(function (k, i) {
      var entry = ruleScores[k];
      var pct = Math.round((entry.score / maxScore) * 100);
      var color = COLORS[i % COLORS.length];
      var label =
        (FIELD_NAMES[entry.field] || entry.field) +
        " " +
        (RULE_NAMES[entry.rule] || entry.rule);

      // 從 fieldRuleRecords 取 bestAvgRT
      var record = records[k];
      var rtText =
        record && record.bestAvgRT
          ? Math.round(record.bestAvgRT) + "ms"
          : "";

      html +=
        '<div class="rule-bar">' +
        '<span class="rule-bar__label">' +
        _esc(label) +
        "</span>" +
        '<div class="rule-bar__track">' +
        '<div class="rule-bar__fill" style="width:' +
        pct +
        "%;background:" +
        color +
        '"></div>' +
        "</div>" +
        '<span class="rule-bar__value">' +
        entry.score +
        "分" +
        (rtText ? "<br>" + rtText : "") +
        "</span>" +
        "</div>";
    });
    html += "</div>";
    container.innerHTML = html;
  }

  // ─── 4. 成績圖表 ───
  function renderChart() {
    var canvas = document.getElementById("performanceChart");

    // 從探險進度收集各點 bestScore
    var statuses =
      typeof ProgressTracker !== "undefined"
        ? ProgressTracker.getAllPointStatuses()
        : [];

    var played = statuses.filter(function (s) {
      return s.status === "passed" || s.status === "current";
    });

    if (played.length < 2) {
      var wrapper = canvas.parentNode;
      wrapper.innerHTML =
        '<div class="empty-state"><div class="empty-state__icon">📈</div><div class="empty-state__text">至少完成 2 個探險點後<br>才能看到成績趨勢圖</div></div>';
      return;
    }

    var labels = played.map(function (p) {
      return p.pointLabel.replace(/[①②③④⑤⑥⑦⑧⑨⑩⑪⑫]\s*/, "");
    });
    var scores = played.map(function (p) {
      return p.bestScore || 0;
    });
    var starsData = played.map(function (p) {
      return (p.starsEarned || 0) + (p.wmStarsEarned || 0);
    });

    new Chart(canvas, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "最高分",
            data: scores,
            backgroundColor: "rgba(79, 195, 247, 0.6)",
            borderColor: "#4fc3f7",
            borderWidth: 1,
            borderRadius: 6,
            order: 2,
          },
          {
            label: "⭐ 星星",
            data: starsData,
            type: "line",
            borderColor: "#ffd700",
            backgroundColor: "rgba(255, 215, 0, 0.1)",
            pointBackgroundColor: "#ffd700",
            pointRadius: 4,
            fill: true,
            tension: 0.3,
            yAxisID: "yStars",
            order: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: "index",
        },
        scales: {
          x: {
            ticks: {
              color: "rgba(255,255,255,0.5)",
              font: { size: 10 },
              maxRotation: 45,
            },
            grid: { display: false },
          },
          y: {
            position: "left",
            ticks: { color: "rgba(255,255,255,0.5)", font: { size: 10 } },
            grid: { color: "rgba(255,255,255,0.06)" },
            title: {
              display: true,
              text: "分數",
              color: "rgba(255,255,255,0.4)",
              font: { size: 10 },
            },
          },
          yStars: {
            position: "right",
            min: 0,
            max: Math.max(3, Math.max.apply(null, starsData) + 1),
            ticks: {
              stepSize: 1,
              color: "rgba(255,215,0,0.5)",
              font: { size: 10 },
            },
            grid: { display: false },
            title: {
              display: true,
              text: "星星",
              color: "rgba(255,215,0,0.4)",
              font: { size: 10 },
            },
          },
        },
        plugins: {
          legend: {
            labels: {
              color: "rgba(255,255,255,0.6)",
              font: { size: 11 },
              usePointStyle: true,
              pointStyle: "circle",
            },
          },
        },
      },
    });
  }

  // ─── 5. 徽章收集 ───
  function renderBadges() {
    var container = document.getElementById("badgeContent");
    var profile = getPlayerProfile();
    var earned = profile ? profile.badges || [] : [];
    var defs =
      typeof BADGE_DEFINITIONS !== "undefined" ? BADGE_DEFINITIONS : [];

    if (defs.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><div class="empty-state__icon">🏅</div><div class="empty-state__text">徽章系統載入中…</div></div>';
      return;
    }

    var html = '<div class="badge-grid">';
    defs.forEach(function (badge) {
      var isEarned = earned.indexOf(badge.id) !== -1;
      html +=
        '<div class="badge-cell ' +
        (isEarned ? "badge-cell--earned" : "badge-cell--locked") +
        '" title="' +
        _esc(badge.description || "") +
        '">' +
        '<span class="badge-cell__icon">' +
        badge.icon +
        "</span>" +
        '<span class="badge-cell__name">' +
        _esc(badge.name) +
        "</span>" +
        "</div>";
    });
    html += "</div>";
    container.innerHTML = html;
  }

  // ─── 工具 ───
  function _loadLeaderboard() {
    try {
      var raw = localStorage.getItem("efgame_leaderboard");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function _esc(str) {
    var d = document.createElement("div");
    d.textContent = str || "";
    return d.innerHTML;
  }
})();
