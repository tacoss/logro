const io = require('std-mocks');
const a = require('assert');

io.use();

const Logro = require('./lib');
const log = Logro.createLogger(__filename);

Logro.setForbiddenFields(['foo']);
log.info('ONE', { foo: 'bar' }, 1234);
log.failure(new Error('FAILURE'), 'TWO', { foo: 'bar' }, 1234);
log.exception(new Error('EXCEPTION'), 'THREE', { foo: 'bar' }, 1234);

log.message('OK', { response: 42 }, 'response', 1234);
log.message('MESSAGE TEST', {}, 'App');
log.error(new Error('OK'), 'App', { message: 'Shutdown error' });
log.error(new Error('TEST'), '', { message: 'Shutdown error' });

io.restore();

const { stdout, stderr } = io.flush();

a.ok(stderr[0].includes('Error: EXCEPTION'), 'should print errors to stdout');
a.ok(stdout[0].includes('"data":{}'), 'should skip forbidden fields');
a.ok(stdout[1].includes('TWO -> FAILURE'), 'should log failures');
a.ok(stdout[2].includes('EXCEPTION at Object'), 'should log exceptions');

a.ok(stdout[3].includes('response -> OK'), 'should log legacy messages');
a.ok(stdout[4].includes('App -> MESSAGE TEST'), 'should log legacy messages');
a.ok(stdout[5].includes('INTERNAL_SERVER_ERROR'), 'should log legacy messages');
a.ok(stdout[6].includes('UNKNOWN_ERROR'), 'should log legacy messages');
