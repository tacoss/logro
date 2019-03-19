const { format: debugFormat } = require('./debug');

function makeWinstonLogger(filePath) {
  const { createLogger, format, transports } = require('winston');

  const {
    json, printf, combine,
  } = format;

  const debug = printf(info => {
    return debugFormat(`${info.level}: ${info.message.on}`, info.message.data, info.timestamp);
  });

  const cleanup = format(info => {
    info.timestamp = Date.now();
    info.filepath = filePath;
    info.message.data = JSON.parse(info.message.data);
    info.level = info.level.toUpperCase();

    if (!info.message.guid) {
      delete info.message.guid;
    }

    return info;
  });

  return createLogger({
    transports: [
      new transports.Console({
        format: combine(cleanup(), process.env.NODE_ENV === 'development' ? debug : json()),
        level: 'debug',
        colorize: true,
        handleException: true,
      }),
    ],
    exitOnError: false,
  });
}

module.exports = makeWinstonLogger;
