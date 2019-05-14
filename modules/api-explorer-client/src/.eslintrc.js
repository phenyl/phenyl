const baseConfig = require("../../../.eslintrc");

module.exports = {
  ...baseConfig,
  globals: {
    window: true
  }
};
