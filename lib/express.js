const clone = require('rfdc')();
const uuid = require('uuid');
const Logro = require('.');

module.exports = (req, res, next) => {
  const guid = uuid.v4();

  const rcvd = {
    ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || null,
    ua: req.headers['user-agent'] || null,
    req: `${req.method} ${req.originalUrl || req.url}`,
    body: Logro.clean(clone(req.body)) || null,
    query: Logro.clean(clone(req.query)) || null,
    params: Logro.clean(clone(req.params)) || null,
  };

  if (req.useragent) {
    rcvd.ua = {
      os: req.useragent.os || null,
      browser: req.useragent.browser || null,
      version: req.useragent.version || null,
      platform: req.useragent.platform || null,
    };
  }

  req.log = Logro.getLogger(guid);
  req.log.info(rcvd);
  req.guid = guid;

  next();
};
