const util = require('util');

function format(message, data, now, ok) {
  const time = new Date(now || Date.now())[ok && ok.showISODate ? 'toISOString' : 'toLocaleString']();
  const date = (ok && (ok.showFulldate || ok.showISODate)) ? time : time.split(' ')[1];
  const text = typeof data !== 'undefined'
    ? util.inspect(data, { colors: true, depth: 6 })
    : '';

  return `\r\u001b[${!message ? '41:97' : '37;100'}m ${date} \u001b[0m ${message ? `${message} ` : ''}${text}\x1b[K`;
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
