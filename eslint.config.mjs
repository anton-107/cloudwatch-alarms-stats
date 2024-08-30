import js from "@eslint/js";
import parser from "@typescript-eslint/parser";
import tsEslint from "@typescript-eslint/eslint-plugin";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import comments from "eslint-plugin-eslint-comments";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parser: parser,
    },
    plugins: {
      "@typescript-eslint": tsEslint,
      "simple-import-sort": simpleImportSort,
      "eslint-plugin-eslint-comments": comments,
    },
    ignores: ["/dist/**/*", "**/*.js"],
    files: ["**/*.ts"],
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "no-console": "error",
      "no-duplicate-imports": "error",
      "@typescript-eslint/no-unused-vars": "error",
      // "eslint-comments/no-unused-disable": "error",
      "max-depth": ["error", 2],
      "max-nested-callbacks": ["error", 2],
      "max-lines-per-function": ["error", 58],
      "max-statements": ["error", 22],
      "max-params": ["error", 3],
    },
  },
  {
    files: ["**/*.test.ts", "**/*.dev.ts"],
    rules: {
      "max-lines-per-function": "off",
      "max-statements": "off",
      "max-nested-callbacks": "off",
    },
  },
];
