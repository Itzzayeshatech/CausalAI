const { createWriteStream } = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '..', 'logs', 'app.log');
const stream = createWriteStream(logFile, { flags: 'a' });

const log = (level, message, meta = {}) => {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta
  };
  stream.write(JSON.stringify(entry) + '\n');
};

module.exports = { log };
