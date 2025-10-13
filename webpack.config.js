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
        filename: "[name]-legacy.js",
        clean: false,
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
          {
            test: /\.svg$/,
            type: "asset/resource", // Use Webpack 5's built-in asset handler.
            generator: {
              // This ensures the output file has a readable name and is placed in an 'images' folder.
              filename: "images/[name][ext]",
            },
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
        clean: false,
      },
    };
