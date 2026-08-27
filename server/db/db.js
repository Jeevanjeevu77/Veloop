const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NOW_REGION);
const dbDir = isServerless ? '/tmp' : __dirname;
const dbPath = path.join(dbDir, 'veloop.sqlite');

let sqlDb = null;

function save() {
  if (sqlDb && dbPath) {
    try {
      const data = sqlDb.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(dbPath, buffer);
    } catch (e) {
      // Fallback cleanly if disk is read-only
    }
  }
}

const db = {
  pragma(statement) {
    try {
      if (sqlDb) sqlDb.run(`PRAGMA ${statement}`);
    } catch (e) {}
  },

  exec(sql) {
    if (!sqlDb) throw new Error('Database not initialized');
    sqlDb.exec(sql);
    save();
  },

  prepare(sql) {
    return {
      get(...args) {
        if (!sqlDb) throw new Error('Database not initialized');
        const stmt = sqlDb.prepare(sql);
        const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        stmt.bind(params);
        if (stmt.step()) {
          const row = stmt.getAsObject();
          stmt.free();
          return row;
        }
        stmt.free();
        return undefined;
      },

      all(...args) {
        if (!sqlDb) throw new Error('Database not initialized');
        const stmt = sqlDb.prepare(sql);
        const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        stmt.bind(params);
        const rows = [];
        while (stmt.step()) {
          rows.push(stmt.getAsObject());
        }
        stmt.free();
        return rows;
      },

      run(...args) {
        if (!sqlDb) throw new Error('Database not initialized');
        const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        sqlDb.run(sql, params);
        
        const changesRes = sqlDb.exec("SELECT changes() AS c");
        const changes = changesRes[0]?.values[0]?.[0] || 0;
        
        const rowidRes = sqlDb.exec("SELECT last_insert_rowid() AS id");
        const lastInsertRowid = rowidRes[0]?.values[0]?.[0] || 0;
        
        save();
        return { changes, lastInsertRowid };
      }
    };
  },

  transaction(fn) {
    return (...args) => {
      if (!sqlDb) throw new Error('Database not initialized');
      try {
        sqlDb.exec('BEGIN TRANSACTION;');
        const result = fn(...args);
        sqlDb.exec('COMMIT;');
        save();
        return result;
      } catch (err) {
        try { sqlDb.exec('ROLLBACK;'); } catch (e) {}
        throw err;
      }
    };
  }
};

async function initDb() {
  if (sqlDb) return db;
  let SQL;
  try {
    const wasmPath = require.resolve('sql.js/dist/sql-wasm.wasm');
    if (fs.existsSync(wasmPath)) {
      const wasmBinary = fs.readFileSync(wasmPath);
      SQL = await initSqlJs({ wasmBinary });
    } else {
      SQL = await initSqlJs();
    }
  } catch (e) {
    SQL = await initSqlJs();
  }

  try {
    if (fs.existsSync(dbPath)) {
      const filebuffer = fs.readFileSync(dbPath);
      sqlDb = new SQL.Database(filebuffer);
    } else {
      sqlDb = new SQL.Database();
    }
  } catch (err) {
    sqlDb = new SQL.Database();
  }

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // --- Schema ---
  db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS user_progress (
    user_id INTEGER PRIMARY KEY,
    current_level INTEGER NOT NULL DEFAULT 1,
    current_xp INTEGER NOT NULL DEFAULT 0,
    last_daily_login_claim TEXT,
    last_profile_claim TEXT,
    last_video_claim TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS level_config (
    level INTEGER PRIMARY KEY,
    required_xp INTEGER NOT NULL,
    reward_type TEXT NOT NULL,
    reward_amount INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS xp_activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    source TEXT NOT NULL,
    xp_amount INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS game_play (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    score INTEGER NOT NULL,
    xp_awarded INTEGER NOT NULL,
    played_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  `);

  // --- Seed level config ---
  const insert = db.prepare(
    'INSERT OR REPLACE INTO level_config (level, required_xp, reward_type, reward_amount) VALUES (?, ?, ?, ?)'
  );
  const demoLevels = [
    [1, 0, 'VEs', 0],
    [2, 1000, 'VEs', 100],
    [3, 3000, 'Gems', 20],
    [4, 6000, 'VEs', 300],
    [5, 9500, 'VEs', 500],
    [6, 14000, 'Gems', 50],
    [7, 19000, 'VEs', 800],
    [8, 25000, 'Gems', 100],
  ];
  const insertMany = db.transaction((rows) => {
    for (const row of rows) insert.run(...row);
  });
  insertMany(demoLevels);
  console.log('[db] Ensured level_config seeded with demo values (1-8)');

  return db;
}

const readyPromise = initDb().catch((err) => console.error('[db] Initialization error:', err));

module.exports = db;
module.exports.initDb = initDb;
module.exports.readyPromise = readyPromise;
