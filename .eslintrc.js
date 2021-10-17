const path = require('path');

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['airbnb-base', 'plugin:@typescript-eslint/recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    parser: '@typescript-eslint/parser',
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [['@src', path.resolve('./src')]],
        extensions: ['.ts', '.js', '.jsx', '.json'],
      },
    },
  },
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    'class-methods-use-this': 0,
    'import/extensions': 0,
    'import/prefer-default-export': 0,
    'no-debugger': 0,
  },
  globals: {},
};
