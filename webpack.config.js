// webpack.config.js

const defaultConfig = require("@wordpress/scripts/config/webpack.config");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = {
  ...defaultConfig,

  // This forces all dependencies (React, wp-components, etc.) to be
  // included directly in your final admin.js and public.js files.
  externals: {},

  entry: {
    admin: "./src/admin/index.js",
    public: "./src/public/index.js",
  },

  output: {
    ...defaultConfig.output,
    filename: "[name].js",
  },

  // This is the new part.
  // It adds the Bundle Analyzer to the list of Webpack plugins.
  // When you run `npm run build`, it will automatically open a browser
  // tab showing a visual map of your bundled files.
  plugins: [
    ...defaultConfig.plugins,
    new BundleAnalyzerPlugin({
      analyzerMode: "static", // Generates an HTML report file
      openAnalyzer: true, // Automatically opens the report in your browser
      reportFilename: "bundle-report.html", // The name of the report file
    }),
  ],
};
