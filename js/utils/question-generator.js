// ====================================
// 題目序列生成器
// ====================================

/**
 * 遊戲場定義
 */
const GAME_STAGES = {
  A: {
    id: 'A',
    type: 'cheese_cat',
    name: '場地A：起司森林',
    icon: '🧀',
    difficulty: 'easy',
    stimuli: [
      { type: 'cheese', emoji: '🧀', correctAction: 'press' },
      { type: 'cat', emoji: '😺', correctAction: 'nopress' },
    ],
  },
  B: {
    id: 'B',
    type: 'person_cheese_cat',
    name: '場地B：人類村莊',
    icon: '🧑',
    difficulty: 'medium',
    stimuli: [
      { type: 'person', emoji: '🧑', correctAction: 'press' },
      { type: 'cheese', emoji: '🧀', correctAction: 'press' },
      { type: 'cat', emoji: '😺', correctAction: 'nopress' },
    ],
  },
  C: {
    id: 'C',
    type: 'fish_shark',
    name: '場地C：海洋世界',
    icon: '🐟',
    difficulty: 'medium',
    stimuli: [
      { type: 'fish', emoji: '🐟', correctAction: 'press' },
      { type: 'shark', emoji: '🦈', correctAction: 'nopress' },
    ],
  },
  D: {
    id: 'D',
    type: 'day_night',
    name: '場地D：晝夜迷宮',
    icon: '🌙',
    difficulty: 'hard',
    stimuli: [
      { type: 'sun', emoji: '☀️', correctAction: 'press', dayNight: 'day' },
      { type: 'moon', emoji: '🌙', correctAction: 'press', dayNight: 'night' },
    ],
    rules: {
      day: { sun: 'press', moon: 'nopress' },
      night: { sun: 'nopress', moon: 'press' },
    },
  },
};

/**
 * 生成單個場地的題目序列
 * @param {string} stageId - 場地ID (A/B/C/D)
 * @param {number} count - 題目數量
 * @returns {Array} 題目陣列
 */
function generateStageQuestions(stageId, count = 10) {
  const stage = GAME_STAGES[stageId];
  if (!stage) {
    throw new Error(`無效的場地ID: ${stageId}`);
  }

  const questions = [];

  // 場地D特殊處理（晝夜切換）
  if (stageId === 'D') {
    return generateDayNightQuestions(count);
  }

  // 一般場地：隨機生成刺激物
  for (let i = 0; i < count; i++) {
    const stimulus = stage.stimuli[Math.floor(Math.random() * stage.stimuli.length)];

    questions.push({
      id: `q${i + 1}`,
      stimulusType: stimulus.type,
      emoji: stimulus.emoji,
      correctAction: stimulus.correctAction,
      dayNight: null,
    });
  }

  // 確保至少有一定比例的「按」和「不按」
  return balanceQuestions(questions, stage);
}

/**
 * 生成場地D的晝夜題目
 */
function generateDayNightQuestions(count = 10) {
  const questions = [];
  const contexts = ['day', 'night'];

  for (let i = 0; i < count; i++) {
    const context = contexts[Math.floor(Math.random() * contexts.length)];
    const stimuli = ['sun', 'moon'];
    const stimulus = stimuli[Math.floor(Math.random() * stimuli.length)];

    // 根據晝夜判斷正確動作
    let correctAction;
    if (context === 'day') {
      correctAction = stimulus === 'sun' ? 'press' : 'nopress';
    } else {
      correctAction = stimulus === 'moon' ? 'press' : 'nopress';
    }

    questions.push({
      id: `q${i + 1}`,
      stimulusType: stimulus,
      emoji: stimulus === 'sun' ? '☀️' : '🌙',
      correctAction: correctAction,
      dayNight: context,
    });
  }

  return questions;
}

/**
 * 平衡題目（確保不會全是同一種）
 */
function balanceQuestions(questions, stage) {
  const pressCount = questions.filter((q) => q.correctAction === 'press').length;
  const total = questions.length;

  // 如果「按」的比例太少（< 30%）或太多（> 70%），重新調整
  if (pressCount < total * 0.3 || pressCount > total * 0.7) {
    // 簡單處理：重新生成
    return generateStageQuestions(stage.id, total);
  }

  return questions;
}

/**
 * 生成完整遊戲的題目序列
 * @param {Array} selectedStages - 選擇的場地ID陣列 ['A', 'B', ...]
 * @param {number} questionsPerStage - 每個場地的題目數量
 * @returns {Array} 場地配置陣列
 */
function generateGameStages(selectedStages, questionsPerStage = 10) {
  return selectedStages.map((stageId, index) => {
    const stage = GAME_STAGES[stageId];
    const questions = generateStageQuestions(stageId, questionsPerStage);

    return {
      id: `stage_${stageId}_${Date.now()}_${index}`,
      stageId: stageId,
      type: stage.type,
      name: stage.name,
      icon: stage.icon,
      difficulty: stage.difficulty,
      order: index + 1,
      questionsCount: questionsPerStage,
      questions: questions,
    };
  });
}

// 匯出
window.QuestionGenerator = {
  GAME_STAGES,
  generateStageQuestions,
  generateGameStages,
};
