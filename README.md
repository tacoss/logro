# :tada: logro [![NPM version](https://badge.fury.io/js/logro.png)](http://badge.fury.io/js/logro) [![codecov](https://codecov.io/gh/tacoss/logro/branch/master/graph/badge.svg)](https://codecov.io/gh/tacoss/logro) [![Build status](https://github.com/tacoss/logro/workflows/build/badge.svg)](https://github.com/tacoss/logro/actions)

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

Log levels are set as follows:

- `process.env.NODE_ENV === 'production'` &mdash; set `error` level
- `process.env.NODE_ENV === 'test'` &mdash; set `debug` level
- `process.env.REMOVE_LOG === 'true'` &mdash; disable all logs

## Formatting

Pipe your logs to `logrof` in order to give them some format, it will ignore non JSON objects from the stream.

Recognized fields are: `ts`, `time`, `ns`, `name` and `level`.

Options:

- `--quiet` &mdash; Non JSON objects are not longer printed
- `--no-color` &mdash; Disable colors on formatting from output

> Otherwise, the default output is JSON, always.

## Public API

- `new Logro(name)` and `Logro.createLogger(name)` &mdash; Creates a new logro instance, `name` can be a filepath.
- `Logro.setForbiddenFields(fromConfig)` &mdash; List of fields to be ignored from `data` objects; also `Logro.clean()` is affected by this.
- `Logro.getExpressLogger()` &mdash; Returns a middleware function for easy logging, it also setup `req.log` as helper.
- `Logro.getLogger(name)` &mdash; Returns a `bole` instance.
- `Logro.format(message[, data[, now]])` &mdash; Returns the message formatted for CLI usage: `[timestamp] [message] (data is optional)`
- `Logro.logger(message)` &mdash; Print formatted messages to the stdout.
- `Logro.inspect(message)` &mdash; Print formatted messages to the stdout; ignored if `process.env.NODE_ENV === 'test'`
- `Logro.clean(data[, fields])` &mdash; Safely clone and remove fields from any given object, it also removes those set by `setForbiddenFields()` calls.
