const clone = require('rfdc')();
const uuid = require('uuid');

const Logro = require('.');

const log = Logro.createLogger(__filename);

module.exports = (req, res, next) => {
  const guid = uuid.v4();
  const rcvd = {
    ip: req.ip,
    ua: req.headers['user-agent'],
    body: Logro.clean(clone(req.body)),
    query: Logro.clean(clone(req.query)),
    params: Logro.clean(clone(req.params)),
  };

  req.guid = guid;

  rcvd.info = {
    os: req.useragent.os,
    browser: req.useragent.browser,
    version: req.useragent.version,
    platform: req.useragent.platform,
  };

  log.message(`${req.method} ${req.originalUrl}`, req.method === 'GET' ? null : rcvd, guid);
  next();
};
