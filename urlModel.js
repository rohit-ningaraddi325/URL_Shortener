const { getDB } = require('./db');

/**
 * Find a URL record by its short ID.
 * @param {string} id
 * @returns {{ id, original, clicks, created_at } | undefined}
 */
function findById(id) {
  return getDB().prepare('SELECT * FROM urls WHERE id = ?').get(id);
}

/**
 * Find a URL record by the original long URL (for deduplication).
 * @param {string} original
 * @returns {{ id, original, clicks, created_at } | undefined}
 */
function findByOriginal(original) {
  return getDB().prepare('SELECT * FROM urls WHERE original = ?').get(original);
}

/**
 * Insert a new short URL record.
 * @param {string} id       – generated short ID
 * @param {string} original – original long URL
 * @returns {{ id, original, clicks, created_at }}
 */
function create(id, original) {
  getDB()
    .prepare('INSERT INTO urls (id, original) VALUES (?, ?)')
    .run(id, original);
  return findById(id);
}

/**
 * Increment the click counter for a short URL.
 * @param {string} id
 */
function incrementClicks(id) {
  getDB().prepare('UPDATE urls SET clicks = clicks + 1 WHERE id = ?').run(id);
}

/**
 * Return all stored URLs (handy for an admin overview).
 * @returns {Array}
 */
function listAll() {
  return getDB().prepare('SELECT * FROM urls ORDER BY created_at DESC').all();
}

module.exports = { findById, findByOriginal, create, incrementClicks, listAll };
