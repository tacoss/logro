const strip = require('strip-ansi');
const { inspect } = require('util');
const { Transform } = require('stream');
const { format } = require('../lib/debug');

const isQuiet = process.argv.indexOf('--quiet') !== -1;
const noColor = process.argv.indexOf('--no-color') !== -1;

const omit = process.argv.indexOf('--omit') !== -1;
const omitKeys = (omit && process.argv[process.argv.indexOf('--omit') + 1] || '').split(/[,;|]/);

const only = process.argv.indexOf('--only') !== -1;
const onlyKeys = (only && process.argv[process.argv.indexOf('--only') + 1] || '').split(/[,;|]/);

process.stdin.pipe(new Transform({
  transform(entry, enc, callback) {
    if (entry.toString('utf8', 0, 1) !== '{') {
      callback(null, entry);
      return;
    }

    const content = Buffer.from(entry, enc).toString();
    const lines = content.split('\n');
    const buffer = [];

    lines.forEach((line, i) => {
      if (line.charAt() === '{' && line.charAt(line.length - 1) === '}') {
        let payload;

        try {
          payload = JSON.parse(line);
        } catch (e) {
          buffer.push(line);
          return;
        }

        const time = payload.time || payload.ts;
        const name = payload.name || payload.ns;
        const level = payload.level;

        delete payload.level;
        delete payload.time;
        delete payload.name;
        delete payload.ts;
        delete payload.ns;

        if (only) {
          Object.keys(payload).forEach(key => {
            if (!onlyKeys.includes(key)) {
              delete payload[key];
            }
          })
        } else if (omit) {
          omitKeys.forEach(key => {
            delete payload[key];
          });
        }

        const label = typeof level === 'string' ? level.toUpperCase() : '';
        const prefix = level ? (!noColor ? `\u001b[4m${label}\u001b[24m ${name || ''}` : `${label} ${name || ''}`).trim() : name;

        buffer.push(format(prefix, payload, time ? new Date(time) : null));
      } else if (!isQuiet) {
        buffer.push(line);
      }
    });

    callback(null, buffer.join('\n'));
  }
})).pipe(process.stdout);
