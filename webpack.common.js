const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const Fiber = require("fibers");
const path = require("path");

module.exports = (env, argv) => ({
  entry: [__dirname + "/index.html", "@babel/polyfill", "./main.js"],
  resolve: {
    alias: {
      src: path.resolve(__dirname, "src/"),
      css: path.resolve(__dirname, "assets/css/"),
      iconfont: path.resolve(__dirname, "assets/fonts/icomoon/"),
      images: path.resolve(__dirname, "assets/images/")
    },
    extensions: [".js", ".json", ".css", ".scss"]
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.html/,
        loader: "file-loader?name=[name].[ext]"
      },
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: { presets: ["@babel/preset-env"] }
        }
      },
      {
        test: /\.(s*)css$/,
        use: [
          {
            loader:
              argv.mode !== "production"
                ? "style-loader"
                : MiniCssExtractPlugin.loader
          },
          {
            loader: "css-loader", // translates CSS into CommonJS
            options: { importLoaders: 1 }
          },
          {
            loader: "postcss-loader" // translates CSS into CommonJS
          },
          {
            loader: "sass-loader",
            options: {
              implementation: require("dart-sass"),
              fiber: Fiber
            }
          }
        ]
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/i,
        exclude: [/\.*\/images/i],
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "fonts/"
            }
          }
        ]
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        exclude: [/\.*\/fonts/i],
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "images/"
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "[name].css",
      chunkFilename: "[id].css"
    })
  ]
});
