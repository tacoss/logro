const io = require('std-mocks');
const a = require('assert');

io.use();

const Logro = require('./lib');
const log = Logro.createLogger(__filename);

Logro.setForbiddenFields(['foo']);
log.message('ONE', { foo: 'bar' }, 1234);
log.failure(new Error('FAILURE'), 'TWO', { foo: 'bar' }, 1234);
log.exception(new Error('EXCEPTION'), 'THREE', { foo: 'bar' }, 1234);
io.restore();

const { stdout, stderr } = io.flush();

a.ok(stderr[0].includes('Error: EXCEPTION'), 'should print errors to stdout');
a.ok(stdout[0].includes('"data":{}'), 'should skip forbidden fields');
a.ok(stdout[1].includes('TWO :: FAILURE'), 'should log failures');
a.ok(stdout[2].includes('EXCEPTION at Object'), 'should log exceptions');
