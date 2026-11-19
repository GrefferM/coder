/** How this machine keeps the desktop widget. */
export const WIDGET_SETTINGS_CHANNEL = "widget:settings";

/** Lays a change over how this machine keeps the widget; what it leaves out stands as written. */
export const SAVE_WIDGET_CHANNEL = "widget:save";

/** Brings the main window up, opening it where it is closed; the widget goes away meanwhile. */
export const OPEN_MAIN_WINDOW_CHANNEL = "widget:open-main";

/** The widget's window takes the height its state asks, its top edge where it stands. */
export const RESIZE_WIDGET_CHANNEL = "widget:resize";

/** Pushed from main to both windows: how this machine keeps the widget, after any change from either. */
export const WIDGET_SETTINGS_CHANGED_CHANNEL = "widget:settings-changed";
