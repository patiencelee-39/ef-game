/**
 * ============================================
 * 接力賽管理模組 — RelayManager
 * ============================================
 * 職責：
 *   1. 隊伍建立/自動分組/手動調整
 *   2. 棒次排程（隨機 or 房主指定）
 *   3. 接力狀態機（team-setup → playing → finished）
 *   4. 棒次切換 Firebase 同步
 *   5. 團隊分數累計
 *   6. 觀戰儀表板資料供給
 *
 * 不認識 DOM — 只做資料層
 * 依賴：firebase-app-compat + firebase-database-compat
 *
 * 匯出：window.RelayManager
 * ============================================
 */

var RelayManager = (function () {
  "use strict";

  // =========================================
  // 常數
  // =========================================

  /** 預設隊伍配色（最多 10 隊） */
  var TEAM_PRESETS = [
    { name: "紅隊", color: "#e74c3c", emoji: "🔴" },
    { name: "藍隊", color: "#3498db", emoji: "🔵" },
    { name: "綠隊", color: "#2ecc71", emoji: "🟢" },
    { name: "黃隊", color: "#f1c40f", emoji: "🟡" },
    { name: "紫隊", color: "#9b59b6", emoji: "🟣" },
    { name: "橙隊", color: "#e67e22", emoji: "🟠" },
    { name: "粉隊", color: "#fd79a8", emoji: "💗" },
    { name: "青隊", color: "#00cec9", emoji: "🩵" },
    { name: "灰隊", color: "#636e72", emoji: "⚪" },
    { name: "棕隊", color: "#d35400", emoji: "🟤" },
  ];

  var MAX_TEAMS = 10;
  var MIN_PLAYERS_PER_TEAM = 1;

  // =========================================
  // 內部狀態
  // =========================================

  var _roomCode = null;
  var _roomRef = null;
  var _teamsRef = null;
  var _relayRef = null;
  var _playerId = null;
  var _isHost = false;

  /** 隊伍快照 { teamId: { name, color, emoji, captainId, order[], members{}, currentBaton, totalScore, ... } } */
  var _teamsSnapshot = {};

  /** 接力狀態快照 { phase, started, batonLog[] } */
  var _relayState = {};

  /** 完成通知去重 */
  var _notifiedFinishedTeams = {};
  var _allTeamsFinishedNotified = false;

  /** 回呼 */
  var _callbacks = {
    onTeamsUpdate: null, // (teamsMap) → 隊伍變更
    onRelayStateUpdate: null, // (relayState) → 接力狀態變更
    onBatonChange: null, // (teamId, newBatonUid, batonIndex) → 棒次切換
    onTeamFinished: null, // (teamId, teamData) → 某隊全部完成
    onAllTeamsFinished: null, // (teamsMap) → 全部隊伍完成
  };

  /** 監聽器引用（用於 cleanup） */
  var _listeners = [];

  // =========================================
  // 初始化
  // =========================================

  /**
   * @param {Object} config
   * @param {string} config.roomCode
   * @param {string} config.playerId
   * @param {boolean} config.isHost
   * @param {Object} [config.callbacks]
   */
  function init(config) {
    _roomCode = config.roomCode;
    _playerId = config.playerId;
    _isHost = config.isHost || false;
    _teamsSnapshot = {};
    _relayState = {};

    if (config.callbacks) {
      for (var key in config.callbacks) {
        if (_callbacks.hasOwnProperty(key)) {
          _callbacks[key] = config.callbacks[key];
        }
      }
    }

    var db = firebase.database();
    _roomRef = db.ref("rooms/" + _roomCode);
    _teamsRef = _roomRef.child("teams");
    _relayRef = _roomRef.child("relayState");

    _startTeamsListener();
    _startRelayListener();

    Logger.debug("🏁 [RelayManager] 初始化完成 room=" + _roomCode);
  }

  // =========================================
  // 監聽器
  // =========================================

  function _startTeamsListener() {
    var ref = _teamsRef;
    var handler = ref.on("value", function (snap) {
      _teamsSnapshot = snap.val() || {};

      if (_callbacks.onTeamsUpdate) {
        _callbacks.onTeamsUpdate(_teamsSnapshot);
      }

      // 檢查是否全部隊伍完成
      _checkAllTeamsFinished();
    });
    _listeners.push({ ref: ref, event: "value", handler: handler });
  }

  function _startRelayListener() {
    var ref = _relayRef;
    var handler = ref.on("value", function (snap) {
      _relayState = snap.val() || {};

      if (_callbacks.onRelayStateUpdate) {
        _callbacks.onRelayStateUpdate(_relayState);
      }
    });
    _listeners.push({ ref: ref, event: "value", handler: handler });
  }

  // =========================================
  // 隊伍管理（房主專用）
  // =========================================

  /**
   * 自動分組：將玩家平均分配至指定數量的隊伍
   * @param {Object} playersMap — { uid: { nickname, ... } }
   * @param {number} teamCount — 隊伍數量（2-4）
   * @returns {Promise}
   */
  function autoAssignTeams(playersMap, teamCount) {
    if (!_isHost) return Promise.reject(new Error("只有房主可以分組"));

    teamCount = Math.min(Math.max(teamCount || 2, 2), MAX_TEAMS);

    // playersMap 可能是 Array（來自 lobby playersList）或 Object（uid→data）
    var playerIds;
    if (Array.isArray(playersMap)) {
      playerIds = playersMap
        .filter(function (p) {
          return p.role !== "spectator";
        })
        .map(function (p) {
          return p.id || p.uid;
        });
      // 轉為 uid→data map 供後續讀取 nickname
      var _map = {};
      playersMap.forEach(function (p) {
        _map[p.id || p.uid] = p;
      });
      playersMap = _map;
    } else {
      playerIds = Object.keys(playersMap).filter(function (uid) {
        var p = playersMap[uid];
        return p.role !== "spectator";
      });
    }

    // 隨機打亂
    for (var i = playerIds.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = playerIds[i];
      playerIds[i] = playerIds[j];
      playerIds[j] = tmp;
    }

    // 建立隊伍資料
    var teams = {};
    for (var t = 0; t < teamCount; t++) {
      var preset = TEAM_PRESETS[t];
      var teamId = "team" + (t + 1);
      teams[teamId] = {
        name: preset.name,
        color: preset.color,
        emoji: preset.emoji,
        captainId: null,
        order: [],
        currentBaton: 0,
        totalScore: 0,
        totalCorrect: 0,
        totalTrials: 0,
        finished: false,
        members: {},
      };
    }

    // 輪流分配
    for (var idx = 0; idx < playerIds.length; idx++) {
      var uid = playerIds[idx];
      var targetTeam = "team" + ((idx % teamCount) + 1);
      var nickname = playersMap[uid].nickname || "玩家";

      teams[targetTeam].members[uid] = {
        nickname: nickname,
        score: 0,
        accuracy: 0,
        finished: false,
        batonIndex: -1,
      };
      teams[targetTeam].order.push(uid);
    }

    // 第一個成員預設為隊長
    for (var tid in teams) {
      if (teams[tid].order.length > 0) {
        teams[tid].captainId = teams[tid].order[0];
      }
    }

    return _teamsRef.set(teams);
  }

  /**
   * 手動移動玩家到指定隊伍
   * @param {string} uid
   * @param {string} fromTeamId
   * @param {string} toTeamId
   * @param {Object} playersMap — 完整玩家資料
   */
  function movePlayerToTeam(uid, fromTeamId, toTeamId, playersMap) {
    if (!_isHost) return Promise.reject(new Error("只有房主可以調整"));

    var updates = {};

    // 從原隊伍移除
    updates["teams/" + fromTeamId + "/members/" + uid] = null;

    // 從原隊伍 order 移除（需讀取後重新計算）
    var fromOrder = (_teamsSnapshot[fromTeamId] || {}).order || [];
    var newFromOrder = fromOrder.filter(function (id) {
      return id !== uid;
    });
    updates["teams/" + fromTeamId + "/order"] = newFromOrder;

    // 如果原隊隊長被移走，指派新隊長
    if (
      _teamsSnapshot[fromTeamId] &&
      _teamsSnapshot[fromTeamId].captainId === uid
    ) {
      updates["teams/" + fromTeamId + "/captainId"] =
        newFromOrder.length > 0 ? newFromOrder[0] : null;
    }

    // 加入新隊伍
    var nickname =
      (playersMap[uid] || {}).nickname ||
      (_teamsSnapshot[fromTeamId] &&
      _teamsSnapshot[fromTeamId].members &&
      _teamsSnapshot[fromTeamId].members[uid]
        ? _teamsSnapshot[fromTeamId].members[uid].nickname
        : "玩家");

    updates["teams/" + toTeamId + "/members/" + uid] = {
      nickname: nickname,
      score: 0,
      accuracy: 0,
      finished: false,
      batonIndex: -1,
    };

    var toOrder = (_teamsSnapshot[toTeamId] || {}).order || [];
    var newToOrder = toOrder.concat([uid]);
    updates["teams/" + toTeamId + "/order"] = newToOrder;

    return _roomRef.update(updates);
  }

  /**
   * 設定隊長
   */
  function setCaptain(teamId, uid) {
    if (!_isHost) return Promise.reject(new Error("只有房主可以設定隊長"));
    return _teamsRef.child(teamId + "/captainId").set(uid);
  }

  /**
   * 玩家自行加入指定隊伍（selfSelect 分隊模式）
   * 任何玩家都可呼叫，會自動從原隊移出
   * @param {string} toTeamId — 目標隊伍 ID (e.g. "team1")
   * @param {string} nickname — 該玩家暱稱
   */
  function joinTeam(toTeamId, nickname) {
    var uid = _playerId;
    if (!uid) return Promise.reject(new Error("無法取得玩家 ID"));

    var updates = {};

    // 先從現有隊伍移除（遍歷所有隊伍）
    for (var tid in _teamsSnapshot) {
      if (!_teamsSnapshot.hasOwnProperty(tid)) continue;
      var members = _teamsSnapshot[tid].members || {};
      if (members[uid]) {
        // 從舊隊移除
        updates["teams/" + tid + "/members/" + uid] = null;
        var oldOrder = (_teamsSnapshot[tid].order || []).filter(function (id) {
          return id !== uid;
        });
        updates["teams/" + tid + "/order"] = oldOrder;
        // 如果是舊隊隊長，改指派
        if (_teamsSnapshot[tid].captainId === uid) {
          updates["teams/" + tid + "/captainId"] =
            oldOrder.length > 0 ? oldOrder[0] : null;
        }
        break; // 一個玩家只會在一隊
      }
    }

    // 加入新隊伍
    updates["teams/" + toTeamId + "/members/" + uid] = {
      nickname: nickname || "玩家",
      score: 0,
      accuracy: 0,
      finished: false,
      batonIndex: -1,
    };

    var toOrder = (_teamsSnapshot[toTeamId] || {}).order || [];
    var newToOrder = toOrder
      .filter(function (id) {
        return id !== uid;
      })
      .concat([uid]);
    updates["teams/" + toTeamId + "/order"] = newToOrder;

    // 如果目標隊伍還沒有隊長，自動設為隊長
    var targetTeam = _teamsSnapshot[toTeamId] || {};
    if (!targetTeam.captainId || targetTeam.captainId === null) {
      updates["teams/" + toTeamId + "/captainId"] = uid;
    }

    return _roomRef.update(updates);
  }

  /**
   * 建立空隊伍結構（供 selfSelect 模式用，開放玩家自行加入）
   * @param {number} teamCount
   */
  function createEmptyTeams(teamCount) {
    var teams = {};
    for (var t = 0; t < teamCount; t++) {
      var preset = TEAM_PRESETS[t];
      var teamId = "team" + (t + 1);
      teams[teamId] = {
        name: preset.name,
        color: preset.color,
        emoji: preset.emoji,
        captainId: null,
        order: [],
        currentBaton: 0,
        totalScore: 0,
        totalCorrect: 0,
        totalTrials: 0,
        finished: false,
        members: {},
      };
    }
    return _teamsRef.set(teams);
  }

  /**
   * 更改隊名（隊長或房主可操作）
   * @param {string} teamId
   * @param {string} newName — 新隊名（最多 12 字）
   */
  function renameTeam(teamId, newName) {
    if (!newName || !newName.trim())
      return Promise.reject(new Error("隊名不可為空"));
    newName = newName.trim().substring(0, 12);
    // 檢查權限：房主 或 該隊隊長
    var team = _teamsSnapshot[teamId];
    if (!_isHost && (!team || team.captainId !== _playerId)) {
      return Promise.reject(new Error("只有隊長或房主可以更改隊名"));
    }
    return _teamsRef.child(teamId + "/name").set(newName);
  }

  // =========================================
  // 棒次排程
  // =========================================

  /**
   * 隨機排列某隊棒次
   * @param {string} teamId
   */
  function randomizeBatonOrder(teamId) {
    if (!_isHost) return Promise.reject(new Error("只有房主可以排序"));
    var order = (_teamsSnapshot[teamId] || {}).order || [];
    var shuffled = order.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = tmp;
    }
    return _teamsRef.child(teamId + "/order").set(shuffled);
  }

  /**
   * 房主手動設定某隊棒次
   * @param {string} teamId
   * @param {string[]} orderedUids
   */
  function setBatonOrder(teamId, orderedUids) {
    if (!_isHost) return Promise.reject(new Error("只有房主可以排序"));
    return _teamsRef.child(teamId + "/order").set(orderedUids);
  }

  // =========================================
  // 接力賽開始
  // =========================================

  /**
   * 房主啟動接力賽
   * @returns {Promise}
   */
  function startRelay() {
    if (!_isHost) return Promise.reject(new Error("只有房主可以開始"));

    var updates = {};

    // 設定每個隊伍的第一棒 batonIndex 為 0
    for (var teamId in _teamsSnapshot) {
      if (!_teamsSnapshot.hasOwnProperty(teamId)) continue;
      updates["teams/" + teamId + "/currentBaton"] = 0;

      // 為 order 中的每個成員標記 batonIndex
      var order = _teamsSnapshot[teamId].order || [];
      for (var i = 0; i < order.length; i++) {
        updates["teams/" + teamId + "/members/" + order[i] + "/batonIndex"] = i;
      }
    }

    // 設定接力狀態
    updates["relayState/phase"] = "playing";
    updates["relayState/started"] = true;
    updates["relayState/startedAt"] = firebase.database.ServerValue.TIMESTAMP;

    return _roomRef.update(updates);
  }

  // =========================================
  // 棒次推進（玩家完成時呼叫）
  // =========================================

  /**
   * 當前棒次玩家完成遊戲，推進到下一棒
   * @param {string} teamId — 所屬隊伍
   * @param {Object} scoreData — { score, correct, trials, accuracy, avgRT }
   * @returns {Promise}
   */
  function advanceBaton(teamId, scoreData) {
    var team = _teamsSnapshot[teamId];
    if (!team) return Promise.reject(new Error("隊伍不存在"));

    var currentIdx = team.currentBaton || 0;
    var order = team.order || [];
    var currentUid = order[currentIdx];

    if (currentUid !== _playerId) {
      Logger.warn("[RelayManager] 非當前棒次玩家嘗試推進");
      return Promise.resolve();
    }

    var updates = {};

    // 標記當前成員已完成 + 寫入分數
    updates["teams/" + teamId + "/members/" + _playerId + "/finished"] = true;
    updates["teams/" + teamId + "/members/" + _playerId + "/score"] =
      scoreData.score || 0;
    updates["teams/" + teamId + "/members/" + _playerId + "/accuracy"] =
      scoreData.accuracy || 0;

    // 累加隊伍總分
    var newTotalScore = (team.totalScore || 0) + (scoreData.score || 0);
    var newTotalCorrect = (team.totalCorrect || 0) + (scoreData.correct || 0);
    var newTotalTrials = (team.totalTrials || 0) + (scoreData.trials || 0);

    updates["teams/" + teamId + "/totalScore"] = newTotalScore;
    updates["teams/" + teamId + "/totalCorrect"] = newTotalCorrect;
    updates["teams/" + teamId + "/totalTrials"] = newTotalTrials;

    // 記錄棒次日誌
    var logEntry = {
      uid: _playerId,
      score: scoreData.score || 0,
      accuracy: scoreData.accuracy || 0,
      timestamp: Date.now(),
    };

    // 推進棒次 or 標記隊伍完成
    var nextIdx = currentIdx + 1;
    if (nextIdx >= order.length) {
      // 該隊全部完成
      updates["teams/" + teamId + "/finished"] = true;
      updates["teams/" + teamId + "/currentBaton"] = order.length; // 超出 = 完成
    } else {
      updates["teams/" + teamId + "/currentBaton"] = nextIdx;
    }

    return _roomRef.update(updates).then(function () {
      // 推送棒次日誌
      return _relayRef.child("batonLog").push(logEntry);
    });
  }

  // =========================================
  // 全部完成偵測
  // =========================================

  function _checkAllTeamsFinished() {
    var teamIds = Object.keys(_teamsSnapshot);
    if (teamIds.length === 0) return;

    var allDone = true;
    for (var i = 0; i < teamIds.length; i++) {
      var team = _teamsSnapshot[teamIds[i]];
      if (!team.finished) {
        allDone = false;
        break;
      }
    }

    if (allDone) {
      if (_callbacks.onAllTeamsFinished && !_allTeamsFinishedNotified) {
        _allTeamsFinishedNotified = true;
        _callbacks.onAllTeamsFinished(_teamsSnapshot);
      }
    }

    // 也逐隊檢查並回呼（去重）
    for (var j = 0; j < teamIds.length; j++) {
      var t = _teamsSnapshot[teamIds[j]];
      if (t.finished && _callbacks.onTeamFinished && !_notifiedFinishedTeams[teamIds[j]]) {
        _notifiedFinishedTeams[teamIds[j]] = true;
        _callbacks.onTeamFinished(teamIds[j], t);
      }
    }
  }

  // =========================================
  // 查詢 API
  // =========================================

  /**
   * 取得玩家所屬隊伍 ID
   * @param {string} [uid] — 預設 _playerId
   * @returns {string|null}
   */
  function getMyTeamId(uid) {
    uid = uid || _playerId;
    for (var teamId in _teamsSnapshot) {
      if (!_teamsSnapshot.hasOwnProperty(teamId)) continue;
      var members = _teamsSnapshot[teamId].members || {};
      if (members[uid]) return teamId;
    }
    return null;
  }

  /**
   * 取得某隊當前棒次的 UID
   * @param {string} teamId
   * @returns {string|null}
   */
  function getCurrentBatonUid(teamId) {
    var team = _teamsSnapshot[teamId];
    if (!team) return null;
    var order = team.order || [];
    var idx = team.currentBaton || 0;
    return idx < order.length ? order[idx] : null;
  }

  /**
   * 我現在是否為當前棒次？
   * @returns {boolean}
   */
  function isMyTurn() {
    var myTeam = getMyTeamId();
    if (!myTeam) return false;
    return getCurrentBatonUid(myTeam) === _playerId;
  }

  /**
   * 取得所有隊伍排行（按總分降序）
   * @returns {Array} [ { teamId, name, color, emoji, totalScore, totalCorrect, finished, members[] } ]
   */
  function getTeamRanking() {
    var ranking = [];
    for (var teamId in _teamsSnapshot) {
      if (!_teamsSnapshot.hasOwnProperty(teamId)) continue;
      var t = _teamsSnapshot[teamId];
      ranking.push({
        teamId: teamId,
        name: t.name,
        color: t.color,
        emoji: t.emoji,
        totalScore: t.totalScore || 0,
        totalCorrect: t.totalCorrect || 0,
        totalTrials: t.totalTrials || 0,
        finished: t.finished || false,
        memberCount: (t.order || []).length,
        currentBaton: t.currentBaton || 0,
        order: t.order || [],
        members: t.members || {},
      });
    }
    ranking.sort(function (a, b) {
      return b.totalScore - a.totalScore;
    });
    return ranking;
  }

  /**
   * 取得某隊的棒次進度描述
   * @param {string} teamId
   * @returns {{ current: number, total: number, currentPlayerName: string }}
   */
  function getBatonProgress(teamId) {
    var team = _teamsSnapshot[teamId];
    if (!team) return { current: 0, total: 0, currentPlayerName: "" };
    var order = team.order || [];
    var idx = team.currentBaton || 0;
    var currentUid = idx < order.length ? order[idx] : null;
    var members = team.members || {};
    var currentName =
      currentUid && members[currentUid] ? members[currentUid].nickname : "";
    return {
      current: Math.min(idx + 1, order.length),
      total: order.length,
      currentPlayerName: currentName,
      finished: team.finished || false,
    };
  }

  // =========================================
  // 清理
  // =========================================

  function destroy() {
    _listeners.forEach(function (l) {
      l.ref.off(l.event);
    });
    _listeners = [];
    _teamsSnapshot = {};
    _relayState = {};
    Logger.debug("🔌 [RelayManager] 已斷開");
  }

  // =========================================
  // 公開 API
  // =========================================

  return {
    TEAM_PRESETS: TEAM_PRESETS,
    MAX_TEAMS: MAX_TEAMS,

    init: init,

    // 隊伍管理
    autoAssignTeams: autoAssignTeams,
    movePlayerToTeam: movePlayerToTeam,
    joinTeam: joinTeam,
    createEmptyTeams: createEmptyTeams,
    setCaptain: setCaptain,
    renameTeam: renameTeam,

    // 棒次排程
    randomizeBatonOrder: randomizeBatonOrder,
    setBatonOrder: setBatonOrder,

    // 接力賽流程
    startRelay: startRelay,
    advanceBaton: advanceBaton,

    // 查詢
    getMyTeamId: getMyTeamId,
    getCurrentBatonUid: getCurrentBatonUid,
    isMyTurn: isMyTurn,
    getTeamRanking: getTeamRanking,
    getBatonProgress: getBatonProgress,

    // 快照
    getTeams: function () {
      return _teamsSnapshot;
    },
    getRelayState: function () {
      return _relayState;
    },

    destroy: destroy,
  };
})();
