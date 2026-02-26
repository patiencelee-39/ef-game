// ====================================
// Firebase 配置檔案
// ====================================
//
// 📋 以下為本專案（EF Game）的 Firebase 配置。
//    Firebase 客戶端 API Key 屬公開設計，
//    安全性由 RTDB / Firestore 規則保障。
//
// ====================================

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

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);

// 初始化服務
const database = firebase.database();
const auth = firebase.auth();
const firestore = firebase.firestore();

// 匯出供其他檔案使用
window.firebaseServices = {
  database,
  auth,
  firestore,
  config: firebaseConfig,
};

// 自動匿名登入
auth
  .signInAnonymously()
  .then(() => {
    Logger.info("✅ 匿名登入成功");

    // 啟動定期清理過期房間（每5分鐘檢查一次）
    startRoomCleanup();
  })
  .catch((error) => {
    Logger.error("❌ 匿名登入失敗:", error);
  });

// 清理過期房間
function startRoomCleanup() {
  // 抽樣：僅 10% 的客戶端執行清理，避免所有使用者同時讀取全部房間
  if (Math.random() > 0.1) return;

  // 隨機延遲 0~60 秒，分散 RTDB 讀取壓力
  setTimeout(function () {
    cleanupExpiredRooms();
    setInterval(cleanupExpiredRooms, 10 * 60 * 1000);
  }, Math.random() * 60000);
}

async function cleanupExpiredRooms() {
  try {
    const now = Date.now();
    const roomsRef = database.ref("rooms");

    // 僅查詢已過期的房間（避免讀取整個 /rooms 觸發 Permission denied）
    const snapshot = await roomsRef
      .orderByChild("expiresAt")
      .endAt(now)
      .once("value");
    const rooms = snapshot.val();

    if (!rooms) return;

    let deletedCount = 0;
    const deletePromises = [];

    // 刪除已過期的房間
    Object.entries(rooms).forEach(([roomCode, roomData]) => {
      if (roomData.expiresAt && roomData.expiresAt < now) {
        Logger.debug(`🗑️ 刪除過期房間: ${roomCode}`);
        deletePromises.push(roomsRef.child(roomCode).remove());
        deletedCount++;
      }
    });

    // 執行所有刪除操作
    await Promise.all(deletePromises);

    if (deletedCount > 0) {
      Logger.info(`✅ 已清理 ${deletedCount} 個過期房間`);
    }
  } catch (error) {
    Logger.error("❌ 清理過期房間失敗:", error);
  }
}
