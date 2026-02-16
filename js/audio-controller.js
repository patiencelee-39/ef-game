/**
 * 音效控制器模組
 * 使用 Web Audio API 產生即時音效
 *
 * @module AudioController
 * @version 1.0.0
 * @date 2026/02/09
 *
 * 遵循規範: NAMING-CONVENTION.md v2.3
 * - 函式: camelCase + 動詞開頭
 * - 變數: camelCase
 * - 常數: UPPER_SNAKE_CASE
 */

/**
 * 音效控制器物件
 * 提供正確/錯誤音效播放功能
 *
 * @namespace AudioController
 */
const AudioController = {
  /**
   * Web Audio API 上下文
   * @type {AudioContext}
   */
  ctx: new (window.AudioContext || window.webkitAudioContext)(),

  /**
   * 播放指定頻率和類型的音調
   *
   * @param {number} frequency - 音調頻率 (Hz)
   * @param {string} waveType - 波形類型 ('sine', 'square', 'sawtooth', 'triangle')
   * @param {number} duration - 持續時間 (秒)
   * @returns {void}
   */
  playTone: function (frequency, waveType, duration) {
    // 恢復音訊上下文（處理瀏覽器自動播放政策）
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    // 創建振盪器和增益節點
    const oscillator = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    // 設定音調屬性
    oscillator.type = waveType;
    oscillator.frequency.value = frequency;

    // 連接音訊節點
    oscillator.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    // 啟動振盪器
    oscillator.start();

    // 設定音量淡出效果
    gainNode.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      this.ctx.currentTime + duration,
    );

    // 停止振盪器
    oscillator.stop(this.ctx.currentTime + duration);
  },

  /**
   * 播放正確答案音效
   * 高音調正弦波 (880Hz)
   *
   * @returns {void}
   */
  playCorrect: function () {
    this.playTone(880, "sine", 0.1);
  },

  /**
   * 播放錯誤答案音效
   * 低音調鋸齒波 (150Hz)
   *
   * @returns {void}
   */
  playError: function () {
    this.playTone(150, "sawtooth", 0.3);
  },
};

// 匯出模組（支援全域和模組化使用）
if (typeof module !== "undefined" && module.exports) {
  module.exports = AudioController;
}
