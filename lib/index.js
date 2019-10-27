const path = require('path');
const bole = require('bole');

const debug = require('./debug');
const mockLogger = require('./mock');
const omitDeep = require('./omit-deep');

const FORBIDDEN_FIELDS = [];

bole.output({
  level: process.env.NODE_ENV === 'production'
    ? (process.env.REMOVE_LOG === 'true' ? 'error' : 'warn')
    : ((process.env.DEBUG || process.env.NODE_ENV === 'test') ? 'debug' : 'info'),
  stream: process.stderr,
});

bole.setFastTime();

class Logro {
  constructor(name) {
    this.logger = Logro.getLogger(name);
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

  static createLogger(name) {
    return new Logro(name);
  }

  static getLogger(name) {
    if (process.env.REMOVE_LOG === 'true') {
      return mockLogger();
    }

    return bole((name.indexOf('.js') > 0 || name.indexOf('.mjs') > 0) ? path.relative(process.cwd(), name) : name);
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

  static clean(data, fields = []) {
    return omitDeep(data, ['guid'].concat(fields, FORBIDDEN_FIELDS));
  }

  call(data, method) {
    if (typeof data.guid === 'object') data.guid = Logro.clean(data.guid);
    if (typeof data.evt === 'object') data.evt = Logro.clean(data.evt);
    if (!data.evt) delete data.evt;
    if (!data.guid) delete data.guid;
    if (!data.data || !Object.keys(data.data).length) delete data.data;
    if (this.logger[method]) this.logger[method](data);
  }

  log(msg, data, type, guid) {
    this.call({
      guid,
      evt: msg,
      data: Logro.clean(data) || null,
    }, type);
  }

  info(msg, data, guid) {
    this.log(msg, data, 'info', guid);
  }

  debug(msg, data, guid) {
    this.log(msg, data, 'debug', guid);
  }

  message(msg, data, type, guid) {
    console.warn('[logro] message(msg, data, type, guid) is deprecated, use info(msg, { type, ...data }, guid)');
    this.info(type ? `${type} :: ${msg}` : msg, data, guid);
  }

  error(msg, err, guid, _guid) {
    if (typeof msg === 'object') {
      console.warn('[logro] error(err, msg, data, guid) is deprecated, use exception(err, msg, data, guid)');
      this.failure(msg, err, _guid);
      return;
    }

    if (!(err instanceof Error)) {
      this.log(msg, err, 'error', guid);
    } else {
      this.exception(err, msg || 'UNKNOWN_ERROR', null, guid);
    }
  }

  warn(msg, err, guid) {
    if (typeof msg === 'object') {
      console.warn('[logro] warn(err, msg, guid) is deprecated, use failure(err, type, guid)');
      this.failure(msg, err, guid);
      return;
    }

    if (!(err instanceof Error)) {
      this.log(msg, err, 'error', guid);
    } else {
      this.failure(err, msg, guid);
    }
  }

  failure(err, type, guid) {
    if (!(err instanceof Error)) {
      throw new Error(`Not an error, given '${err}'`);
    }

    if (process.env.NODE_ENV !== 'production') {
      debug.inspect(err);
    }

    this.call({
      guid,
      evt: `${type || 'UNKNOWN_ERROR'} :: ${err.message}`,
    }, 'warn');
  }

  exception(err, msg, data, guid) {
    if (!(err instanceof Error)) {
      throw new Error(`Not an error, given '${err}'`);
    }

    if (err.stack && err.stack.includes(' at ')) {
      err.stack = err.stack.split('\n').filter(x => !x.includes('node_modules') && !x.includes('internal/modules')).join('\n');

      const location = err.stack.match(/\bat ([^()]+) \(([^()]+)\)/);
      const message = err.stack.match(/^([\s\S]+?) at /)[1].trim();

      err.description = `${message} at ${location[1]} (${path.relative(process.cwd(), location[2])})`;
    }

    if (!err.status) {
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
      data: Logro.clean(data) || null,
    }, 'error');
  }
}

module.exports = Logro;
