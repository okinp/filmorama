var HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

var path = require("path");

module.exports = {
  entry: [
    __dirname + "/index.html",
    '@babel/polyfill',
    "./main.js"
  ],
  resolve: {
    alias: {
      src: path.resolve(__dirname, "src/"),
      css: path.resolve(__dirname, "assets/css/"),
      iconfont: path.resolve(__dirname, "assets/fonts/icomoon/"),
      images: path.resolve(__dirname,"assets/images/")
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
        loader: 'file-loader?name=[name].[ext]', 
      },
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: { presets: [
            "@babel/preset-env"
          ]}
        }
      },
      {
        test: /\.(s*)css$/,
        use: [
          {
            loader: "style-loader" // creates style nodes from JS strings
          },
          // {
          //   loader: MiniCssExtractPlugin.loader,
          //   options: {
          //     // you can specify a publicPath here
          //     // by default it uses publicPath in webpackOptions.output
          //     publicPath: './dist/',
          //     hmr: process.env.NODE_ENV === 'development',
          //   },
          // },
          {
            loader: "css-loader", // translates CSS into CommonJS
            options: { importLoaders: 1}
          },
          {
            loader: "postcss-loader" // translates CSS into CommonJS
          },
          {
            loader: "sass-loader" // compiles Sass to CSS
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
    // new HtmlWebpackPlugin(),
    // new MiniCssExtractPlugin({
    //   // Options similar to the same options in webpackOptions.output
    //   // both options are optional
    //   filename: '[name].css',
    //   chunkFilename: '[id].css',
    // }),
  ]
};