const { resolve } = require('./tools');
const config = {
  buildDetail: false,
  devServer: {
    contentBase: resolve('dist'),
    useLocalIp: true,
    port: 2233,
    open: true,
    hot: true,
    host: '0.0.0.0',
    index: 'index.html',
    overlay: {
      errors: true,
      warnings: false,
    },
    historyApiFallback: true,
    proxy: {
      '/xxx': {
        target: 'http://xxx.com',
        changeOrigin: true,
        pathRewrite: {
          '^/xxx': '/',
        },
      },
    },
  },
  local: {
    API_PATH: '/api',
  },
  prod: {
    API_PATH: '/api',
  },
};
module.exports = config;
