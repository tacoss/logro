# :tada: logro [![Build Status](https://api.travis-ci.org/agave/logro.svg?branch=master)](https://travis-ci.org/agave/logro) [![NPM version](https://badge.fury.io/js/logro.svg)](http://badge.fury.io/js/logro) [![Coverage Status](https://codecov.io/github/agave/logro/coverage.svg?branch=master)](https://codecov.io/github/agave/logro) [![Known Vulnerabilities](https://snyk.io/test/npm/logro/badge.svg)](https://snyk.io/test/npm/logro)

> Handy logger impl.

Built on-top of `bole` to provide ready to use logging:

```js
const log = require('logro').createLogger(__filename);
log.info('Just testing');
```

It also provides a simple formatter for the CLI:

```bash
$ echo '{"foo":"bar","time":1560577967962}' | logrof
#  12:52:47  { foo: 'bar' }
```

However, `logro` messages are sent to the stderr:

```bash
$ node main.js 2>&1 | logrof
#  1:22:37  INFO main.js { hostname: 'dev.local', pid: 62525, evt: 'Just testing' }
```

> WIP
