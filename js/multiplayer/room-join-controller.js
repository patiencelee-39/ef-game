      // 等待 Firebase 初始化完成
      let firebaseReady = false;

      window.addEventListener("DOMContentLoaded", () => {
        // 等 firebase-config.js 的匿名登入完成
        firebase.auth().onAuthStateChanged((user) => {
          if (user) {
            firebaseReady = true;
            console.log("✅ Firebase 已就緒，uid:", user.uid);
          }
        });

        // 5秒後如果還沒載入就顯示錯誤
        setTimeout(() => {
          if (!firebaseReady) {
            showStatus("❌ Firebase 載入失敗，請重新整理頁面", "error");
          }
        }, 5000);
      });

      // 代碼輸入自動跳轉
      const codeInputs = document.querySelectorAll(".code-input");
      codeInputs.forEach((input, index) => {
        input.addEventListener("input", (e) => {
          const value = e.target.value.toUpperCase();
          e.target.value = value;

          if (value && index < codeInputs.length - 1) {
            codeInputs[index + 1].focus();
          }
        });

        input.addEventListener("keydown", (e) => {
          if (e.key === "Backspace" && !e.target.value && index > 0) {
            codeInputs[index - 1].focus();
          }
        });

        input.addEventListener("paste", (e) => {
          e.preventDefault();
          const pastedText = e.clipboardData
            .getData("text")
            .toUpperCase()
            .replace(/-/g, "");
          const chars = pastedText.split("");

          codeInputs.forEach((input, i) => {
            if (chars[i]) {
              input.value = chars[i];
            }
          });

          if (chars.length > 0) {
            const lastIndex = Math.min(chars.length - 1, codeInputs.length - 1);
            codeInputs[lastIndex].focus();
          }
        });
      });

      function getRoomCode() {
        return Array.from(codeInputs)
          .map((input) => input.value)
          .join("")
          .toUpperCase();
      }

      function showStatus(message, type) {
        const statusEl = document.getElementById("joinStatus");
        statusEl.textContent = message;
        statusEl.className = `join-status ${type}`;
        statusEl.style.display = "block";
      }

      function hideStatus() {
        document.getElementById("joinStatus").style.display = "none";
      }

      async function joinRoom() {
        if (!firebaseReady) {
          showStatus("❌ 系統尚未就緒，請稍候再試", "error");
          return;
        }

        const playerName = document.getElementById("playerName").value.trim();
        const cleanRoomCode = getRoomCode();

        // 驗證輸入
        if (!playerName) {
          showStatus("❌ 請輸入您的名字", "error");
          return;
        }

        if (cleanRoomCode.length !== 6) {
          showStatus("❌ 請輸入完整的 6 位房間代碼", "error");
          return;
        }

        // 顯示載入狀態
        document.getElementById("loading").style.display = "block";
        document.getElementById("joinBtn").disabled = true;
        hideStatus();

        try {
          const user = firebase.auth().currentUser;
          if (!user) throw new Error("請先登入");

          // 使用 RoomManager 加入房間（統一邏輯：密碼檢查、過期檢查、資料結構）
          await window.RoomManager.joinRoom(cleanRoomCode, null);

          // 加入成功後更新暱稱
          await window.RoomManager.updateNickname(cleanRoomCode, playerName);

          // 顯示房間資訊
          const roomRef = firebase.database().ref(`rooms/${cleanRoomCode}`);
          const snapshot = await roomRef.once("value");
          const roomData = snapshot.val();

          const currentPlayers = roomData.players
            ? Object.keys(roomData.players).length
            : 0;

          document.getElementById("roomHost").textContent =
            roomData.roomName || "未知";
          document.getElementById("playerCount").textContent =
            `${currentPlayers}/8`;
          document.getElementById("stageCount").textContent =
            roomData.gameStages?.length || 0;
          document.getElementById("roomInfo").style.display = "block";

          showStatus("✅ 成功加入房間！正在進入等待室...", "success");

          // 儲存到 localStorage（統一使用 auth.uid）
          localStorage.setItem(
            "currentRoom",
            JSON.stringify({
              code: cleanRoomCode,
              name: roomData.roomName || "",
            }),
          );
          localStorage.setItem(
            "currentPlayer",
            JSON.stringify({
              id: user.uid,
              isHost: false,
              nickname: playerName,
            }),
          );

          // 跳轉到等待室
          setTimeout(() => {
            location.href = `room-lobby.html?code=${cleanRoomCode}`;
          }, 1000);
        } catch (error) {
          console.error("加入房間失敗:", error);
          showStatus("❌ " + error.message, "error");
        } finally {
          document.getElementById("loading").style.display = "none";
          document.getElementById("joinBtn").disabled = false;
        }
      }

      // Enter 鍵提交
      document
        .getElementById("playerName")
        .addEventListener("keypress", (e) => {
          if (e.key === "Enter") {
            codeInputs[0].focus();
          }
        });

      codeInputs[codeInputs.length - 1].addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          joinRoom();
        }
      });
