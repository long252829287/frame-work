module.exports = {
  root: true,
  env: {
    browser: true
  },
  extends: [
    'plugin:vue/recommended',
    'plugin:vue/essential'
  ],
  plugins: [
    'vue'
  ],
  parserOptions: {
    'parser': 'babel-eslint',
    'ecmaVersion': 2022,
    'sourceType': 'module'
  },
  rules: {
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'no-alert': process.env.NODE_ENV === 'production' ? 2 : 0,
    'no-console': 0,
    'arrow-parent': 0,
    'space-before-function-paren': 0,
    'semi': [2, 'always'],
    'quotes': [2, 'single'],
    'indent': [2, 2],
    'no-trailing-spaces': 2,
    'vue/max-attributes-per-line': 0,
    'vue/singleline-html-element-content-newline': 0,
    'vue/require-default-prop': 0,
    'vue/multi-word-component-names': 0,
    'vue/first-attribute-linebreak': 0,
    'vue/html-closing-bracket-newline': 0,
    'vue/no-v-html': 0,
    'vue/html-self-closing': ['error', {
      'html': {
        'void': 'always',
        'normal': 'any',
        'component': 'any'
      },
      'svg': 'always',
      'math': 'always'
    }]
  }
};
