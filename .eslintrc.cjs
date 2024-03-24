module.exports = {
  env: {
    es2021: true,
    node: true
  },
  extends: ['standard', 'plugin:jsdoc/recommended', 'plugin:import/recommended', 'plugin:promise/recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['import', 'promise', 'jsdoc'],
  globals: {
    Bot: true,
    redis: true,
    logger: true,
    plugin: true,
    segment: true
  },
  rules: {
    'eqeqeq': ['off'],
    'prefer-const': ['off'],
    'arrow-body-style': 'off',
    'camelcase': 'off',
    'quote-props': ['error', 'consistent'],
    'no-eval': ['error', { allowIndirect: true }],
    'jsdoc/require-returns': 0,
    'jsdoc/require-jsdoc': 0,
    'jsdoc/require-param-description': 0,
    'jsdoc/require-returns-description': 0,
    'jsdoc/require-param-type': 0
  },
  ignorePatterns: ['resources/state/echarts.min.js']
}
