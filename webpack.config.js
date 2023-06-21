const path = require("path");
const webpack = require("webpack");
const HtmlWebPackPlugin = require("html-webpack-plugin");
module.exports = {
  entry: {
    index: "./src/js/index.js",
    game: "./src/js/game.js",
    instruction: "./src/js/instruction.js",
    default_stage: "./src/js/default_stage.js",
    post_stage: "./src/js/post_stage.js",
  },
  output: {
    path: path.join(__dirname, "dist"),
    publicPath: "/",
    filename: "[name].js",
    assetModuleFilename: "images/[hash][ext][query]",
  },
  target: "web",
  devtool: "source-map",
  resolve: {
    alias: {
      assert: "assert",
      buffer: "buffer",
      console: "console-browserify",
      constants: "constants-browserify",
      crypto: "crypto-browserify",
      domain: "domain-browser",
      events: "events",
      http: "stream-http",
      https: "https-browserify",
      os: "os-browserify/browser",
      path: "path-browserify",
      punycode: "punycode",
      process: "process/browser",
      querystring: "querystring-es3",
      stream: "stream-browserify",
      _stream_duplex: "readable-stream/duplex",
      _stream_passthrough: "readable-stream/passthrough",
      _stream_readable: "readable-stream/readable",
      _stream_transform: "readable-stream/transform",
      _stream_writable: "readable-stream/writable",
      string_decoder: "string_decoder",
      sys: "util",
      timers: "timers-browserify",
      tty: "tty-browserify",
      url: "url",
      util: "util",
      vm: "vm-browserify",
      zlib: "browserify-zlib",
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env"],
        },
      },
      {
        // Loads the javacript into html template provided.
        // Entry point is set below in HtmlWebPackPlugin in Plugins
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
            //options: { minimize: true }
          },
        ],
      },
      {
        test: /\.(scss|sass|css)$/i,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        type: "asset/resource",
      },
      // {
      //   test: /\.json$/,
      //   loader: "json-loader",
      // },
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./src/html/index.html",
      filename: "./index.html",
      chunks: ["index"],
    }),
    new HtmlWebPackPlugin({
      template: "./src/html/game.html",
      filename: "./game.html",
      chunks: ["game"],
    }),
    new HtmlWebPackPlugin({
      template: "./src/html/instruction.html",
      filename: "./instruction.html",
      chunks: ["instruction"],
    }),
    new HtmlWebPackPlugin({
      template: "./src/html/default_stage.html",
      filename: "./default_stage.html",
      chunks: ["default_stage"],
    }),
    new HtmlWebPackPlugin({
      template: "./src/html/post_stage.html",
      filename: "./post_stage.html",
      chunks: ["post_stage"],
    }),
  ],
};
