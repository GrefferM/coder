import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";

// The renderer takes only types from the backend: a value import pulls node:fs and the native
// SQLite binding into a browser bundle. Everything else crosses through `window.electronApi`.
const rendererModulesImport = {
  group: ["**/modules", "**/modules/*"],
  allowTypeImports: true,
  message: "The renderer takes only types from modules — a value import bundles node:fs.",
};

const pagesImport = {
  group: ["**/pages/**"],
  message: "A subject cannot reach into a page: the page composes subjects, not the other way round.",
};

const ipcImport = {
  group: ["**/ipc", "**/ipc/**"],
  message: "A channel's name is taken from src/contracts, never from the main process's IPC folder.",
};

const neighbourInnards = {
  // A subject's own folder stands before the inner one, never a `..` climbing out of it.
  // `constants/` is every layer's folder, so it is caught only where the path names
  // `features/` or has already climbed clear of the subject it started in.
  group: [
    "**/[a-z]*/logic",
    "**/[a-z]*/words",
    "**/[a-z]*/ui",
    "**/[a-z]*/hooks",
    "**/[a-z]*/api",
    "**/features/*/**/constants",
    "**/../../[a-z]*/constants",
  ],
  message: "Take a neighbouring subject through its index.ts, never from inside it.",
};

const screenImport = {
  group: ["**/ui", "**/ui/**", "**/hooks", "**/hooks/**"],
  message: "What decides is called by a hook or a drawing, never the other way round.",
};

const reactImport = {
  name: "react",
  message: "What decides and what speaks know nothing of the screen.",
};

const sharedKnowsNoSubject = {
  group: ["**/features/**", "**/pages/**"],
  message: "This is shared by everyone: it cannot know a subject or a page.",
};

const apiImport = {
  group: ["**/api", "**/api/**"],
  message: "A drawing reaches the machine through a hook, never itself.",
};

// A narrower block replaces the wider one's rule whole, so the house bans are one list a block spreads and adds to.
const rendererLayers = [rendererModulesImport, pagesImport, ipcImport, neighbourInnards];

export default tseslint.config(
  {
    // `design/` is the design reference and its vendored React; `_to_delete/` waits to be deleted by hand;
    // `.tools/` is this machine's alone.
    ignores: ["dist/**", "node_modules/**", "design/**", "_to_delete/**", ".tools/**"],
  },
  {
    languageOptions: {
      globals: globals.node,
    },
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    // The renderer runs in a browser, not Node.
    files: ["src/app/renderer/**/*.{ts,tsx,mts,cts}"],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // Plain CommonJS that no ts-node hook reaches: the window's preload, the two bootstraps that register the hook
    // themselves, the repo's scripts, and a stand-in server a test spawns as a process of its own.
    files: [
      "src/app/preload.js",
      "src/app/bootstrap.js",
      "src/app/agent-bootstrap.js",
      "scripts/*.js",
      "scripts/*.cjs",
      "src/**/testing/*.cjs",
    ],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    // Spec files stand outside the block below; this one restriction binds them too.
    files: ["src/app/renderer/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [rendererModulesImport],
        },
      ],
    },
  },
  {
    // The renderer's layers, and the one direction they may point in: pages take subjects, subjects
    // take what is shared, and what is shared knows no subject at all. A subject may take a
    // neighbour, but only through its door.
    files: ["src/app/renderer/**/*.{ts,tsx}"],
    // A spec names the word it asserts on where that word is declared.
    ignores: ["**/*.spec.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: rendererLayers,
        },
      ],
    },
  },
  {
    // What decides and what speaks know nothing of the screen: they are called from a hook or a
    // drawing, never the other way round, and a spec of theirs needs no renderer to run.
    files: [
      "src/app/renderer/**/logic/**/*.{ts,tsx}",
      "src/app/renderer/**/words/**/*.{ts,tsx}",
      "src/app/renderer/utils/**/*.{ts,tsx}",
    ],
    ignores: ["**/*.spec.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          paths: [reactImport],
          patterns: [...rendererLayers, screenImport],
        },
      ],
    },
  },
  {
    // A drawing never talks to the machine itself: the call goes through a hook, so what is drawn
    // can be rendered in a spec with nothing behind it.
    files: ["src/app/renderer/**/ui/**/*.{ts,tsx}", "src/app/renderer/components/**/*.{ts,tsx}"],
    ignores: ["**/*.spec.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [...rendererLayers, apiImport],
        },
      ],
    },
  },
  {
    // A path naming `features/` from inside it has climbed to the renderer's root to come back down. The base rule, not
    // the typed one, so it adds to the bans above instead of replacing them.
    files: ["src/app/renderer/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/features/*", "**/features/*/**"],
              message:
                "A subject never names `features/` from inside it: a neighbour is one `..` away, its own folders are nearer still.",
            },
          ],
        },
      ],
    },
  },
  {
    // `src/contracts` imports nothing but itself: anything it took would put one process's code in the other's bundle.
    files: ["src/contracts/**/*.ts"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/app/**", "**/modules/**", "**/utils/**"],
              message: "Contracts are what both processes agree on: they take nothing from either.",
            },
          ],
        },
      ],
    },
  },
  {
    // Nothing shared may know a subject. Three blocks, as a shared drawing, a shared hook and a shared rule are barred
    // from different things.
    files: ["src/app/renderer/components/**/*.{ts,tsx}"],
    ignores: ["**/*.spec.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [...rendererLayers, sharedKnowsNoSubject, apiImport],
        },
      ],
    },
  },
  {
    files: ["src/app/renderer/hooks/**/*.{ts,tsx}"],
    ignores: ["**/*.spec.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [...rendererLayers, sharedKnowsNoSubject],
        },
      ],
    },
  },
  {
    files: [
      "src/app/renderer/logic/**/*.{ts,tsx}",
      "src/app/renderer/utils/**/*.{ts,tsx}",
      "src/app/renderer/words/**/*.{ts,tsx}",
    ],
    ignores: ["**/*.spec.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          paths: [reactImport],
          patterns: [...rendererLayers, sharedKnowsNoSubject, screenImport],
        },
      ],
    },
  },
  {
    // The atoms (`Mark`, `Words`, `Chip`) carry their own type.
    files: ["src/app/renderer/**/*.{ts,tsx}"],
    ignores: ["**/*.spec.{ts,tsx}", "**/*.constant.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Property[key.name=/^(fontSize|letterSpacing)$/] > Literal[value=/^[0-9.]+$/]",
          message: "Type is the atom's to say, or a constant beside this file — never a bare number here.",
        },
        {
          selector: "Property[key.name=/^(fontSize|letterSpacing)$/] > Literal[raw=/^[0-9]/]",
          message: "Type is the atom's to say, or a constant beside this file — never a bare number here.",
        },
      ],
    },
  },
  {
    files: ["src/**/*.{ts,tsx,mts,cts}"],
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",

      // Вимикаємо стандартне правило на користь unused-imports (воно ще й видаляє --fix)
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      "no-multiple-empty-lines": ["warn", { max: 1, maxEOF: 0, maxBOF: 0 }],
      "no-trailing-spaces": "warn",
      "eol-last": ["warn", "always"],

      semi: ["error", "always"],
      quotes: ["error", "double", { avoidEscape: true }],
      "padding-line-between-statements": ["warn", { blankLine: "always", prev: "*", next: "return" }],
      "object-property-newline": ["warn", { allowAllPropertiesOnSameLine: false }],
      // Об'єктні літерали завжди багаторядкові, навіть з однією властивістю (не { x: 1 } в один рядок).
      // Імпорти й деструктуризацію (const { x } = y) не чіпаємо.
      "object-curly-newline": ["warn", { ObjectExpression: { minProperties: 1 } }],
      // Нічого не читається вище за рядок, де воно створене: змінна, прочитана із замикання раніше за своє
      // оголошення, кидає в мить малювання, і TypeScript такого не бачить.
      "@typescript-eslint/no-use-before-define": [
        "error",
        { variables: true, functions: false, classes: false, enums: true, typedefs: false, ignoreTypeReferences: true },
      ],
      // Деструктуризація масиву замість прямого індексу: const [item] = array, не array[0]
      "prefer-destructuring": [
        "warn",
        { VariableDeclarator: { array: true, object: false }, AssignmentExpression: { array: false, object: false } },
      ],
    },
  },
);
