const _ = require('lodash');
const uuid = require('uuid');

const Logro = require('.');

const log = Logro.createLogger(__filename);

module.exports = (req, res, next) => {
  const guid = uuid.v4();
  const rcvd = {
    ip: req.ip,
    ua: req.headers['user-agent'],
    body: _.cloneDeep(Logro.clean(req.body)),
    query: _.cloneDeep(Logro.clean(req.query)),
    params: _.cloneDeep(Logro.clean(req.params)),
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
