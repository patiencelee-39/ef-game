/**
 * ============================================
 * Firestore 排行榜服務 — FirestoreLeaderboard
 * ============================================
 * 說明：處理班級排行榜和世界排行榜的 Firestore CRUD 操作
 *
 * 二軌制：
 *   📋 班級排行榜 /classLeaderboards/{boardId}/entries/{entryId}
 *   🌐 世界排行榜 /worldLeaderboard/{uid}
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
      console.warn("⚠️ Firestore 尚未載入");
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

        console.log("✅ 班級看板已建立：" + boardId + "（代碼：" + code + "）");
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

        console.log("✅ 成績已上傳：" + entryData.nickname + " → " + boardId);
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
      console.warn("⚠️ Firestore 未就緒");
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
          console.error("❌ 監聽失敗：", error);
          callback([]);
        },
      );
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
      .orderBy("createdAt", "desc")
      .get()
      .then(function (snapshot) {
        var boards = [];
        snapshot.forEach(function (doc) {
          var data = doc.data();
          data.boardId = doc.id;
          boards.push(data);
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
        console.log("✅ 看板已刪除：" + boardId);
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
      console.log("✅ Google 登入成功：" + result.user.displayName);
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
   * @param {Object} data
   * @param {string} data.nickname
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

    var uploadData = {
      nickname: (data.nickname || "").substring(0, 20) || "匿名",
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

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

    return db
      .collection("worldLeaderboard")
      .doc(user.uid)
      .set(uploadData, { merge: true })
      .then(function () {
        console.log("✅ 世界排行榜已更新：" + uploadData.nickname);
      });
  }

  /**
   * 讀取世界排行榜（依星星排序）
   * @param {number} [limit] - 限制筆數，預設 50
   * @returns {Promise<Array>}
   */
  function getWorldLeaderboard(limit) {
    var db = _getFirestore();
    if (!db) return Promise.reject(new Error("Firestore 未就緒"));

    return db
      .collection("worldLeaderboard")
      .orderBy("bestScore", "desc")
      .limit(limit || 50)
      .get()
      .then(function (snapshot) {
        var entries = [];
        snapshot.forEach(function (doc) {
          var data = doc.data();
          data.docId = doc.id;
          entries.push(data);
        });
        return entries;
      });
  }

  /**
   * 刪除自己的世界排行榜資料
   * @returns {Promise}
   */
  function deleteMyWorldEntry() {
    var db = _getFirestore();
    var user = _getCurrentUser();
    if (!db || !user) return Promise.reject(new Error("請先登入"));

    return db
      .collection("worldLeaderboard")
      .doc(user.uid)
      .delete()
      .then(function () {
        console.log("✅ 已從世界排行榜移除自己的資料");
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
    getMyBoards: getMyBoards,
    deleteClassBoard: deleteClassBoard,
    deleteClassEntry: deleteClassEntry,

    // 世界排行榜
    signInWithGoogle: signInWithGoogle,
    isGoogleUser: isGoogleUser,
    uploadToWorld: uploadToWorld,
    getWorldLeaderboard: getWorldLeaderboard,
    deleteMyWorldEntry: deleteMyWorldEntry,

    // 工具
    generateCode: _generateCode,
  };
})();

// 匯出
if (typeof window !== "undefined") {
  window.FirestoreLeaderboard = FirestoreLeaderboard;
}
