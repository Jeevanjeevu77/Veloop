const express = require('express');
const requireAuth = require('../middleware/auth');
const db = require('../db/db');
const { awardXP } = require('../db/progress');

const router = express.Router();

const DAILY_PLAY_LIMIT = 3;
const MAX_XP_PER_PLAY = 30;

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start.toISOString();
}

function playsToday(userId) {
  const since = todayRange();
  const row = db
    .prepare('SELECT COUNT(*) AS c FROM game_play WHERE user_id = ? AND played_at >= ?')
    .get(userId, since);
  return row.c;
}

router.get('/play', requireAuth, (req, res) => {
  const used = playsToday(req.userId);
  res.json({
    allowed: used < DAILY_PLAY_LIMIT,
    playsRemaining: Math.max(DAILY_PLAY_LIMIT - used, 0),
    dailyLimit: DAILY_PLAY_LIMIT,
  });
});

router.post('/result', requireAuth, (req, res) => {
  const { score } = req.body || {};
  const numericScore = Number(score);

  if (!Number.isFinite(numericScore) || numericScore < 0 || numericScore > 200) {
    return res.status(400).json({ error: 'Invalid score submitted.' });
  }

  const used = playsToday(req.userId);
  if (used >= DAILY_PLAY_LIMIT) {
    return res.status(429).json({
      error: `You've used all ${DAILY_PLAY_LIMIT} plays for today. Come back tomorrow!`,
    });
  }

  const xpAwarded = Math.min(Math.round(numericScore * 2), MAX_XP_PER_PLAY);

  db.prepare(
    'INSERT INTO game_play (user_id, score, xp_awarded) VALUES (?, ?, ?)'
  ).run(req.userId, numericScore, xpAwarded);

  const result = awardXP(req.userId, xpAwarded, 'Game: Catch the Coins');

  res.json({
    score: numericScore,
    xpAwarded,
    newXP: result.newXP,
    newLevel: result.newLevel,
    leveledUp: result.leveledUp,
    reward: result.reward,
    playsRemaining: Math.max(DAILY_PLAY_LIMIT - used - 1, 0),
  });
});

module.exports = router;
