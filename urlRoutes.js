const express = require('express');
const router = express.Router();
const {
  shortenUrl,
  redirectToOriginal,
  getStats,
  listUrls,
} = require('../controllers/urlController');

// Health check
router.get('/health', (_req, res) =>
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
);

// Admin: list all URLs
router.get('/admin/urls', listUrls);

// Stats for a specific short ID
router.get('/stats/:id', getStats);

// Shorten a URL
router.post('/shorten', shortenUrl);

// Redirect short URL → original  (keep this last to avoid conflicts)
router.get('/:id', redirectToOriginal);

module.exports = router;
