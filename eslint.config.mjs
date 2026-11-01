import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  /**
   * Next 16 ships the React Compiler lint rules. `set-state-in-effect` flags the
   * standard client-side data-fetching pattern (fetch in an effect, store the
   * result in state) that this app must use for authenticated calls against the
   * separate Express API — those requests cannot run in a Server Component
   * because they depend on the browser's HTTPOnly session cookie. The pattern is
   * intentional and reviewed, so the advisory is a warning, not an error.
   * Everything else (including all correctness rules) stays an error.
   */
  {
    rules: {
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
