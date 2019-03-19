function mockLogger() {
  return {
    warn() {},
    error() {},
    debug() {},
  };
}

module.exports = mockLogger;
