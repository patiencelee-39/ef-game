/**
 * ============================================
 * 探險進度追蹤器
 * ============================================
 * 對應需求文件：§3.9, Flow-21, Flow-22, Flow-26
 * 說明：12 關卡逐步解鎖狀態機 + 遊戲結果處理
 *       整合 storage / score-calculator / level-calculator / badge-checker
 * 依賴：
 *   - storage.js（getAdventureProgress, saveAdventureProgress, ...）
 *   - score-calculator.js（calculateRuleScore, calculateWMScore, calculateStars）
 *   - level-calculator.js（calculateLevel, detectLevelUp）
 *   - badge-checker.js（updateBadgeCounters, checkAllBadges）
 *   - adventure-maps-config.js（ADVENTURE_MAPS, ADVENTURE_POINT_STATUS）
 *   - game-config.js（GAME_CONFIG）
 * ============================================
 */

// =========================================
// 探險進度核心
// =========================================

var ProgressTracker = (function () {
  "use strict";

  // ─── 內部輔助 ───

  /**
   * 取得當前探險點（current point）資訊
   * @returns {{ mapIndex: number, pointIndex: number, mapDef: Object, pointDef: Object, pointRecord: Object }|null}
   */
  function getCurrentPoint() {
    var progress = getAdventureProgress();
    var mapIndex = progress.currentMapIndex;
    var pointIndex = progress.currentPointIndex;

    if (mapIndex >= ADVENTURE_MAPS.length) return null;

    var mapDef = ADVENTURE_MAPS[mapIndex];
    if (pointIndex >= mapDef.points.length) return null;

    var pointDef = mapDef.points[pointIndex];
    var pointRecord = getPointRecord(mapDef.id, pointIndex);

    return {
      mapIndex: mapIndex,
      pointIndex: pointIndex,
      mapDef: mapDef,
      pointDef: pointDef,
      pointRecord: pointRecord,
    };
  }

  /**
   * 取得所有探險點的狀態列表
   * @returns {Array<{ mapId, mapName, pointId, pointLabel, status, starsEarned, wmStarsEarned }>}
   */
  function getAllPointStatuses() {
    var progress = getAdventureProgress();
    var result = [];

    ADVENTURE_MAPS.forEach(function (mapDef, mi) {
      var mapRecord = progress.maps[mi];
      if (!mapRecord) return;

      mapDef.points.forEach(function (pointDef, pi) {
        var pr = mapRecord.points[pi];
        var status;

        if (mi < progress.currentMapIndex) {
          // 前面的地圖 → 全部 passed
          status = ADVENTURE_POINT_STATUS.PASSED;
        } else if (mi === progress.currentMapIndex) {
          if (pi < progress.currentPointIndex) {
            status = ADVENTURE_POINT_STATUS.PASSED;
          } else if (pi === progress.currentPointIndex) {
            status = ADVENTURE_POINT_STATUS.CURRENT;
          } else {
            status = ADVENTURE_POINT_STATUS.LOCKED;
          }
        } else {
          status = ADVENTURE_POINT_STATUS.LOCKED;
        }

        result.push({
          mapId: mapDef.id,
          mapName: mapDef.name,
          mapIcon: mapDef.icon,
          pointId: pointDef.id,
          pointLabel: pointDef.label,
          field: pointDef.field,
          rule: pointDef.rule,
          hasWM: pointDef.hasWM,
          questionsCount: pointDef.questionsCount,
          status: status,
          starsEarned: pr ? pr.starsEarned : 0,
          wmStarsEarned: pr ? pr.wmStarsEarned : 0,
          passed: pr ? pr.passed : false,
          bestScore: pr ? pr.bestScore : 0,
        });
      });
    });

    return result;
  }

  /**
   * 檢查教師覆寫（?unlock=all）
   * @returns {boolean}
   */
  function checkTeacherOverride() {
    try {
      var params = new URLSearchParams(window.location.search);
      return params.get("unlock") === "all";
    } catch (e) {
      return false;
    }
  }

  /**
   * 執行教師覆寫 — 解鎖全部探險點
   */
  function applyTeacherOverride() {
    var progress = getAdventureProgress();

    progress.maps.forEach(function (map) {
      map.points.forEach(function (point) {
        point.passed = true;
      });
    });

    progress.currentMapIndex = ADVENTURE_MAPS.length; // 超出 = 全完成
    progress.currentPointIndex = 0;
    progress.freeChoiceUnlocked = true;

    saveAdventureProgress(progress);
    Logger.info("🔓 教師覆寫：全部探險點已解鎖");
  }

  // ─── 通過判定（Flow-26）───

  /**
   * 判定本輪探險點是否通過
   * 純規則：ruleAccuracy ≥ 83%
   * 規則+WM：ruleAccuracy ≥ 83% AND wmAccuracy ≥ 83%
   *
   * @param {Object} ruleResult - calculateRuleScore 的結果
   * @param {Object|null} wmResult - calculateWMScore 的結果
   * @param {boolean} hasWM - 該探險點是否含 WM
   * @returns {boolean}
   */
  function isPointPassed(ruleResult, wmResult, hasWM) {
    if (!ruleResult.passed) return false;
    if (hasWM && wmResult && !wmResult.wmPassed) return false;
    return true;
  }

  // ─── 遊戲結果處理（核心 orchestrator）───

  /**
   * 處理探險模式的一輪遊戲結果
   * 完整流程：計分 → 星星 → 等級 → 徽章 → 進度推進
   *
   * @param {Object} params
   * @param {Array}  params.ruleResults     - 每題結果 [{ isCorrect, isGo, rt }]
   * @param {Object|null} params.wmData     - WM 結果 { correctCount, totalPositions, direction, completionTimeMs }
   * @param {boolean} params.isRetrySuccess - 是否為不屈勇士觸發
   * @returns {{
   *   ruleResult: Object,
   *   wmResult: Object|null,
   *   starsResult: Object,
   *   pointPassed: boolean,
   *   levelResult: Object,
   *   newBadges: Array,
   *   adventureAdvanced: boolean,
   *   freeChoiceJustUnlocked: boolean,
   *   mapJustCompleted: string|null,
   *   allMapsCompleted: boolean
   * }}
   */
  function processAdventureResult(params) {
    try {
      // === 先判斷重玩，再取 current（修復全通關後重玩 comboResult 為 null）===
      var current = getCurrentPoint(); // 可能為 null（全通關時）
      var isReplay = false;
      var played; // 實際遊玩的探險點資料

      // 嘗試從 sessionPoint 建構 replay 資料（不依賴 current）
      if (
        params.sessionPoint &&
        typeof params.sessionPoint.mapIndex === "number"
      ) {
        var spMapDef = ADVENTURE_MAPS[params.sessionPoint.mapIndex];
        if (
          spMapDef &&
          params.sessionPoint.pointIndex < spMapDef.points.length
        ) {
          var spPointDef = spMapDef.points[params.sessionPoint.pointIndex];
          var spRecord = getPointRecord(
            spMapDef.id,
            params.sessionPoint.pointIndex,
          );

          // 與 current 不同 → 重玩；或 current 為 null（全通關）→ 也是重玩
          if (
            !current ||
            params.sessionPoint.mapIndex !== current.mapIndex ||
            params.sessionPoint.pointIndex !== current.pointIndex
          ) {
            isReplay = true;
            played = {
              mapIndex: params.sessionPoint.mapIndex,
              pointIndex: params.sessionPoint.pointIndex,
              mapDef: spMapDef,
              pointDef: spPointDef,
              pointRecord: spRecord || {
                bestScore: 0,
                starsEarned: 0,
                wmStarsEarned: 0,
                bestTime: null,
                passed: false,
              },
            };
            Logger.info(
              "🔁 重玩模式：實際遊玩",
              spPointDef.id,
              current
                ? "（進度仍在 " + current.pointDef.id + "）"
                : "（全地圖已通關）",
            );
          } else {
            // sessionPoint === current → 非重玩
            played = current;
          }
        }
      }

      // 非重玩且尚未設定 played → 使用 current
      if (!played) {
        if (!current) {
          Logger.error(
            "❌ processAdventureResult: 無當前探險點且無 sessionPoint",
          );
          return null;
        }
        played = current;
      }

      var pointDef = played.pointDef;
      var mapDef = played.mapDef;

      // === 1. 計分 ===
      var fieldRuleRecord = getFieldRuleRecord(pointDef.field, pointDef.rule);
      var ruleResult = calculateRuleScore({
        results: params.ruleResults,
        fieldId: pointDef.field,
        ruleId: pointDef.rule,
        mode: "singleplayer",
        records: {
          bestAvgRT: fieldRuleRecord.bestAvgRT,
          bestScore: played.pointRecord.bestScore,
          firstClear: fieldRuleRecord.firstClear,
        },
      });

      var wmResult = null;
      if (pointDef.hasWM && params.wmData) {
        var wmRecords = { bestWMTime: played.pointRecord.bestTime };
        wmResult = calculateWMScore({
          correctCount: params.wmData.correctCount,
          totalPositions: params.wmData.totalPositions,
          direction: params.wmData.direction,
          completionTimeMs: params.wmData.completionTimeMs,
          records: wmRecords,
        });
      }

      // === 2. 星星 ===
      var starsResult = calculateStars(ruleResult, wmResult);
      var oldTotalStars = getTotalStars();
      var newTotalStars = oldTotalStars;

      // 只有通過才加星（重複通過也加）
      var pointPassed = isPointPassed(ruleResult, wmResult, pointDef.hasWM);
      if (starsResult.totalStars > 0) {
        newTotalStars = addStars(starsResult.totalStars);
      }

      // === 3. 等級 ===
      var levelResult = detectLevelUp(oldTotalStars, newTotalStars);
      if (levelResult.leveledUp) {
        setLevel(levelResult.newLevel);
      }

      // === 4. 更新探險點記錄 ===
      var pointUpdates = {};
      if (ruleResult.finalScore > played.pointRecord.bestScore) {
        pointUpdates.bestScore = ruleResult.finalScore;
      }
      if (starsResult.ruleStars > played.pointRecord.starsEarned) {
        pointUpdates.starsEarned = starsResult.ruleStars;
      }
      if (wmResult && starsResult.wmStars > played.pointRecord.wmStarsEarned) {
        pointUpdates.wmStarsEarned = starsResult.wmStars;
      }
      if (wmResult && wmResult.newBestWMTime !== null) {
        if (
          played.pointRecord.bestTime === null ||
          wmResult.newBestWMTime < played.pointRecord.bestTime
        ) {
          pointUpdates.bestTime = wmResult.newBestWMTime;
        }
      }

      // === 5. 更新 fieldRuleRecord ===
      var fieldRuleUpdates = {};
      if (ruleResult.isFirstClear) {
        fieldRuleUpdates.firstClear = false;
      }
      if (ruleResult.newBestAvgRT !== null) {
        fieldRuleUpdates.bestAvgRT = ruleResult.newBestAvgRT;
      }
      if (Object.keys(fieldRuleUpdates).length > 0) {
        updateFieldRuleRecord(pointDef.field, pointDef.rule, fieldRuleUpdates);
      }

      // === 6. 通過 → 推進探險（僅首次通過且非重玩已通過的關卡才推進） ===
      var adventureAdvanced = false;
      var freeChoiceJustUnlocked = false;
      var mapJustCompleted = null;
      var allMapsCompleted = false;

      if (pointPassed && !played.pointRecord.passed && !isReplay) {
        pointUpdates.passed = true;
        adventureAdvanced = true;

        // 推進到下一點
        var progress = getAdventureProgress();
        var nextPointIndex = current.pointIndex + 1;

        if (nextPointIndex >= mapDef.points.length) {
          // 當前地圖完成
          mapJustCompleted = mapDef.id;
          var nextMapIndex = current.mapIndex + 1;

          if (nextMapIndex >= ADVENTURE_MAPS.length) {
            // 全部完成！
            allMapsCompleted = true;
            progress.currentMapIndex = ADVENTURE_MAPS.length;
            progress.currentPointIndex = 0;
            progress.freeChoiceUnlocked = true;
            freeChoiceJustUnlocked = true;
          } else {
            progress.currentMapIndex = nextMapIndex;
            progress.currentPointIndex = 0;
          }
        } else {
          progress.currentPointIndex = nextPointIndex;
        }

        saveAdventureProgress(progress);
      }

      // 更新 point record（使用實際遊玩的探險點）
      if (Object.keys(pointUpdates).length > 0) {
        updatePointRecord(mapDef.id, played.pointIndex, pointUpdates);
      }

      // === 7. 徽章 ===
      var counters = updateBadgeCounters({
        ruleResult: ruleResult,
        wmResult: wmResult,
        ruleId: pointDef.rule,
      });

      var newBadges = checkAllBadges({
        counters: counters,
        isRetrySuccess: params.isRetrySuccess || false,
        completedAt: new Date(),
      });

      // === 8. 組裝結果 ===
      return {
        // 計分
        ruleResult: ruleResult,
        wmResult: wmResult,
        starsResult: starsResult,

        // 通過判定
        pointPassed: pointPassed,

        // 等級
        levelResult: levelResult,
        totalStars: newTotalStars,

        // 徽章
        newBadges: newBadges,

        // 進度
        adventureAdvanced: adventureAdvanced,
        freeChoiceJustUnlocked: freeChoiceJustUnlocked,
        mapJustCompleted: mapJustCompleted,
        allMapsCompleted: allMapsCompleted,

        // meta
        pointDef: pointDef,
        mapDef: mapDef,
      };
    } catch (err) {
      Logger.error("❌ processAdventureResult 錯誤:", err);
      return null;
    }
  }

  /**
   * 處理自由選擇模式的一輪遊戲結果
   * 與探險模式類似但不推進進度
   *
   * @param {Object} params
   * @param {string} params.fieldId
   * @param {string} params.ruleId
   * @param {boolean} params.hasWM
   * @param {Array}  params.ruleResults
   * @param {Object|null} params.wmData
   * @param {boolean} params.isRetrySuccess
   * @returns {Object} 結算結果
   */
  function processFreeSelectResult(params) {
    try {
      var fieldRuleRecord = getFieldRuleRecord(params.fieldId, params.ruleId);

      var ruleResult = calculateRuleScore({
        results: params.ruleResults,
        fieldId: params.fieldId,
        ruleId: params.ruleId,
        mode: "singleplayer",
        records: {
          bestAvgRT: fieldRuleRecord.bestAvgRT,
          bestScore: 0, // 自由選擇不追蹤 bestScore
          firstClear: false, // 自由選擇不觸發首次通關
        },
      });

      var wmResult = null;
      if (params.hasWM && params.wmData) {
        wmResult = calculateWMScore({
          correctCount: params.wmData.correctCount,
          totalPositions: params.wmData.totalPositions,
          direction: params.wmData.direction,
          completionTimeMs: params.wmData.completionTimeMs,
          records: { bestWMTime: null },
        });
      }

      var starsResult = calculateStars(ruleResult, wmResult);
      var oldTotalStars = getTotalStars();
      var newTotalStars = oldTotalStars;

      if (starsResult.totalStars > 0) {
        newTotalStars = addStars(starsResult.totalStars);
      }

      var levelResult = detectLevelUp(oldTotalStars, newTotalStars);
      if (levelResult.leveledUp) {
        setLevel(levelResult.newLevel);
      }

      // 更新 fieldRuleRecord（速度記錄共用）
      var fieldRuleUpdates = {};
      if (ruleResult.newBestAvgRT !== null) {
        fieldRuleUpdates.bestAvgRT = ruleResult.newBestAvgRT;
      }
      if (Object.keys(fieldRuleUpdates).length > 0) {
        updateFieldRuleRecord(params.fieldId, params.ruleId, fieldRuleUpdates);
      }

      // 徽章
      var counters = updateBadgeCounters({
        ruleResult: ruleResult,
        wmResult: wmResult,
        ruleId: params.ruleId,
      });

      var newBadges = checkAllBadges({
        counters: counters,
        isRetrySuccess: params.isRetrySuccess || false,
        completedAt: new Date(),
      });

      return {
        ruleResult: ruleResult,
        wmResult: wmResult,
        starsResult: starsResult,
        pointPassed: isPointPassed(ruleResult, wmResult, params.hasWM),
        levelResult: levelResult,
        totalStars: newTotalStars,
        newBadges: newBadges,
      };
    } catch (err) {
      Logger.error("❌ processFreeSelectResult 錯誤:", err);
      return null;
    }
  }

  // ─── 狀態查詢 ───

  /**
   * 是否可進入自由選擇模式
   * @returns {boolean}
   */
  function isFreeSelectAvailable() {
    if (checkTeacherOverride()) return true;
    var progress = getAdventureProgress();
    return progress.freeChoiceUnlocked || isAllPointsPassed();
  }

  /**
   * 取得探險進度摘要
   * @returns {{ totalPoints: number, passedPoints: number, percent: number, currentMapName: string, currentPointLabel: string }}
   */
  function getProgressSummary() {
    var progress = getAdventureProgress();
    var totalPoints = 0;
    var passedPoints = 0;

    progress.maps.forEach(function (map) {
      map.points.forEach(function (p) {
        totalPoints++;
        if (p.passed) passedPoints++;
      });
    });

    var current = getCurrentPoint();
    return {
      totalPoints: totalPoints,
      passedPoints: passedPoints,
      percent:
        totalPoints > 0 ? Math.round((passedPoints / totalPoints) * 100) : 0,
      currentMapName: current ? current.mapDef.name : "全部完成！",
      currentPointLabel: current ? current.pointDef.label : "🎉",
    };
  }

  // ─── 公開 API ───

  return {
    getCurrentPoint: getCurrentPoint,
    getAllPointStatuses: getAllPointStatuses,
    checkTeacherOverride: checkTeacherOverride,
    applyTeacherOverride: applyTeacherOverride,
    isPointPassed: isPointPassed,
    processAdventureResult: processAdventureResult,
    processFreeSelectResult: processFreeSelectResult,
    isFreeSelectAvailable: isFreeSelectAvailable,
    getProgressSummary: getProgressSummary,
  };
})();

// =========================================
// 匯出
// =========================================

if (typeof window !== "undefined") {
  window.ProgressTracker = ProgressTracker;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ProgressTracker;
}
