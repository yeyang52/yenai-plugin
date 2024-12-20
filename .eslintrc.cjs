module.exports = {
  env: {
    es2021: true,
    node: true
  },
  extends: [
    "standard",
    "plugin:jsdoc/recommended",
    "plugin:import/recommended",
    "plugin:promise/recommended"
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: [ "import", "promise", "jsdoc" ],
  globals: {
    Bot: true,
    redis: true,
    logger: true,
    plugin: true,
    segment: true,
    ReplyError: true
  },
  rules: {
    "eqeqeq": [ "off" ],
    "prefer-const": [ "off" ],
    "arrow-body-style": "off",
    "camelcase": "off",
    "quotes": [ "error", "double" ],
    "quote-props": [ "error", "consistent" ],
    "no-eval": [ "error", { allowIndirect: true } ],
    "array-bracket-newline": [ "error", { multiline: true } ],
    "array-bracket-spacing": [ "error", "always" ],
    "space-before-function-paren": [ "error", "never" ],
    "no-invalid-this": "error",
    // 插件规则
    "jsdoc/require-returns": 0,
    "jsdoc/require-jsdoc": 0,
    "jsdoc/require-param-description": 0,
    "jsdoc/require-returns-description": 0,
    "jsdoc/require-param-type": 0,
    "import/extensions": [ "error", "ignorePackages" ]
  },
  settings: {
    "import/resolver": {
      "custom-alias": {
        alias: {
          "#yenai.common": "./lib/common/common.js",
          "#yenai.request": "./lib/request/request.js",
          "#yenai.puppeteer": "./lib/puppeteer/puppeteer.js",
          "#yenai.model": "./model/index.js",
          "#yenai.components": "./components/index.js"
        },
        extensions: [ ".js", ".json", ".jsx", ".ts", ".tsx" ]
      }
    }
  },
  ignorePatterns: [ "echarts.min.js", "westeros.js", "theme/" ]
}
