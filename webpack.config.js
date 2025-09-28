const defaults = require("@wordpress/scripts/config/webpack.config");

module.exports = {
  ...defaults,
  externals: {},
  entry: {
    admin: "./src/admin/index.js",
    public: "./src/public/index.js",
  },
  output: {
    ...defaults.output,
    filename: "[name].js",
  },
};
