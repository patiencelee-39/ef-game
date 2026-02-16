// ====================================
// Firebase 配置檔案
// ====================================
//
// ⚠️ 重要：請填入您的 Firebase 配置資訊
//
// 取得方式：
// 1. 前往 Firebase Console
// 2. 點擊專案總覽 → 專案設定
// 3. 向下捲動找到「您的應用程式」
// 4. 複製 firebaseConfig 的內容
// 5. 貼到下方對應欄位
//
// ====================================

const firebaseConfig = {
  // 🔧 請替換成您的 API Key
  apiKey: "AIzaSyBs9g8H0lL0SYR0FOs2FLkDAJE2bNTB-GE",

  // 🔧 請替換成您的 Auth Domain（格式：專案ID.firebaseapp.com）
  authDomain: "efgame-634af.firebaseapp.com",

  // 🔧 請替換成您的 Database URL（格式：https://專案ID.firebaseio.com）
  databaseURL:
    "https://efgame-634af-default-rtdb.asia-southeast1.firebasedatabase.app",

  // 🔧 請替換成您的 Project ID
  projectId: "efgame-634af",

  // 🔧 請替換成您的 Storage Bucket（格式：專案ID.appspot.com）
  storageBucket: "efgame-634af.firebasestorage.app",

  // 🔧 請替換成您的 Messaging Sender ID
  messagingSenderId: "681595552501",

  // 🔧 請替換成您的 App ID
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
    console.log("✅ 匿名登入成功");

    // 啟動定期清理過期房間（每5分鐘檢查一次）
    startRoomCleanup();
  })
  .catch((error) => {
    console.error("❌ 匿名登入失敗:", error);
  });

// 清理過期房間
function startRoomCleanup() {
  // 立即執行一次清理
  cleanupExpiredRooms();

  // 每10分鐘清理一次
  setInterval(cleanupExpiredRooms, 10 * 60 * 1000);
}

async function cleanupExpiredRooms() {
  try {
    const now = Date.now();
    const roomsRef = database.ref("rooms");

    // 查詢所有房間
    const snapshot = await roomsRef.once("value");
    const rooms = snapshot.val();

    if (!rooms) return;

    let deletedCount = 0;
    const deletePromises = [];

    // 檢查每個房間是否過期
    Object.entries(rooms).forEach(([roomCode, roomData]) => {
      if (roomData.expiresAt && roomData.expiresAt < now) {
        console.log(`🗑️ 刪除過期房間: ${roomCode}`);
        deletePromises.push(roomsRef.child(roomCode).remove());
        deletedCount++;
      }
    });

    // 執行所有刪除操作
    await Promise.all(deletePromises);

    if (deletedCount > 0) {
      console.log(`✅ 已清理 ${deletedCount} 個過期房間`);
    }
  } catch (error) {
    console.error("❌ 清理過期房間失敗:", error);
  }
}
