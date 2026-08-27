const db = require('./db');

const getAllLevels = () =>
  db.prepare('SELECT * FROM level_config ORDER BY level ASC').all();

/**
 * Given a total XP amount, determine what level the user is currently at
 * based on the seeded level_config thresholds.
 */
function computeLevelForXP(totalXP) {
  const levels = getAllLevels();
  let current = levels[0];
  for (const lvl of levels) {
    if (totalXP >= lvl.required_xp) current = lvl;
    else break;
  }
  return current.level;
}

function getProgress(userId) {
  let progress = db
    .prepare('SELECT * FROM user_progress WHERE user_id = ?')
    .get(userId);

  if (!progress) {
    db.prepare(
      'INSERT INTO user_progress (user_id, current_level, current_xp) VALUES (?, 1, 0)'
    ).run(userId);
    progress = db
      .prepare('SELECT * FROM user_progress WHERE user_id = ?')
      .get(userId);
  }
  return progress;
}

/**
 * Adds XP to a user, recomputes their level, persists it, and logs the
 * activity. Returns a summary including whether they leveled up.
 */
function awardXP(userId, amount, source) {
  const progress = getProgress(userId);
  const newXP = progress.current_xp + amount;
  const newLevel = computeLevelForXP(newXP);
  const leveledUp = newLevel > progress.current_level;

  db.prepare(
    'UPDATE user_progress SET current_xp = ?, current_level = ? WHERE user_id = ?'
  ).run(newXP, newLevel, userId);

  db.prepare(
    'INSERT INTO xp_activity (user_id, source, xp_amount) VALUES (?, ?, ?)'
  ).run(userId, source, amount);

  const levels = getAllLevels();
  const rewardLevel = levels.find((l) => l.level === newLevel);

  return {
    newXP,
    newLevel,
    leveledUp,
    reward: leveledUp
      ? { type: rewardLevel.reward_type, amount: rewardLevel.reward_amount }
      : null,
  };
}

/**
 * Builds the full dashboard payload: level, XP, next-level reward,
 * roadmap of nearby levels, and recent activity.
 */
function buildDashboard(userId) {
  const progress = getProgress(userId);
  const levels = getAllLevels();

  const currentLevelConfig = levels.find((l) => l.level === progress.current_level) || levels[0] || { required_xp: 0 };
  const nextLevelConfig = levels.find((l) => l.level === progress.current_level + 1);

  const xpIntoLevel = progress.current_xp - currentLevelConfig.required_xp;
  const xpForLevel = nextLevelConfig
    ? nextLevelConfig.required_xp - currentLevelConfig.required_xp
    : 0;
  const xpToNextLevel = nextLevelConfig
    ? Math.max(nextLevelConfig.required_xp - progress.current_xp, 0)
    : 0;
  const progressPercent = nextLevelConfig
    ? Math.min(Math.round((xpIntoLevel / xpForLevel) * 100), 100)
    : 100;

  const roadmap = levels.map((lvl) => {
    let state = 'locked';
    if (lvl.level < progress.current_level) state = 'completed';
    else if (lvl.level === progress.current_level) state = 'current';
    return {
      level: lvl.level,
      state,
      rewardType: lvl.reward_type,
      rewardAmount: lvl.reward_amount,
      requiredXP: lvl.required_xp,
    };
  });

  const recentActivity = db
    .prepare(
      'SELECT source, xp_amount as xpAmount, created_at as createdAt FROM xp_activity WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT 10'
    )
    .all(userId);

  return {
    level: progress.current_level,
    currentXP: progress.current_xp,
    xpIntoLevel,
    xpForLevel,
    xpToNextLevel,
    progressPercent,
    nextLevelReward: nextLevelConfig
      ? { type: nextLevelConfig.reward_type, amount: nextLevelConfig.reward_amount }
      : null,
    isMaxLevel: !nextLevelConfig,
    roadmap,
    recentActivity,
  };
}

module.exports = { getProgress, awardXP, buildDashboard, computeLevelForXP, getAllLevels };
