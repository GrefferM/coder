import * as path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/** The `.ts` specs that need a browser. An `api/` spec is here by what that layer is: it talks to the bridge on the
 * window, so every one of them needs a window — named by the folder rather than one by one. A hook that stands
 * beside the component it serves rather than in a `hooks/` folder is named here, one by one, like the utils below. */
const DOM_SPECS = [
  "**/hooks/**/*.spec.ts",
  "**/api/**/*.spec.ts",
  "components/zoom-field/use-zoom-field.spec.ts",
  "utils/keyboard/is-typed-in.spec.ts",
  "utils/sight/keep-in-sight.spec.ts",
  "utils/text/selected-text.spec.ts",
];

export default defineConfig({
  root: import.meta.dirname,
  base: "./",
  plugins: [react()],
  build: {
    outDir: path.join(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Bootstrap's own SCSS uses the syntax Dart Sass is deprecating.
        silenceDeprecations: ["import", "global-builtin", "color-functions", "if-function"],
      },
    },
  },
  test: {
    // Only tests that touch a DOM get a browser environment; the split is by what a test does, not where it lives.
    projects: [
      {
        extends: true,
        test: {
          name: "logic",
          environment: "node",
          include: ["**/*.spec.ts"],
          exclude: ["node_modules/**", "dist/**", ...DOM_SPECS],
          setupFiles: [],
        },
      },
      {
        extends: true,
        test: {
          name: "screens",
          environment: "jsdom",
          include: ["**/*.spec.tsx", ...DOM_SPECS],
          exclude: ["node_modules/**", "dist/**"],
          setupFiles: [path.join(import.meta.dirname, "vitest.setup.ts")],
        },
      },
    ],
  },
});
