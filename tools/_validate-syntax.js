var fs = require("fs");
var files = [
  "js/singleplayer/game-controller.js",
  "js/singleplayer/result-controller.js",
  "js/singleplayer/pet-controller.js",
  "js/singleplayer/mode-controller.js",
  "js/singleplayer/free-select-controller.js",
  "js/singleplayer/avatar-shop-controller.js",
  "js/singleplayer/sticker-book-controller.js",
  "js/shared/csv-report.js",
  "js/shared/class-leaderboard-controller.js",
  "js/shared/game-modal.js",
  "js/multiplayer/result-controller.js",
  "js/multiplayer/multiplayer-bridge.js",
  "js/multiplayer/game-controller.js",
  "js/multiplayer/room-create-controller.js",
  "js/multiplayer/room-lobby-controller.js",
  "js/shared/ranking-renderer.js",
  "js/multiplayer/room-join-controller.js",
];
var pass = 0,
  fail = 0;
files.forEach(function (f) {
  try {
    var code = fs.readFileSync(f, "utf8");
    new Function(code);
    console.log("✅ " + f);
    pass++;
  } catch (e) {
    console.log("❌ " + f + ": " + e.message);
    fail++;
  }
});
console.log("\n=== Result: " + pass + " pass, " + fail + " fail ===");
