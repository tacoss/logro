const util = require('util');

function format(message, data, now) {
  const time = new Date(now || Date.now()).toLocaleString().split(' ')[1];
  const text = typeof data !== 'undefined'
    ? util.inspect(data, { colors: true, depth: 6 })
    : '';

  return `\u001b[${!message ? '41:97' : '37;100'}m ${time} \u001b[0m ${message ? `${message} ` : ''}${text}`;
}

function logger(message) {
  console.log(format(message));
}

function inspect(message) {
  if (!(process.env.NODE_ENV === 'test' || process.env.REMOVE_LOG === 'YES')) {
    console.warn(format(null, message));
  }
}

module.exports = {
  format,
  logger,
  inspect,
};
