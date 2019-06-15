const filter = process.argv.slice(2).filter(x => x.charAt() !== '-')[0];
const debug = process.argv.indexOf('--debug') !== -1;

const io = require('std-mocks');
const a = require('assert');

function test(text, cb, k) {
  console.log('*', text);

  io.use(); cb(); io.restore();

  const { stdout, stderr } = io.flush();

  const out = stdout.join('');
  const err = stderr.join('');

  if (debug) {
    console.log('--- stdout ---');
    console.log(out);

    console.log('--- stderr ---');
    console.log(err);
  }

  try {
    k({ stdout: out, stderr: err });
  } catch (e) {
    console.log('[ERROR]', e.message);
    console.log('- actual:', e.actual);
    console.log('- expected:', e.expected);
    process.exit(1);
  }
}

module.exports = { test };
