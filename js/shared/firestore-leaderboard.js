/**
 * ============================================
 * Firestore 排行榜服務 — FirestoreLeaderboard
 * ============================================
 * 說明：處理班級排行榜和世界排行榜的 Firestore CRUD 操作
 *
 * 二軌制：
 *   📋 班級排行榜 /classLeaderboards/{boardId}/entries/{entryId}
 *   🌐 世界排行榜 /worldLeaderboard/{uid_fieldId_ruleId}（per-rule）
 *
 * 依賴：firebase-app, firebase-firestore, firebase-auth（均在 index.html 載入）
 *
 * 匯出：window.FirestoreLeaderboard
 * ============================================
 */

var FirestoreLeaderboard = (function () {
  "use strict";

  // ─── 工具函式 ───

  function _getFirestore() {
    if (
      typeof firebase === "undefined" ||
      !firebase.firestore ||
      !window.firebaseServices ||
      !window.firebaseServices.firestore
    ) {
      Logger.warn("⚠️ Firestore 尚未載入");
      return null;
    }
    return window.firebaseServices.firestore;
  }

  function _getAuth() {
    if (
      typeof firebase === "undefined" ||
      !firebase.auth ||
      !window.firebaseServices ||
      !window.firebaseServices.auth
    ) {
      return null;
    }
    return window.firebaseServices.auth;
  }

  function _getCurrentUser() {
    var auth = _getAuth();
    return auth ? auth.currentUser : null;
  }

  /**
   * 產生 6 位代碼（大寫英文 + 數字）
   */
  function _generateCode() {
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 排除 I/O/0/1 避免混淆
    var code = "";
    for (var i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // ═══════════════════════════════════════
  // 📋 班級排行榜
  // ═══════════════════════════════════════

  /**
   * 建立新的班級排行看板
   * @param {string} boardName - 看板名稱（如「112學年上學期 中班」）
   * @returns {Promise<{boardId: string, code: string, shareUrl: string}>}
   */
  function createClassBoard(boardName) {
    var db = _getFirestore();
    var user = _getCurrentUser();
    if (!db || !user) {
      return Promise.reject(new Error("請先登入"));
    }

    var code = _generateCode();
    var boardData = {
      ownerId: user.uid,
      boardName: boardName || "班級排行榜",
      code: code,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      entryCount: 0,
    };

    return db
      .collection("classLeaderboards")
      .add(boardData)
      .then(function (docRef) {
        var boardId = docRef.id;
        var shareUrl =
          window.location.origin +
          "/leaderboard/class.html?board=" +
          boardId +
          "&code=" +
          code;

        Logger.info("✅ 班級看板已建立：" + boardId + "（代碼：" + code + "）");
        return {
          boardId: boardId,
          code: code,
          shareUrl: shareUrl,
          qrData: shareUrl,
        };
      });
  }

  /**
   * 透過代碼查找看板
   * @param {string} code - 6 位代碼
   * @returns {Promise<{boardId: string, boardName: string, code: string} | null>}
   */
  function findBoardByCode(code) {
    var db = _getFirestore();
    if (!db) return Promise.reject(new Error("Firestore 未就緒"));

    return db
      .collection("classLeaderboards")
      .where("code", "==", code.toUpperCase().trim())
      .limit(1)
      .get()
      .then(function (snapshot) {
        if (snapshot.empty) return null;
        var doc = snapshot.docs[0];
        var data = doc.data();
        return {
          boardId: doc.id,
          boardName: data.boardName,
          code: data.code,
          ownerId: data.ownerId,
          createdAt: data.createdAt,
        };
      });
  }

  /**
   * 學生上傳成績到班級排行榜
   * @param {string} boardId - 看板 ID
   * @param {Object} entry
   * @param {string} entry.nickname   - 暱稱
   * @param {number} entry.score      - 分數
   * @param {number} entry.accuracy   - 正確率 (0-100)
   * @param {number} [entry.avgRT]    - 平均反應時間 (ms)
   * @param {number} [entry.stars]    - 星星數
   * @param {number} [entry.totalTrials] - 總題數
   * @returns {Promise<string>} entryId
   */
  function uploadToClassBoard(boardId, entry) {
    var db = _getFirestore();
    var user = _getCurrentUser();
    if (!db || !user) {
      return Promise.reject(new Error("請先登入"));
    }

    var entryData = {
      uid: user.uid,
      nickname: (entry.nickname || "").substring(0, 20) || "匿名",
      score: Math.max(0, Math.min(99999, Math.round(entry.score || 0))),
      accuracy: Math.round((entry.accuracy || 0) * 10) / 10,
      avgRT: Math.round(entry.avgRT || 0),
      stars: Math.max(0, Math.min(3, entry.stars || 0)),
      totalTrials: entry.totalTrials || 0,
      // SDT 指標
      dPrime:
        entry.dPrime != null ? Math.round(entry.dPrime * 100) / 100 : null,
      criterion:
        entry.criterion != null
          ? Math.round(entry.criterion * 100) / 100
          : null,
      beta: entry.beta != null ? Math.round(entry.beta * 100) / 100 : null,
      // 遊戲組合順序 & 總花費時間
      comboOrder: (entry.comboOrder || "").substring(0, 200),
      totalTimeMs: entry.totalTimeMs || null,
      gameEndTime: entry.gameEndTime || new Date().toISOString(),
      uploadedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    // 用 uid 當 document ID → 同一用戶重複上傳會覆蓋
    return db
      .collection("classLeaderboards")
      .doc(boardId)
      .collection("entries")
      .doc(user.uid)
      .set(entryData, { merge: true })
      .then(function () {
        // 更新看板的 updatedAt
        db.collection("classLeaderboards")
          .doc(boardId)
          .update({
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          })
          .catch(function () {
            /* 非關鍵操作 */
          });

        Logger.info("✅ 成績已上傳：" + entryData.nickname + " → " + boardId);
        return user.uid;
      });
  }

  /**
   * 讀取班級看板的所有成績（即時監聽）
   * @param {string} boardId
   * @param {Function} callback - 每次資料變動時呼叫，傳入排序後的 entries 陣列
   * @returns {Function} unsubscribe 函式
   */
  function listenClassBoard(boardId, callback) {
    var db = _getFirestore();
    if (!db) {
      Logger.warn("⚠️ Firestore 未就緒");
      return function () {};
    }

    return db
      .collection("classLeaderboards")
      .doc(boardId)
      .collection("entries")
      .orderBy("score", "desc")
      .onSnapshot(
        function (snapshot) {
          var entries = [];
          snapshot.forEach(function (doc) {
            var data = doc.data();
            data.entryId = doc.id;
            entries.push(data);
          });

          // 同步更新看板的 entryCount（非阻塞）
          db.collection("classLeaderboards")
            .doc(boardId)
            .update({ entryCount: entries.length })
            .catch(function () {
              /* 非關鍵操作 */
            });

          callback(entries);
        },
        function (error) {
          Logger.error("❌ 監聽失敗：", error);
          callback([]);
        },
      );
  }

  /**
   * 取得目前使用者在特定班級看板中的已有紀錄
   * @param {string} boardId
   * @returns {Promise<Object|null>}
   */
  function getMyClassEntry(boardId) {
    var db = _getFirestore();
    var user = _getCurrentUser();
    if (!db || !user) return Promise.resolve(null);

    return db
      .collection("classLeaderboards")
      .doc(boardId)
      .collection("entries")
      .doc(user.uid)
      .get()
      .then(function (doc) {
        if (!doc.exists) return null;
        var data = doc.data();
        data.entryId = doc.id;
        return data;
      })
      .catch(function () {
        return null;
      });
  }

  /**
   * 取得目前使用者在世界排行榜的所有紀錄
   * @returns {Promise<Array>}
   */
  function getMyWorldEntries() {
    var db = _getFirestore();
    var user = _getCurrentUser();
    if (!db || !user) return Promise.resolve([]);

    return db
      .collection("worldLeaderboard")
      .where("uid", "==", user.uid)
      .get()
      .then(function (snapshot) {
        var entries = [];
        snapshot.forEach(function (doc) {
          var data = doc.data();
          data.docId = doc.id;
          entries.push(data);
        });
        return entries;
      })
      .catch(function () {
        return [];
      });
  }

  /**
   * 一次性讀取班級看板的所有成績
   * @param {string} boardId
   * @returns {Promise<Array>}
   */
  function getClassBoardEntries(boardId) {
    var db = _getFirestore();
    if (!db) return Promise.reject(new Error("Firestore 未就緒"));

    return db
      .collection("classLeaderboards")
      .doc(boardId)
      .collection("entries")
      .orderBy("score", "desc")
      .get()
      .then(function (snapshot) {
        var entries = [];
        snapshot.forEach(function (doc) {
          var data = doc.data();
          data.entryId = doc.id;
          entries.push(data);
        });
        return entries;
      });
  }

  /**
   * 取得老師擁有的所有看板
   * @returns {Promise<Array>}
   */
  function getMyBoards() {
    var db = _getFirestore();
    var user = _getCurrentUser();
    if (!db || !user) return Promise.resolve([]);

    return db
      .collection("classLeaderboards")
      .where("ownerId", "==", user.uid)
      .get()
      .then(function (snapshot) {
        var boards = [];
        snapshot.forEach(function (doc) {
          var data = doc.data();
          data.boardId = doc.id;
          boards.push(data);
        });
        // client-side 排序（避免依賴複合索引）
        boards.sort(function (a, b) {
          var aTime = a.createdAt ? a.createdAt.toMillis() : 0;
          var bTime = b.createdAt ? b.createdAt.toMillis() : 0;
          return bTime - aTime; // 新 → 舊
        });
        return boards;
      });
  }

  /**
   * 刪除班級看板（含所有 entries）
   * @param {string} boardId
   * @returns {Promise}
   */
  function deleteClassBoard(boardId) {
    var db = _getFirestore();
    var user = _getCurrentUser();
    if (!db || !user) return Promise.reject(new Error("請先登入"));

    // 先刪除所有 entries
    return db
      .collection("classLeaderboards")
      .doc(boardId)
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
        // 再刪除看板本身
        return db.collection("classLeaderboards").doc(boardId).delete();
      })
      .then(function () {
        Logger.info("✅ 看板已刪除：" + boardId);
      });
  }

  /**
   * 刪除看板中的單筆成績
   * @param {string} boardId
   * @param {string} entryId
   * @returns {Promise}
   */
  function deleteClassEntry(boardId, entryId) {
    var db = _getFirestore();
    if (!db) return Promise.reject(new Error("Firestore 未就緒"));

    return db
      .collection("classLeaderboards")
      .doc(boardId)
      .collection("entries")
      .doc(entryId)
      .delete();
  }

  // ═══════════════════════════════════════
  // 🌐 世界排行榜
  // ═══════════════════════════════════════

  /**
   * Google 登入
   * @returns {Promise<firebase.User>}
   */
  function signInWithGoogle() {
    var auth = _getAuth();
    if (!auth) return Promise.reject(new Error("Auth 未就緒"));

    var provider = new firebase.auth.GoogleAuthProvider();
    return auth.signInWithPopup(provider).then(function (result) {
      Logger.info("✅ Google 登入成功：" + result.user.displayName);
      return result.user;
    });
  }

  /**
   * 檢查當前使用者是否為 Google 登入（非匿名）
   * @returns {boolean}
   */
  function isGoogleUser() {
    var user = _getCurrentUser();
    if (!user) return false;
    return !user.isAnonymous;
  }

  /**
   * 上傳到世界排行榜（匿名即可，不需 Google 登入）
   * 支援 per-rule 上傳：若提供 fieldId + ruleId，docId = uid_fieldId_ruleId
   * 向後相容：若未提供，docId = uid（舊格式）
   * @param {Object} data
   * @param {string} data.nickname
   * @param {string} [data.fieldId]     - 遊戲場 ID（per-rule 必填）
   * @param {string} [data.ruleId]      - 規則 ID（per-rule 必填）
   * @param {number} [data.totalStars]
   * @param {number} [data.level]
   * @param {number} [data.bestScore]
   * @param {number} [data.gamesPlayed]
   * @param {number} [data.bestAccuracy]
   * @param {number} [data.bestAvgRT]
   * @param {string[]} [data.badges]
   * @returns {Promise}
   */
  function uploadToWorld(data) {
    var db = _getFirestore();
    var user = _getCurrentUser();
    if (!db || !user) return Promise.reject(new Error("請先登入（匿名即可）"));

    // 決定 docId：有 fieldId + ruleId → per-rule，否則舊格式
    var docId = user.uid;
    if (data.fieldId && data.ruleId) {
      docId = user.uid + "_" + data.fieldId + "_" + data.ruleId;
    }

    var uploadData = {
      uid: user.uid,
      nickname: (data.nickname || "").substring(0, 20) || "匿名",
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    // per-rule 欄位
    if (data.fieldId) uploadData.fieldId = data.fieldId;
    if (data.ruleId) uploadData.ruleId = data.ruleId;

    // 只上傳有提供的欄位
    if (data.totalStars != null) uploadData.totalStars = data.totalStars;
    if (data.level != null) uploadData.level = data.level;
    if (data.bestScore != null) uploadData.bestScore = data.bestScore;
    if (data.gamesPlayed != null) uploadData.gamesPlayed = data.gamesPlayed;
    if (data.bestAccuracy != null) uploadData.bestAccuracy = data.bestAccuracy;
    if (data.bestAvgRT != null) uploadData.bestAvgRT = data.bestAvgRT;
    if (data.totalCorrect != null) uploadData.totalCorrect = data.totalCorrect;
    if (data.totalTrials != null) uploadData.totalTrials = data.totalTrials;
    if (data.mode) uploadData.mode = data.mode;
    if (data.badges) uploadData.badges = data.badges;
    if (data.hasWM != null) uploadData.hasWM = data.hasWM;
    if (data.gameEndTime) uploadData.gameEndTime = data.gameEndTime;

    return db
      .collection("worldLeaderboard")
      .doc(docId)
      .set(uploadData, { merge: true })
      .then(function () {
        var label = data.fieldId
          ? uploadData.nickname + " [" + data.fieldId + "/" + data.ruleId + "]"
          : uploadData.nickname;
        Logger.info("✅ 世界排行榜已更新：" + label);

        // 上傳後自動修剪至前 10 名
        return _trimWorldToTop10();
      });
  }

  /**
   * 修剪世界排行榜：每個規則（fieldId + ruleId）各自保留前 10 名
   * 沒有 fieldId/ruleId 的舊紀錄視為同一組
   * @returns {Promise}
   */
  function _trimWorldToTop10() {
    var db = _getFirestore();
    if (!db) return Promise.resolve();

    var TOP_N = 10;

    return db
      .collection("worldLeaderboard")
      .orderBy("bestScore", "desc")
      .get()
      .then(function (snapshot) {
        // 按 fieldId+ruleId 分組
        var groups = {}; // key → [docRef, ...]
        snapshot.forEach(function (doc) {
          var d = doc.data();
          var key = (d.fieldId || "_none") + "|" + (d.ruleId || "_none");
          if (!groups[key]) groups[key] = [];
          groups[key].push(doc.ref);
        });

        // 每組只保留前 TOP_N 筆（已按 bestScore desc 排序）
        var docsToDelete = [];
        Object.keys(groups).forEach(function (key) {
          var refs = groups[key];
          if (refs.length > TOP_N) {
            for (var i = TOP_N; i < refs.length; i++) {
              docsToDelete.push(refs[i]);
            }
          }
        });

        if (docsToDelete.length === 0) return;

        // Firestore batch 每次最多 500 筆
        var batch = db.batch();
        docsToDelete.forEach(function (ref) {
          batch.delete(ref);
        });
        return batch.commit().then(function () {
          Logger.info(
            "🧹 排行榜已修剪：刪除 " +
              docsToDelete.length +
              " 筆排名外資料，每規則保留前 " +
              TOP_N +
              " 名",
          );
        });
      })
      .catch(function (e) {
        // 修剪失敗不影響主流程
        Logger.warn("排行榜修剪失敗：" + e.message);
      });
  }

  /**
   * 讀取世界排行榜（依最高分排序）
   * @param {number} [limit] - 限制筆數，預設 50
   * @param {Object} [filter] - 可選篩選
   * @param {string} [filter.ruleId]  - 篩選特定規則
   * @param {string} [filter.fieldId] - 篩選特定遊戲場
   * @returns {Promise<Array>}
   */
  function getWorldLeaderboard(limit, filter) {
    var db = _getFirestore();
    if (!db) return Promise.reject(new Error("Firestore 未就緒"));

    var query = db.collection("worldLeaderboard");

    // 客戶端篩選比較安全（避免複合索引問題）
    return query
      .orderBy("bestScore", "desc")
      .limit(limit || 200)
      .get()
      .then(function (snapshot) {
        var entries = [];
        snapshot.forEach(function (doc) {
          var data = doc.data();
          data.docId = doc.id;
          entries.push(data);
        });

        // 客戶端篩選
        if (filter) {
          if (filter.ruleId) {
            entries = entries.filter(function (e) {
              return e.ruleId === filter.ruleId;
            });
          }
          if (filter.fieldId) {
            entries = entries.filter(function (e) {
              return e.fieldId === filter.fieldId;
            });
          }
        }

        return entries;
      });
  }

  /**
   * 刪除自己的世界排行榜資料（所有 per-rule 紀錄）
   * @returns {Promise}
   */
  function deleteMyWorldEntry() {
    var db = _getFirestore();
    var user = _getCurrentUser();
    if (!db || !user) return Promise.reject(new Error("請先登入"));

    // 查詢所有自己的紀錄（uid 欄位 == auth.uid）
    return db
      .collection("worldLeaderboard")
      .where("uid", "==", user.uid)
      .get()
      .then(function (snapshot) {
        if (snapshot.empty) {
          // 舊版相容：嘗試用 uid 當 docId 刪除
          return db.collection("worldLeaderboard").doc(user.uid).delete();
        }
        var batch = db.batch();
        snapshot.forEach(function (doc) {
          batch.delete(doc.ref);
        });
        return batch.commit();
      })
      .then(function () {
        Logger.info("✅ 已從世界排行榜移除自己的所有資料");
      });
  }

  // ═══════════════════════════════════════
  // 匯出 API
  // ═══════════════════════════════════════

  return {
    // 班級排行榜
    createClassBoard: createClassBoard,
    findBoardByCode: findBoardByCode,
    uploadToClassBoard: uploadToClassBoard,
    listenClassBoard: listenClassBoard,
    getClassBoardEntries: getClassBoardEntries,
    getMyClassEntry: getMyClassEntry,
    getMyBoards: getMyBoards,
    deleteClassBoard: deleteClassBoard,
    deleteClassEntry: deleteClassEntry,

    // 世界排行榜
    signInWithGoogle: signInWithGoogle,
    isGoogleUser: isGoogleUser,
    uploadToWorld: uploadToWorld,
    getWorldLeaderboard: getWorldLeaderboard,
    getMyWorldEntries: getMyWorldEntries,
    deleteMyWorldEntry: deleteMyWorldEntry,
    trimWorldToTop10: _trimWorldToTop10,

    // 工具
    generateCode: _generateCode,
  };
})();

// 匯出
if (typeof window !== "undefined") {
  window.FirestoreLeaderboard = FirestoreLeaderboard;
}
