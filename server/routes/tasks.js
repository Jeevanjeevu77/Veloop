const express = require('express');
const requireAuth = require('../middleware/auth');
const db = require('../db/db');
const { getProgress, awardXP } = require('../db/progress');

const router = express.Router();

// Task catalog: id -> { label, xp, column tracking last claim, source label }
const TASKS = {
  'daily-login': {
    label: 'Daily Login',
    xp: 10,
    column: 'last_daily_login_claim',
    source: 'Daily Login',
  },
  'complete-profile': {
    label: 'Complete Profile',
    xp: 20,
    column: 'last_profile_claim',
    source: 'Task: Complete Profile',
  },
  'watch-video': {
    label: 'Watch a Video',
    xp: 15,
    column: 'last_video_claim',
    source: 'Task: Watch a Video',
  },
};

function todayStamp() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

router.get('/', requireAuth, (req, res) => {
  const progress = getProgress(req.userId);
  const today = todayStamp();

  const tasks = Object.entries(TASKS).map(([id, t]) => ({
    id,
    label: t.label,
    xp: t.xp,
    claimedToday: progress[t.column] === today,
  }));

  res.json({ tasks });
});

router.post('/claim', requireAuth, (req, res) => {
  const { taskId } = req.body || {};
  const task = TASKS[taskId];

  if (!task) {
    return res.status(400).json({ error: 'Unknown task.' });
  }

  const progress = getProgress(req.userId);
  const today = todayStamp();

  if (progress[task.column] === today) {
    return res.status(409).json({ error: 'You already claimed this task today.' });
  }

  db.prepare(`UPDATE user_progress SET ${task.column} = ? WHERE user_id = ?`).run(
    today,
    req.userId
  );

  const result = awardXP(req.userId, task.xp, task.source);

  res.json({
    xpAwarded: task.xp,
    newXP: result.newXP,
    newLevel: result.newLevel,
    leveledUp: result.leveledUp,
    reward: result.reward,
  });
});

module.exports = router;
