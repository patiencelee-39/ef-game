/**
 * ============================================
 * Firebase Modular SDK 初始化入口
 * ============================================
 * 說明：使用 Firebase v10 modular API，由 Vite 打包後
 *       透過 window.firebaseServices 匯出，保持向後相容。
 *
 * 打包指令：npm run build:firebase
 * 輸出檔案：js/firebase-bundle.js
 *
 * ⚠️ 這是範本檔案。請執行 npm run setup 來產生你的
 *    src/firebase-init.js（含你的 Firebase 金鑰）。
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
  onChildChanged,
  onChildRemoved,
  off,
  onDisconnect as rtdbOnDisconnect,
  serverTimestamp as rtdbServerTimestamp,
  query as rtdbQuery,
  orderByChild,
  endAt,
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
// Firebase 配置 — 請替換成你的值
// ════════════════════════════════════════

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// ── 初始化 ──
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
// Firestore 延遲初始化 — 只在實際呼叫時才建立
let firestore = null;
function getFirestoreInstance() {
  if (!firestore) firestore = getFirestore(app);
  return firestore;
}

// ════════════════════════════════════════
// Compat Shim — 讓現有程式碼不用改
// ════════════════════════════════════════

function wrapRef(dbRef) {
  const wrapper = {
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
      if (eventType === "child_changed") {
        return onChildChanged(dbRef, (snapshot) =>
          callback(wrapSnapshot(snapshot)),
        );
      }
      if (eventType === "child_removed") {
        return onChildRemoved(dbRef, (snapshot) =>
          callback(wrapSnapshot(snapshot)),
        );
      }
    },
    off() {
      off(dbRef);
    },
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
    onDisconnect() {
      const disc = rtdbOnDisconnect(dbRef);
      return {
        set(value) {
          return disc.set(value);
        },
        update(value) {
          return disc.update(value);
        },
        remove() {
          return disc.remove();
        },
        cancel() {
          return disc.cancel();
        },
      };
    },
    child(path) {
      return wrapRef(child(dbRef, path));
    },
    ref(path) {
      return wrapRef(ref(database, path));
    },
    orderByChild(childKey) {
      const q = rtdbQuery(dbRef, orderByChild(childKey));
      return wrapRef(q);
    },
    endAt(value) {
      const q = rtdbQuery(dbRef, endAt(value));
      return wrapRef(q);
    },
    _ref: dbRef,
    key: dbRef.key,
  };

  return wrapper;
}

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

const databaseCompat = {
  ref(path) {
    return wrapRef(ref(database, path));
  },
};

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
      return wrapCollectionRef(collRef, [
        ...constraints,
        where(field, op, value),
      ]);
    },
    orderBy(field, direction) {
      return wrapCollectionRef(collRef, [
        ...constraints,
        orderBy(field, direction || "asc"),
      ]);
    },
    limit(n) {
      return wrapCollectionRef(collRef, [...constraints, limit(n)]);
    },
    onSnapshot(onNext, onError) {
      return onSnapshot(
        buildQuery(),
        onNext ? (snap) => onNext(wrapQuerySnapshot(snap)) : undefined,
        onError,
      );
    },
  };

  return wrapper;
}

const firestoreCompat = {
  collection(name) {
    return wrapCollectionRef(collection(getFirestoreInstance(), name));
  },
  batch() {
    const batch = writeBatch(getFirestoreInstance());
    return {
      delete(docRef) {
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

window.firebaseServices = {
  database: databaseCompat,
  auth: authCompat,
  firestore: firestoreCompat,
  config: firebaseConfig,
};

window.firebase = {
  apps: [app],
  initializeApp() {
    return app;
  },
  auth: Object.assign(
    function () {
      return authCompat;
    },
    {
      GoogleAuthProvider: GoogleAuthProvider,
    },
  ),
  database: Object.assign(
    function () {
      return databaseCompat;
    },
    {
      ServerValue: {
        TIMESTAMP: rtdbServerTimestamp(),
      },
    },
  ),
  firestore: Object.assign(
    function () {
      return firestoreCompat;
    },
    {
      FieldValue: {
        serverTimestamp() {
          return serverTimestamp();
        },
        delete() {
          return deleteField();
        },
      },
    },
  ),
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
  if (Math.random() > 0.2) {
    console.log("🧹 本次客戶端跳過房間清理（抽樣機制）");
    return;
  }
  var delay = Math.floor(Math.random() * 30000);
  setTimeout(function () {
    cleanupExpiredRooms();
    setInterval(cleanupExpiredRooms, 10 * 60 * 1000);
  }, delay);
}

async function cleanupExpiredRooms() {
  try {
    const now = Date.now();
    const roomsRef = databaseCompat.ref("rooms");

    const snapshot = await roomsRef
      .orderByChild("expiresAt")
      .endAt(now)
      .once("value");
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
