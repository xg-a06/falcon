const { HotModuleReplacementPlugin } = require('webpack');
const { merge } = require('webpack-merge');
const { devServer } = require('./config');
const { getEntries } = require('./tools');
const { resolve } = require('./tools');
const baseConfig = require('./webpack.base.conf');

const { entries, htmlPlugins } = getEntries();

const devConfig = {
  entry: {
    ...entries,
  },
    module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'eslint-loader',
          options: {
            formatter: require('eslint-friendly-formatter'),
          },
        },
        include: [resolve('src')],
        enforce: 'pre',
      },
    ],
  },
    plugins: [new HotModuleReplacementPlugin(), ...htmlPlugins],
  devServer: devServer,
};

module.exports = merge(baseConfig, devConfig);
