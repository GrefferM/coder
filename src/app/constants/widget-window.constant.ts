import * as path from "node:path";

/** The widget's window (52a): a borderless window on the desktop, its own size every launch. */
export const WIDGET_WIDTH = 380;
export const WIDGET_HEIGHT = 720;

/** The renderer draws the widget, not the main page, when loaded under this hash. */
export const WIDGET_HASH = "widget";

/** The menu bar's Coder: a press shows the widget, its menu closes Coder. */
export const TRAY_ICON_PATH = path.join(__dirname, "..", "assets", "trayTemplate.png");
export const TRAY_TOOLTIP = "Coder";
export const QUIT_LABEL = "Закрити Coder";
/** The red dot beside «Закрити Coder»: a menu of the system draws its words in its own colour. */
export const QUIT_ICON_PATH = path.join(__dirname, "..", "assets", "quit.png");
