const { equal, ok } = require('assert');
const { test } = require('./util');

const Logro = require('../lib');
const log = Logro.createLogger(__filename);

test('logro messages are sent to stderr', () => {
  console.log('standard console.log() call');

  log.info('Hello World');
  log.warn('Possible warn');
  log.debug('Regular debug');
  log.error('Standard errors');
}, ({ stdout, stderr }) => {
  equal(stdout.trim(), 'standard console.log() call');
  ok(stderr.includes('"evt":"Standard errors"'));
  ok(stderr.includes('"evt":"Possible warn"'));

  if (process.env.NODE_ENV === 'test') {
    ok(stderr.includes('"evt":"Regular debug"'));
  }

  if (process.env.NODE_ENV !== 'production') {
    ok(stderr.includes('"evt":"Hello World"'));
    ok(stderr.includes('"level":"info"'))
  }

  console.log(stderr);
});
