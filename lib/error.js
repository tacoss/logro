const httpCodes = require('http').STATUS_CODES;

const { inspect } = require('util');

const ERROR_CODES = {};

class ErrorHandler {
  static setErrorCodes(fromConfig) {
    Object.assign(ERROR_CODES, fromConfig);
  }

  static formatError(type, identifier) {
    const errorsMap = ERROR_CODES[type] || {};
    let errorInfo = errorsMap[identifier] || [];

    if (typeof errorInfo === 'number') {
      errorInfo = [errorInfo, ['server'], identifier];
    }

    if (!(errorInfo && errorInfo[0])) {
      throw new Error(`Missing ${type} error for ${identifier}`);
    }

    const formatted = {
      code: errorInfo[0] || 0,
      path: errorInfo[1] || [],
      message: errorInfo[2] || httpCodes[500],
    };

    return formatted;
  }

  static buildError(label, status) {
    if (!label || typeof label !== 'string') {
      throw new Error(`Expecting label, given ${inspect(label)}`);
    }

    if (!(status && httpCodes[status])) {
      throw new Error(`Unknown http-code, given ${inspect(status)}`);
    }

    const [type, identifier] = label.split('.');

    const {
      code,
      path,
      message,
    } = ErrorHandler.formatError(type, identifier);

    return class extends Error {
      constructor(exception) {
        const _description = typeof exception === 'string' && exception;

        let description = _description || message;

        if (exception
          && (exception instanceof TypeError
            || exception.name === 'SequelizeValidationError')) {
          description = exception.message || exception.toString();
        }

        super(`${status} ${httpCodes[status]} - ${description} (${code})`);

        Object.assign(this, {
          description,
          identifier,
          status,
          type,
          code,
          path,
        });
      }
    };
  }

  static responds(err, guid, callback) {
    callback(new Error(JSON.stringify({
      originalError: err,
      guid,
    })));
  }
}

module.exports = ErrorHandler;
