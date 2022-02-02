module.exports = {
  "extends": "airbnb-base",
  "plugins": [
    "import"
  ],
  "parser": "@babel/eslint-parser",
  "rules": {
    "indent": ["error", 2]
  },
  "parserOptions": {
    "sourceType": "module",
    "ecmaVersion": 6,
    "ecmaFeatures": {
      "experimentalObjectRestSpread": true
    }
  }
};
