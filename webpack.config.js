const defaults = require("@wordpress/scripts/config/webpack.config");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const isLegacy = process.env.BUILD_TARGET === "legacy";

module.exports = isLegacy
  ? {
      entry: {
        admin: "./src/admin/index.js",
      },
      output: {
        path: path.resolve(__dirname, "build"),
        filename: "[name].js",
        clean: true,
      },
      devtool: false,
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: "babel-loader",
          },
          {
            test: /\.scss$/,
            use: [
              MiniCssExtractPlugin.loader,
              "css-loader",
              "postcss-loader",
              "sass-loader",
            ],
          },
        ],
      },
      plugins: [
        new MiniCssExtractPlugin({
          filename: "[name].css",
        }),
      ],
    }
  : {
      ...defaults,
      externals: {
        react: "React",
        "react-dom": "ReactDOM",
      },
      entry: {
        admin: "./src/admin/index.js",
      },
      output: {
        ...defaults.output,
        filename: "[name].js",
      },
    };
