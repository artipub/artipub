import unjs from "eslint-config-unjs";

export default unjs({
  ignores: [
    "**/dist",
    "**/node_modules",
    "packages/**/CHANGELOG.md",
    "docs/.vitepress/cache",
    "docs/lunaria.config.json",
    ".artipub/cache",
  ],
  rules: {
    "unicorn/no-null": 0,
    "unicorn/prefer-top-level-await": 0,
    "unicorn/template-indent": 0,
    "unicorn/no-process-exit": 0,
    "unicorn/no-this-assignment": 0,
    "unicorn/no-unreadable-array-destructuring": 0,
    "unicorn/filename-case": 0,
    "unicorn/no-array-for-each": 0,
    "unicorn/no-array-reduce": 0,
    "unicorn/no-nested-ternary": 0,
    "@typescript-eslint/no-this-alias": 0,
    "@typescript-eslint/no-unused-vars": 1,
    semi: ["error", "always"],
  },
  markdown: {
    rules: {
      // markdown rule overrides
    },
  },
});
