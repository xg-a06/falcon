/* eslint-disable no-param-reassign */
/* eslint-disable import/no-extraneous-dependencies */
const glob = require('glob');

const indexs = glob('*/index.ts', { sync: true });
const htmlPlugins = [];
const entries = indexs.reduce((ret, file) => {
  const [dir] = file.split('/');
  ret[`${dir}`] = file;
  htmlPlugins.push({
    template: `${dir}/index.html`,
    filename: `${dir}/index.html`,
    inject: 'body',
    minify: true,
    chunks: [`${dir}`],
  });
  return ret;
}, {});

const config = {
  entry: entries,
  devServer: {
    port: 2333,
    proxy: {
      '/api': {
        target: 'http://10.0.70.49:8000',
        changeOrigin: true,
      },
    },
  },
  path: {
    tplPath: htmlPlugins,
  },
};

module.exports = config;
