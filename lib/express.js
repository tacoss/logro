const clone = require('rfdc')();
const uuid = require('uuid');
const Logro = require('.');

module.exports = (req, res, next) => {
  const guid = uuid.v4();

  const rcvd = {
    ip: req.ip,
    ua: req.headers['user-agent'],
    body: Logro.clean(clone(req.body)),
    query: Logro.clean(clone(req.query)),
    params: Logro.clean(clone(req.params)),
  };

  if (req.useragent) {
    rcvd.info = {
      os: req.useragent.os,
      browser: req.useragent.browser,
      version: req.useragent.version,
      platform: req.useragent.platform,
    };
  }

  req.log = Logro.getLogger(guid);
  req.log.info(req, rcvd);
  req.guid = guid;

  next();
};
