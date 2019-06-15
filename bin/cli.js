const { Transform } = require('stream');
const { format } = require('../lib/debug');

const showFulldate = process.argv.slice(2).indexOf('--full') !== -1 || process.argv.slice(2).indexOf('-f') !== -1;
const showISODate = process.argv.slice(2).indexOf('--iso') !== -1 || process.argv.slice(2).indexOf('-i') !== -1;

process.stdin.pipe(new Transform({
  transform(entry, enc, callback) {
    const text = Buffer.from(entry, enc).toString().trim();

    if (text.charAt() === '{' && text.charAt(text.length - 1) === '}') {
      const payload = JSON.parse(text);

      const time = payload.time || payload.ts;
      const name = payload.name || payload.ns;
      const level = payload.level;

      delete payload.level;
      delete payload.time;
      delete payload.name;
      delete payload.ts;
      delete payload.ns;

      const prefix = level ? `\u001b[4m${level.toUpperCase()}\u001b[24m ${name || ''}`.trim() : name;

      callback(null, `${format(prefix, payload, time ? new Date(time) : null, { showFulldate, showISODate })}\n`);
    } else {
      callback(null, `${text}\n`);
    }
  }
})).pipe(process.stdout);
