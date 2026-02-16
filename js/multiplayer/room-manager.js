// ====================================
// 房間管理器
// ====================================

class RoomManager {
  constructor() {
    this.database = firebase.database();
    this.auth = firebase.auth();
  }

  /**
   * 建立新房間
   * @param {Object} roomData 房間資料
   * @returns {Promise<string>} 房間代碼
   */
  async createRoom(roomData) {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        throw new Error("請先登入");
      }

      const {
        roomCode,
        roomName,
        hasPassword,
        password,
        hostJoinsGame = true,
        selectedStages,
        questionsCount,
        countdownSeconds,
        displaySettings,
      } = roomData;

      // 生成題目序列
      const gameStages = window.QuestionGenerator.generateGameStages(
        selectedStages,
        questionsCount,
      );

      // 準備房間資料
      const room = {
        // 基本資訊
        roomCode,
        roomName,
        hostId: user.uid,
        hasPassword,
        passwordHash: hasPassword ? this.hashPassword(password) : null,
        createdAt: Date.now(),
        expiresAt: Date.now() + window.GameConstants.ROOM_EXPIRY_TIME_MS,
        status: window.GameConstants.ROOM_STATUS.WAITING,

        // 遊戲開始狀態
        isGameStarted: false,
        countdownSeconds,

        // 遊戲場設定
        gameStages,

        // 進階設定
        displaySettings,

        // 玩家資料
        players: hostJoinsGame
          ? {
              [user.uid]: {
                nickname: window.GameConstants.DEFAULT_HOST_NICKNAME,
                isHost: true,
                online: true,
                joinedAt: Date.now(),
                currentStageIndex: 0,
                currentQuestion: 0,
                completedStages: [],
                stageStatus: {},
                totalScore: 0,
                totalStars: 0,
                totalCorrect: 0,
                totalQuestions: 0,
                accuracy: 0,
              },
            }
          : {},
      };

      // 寫入 Firebase
      await this.database.ref(`rooms/${roomCode}`).set(room);

      console.log("✅ 房間建立成功:", roomCode);
      return roomCode;
    } catch (error) {
      console.error("❌ 建立房間失敗:", error);
      throw error;
    }
  }

  /**
   * 加入房間
   * @param {string} roomCode 房間代碼
   * @param {string|null} password 房間密碼
   * @returns {Promise<string>} 房間代碼
   */
  async joinRoom(roomCode, password = null) {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        throw new Error("請先登入");
      }

      // 檢查房間是否存在
      const roomSnapshot = await this.database
        .ref(`rooms/${roomCode}`)
        .once("value");
      if (!roomSnapshot.exists()) {
        throw new Error("房間不存在");
      }

      const room = roomSnapshot.val();

      // 檢查密碼
      if (room.hasPassword) {
        if (!password) {
          throw new Error("此房間需要密碼");
        }
        if (this.hashPassword(password) !== room.passwordHash) {
          throw new Error("密碼錯誤");
        }
      }

      // 檢查是否已開始且不允許中途加入
      if (room.isGameStarted && !room.displaySettings.allowLateJoin) {
        throw new Error("遊戲已開始，不允許中途加入");
      }

      // 檢查是否已過期
      if (Date.now() > room.expiresAt) {
        throw new Error("房間已過期");
      }

      // 加入房間
      const playerData = {
        nickname:
          window.GameConstants.DEFAULT_PLAYER_NICKNAME_PREFIX +
          Math.floor(Math.random() * window.GameConstants.RANDOM_NICKNAME_MAX),
        isHost: false,
        online: true,
        joinedAt: Date.now(),
        currentStageIndex: 0,
        currentQuestion: 0,
        completedStages: [],
        stageStatus: {},
        totalScore: 0,
        totalStars: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        accuracy: 0,
      };

      await this.database
        .ref(`rooms/${roomCode}/players/${user.uid}`)
        .set(playerData);

      console.log("✅ 加入房間成功:", roomCode);
      return roomCode;
    } catch (error) {
      console.error("❌ 加入房間失敗:", error);
      throw error;
    }
  }

  /**
   * 更新玩家暱稱
   */
  async updateNickname(roomCode, nickname) {
    try {
      const user = this.auth.currentUser;
      if (!user) return;

      await this.database
        .ref(`rooms/${roomCode}/players/${user.uid}/nickname`)
        .set(nickname);
    } catch (error) {
      console.error("更新暱稱失敗:", error);
    }
  }

  /**
   * 開始遊戲
   */
  async startGame(roomCode) {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        throw new Error("請先登入");
      }

      // 檢查是否為房主
      const roomSnapshot = await this.database
        .ref(`rooms/${roomCode}`)
        .once("value");
      const room = roomSnapshot.val();

      if (room.hostId !== user.uid) {
        throw new Error("只有房主可以開始遊戲");
      }

      // 更新狀態
      await this.database.ref(`rooms/${roomCode}`).update({
        isGameStarted: true,
        status: window.GameConstants.ROOM_STATUS.PLAYING,
      });

      console.log("✅ 遊戲開始");
      return true;
    } catch (error) {
      console.error("❌ 開始遊戲失敗:", error);
      throw error;
    }
  }

  /**
   * 離開房間
   */
  async leaveRoom(roomCode) {
    try {
      const user = this.auth.currentUser;
      if (!user) return;

      await this.database.ref(`rooms/${roomCode}/players/${user.uid}`).remove();
      console.log("✅ 離開房間");
    } catch (error) {
      console.error("離開房間失敗:", error);
    }
  }

  /**
   * 監聽房間變化
   */
  onRoomChange(roomCode, callback) {
    const ref = this.database.ref(`rooms/${roomCode}`);
    ref.on("value", (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        callback(null);
      }
    });

    // 返回取消監聽的函式
    return () => ref.off("value");
  }

  /**
   * 簡單的密碼雜湊（生產環境應使用更安全的方式）
   */
  hashPassword(password) {
    // 簡單的雜湊，實際應使用 bcrypt 等
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString();
  }
}

// 建立全域實例
window.RoomManager = new RoomManager();
