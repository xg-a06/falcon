const chalk = require('chalk');
const { merge } = require('webpack-merge');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const TerserPlugin = require('terser-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
// const NpmDtsPlugin = require('npm-dts-webpack-plugin');
const BundleDeclarationsWebpackPlugin = require('bundle-declarations-webpack-plugin');
const config = require('./config');
const baseConfig = require('./webpack.base.conf');

const prodConfig = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: {},
          compress: {},
          safari10: true,
        },
        parallel: true,
      }),
    ],
  },
  plugins: [
    // new BundleDeclarationsWebpackPlugin.default({
    //   entry: './src/index.ts',
    //   outFile: 'index.d.ts',
    // }),
    new ProgressBarPlugin({
      format: '  build [:bar] ' + chalk.green.bold(':percent') + ' (:elapsed seconds)',
    }),
  ],
};
if (config.buildDetail) {
  prodConfig.plugins.push(
    new BundleAnalyzerPlugin({
      analyzerPort: 8899,
    }),
  );
}
module.exports = merge(baseConfig, prodConfig);
