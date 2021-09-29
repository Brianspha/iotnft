module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ["plugin:vue/strongly-recommended", "eslint:recommended"],
  rules: {
    "no-console": "off",
    "no-debugger": "off",
    "no-unused-vars": "off",
    "no-async-promise-executor": "off",
    "no-empty": "off",
    "no-undef": "off",
    "vue/no-unused-components":"off",
  },
  parserOptions: {
    parser: "babel-eslint",
  },
};
