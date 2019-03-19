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

  static createLogger(moduleDir) {
    return new Logro(moduleDir);
  }

  static getLogger(moduleDir) {
    if (process.env.REMOVE_LOG === 'YES') {
      return mockLogger();
    }

    return makeWinstonLogger(moduleDir.split('/').slice(-3).join('/'));
  }

  static params(data) {
    return JSON.stringify(Logro.clean(data));
  }

  static clean(data) {
    return omitDeep(data, ['guid'].concat(FORBIDDEN_FIELDS));
  }

  message(on, data, guid) {
    this.log.debug({
      guid,
      on,
      data: Logro.params(data),
    });
  }

  failure(e, on, data, guid) {
    this.log.warn({
      guid,
      on: `${on} :: ${e.message}`,
      data: Logro.params(data),
    });
  }

  exception(e, on, data, guid) {
    if (!e.status) {
      if (e.stack) {
        e.stack = e.stack.split('\n').filter(x => !x.includes('node_modules') && !x.includes('internal/modules')).join('\n');

        const location = e.stack.match(/\bat ([^()]+) \(([^()]+)\)/);
        const message = e.stack.match(/^([\s\S]+?) at /)[1].trim();

        e.description = `${message} at ${location[1]} (${path.relative(process.cwd(), location[2])})`;
      }

      e.description = e.description || e.message || 'An error has occurred';
      e.identifier = e.identifier || 'INTERNAL_SERVER_ERROR';
      e.status = 500;

      if (e.description.indexOf(': ') !== -1) {
        const matches = e.description.match(/^(\w+): (.+?)$/) || [null, 'unknown', e.description];

        e.type = matches[1];
        e.description = matches[2];
      }
    }

    e.code = e.code || 0;
    e.type = e.type || 'System';
    e.path = e.path || ['server'];

    debug.inspect(e);

    this.log.error({
      guid,
      on,
      error: e,
      data: Logro.params(data),
    });
  }
}

module.exports = Logro;
