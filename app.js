const express = require('express');
const urlRoutes = require('./urlRoutes');
const { errorHandler, notFoundHandler } = require('./errorMiddleware');
const { initDB } = require('./db');
const logger = require('./logger');

const app = express();
const PORT = process.env.PORT || 8080;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/', urlRoutes);
app.get('/', (req, res) => {
  res.send(`
    <h2>URL Shortener</h2>
    <form method="POST" action="/shorten">
      <input name="url" placeholder="Enter URL" />
      <button type="submit">Shorten</button>
    </form>
  `);
});
// ── Error Handling ────────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Bootstrap ─────────────────────────────────────────────────────────────────
(async () => {
  try {
    initDB();
    logger.info('Database initialised');

    app.listen(PORT, () => {
      logger.info(`URL Shortener running on port ${PORT}`);
      logger.info(`BASE_URL: ${process.env.BASE_URL || '(not set – set BASE_URL env var)'}`);
    });
  } catch (err) {
    logger.error('Failed to start server', err);
    process.exit(1);
  }
})();

module.exports = app;
