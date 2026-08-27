const express = require('express');
const requireAuth = require('../middleware/auth');
const { buildDashboard } = require('../db/progress');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  try {
    const data = buildDashboard(req.userId);
    res.json(data);
  } catch (err) {
    console.error('[dashboard] failed to build dashboard', err);
    res.status(500).json({ error: 'Unable to load your dashboard right now.' });
  }
});

module.exports = router;
