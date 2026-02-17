/**
 * ============================================
 * Firebase Modular SDK 初始化入口
 * ============================================
 * 說明：使用 Firebase v10 modular API，由 Vite 打包後
 *       透過 window.firebaseServices 匯出，保持向後相容。
 *
 * 打包指令：npm run build:firebase
 * 輸出檔案：js/firebase-bundle.js
 * ============================================
 */

// ── Firebase Core ──
import { initializeApp } from "firebase/app";

// ── Auth ──
import {
  getAuth,
  signInAnonymously,
  signInWithPopup,
  onAuthStateChanged,
  GoogleAuthProvider,
} from "firebase/auth";

// ── Realtime Database ──
import {
  getDatabase,
  ref,
  set,
  get,
  update,
  remove,
  push,
  child,
  onValue,
  onChildAdded,
  off,
  serverTimestamp as rtdbServerTimestamp,
  query as rtdbQuery,
  orderByChild,
} from "firebase/database";

// ── Firestore ──
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  deleteField,
} from "firebase/firestore";

// ════════════════════════════════════════
// Firebase 配置
// ════════════════════════════════════════

const firebaseConfig = {
  apiKey: "AIzaSyBs9g8H0lL0SYR0FOs2FLkDAJE2bNTB-GE",
  authDomain: "efgame-634af.firebaseapp.com",
  databaseURL:
    "https://efgame-634af-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "efgame-634af",
  storageBucket: "efgame-634af.firebasestorage.app",
  messagingSenderId: "681595552501",
  appId: "1:681595552501:web:a24cb6e02e0c8063e7bbbc",
};

// ── 初始化 ──
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const firestore = getFirestore(app);

// ════════════════════════════════════════
// Compat Shim — 讓現有程式碼不用改
// ════════════════════════════════════════
// 目標：提供 firebase.database().ref("path") 等 compat 風格 API
//       底層使用 modular SDK，享受 tree-shaking 優勢

/**
 * 包裝 RTDB Reference 為 compat-like 物件
 * 支援：.ref(), .once(), .on(), .off(), .set(), .update(), .push(), .remove(), .child(), .val()
 */
function wrapRef(dbRef) {
  const wrapper = {
    // 讀取
    once(eventType) {
      return get(dbRef).then((snapshot) => wrapSnapshot(snapshot));
    },
    on(eventType, callback) {
      if (eventType === "value") {
        return onValue(dbRef, (snapshot) => callback(wrapSnapshot(snapshot)));
      }
      if (eventType === "child_added") {
        return onChildAdded(dbRef, (snapshot) =>
          callback(wrapSnapshot(snapshot)),
        );
      }
    },
    off() {
      off(dbRef);
    },

    // 寫入
    set(data) {
      return set(dbRef, data);
    },
    update(data) {
      return update(dbRef, data);
    },
    push(data) {
      const newRef = push(dbRef);
      if (data !== undefined) {
        return set(newRef, data).then(() => wrapRef(newRef));
      }
      return wrapRef(newRef);
    },
    remove() {
      return remove(dbRef);
    },

    // 導航
    child(path) {
      return wrapRef(child(dbRef, path));
    },
    ref(path) {
      return wrapRef(ref(database, path));
    },

    // 原始 ref（供內部使用）
    _ref: dbRef,
    key: dbRef.key,
  };

  return wrapper;
}

/**
 * 包裝 DataSnapshot 為 compat-like 物件
 */
function wrapSnapshot(snapshot) {
  return {
    val() {
      return snapshot.val();
    },
    exists() {
      return snapshot.exists();
    },
    key: snapshot.key,
    ref: wrapRef(snapshot.ref),
    forEach(callback) {
      snapshot.forEach((childSnap) => {
        callback(wrapSnapshot(childSnap));
      });
    },
    numChildren() {
      return snapshot.size;
    },
  };
}

/**
 * 包裝 Database 為 compat-like 物件
 */
const databaseCompat = {
  ref(path) {
    return wrapRef(ref(database, path));
  },
};

/**
 * 包裝 Firestore 為 compat-like 物件
 * 支援：.collection(), .doc(), .add(), .set(), .get(), .update(), .delete(),
 *       .where(), .orderBy(), .limit(), .onSnapshot(), .batch()
 */
function wrapDocRef(docReference) {
  return {
    get() {
      return getDoc(docReference).then((snap) => wrapDocSnapshot(snap));
    },
    set(data, options) {
      return setDoc(docReference, data, options || {});
    },
    update(data) {
      return updateDoc(docReference, data);
    },
    delete() {
      return deleteDoc(docReference);
    },
    collection(name) {
      return wrapCollectionRef(collection(docReference, name));
    },
    get id() {
      return docReference.id;
    },
    get ref() {
      return docReference;
    },
  };
}

function wrapDocSnapshot(snap) {
  return {
    data() {
      return snap.data();
    },
    exists: snap.exists(),
    get id() {
      return snap.id;
    },
    get ref() {
      return snap.ref;
    },
  };
}

function wrapQuerySnapshot(querySnap) {
  return {
    get empty() {
      return querySnap.empty;
    },
    get size() {
      return querySnap.size;
    },
    get docs() {
      return querySnap.docs.map((d) => wrapDocSnapshot(d));
    },
    forEach(callback) {
      querySnap.forEach((d) => callback(wrapDocSnapshot(d)));
    },
  };
}

function wrapCollectionRef(collRef, existingConstraints) {
  // 收集鏈式約束
  const constraints = existingConstraints ? [...existingConstraints] : [];
  const baseRef = collRef;

  function buildQuery() {
    if (constraints.length === 0) return baseRef;
    return query(baseRef, ...constraints);
  }

  const wrapper = {
    doc(id) {
      return wrapDocRef(id ? doc(collRef, id) : doc(collRef));
    },
    add(data) {
      return addDoc(collRef, data).then((docRef) => wrapDocRef(docRef));
    },
    get() {
      return getDocs(buildQuery()).then((snap) => wrapQuerySnapshot(snap));
    },
    where(field, op, value) {
      return wrapCollectionRef(collRef, [...constraints, where(field, op, value)]);
    },
    orderBy(field, direction) {
      return wrapCollectionRef(collRef, [...constraints, orderBy(field, direction || "asc")]);
    },
    limit(n) {
      return wrapCollectionRef(collRef, [...constraints, limit(n)]);
    },
    onSnapshot(onNext, onError) {
      return onSnapshot(buildQuery(), onNext ? (snap) => onNext(wrapQuerySnapshot(snap)) : undefined, onError);
    },
  };

  return wrapper;
}

const firestoreCompat = {
  collection(name) {
    return wrapCollectionRef(collection(firestore, name));
  },
  batch() {
    const batch = writeBatch(firestore);
    return {
      delete(docRef) {
        // 接受原始 ref 或包裝過的
        batch.delete(docRef.ref || docRef);
      },
      set(docRef, data, options) {
        batch.set(docRef.ref || docRef, data, options || {});
      },
      update(docRef, data) {
        batch.update(docRef.ref || docRef, data);
      },
      commit() {
        return batch.commit();
      },
    };
  },
};

/**
 * 包裝 Auth 為 compat-like 物件
 */
const authCompat = {
  signInAnonymously() {
    return signInAnonymously(auth);
  },
  signInWithPopup(provider) {
    return signInWithPopup(auth, provider);
  },
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  },
  get currentUser() {
    return auth.currentUser;
  },
};

// ════════════════════════════════════════
// 全域匯出 — 保持現有程式碼相容
// ════════════════════════════════════════

// 1. window.firebaseServices（主要介面）
window.firebaseServices = {
  database: databaseCompat,
  auth: authCompat,
  firestore: firestoreCompat,
  config: firebaseConfig,
};

// 2. window.firebase 命名空間（給直接使用 firebase.xxx 的程式碼）
window.firebase = {
  database() {
    return databaseCompat;
  },
  auth() {
    return authCompat;
  },
  firestore() {
    return firestoreCompat;
  },
  initializeApp() {
    /* 已初始化，no-op */
  },
  // 靜態屬性
  auth: Object.assign(function () { return authCompat; }, {
    GoogleAuthProvider: GoogleAuthProvider,
  }),
  database: Object.assign(function () { return databaseCompat; }, {
    ServerValue: {
      TIMESTAMP: rtdbServerTimestamp(),
    },
  }),
  firestore: Object.assign(function () { return firestoreCompat; }, {
    FieldValue: {
      serverTimestamp() {
        return serverTimestamp();
      },
      delete() {
        return deleteField();
      },
    },
  }),
};

// ════════════════════════════════════════
// 自動匿名登入 + 房間清理
// ════════════════════════════════════════

authCompat
  .signInAnonymously()
  .then(() => {
    console.log("✅ 匿名登入成功");
    startRoomCleanup();
  })
  .catch((error) => {
    console.error("❌ 匿名登入失敗:", error);
  });

function startRoomCleanup() {
  cleanupExpiredRooms();
  setInterval(cleanupExpiredRooms, 10 * 60 * 1000);
}

async function cleanupExpiredRooms() {
  try {
    const now = Date.now();
    const roomsRef = databaseCompat.ref("rooms");
    const snapshot = await roomsRef.once("value");
    const rooms = snapshot.val();

    if (!rooms) return;

    let deletedCount = 0;
    const deletePromises = [];

    Object.entries(rooms).forEach(([roomCode, roomData]) => {
      if (roomData.expiresAt && roomData.expiresAt < now) {
        console.log(`🗑️ 刪除過期房間: ${roomCode}`);
        deletePromises.push(roomsRef.child(roomCode).remove());
        deletedCount++;
      }
    });

    await Promise.all(deletePromises);

    if (deletedCount > 0) {
      console.log(`✅ 已清理 ${deletedCount} 個過期房間`);
    }
  } catch (error) {
    console.error("❌ 清理過期房間失敗:", error);
  }
}

console.log("🔥 Firebase modular SDK 已載入 (bundle)");
