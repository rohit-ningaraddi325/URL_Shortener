const Database = require('better-sqlite3');
const path = require('path');
const logger = require('./logger');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data/urls.db');

let db;
logger.info(`Using DB path: ${DB_PATH}`);
/**
 * Open (or create) the SQLite database and run migrations.
 */
function initDB() {
  // Ensure the data directory exists
  const fs = require('fs');
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(DB_PATH);

  // Enable WAL mode for better concurrent read performance
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS urls (
      id          TEXT PRIMARY KEY,
      original    TEXT NOT NULL,
      clicks      INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_urls_original ON urls(original);
  `);

  logger.info(`SQLite database ready at ${DB_PATH}`);
  return db;
}

function getDB() {
  if (!db) throw new Error('Database not initialised. Call initDB() first.');
  return db;
}

module.exports = { initDB, getDB };
