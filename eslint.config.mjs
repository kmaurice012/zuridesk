import eslint from "@eslint/js";
import importX from "eslint-plugin-import-x";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/.expo/**",
      "**/.next/**",
      "**/coverage/**",
      "**/dist/**",
      "**/node_modules/**",
      "apps/api/openapi/openapi.json",
      "packages/api-client/src/generated/**"
    ]
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    plugins: {
      "import-x": importX
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "import-x/no-cycle": ["error", { ignoreExternal: true }],
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "mongoose",
              message:
                "Mongoose is private to packages/db. Import an exported repository or connection helper from @zuridesk/db."
            }
          ],
          patterns: [
            {
              group: ["@zuridesk/db/internal", "@zuridesk/db/internal/*"],
              message: "Raw database internals are not public API."
            }
          ]
        }
      ]
    }
  },
  {
    files: ["packages/db/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": "off"
    }
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    ...tseslint.configs.disableTypeChecked
  }
);
