const { nanoid } = require('nanoid');
const validUrl = require('valid-url');
const urlModel = require('../models/urlModel');
const logger = require('../utils/logger');

const ID_LENGTH = 7; // e.g. "xK3mP2q"

/**
 * POST /shorten
 * Body: { "url": "https://..." }
 * Returns: { shortUrl, id, original, clicks, created_at }
 */
async function shortenUrl(req, res, next) {
  try {
    const { url } = req.body;

    // ── Validation ──────────────────────────────────────────────────────────
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Missing required field: url' });
    }

    const trimmed = url.trim();

    if (!validUrl.isWebUri(trimmed)) {
      return res.status(422).json({
        error: 'Invalid URL. Please provide a valid http or https URL.',
      });
    }

    // ── Deduplication ───────────────────────────────────────────────────────
    const existing = urlModel.findByOriginal(trimmed);
    if (existing) {
      const shortUrl = buildShortUrl(existing.id);
      logger.info(`Duplicate detected – returning existing short URL: ${shortUrl}`);
      return res.status(200).json({
        shortUrl,
        id: existing.id,
        original: existing.original,
        clicks: existing.clicks,
        created_at: existing.created_at,
        duplicate: true,
      });
    }

    // ── Create ──────────────────────────────────────────────────────────────
    const id = nanoid(ID_LENGTH);
    const record = urlModel.create(id, trimmed);
    const shortUrl = buildShortUrl(id);

    logger.info(`Created short URL: ${shortUrl} → ${trimmed}`);

    return res.status(201).json({
      shortUrl,
      id: record.id,
      original: record.original,
      clicks: record.clicks,
      created_at: record.created_at,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /:id
 * Redirects to the original long URL and increments the click counter.
 */
async function redirectToOriginal(req, res, next) {
  try {
    const { id } = req.params;
    const record = urlModel.findById(id);

    if (!record) {
      return res.status(404).json({ error: `Short URL '${id}' not found.` });
    }

    urlModel.incrementClicks(id);
    logger.info(`Redirecting /${id} → ${record.original} (clicks: ${record.clicks + 1})`);

    return res.redirect(301, record.original);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /stats/:id
 * Returns click stats for a given short ID.
 */
async function getStats(req, res, next) {
  try {
    const { id } = req.params;
    const record = urlModel.findById(id);

    if (!record) {
      return res.status(404).json({ error: `Short URL '${id}' not found.` });
    }

    return res.status(200).json({
      id: record.id,
      shortUrl: buildShortUrl(record.id),
      original: record.original,
      clicks: record.clicks,
      created_at: record.created_at,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /admin/urls
 * Lists all stored URLs.
 */
async function listUrls(req, res, next) {
  try {
    const records = urlModel.listAll();
    const data = records.map((r) => ({
      ...r,
      shortUrl: buildShortUrl(r.id),
    }));
    return res.status(200).json({ count: data.length, urls: data });
  } catch (err) {
    next(err);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildShortUrl(id) {
  const base = (process.env.BASE_URL || '').replace(/\/$/, '');
  return `${base}/${id}`;
}

module.exports = { shortenUrl, redirectToOriginal, getStats, listUrls };
