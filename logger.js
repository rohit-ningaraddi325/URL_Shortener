const levels = { info: '📋 INFO', warn: '⚠️  WARN', error: '🔴 ERROR' };

function log(level, message, ...args) {
  const ts = new Date().toISOString();
  const prefix = levels[level] || level.toUpperCase();
  console[level === 'error' ? 'error' : 'log'](`[${ts}] ${prefix}  ${message}`, ...args);
}

module.exports = {
  info:  (msg, ...a) => log('info',  msg, ...a),
  warn:  (msg, ...a) => log('warn',  msg, ...a),
  error: (msg, ...a) => log('error', msg, ...a),
};
