const Logro = require('./lib');
const log = Logro.createLogger(__filename);

Logro.setForbiddenFields(['foo']);

log.message('ON', { foo: 'bar' }, 1234);

// log.failure(new Error('FAIL'), 'ON', { foo: 'bar' }, 1234);

// log.exception(new Error('FAIL'), 'ON', { foo: 'bar' }, 1234);
