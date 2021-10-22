const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const threadLoader = require('thread-loader');
const config = require('./config');
const { resolve, isProd } = require('./tools');
const pkg = require('../package.json');

threadLoader.warmup(
  {
    workers: 4,
  },
  ['babel-loader', '@babel/preset-env'],
);

const baseConfig = {
  target: 'web',
  mode: isProd ? 'production' : 'development',
  devtool: isProd ? false : 'source-map',
  entry: {
    index: resolve('src/index.ts'),
  },
  output: {
    filename: '[name].js',
    path: resolve(`dist`),
    library: {
      type: 'umd',
    },
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    alias: {
      '@src': resolve('src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.[t|j]s?$/,
        // loader: 'babel-loader',
        use: [
          {
            loader: 'thread-loader',
            options: {
              workers: 4,
            },
          },
          'cache-loader',
          'babel-loader?cacheDirectory=true',
        ],
        include: [resolve('src'), resolve('demo')],
      },
      {
        test: /\.worker\.ts$/,
        use: {
          loader: 'worker-loader',
          options: { inline: 'fallback' },
        },
        include: [resolve('src')],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        BUILD_ENV: JSON.stringify(process.env.BUILD_ENV),
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        API_PATH: JSON.stringify(config[process.env.BUILD_ENV].API_PATH),
      },
    }),
  ],
};

module.exports = baseConfig;
