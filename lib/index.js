const path = require('path');
const bole = require('bole');

const debug = require('./debug');
const mockLogger = require('./mock');
const omitDeep = require('./omit-deep');

const FORBIDDEN_FIELDS = [];

bole.output({
  level: process.env.NODE_ENV === 'production' ?
    'warn' : ((process.env.DEBUG || process.env.NODE_ENV === 'test') ? 'debug' : 'info'),
  stream: process.stderr,
});

bole.setFastTime();

class Logro {
  constructor(moduleDir) {
    this.logger = Logro.getLogger(moduleDir);
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

  static createLogger(moduleDir) {
    return new Logro(moduleDir);
  }

  static getLogger(moduleDir) {
    if (process.env.REMOVE_LOG === 'YES') {
      return mockLogger();
    }

    return bole((moduleDir.indexOf('.js') > 0 || moduleDir.indexOf('.mjs') > 0) ? path.relative(process.cwd(), moduleDir) : moduleDir);
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
    return Logro.clean(data);
  }

  static clean(data) {
    return omitDeep(data, ['guid'].concat(FORBIDDEN_FIELDS));
  }

  call(data, method) {
    if (!data.guid) delete data.guid;
    if (!data.data) delete data.data;
    if (this.logger[method]) this.logger[method](data);
  }

  log(msg, data, guid, type) {
    this.call({
      guid,
      evt: msg,
      data: Logro.params(data) || null,
    }, type);
  }

  info(msg, data, guid) {
    this.log(msg, data, guid, 'info');
  }

  debug(msg, data, guid) {
    this.log(msg, data, guid, 'debug');
  }

  message(msg, data, type, guid) {
    console.warn('[logro] message(msg, data, type, guid) is deprecated, use info(msg, { type, ...data }, guid)');
    this.info(type ? `${type} -> ${msg}` : msg, data, guid);
  }

  error(msg, error, guid) {
    if (typeof msg === 'object') {
      console.warn('[logro] error(err, msg, guid) is deprecated, use exception(err, msg, data, guid)');
      this.failure(msg, error, guid);
      return;
    }

    this.exception(error, msg || 'UNKNOWN_ERROR', null, guid);
  }

  warn(msg, error, guid) {
    if (typeof msg === 'object') {
      console.warn('[logro] warn(err, msg, guid) is deprecated, use failure(err, type, guid)');
      this.failure(msg, error, guid);
      return;
    }

    this.failure(error, msg, guid);
  }

  failure(err, type, guid) {
    this.call({
      guid,
      evt: `${type} -> ${err.message}`,
    }, 'warn');
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

    if (process.env.NODE_ENV !== 'production') {
      debug.inspect(err);
    }

    this.call({
      guid,
      evt: msg,
      error: err,
      data: Logro.params(data) || null,
    }, 'error');
  }
}

module.exports = Logro;
