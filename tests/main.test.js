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

  if (process.env.REMOVE_LOG === 'true') {
    ok(stderr.trim() === '');
  } else {
    ok(stderr.includes('"evt":"Standard errors"'));
    ok(stderr.includes('"evt":"Possible warn"'));

    if (process.env.NODE_ENV === 'test') {
      ok(stderr.includes('"evt":"Regular debug"'));
    }

    if (process.env.NODE_ENV !== 'production') {
      ok(stderr.includes('"evt":"Hello World"'));
      ok(stderr.includes('"level":"info"'))
    }
  }
});

test('logro handles deprecated messages and levels', () => {
  const err = new Error('FAILURE');
  const msg = 'Some error';
  const data = { t: 42 };
  const type = 'check';
  const guid = [123];

  log.message(msg, data, type, guid);
  log.error(err, msg, data, guid);
  log.warn(err, msg, guid);
}, ({ stdout, stderr }) => {
  if (process.env.REMOVE_LOG !== 'true') {
    ok(stderr.includes('"evt":"Some error :: FAILURE"'));

    if (process.env.NODE_ENV !== 'production') {
      ok(stderr.includes('"evt":"check :: Some error"'));

      if (process.env.NODE_ENV !== 'test') {
        ok(stderr.includes('Error: FAILURE'));
      }
    }
  }
});
