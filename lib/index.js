const path = require('path');

const debug = require('./debug');
const mockLogger = require('./mock');
const omitDeep = require('./omit-deep');
const makeWinstonLogger = require('./winston-logger');

const FORBIDDEN_FIELDS = [];

class Logro {
  constructor(moduleDir) {
    this.log = Logro.getLogger(moduleDir);
  }

  static setForbiddenFields(fromConfig) {
    fromConfig.forEach(key => {
      if (FORBIDDEN_FIELDS.indexOf(key) === -1) {
        FORBIDDEN_FIELDS.push(key);
      }
    });
  }

  static getExpressLogger() {
    return require('./express');
  }

  static getErrorHandler() {
    return require('./error');
  }

  static createLogger(moduleDir) {
    return new Logro(moduleDir);
  }

  static getLogger(moduleDir) {
    if (process.env.REMOVE_LOG === 'YES') {
      return mockLogger();
    }

    return makeWinstonLogger(moduleDir.split('/').slice(-3).join('/'));
  }

  static format(message, data, now) {
    return debug.format(message, data, now);
  }

  static logger(message) {
    return debug.logger(message);
  }

  static inspect(message) {
    return debug.inspect(message);
  }

  static params(data) {
    return JSON.stringify(Logro.clean(data));
  }

  static clean(data) {
    return omitDeep(data, ['guid'].concat(FORBIDDEN_FIELDS));
  }

  // FIXME: legacy methods, add deprecation warnings?
  message(msg, data, type, guid) { this.info(type ? `${type} -> ${msg}` : msg, data, guid); }
  error(msg, guid, err) { this.exception(err, msg, null, guid); }
  warn(msg, guid, err) { this.failure(err, msg, guid); }

  info(msg, data, guid) {
    this.log.debug({
      guid,
      on: msg,
      data: Logro.params(data),
    });
  }

  failure(err, type, guid) {
    this.log.warn({
      guid,
      on: `${type} -> ${err.message}`,
    });
  }

  exception(err, msg, data, guid) {
    if (!err.status) {
      if (err.stack) {
        err.stack = err.stack.split('\n').filter(x => !x.includes('node_modules') && !x.includes('internal/modules')).join('\n');

        const location = err.stack.match(/\bat ([^()]+) \(([^()]+)\)/);
        const message = err.stack.match(/^([\s\S]+?) at /)[1].trim();

        err.description = `${message} at ${location[1]} (${path.relative(process.cwd(), location[2])})`;
      }

      err.description = err.description || err.message || 'An error has occurred';
      err.identifier = err.identifier || 'INTERNAL_SERVER_ERROR';
      err.status = 500;

      if (err.description.indexOf(': ') !== -1) {
        const matches = err.description.match(/^(\w+): (.+?)$/) || [null, 'unknown', err.description];

        err.type = matches[1];
        err.description = matches[2];
      }
    }

    err.code = err.code || 0;
    err.type = err.type || 'System';
    err.path = err.path || ['server'];

    debug.inspect(err);

    this.log.error({
      guid,
      on: msg,
      error: err,
      data: Logro.params(data),
    });
  }
}

module.exports = Logro;
