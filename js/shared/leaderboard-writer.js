/**
 * ============================================
 * 排行榜寫入器 — LeaderboardWriter
 * ============================================
 * 說明：將遊戲結果寫入 localStorage["efgame_leaderboard"]
 *       供 leaderboard/class.html 和 management/index.html 讀取
 *
 * 資料格式（每筆記錄）：
 *   { id, name, class, bestScore, gamesPlayed, accuracy, lastPlayed }
 *
 * 策略：
 *   - 以 id 為 key（相同玩家合併）
 *   - bestScore 取歷史最高分
 *   - gamesPlayed 累加
 *   - accuracy 取歷史加權平均
 *   - lastPlayed 取最新時間
 *
 * 匯出：window.LeaderboardWriter
 * ============================================
 */

var LeaderboardWriter = (function () {
  "use strict";

  var STORAGE_KEY = "efgame_leaderboard";

  /**
   * 讀取目前排行榜資料
   * @returns {Array} 玩家陣列
   */
  function _load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn("⚠️ LeaderboardWriter: 讀取失敗", e);
      return [];
    }
  }

  /**
   * 儲存排行榜資料
   * @param {Array} data
   */
  function _save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("⚠️ LeaderboardWriter: 儲存失敗", e);
    }
  }

  /**
   * 取得玩家識別資訊
   * @returns {{ id: string, name: string, class: string }}
   */
  function _getPlayerInfo() {
    var id = "anonymous";
    var name = "匿名玩家";
    var playerClass = "未分班";

    // 1. 優先嘗試從 localStorage 取得 currentPlayer（多人模式）
    try {
      var cp = localStorage.getItem("currentPlayer");
      if (cp) {
        var parsed = JSON.parse(cp);
        id = parsed.id || parsed.uid || id;
        name = parsed.name || parsed.nickname || name;
        playerClass = parsed.class || parsed.className || playerClass;
      }
    } catch (e) {
      /* ignore */
    }

    // 2. Fallback：讀取單人模式的 efgame-player-profile
    if (id === "anonymous") {
      try {
        var pp =
          sessionStorage.getItem("efgame-player-profile") ||
          localStorage.getItem("efgame-player-profile");
        if (pp) {
          var profile = JSON.parse(pp);
          // 用 seatNumber 或 nickname 產生穩定 id
          var nick = profile.nickname || "";
          var seat = profile.seatNumber || "";
          if (nick || seat) {
            id = "sp_" + (seat || nick).replace(/\s/g, "_");
            name = nick || "學生" + seat;
            playerClass = profile.playerClass || playerClass;
          }
        }
      } catch (e) {
        /* ignore */
      }
    }

    // 3. 嘗試從 Firebase Auth 取得 uid
    if (
      id === "anonymous" &&
      typeof firebase !== "undefined" &&
      firebase.auth &&
      firebase.auth().currentUser
    ) {
      id = firebase.auth().currentUser.uid;
    }

    return { id: id, name: name, class: playerClass };
  }

  /**
   * 記錄一場遊戲結果到排行榜
   *
   * @param {Object} result
   * @param {number} result.score       - 本場分數（正確題數 or 自訂分數）
   * @param {number} result.accuracy    - 本場正確率（0~100）
   * @param {number} result.totalTrials - 本場總題數
   * @param {Object} [playerOverride]   - 覆蓋玩家資訊 { id, name, class }
   */
  function recordGame(result, playerOverride) {
    var player = playerOverride || _getPlayerInfo();
    var data = _load();

    // 找既有記錄
    var existing = null;
    var existingIndex = -1;
    for (var i = 0; i < data.length; i++) {
      if (data[i].id === player.id) {
        existing = data[i];
        existingIndex = i;
        break;
      }
    }

    var score = result.score || 0;
    var accuracy = result.accuracy || 0;
    var totalTrials = result.totalTrials || 0;

    if (existing) {
      // 更新既有記錄
      existing.name = player.name; // 名字可能改過
      existing.class = player.class;
      existing.bestScore = Math.max(existing.bestScore || 0, score);
      existing.gamesPlayed = (existing.gamesPlayed || 0) + 1;

      // 加權平均正確率
      var prevGames = existing.gamesPlayed - 1;
      if (prevGames > 0 && existing.accuracy != null) {
        existing.accuracy =
          Math.round(
            ((existing.accuracy * prevGames + accuracy) /
              existing.gamesPlayed) *
              10,
          ) / 10;
      } else {
        existing.accuracy = Math.round(accuracy * 10) / 10;
      }

      existing.lastPlayed = new Date().toISOString();
      data[existingIndex] = existing;
    } else {
      // 新增記錄
      data.push({
        id: player.id,
        name: player.name,
        class: player.class,
        bestScore: score,
        gamesPlayed: 1,
        accuracy: Math.round(accuracy * 10) / 10,
        lastPlayed: new Date().toISOString(),
      });
    }

    _save(data);
    console.log(
      "📊 排行榜已更新：" +
        player.name +
        " | 最高分: " +
        (existing ? existing.bestScore : score) +
        " | 累計場次: " +
        (existing ? existing.gamesPlayed : 1),
    );
  }

  /**
   * 從單人模式結算資料提取並記錄
   * @param {Object} resultData - ModeController.getResultData() 的資料
   */
  function recordFromSingleplayer(resultData) {
    if (!resultData) return;

    var score = 0;
    var accuracy = 0;
    var totalTrials = 0;
    var avgRT = 0;
    var stars = 0;

    if (resultData.mode === "adventure") {
      // 探險模式：取 comboResult 中的 ruleResult
      var cr = resultData.comboResult;
      if (cr && cr.ruleResult) {
        var rr = cr.ruleResult;
        score = rr.correctCount || 0;
        accuracy = rr.accuracy != null ? rr.accuracy * 100 : 0;
        totalTrials = rr.totalCount || 0;
        avgRT = rr.avgRT ? Math.round(rr.avgRT) : 0;
      }
      // 星星
      if (cr && cr.starsResult) {
        stars = cr.starsResult.totalStars || 0;
      } else if (cr) {
        stars = cr.totalStars || 0;
      }
    } else {
      // 自由選擇模式：合併所有 combo 結果
      var all = resultData.allComboResults || [];
      var totalCorrect = 0;
      var rtSum = 0;
      var rtCount = 0;
      for (var i = 0; i < all.length; i++) {
        var entry = all[i];
        var r = entry.result || {};
        var rr2 = r.ruleResult || {};
        totalCorrect += rr2.correctCount || 0;
        totalTrials += rr2.totalCount || 0;
        if (rr2.avgRT) {
          rtSum += rr2.avgRT;
          rtCount++;
        }
        stars += (r.starsResult || {}).totalStars || 0;
      }
      score = totalCorrect;
      accuracy = totalTrials > 0 ? (totalCorrect / totalTrials) * 100 : 0;
      avgRT = rtCount > 0 ? Math.round(rtSum / rtCount) : 0;
    }

    recordGame({
      score: score,
      accuracy: accuracy,
      totalTrials: totalTrials,
      avgRT: avgRT,
      stars: stars,
    });
  }

  /**
   * 從多人模式結算資料提取並記錄
   * @param {Object} gameResult - localStorage["gameResult"] 解析後的資料
   */
  function recordFromMultiplayer(gameResult) {
    if (!gameResult) return;

    recordGame({
      score: gameResult.score || gameResult.correctAnswers || 0,
      accuracy: gameResult.accuracy || 0,
      totalTrials: gameResult.totalQuestions || 0,
      avgRT: gameResult.avgRT ? Math.round(gameResult.avgRT) : 0,
      stars: gameResult.stars || 0,
    });
  }

  return {
    recordGame: recordGame,
    recordFromSingleplayer: recordFromSingleplayer,
    recordFromMultiplayer: recordFromMultiplayer,
  };
})();

// 匯出
if (typeof window !== "undefined") {
  window.LeaderboardWriter = LeaderboardWriter;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = LeaderboardWriter;
}
