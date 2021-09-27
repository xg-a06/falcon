const path = require('path');
const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');

function resolve(dir) {
  return path.resolve(__dirname, '..', dir);
}

const isProd = process.env.NODE_ENV === 'production';

function getEntries() {
  let indexs = glob('demo/*/index.js', { sync: true });
  const htmlPlugins = [
    new HtmlWebpackPlugin({
      template: resolve('demo/index.html'),
      filename: 'demo/index.html',
      inject: 'body',
      minify: true,
      chunks: ['demo/index'],
    }),
  ];
  const entries = indexs.reduce(
    (ret, file) => {
      const [, entry] = file.split('/');
      ret[`demo/${entry}`] = resolve(file);
      htmlPlugins.push(
        new HtmlWebpackPlugin({
          template: resolve(`demo/${entry}/index.html`),
          filename: `demo/${entry}/index.html`,
          inject: 'body',
          minify: true,
          chunks: [`demo/${entry}`],
        })
      );
      return ret;
    },
    { 'demo/index': resolve('demo/index.js') }
  );
  return { entries, htmlPlugins };
}

module.exports = {
  resolve,
  isProd,
  getEntries,
};
