module.exports = {
  env: { es6: true, node: true, jest: true },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ["prettier", "@typescript-eslint"],
  extends: ["eslint:recommended"],
  rules: {
    "no-unused-vars": "off",
    // caughtErrors "none" keeps the pre-bump behavior (typescript-eslint v8
    // changed the default to "all", which would newly flag unused `catch (e)`).
    // argsIgnorePattern allows intentionally-unused `_`-prefixed parameters.
    "@typescript-eslint/no-unused-vars": [
      "error",
      { caughtErrors: "none", argsIgnorePattern: "^_" }
    ],
    // The interfaces module intentionally declares domain types (Headers, etc.)
    // that shadow DOM lib globals; don't treat those as redeclarations.
    "no-redeclare": ["error", { builtinGlobals: false }],
    // TypeScript itself reports undefined names (and handles type-only imports);
    // the core no-undef rule only produces false positives on .ts files.
    "no-undef": "off",
    "prefer-arrow-callback": ["error"]
  },
  overrides: [
    {
      // type-test files assign values purely to assert their inferred types.
      files: ["**/type-test/**/*.ts"],
      rules: { "@typescript-eslint/no-unused-vars": "off" }
    }
  ]
};
