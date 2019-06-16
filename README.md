# :tada: logro [![Build Status](https://api.travis-ci.org/tacoss/logro.svg?branch=master)](https://travis-ci.org/tacoss/logro) [![NPM version](https://badge.fury.io/js/logro.svg)](http://badge.fury.io/js/logro) [![Coverage Status](https://codecov.io/github/tacoss/logro/coverage.svg?branch=master)](https://codecov.io/github/tacoss/logro) [![Known Vulnerabilities](https://snyk.io/test/npm/logro/badge.svg)](https://snyk.io/test/npm/logro)

> Handy logger impl.

Built on-top of [bole](https://www.npmjs.com/package/bole) to provide ready to use logging:

```js
const log = require('logro').createLogger(__filename);
log.info('Just testing');
```

It also comes with simple formatter for the CLI:

```bash
$ echo '{"foo":"bar","time":1560577967962}' | logrof
#  12:52:47  { foo: 'bar' }
```

## How it works?

By design, `logro` messages are sent to the stderr:

```bash
$ node main.js 2>&1 | logrof
#  1:22:37  INFO main.js { hostname: 'dev.local', pid: 62525, evt: 'Just testing' }
```

Most methods receive a message and some data, otherwise an error with some data, etc.

> Last argument is used as identity for the ongoing message, on all methods.

Quiet methods (derived from `bole`):

- `info(msg[, data[, guid]])` &mdash; Just info; hidden on production
- `debug(msg[, data[, guid]])` &mdash; Debug info; shown during test only
- `warn(msg[, error[, guid]])` &mdash; Relax warnings; hidden from stdout
- `error(msg[, error[, guid]])` &mdash; Regular/relax errors; not critical, hidden

> If warn/error receives an instance of `Error`, a proper failure/exception will be raised, respectively.

Loud methods:

- `failure(err[, type[, guid]])` &mdash; Real warnings!
- `exception(err[, msg[, data[, guid]]])` &mdash; Fatal errors :bomb:

> Both methods always print to the stdout during development to help, the default level is `info`.

Disabled if one or more conditions are true:

- `process.env.NODE_ENV === 'production'` &mdash; set `error` level
- `process.env.NODE_ENV === 'test'` &mdash; set `debug` level
- `process.env.REMOVE_LOG === 'true'` &mdash; disable all logs

## Formatting

Pipe your logs to `logrof` in order to give them some format, it will skip non JSON objects from the stream.

Recognized fields are: `ts`, `time`, `ns`, `name` and `level`.

Options:

- `--iso` &mdash; Format parsed date with `toISOString()`
- `--full` &mdash; Format parsed date with `toLocaleString()`
- `--quiet` &mdash; Non JSON objects are not longer printed
- `--no-color` &mdash; Disable colors on formatting from output

> Otherwise, the default output is JSON, always.
