const util = require('util');

const noColor = process.argv.indexOf('--no-color') !== -1;

function format(message, data, now) {
  const time = new Date(now || Date.now()).toLocaleString();
  const date = time.split(' ')[1];
  const text = typeof data !== 'undefined'
    ? util.inspect(data, { colors: noColor !== true, depth: 6 })
    : '';

  if (noColor) {
    return `\r ${date} ${message ? `${message} ` : ''}${text}\x1b[K`;
  }

  return `\r\u001b[${!message ? '41:97' : '37;100'}m ${date} \u001b[0m ${message ? `${message} ` : ''}${text}\x1b[K`;
}

function logger(message) {
  console.log(format(message));
}

function inspect(message) {
  if (!(process.env.NODE_ENV === 'test' || process.env.REMOVE_LOG === 'true')) {
    console.warn(format(null, message));
  }
}

module.exports = {
  format,
  logger,
  inspect,
};
