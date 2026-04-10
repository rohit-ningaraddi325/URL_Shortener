const logger = require('../utils/logger');

/**
 * 404 handler – catches requests that don't match any route.
 */
function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
}

/**
 * Global error handler – catches errors forwarded via next(err).
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  logger.error(`Unhandled error on ${req.method} ${req.path}:`, err.message);

  // Don't leak internal stack traces in production
  const isDev = process.env.NODE_ENV !== 'production';

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(isDev && { stack: err.stack }),
  });
}

module.exports = { notFoundHandler, errorHandler };
