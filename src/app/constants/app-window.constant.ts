import * as path from "node:path";

/** Default size of the app's window on first open. */
export const WINDOW_WIDTH = 1366;
export const WINDOW_HEIGHT = 960;

/** Painted before the renderer's first frame; matches `$app-content-bg` in `app.scss`. */
export const WINDOW_BACKGROUND_COLOR = "#0d0f16";

/** The app's name in the Dock, title bar and system menus. */
export const APP_NAME = "Coder";

export const APP_ICON_PATH = path.join(__dirname, "..", "assets", "icon.png");

export const PRELOAD_SCRIPT_PATH = path.join(__dirname, "..", "preload.js");

/** The Vite dev server's URL, set by `npm run dev:app` once it's listening. */
export const RENDERER_DEV_SERVER_URL = process.env.RENDERER_DEV_SERVER_URL;
