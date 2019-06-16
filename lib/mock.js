function mockLogger() {
  return {
    info() {},
    warn() {},
    error() {},
    debug() {},
  };
}

module.exports = mockLogger;
