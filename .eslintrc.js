module.exports = {
  root: true,
  env: {
    node: true,
    "vue/setup-compiler-macros": true
  },
  extends: [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/typescript/recommended",
    "plugin:prettier/recommended"
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  globals: {
    cv: true // 避免全局opencv cv对象eslint语法报错
  },
  rules: {
    "no-console": "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "vue/multi-word-component-names": [
      "error",
      {
        ignores: ["index"]
      }
    ],
    "no-unused-vars": [
      "error",
      // we are only using this rule to check for unused arguments since TS
      // catches unused variables but not args.
      { varsIgnorePattern: ".*", args: "none" }
    ],
    "@typescript-eslint/no-unused-vars":
      process.env.NODE_ENV === "production" ? "off" : "warn",
    "no-control-regex": 0 // 避免不必要的正则检测
  },
  overrides: [
    {
      files: [
        "**/__tests__/*.{j,t}s?(x)",
        "**/tests/unit/**/*.spec.{j,t}s?(x)"
      ],
      env: {
        jest: true
      }
    },
    // 避免全局type类型在ts里报未定义错误
    {
      files: ["*.ts", "*.vue"],
      rules: {
        "no-undef": "off"
      }
    }
  ]
};
