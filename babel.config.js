const babelConfig = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: 'chrome>=49',
        useBuiltIns: 'usage',
        corejs: {
          version: 3,
          proposals: true, // 使用尚在“提议”阶段特性的 polyfill
        },
      },
    ],
    '@babel/preset-typescript',
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  plugins: [
    'react-refresh/babel',
    [
      '@babel/plugin-transform-react-jsx',
      {
        runtime: 'automatic',
      },
    ],
    ['@babel/plugin-transform-runtime'],
    '@babel/plugin-proposal-class-static-block', // 必须在plugin-proposal-class-properties之前
    ['@babel/plugin-proposal-decorators', { legacy: true }], // 必须在plugin-proposal-class-properties之前
    ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
    ['@babel/plugin-proposal-private-methods', { loose: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    '@babel/plugin-proposal-do-expressions',
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/plugin-proposal-function-bind',
    '@babel/plugin-proposal-function-sent',
    '@babel/plugin-proposal-logical-assignment-operators',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-numeric-separator',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-partial-application',
    ['@babel/plugin-proposal-pipeline-operator', { proposal: 'minimal' }],
    '@babel/plugin-proposal-throw-expressions',
    [
      'import',
      {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: 'css',
      },
    ],
  ],
};

if (process.env.NODE_ENV === 'production') {
  babelConfig.plugins.shift();
}

module.exports = babelConfig;
