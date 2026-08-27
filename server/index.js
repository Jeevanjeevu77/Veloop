require('dotenv').config();
const express = require('express');
const cors = require('cors');

require('./db/db'); // initializes schema + seed on startup

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const taskRoutes = require('./routes/tasks');
const gameRoutes = require('./routes/game');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(cors());
app.use(express.json());

const { readyPromise } = require('./db/db');

// Ensure database is initialized before handling requests
app.use(async (req, res, next) => {
  try {
    await readyPromise;
    next();
  } catch (err) {
    next(err);
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/game', gameRoutes);

// 404 handler for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

// Generic error handler (never leak raw errors to the client)
app.use((err, req, res, next) => {
  console.error('[server] unhandled error', err);
  res.status(500).json({ error: 'Something went wrong on our end.' });
});

if (require.main === module) {
  readyPromise.then(() => {
    app.listen(PORT, () => {
      console.log(`VELOOP Rewards API running on http://localhost:${PORT}`);
    });
  });
}

module.exports = app;
