/** How this machine keeps the desktop widget. */
export const WIDGET_SETTINGS_CHANNEL = "widget:settings";

/** Writes how this machine keeps the widget, whole. */
export const SAVE_WIDGET_CHANNEL = "widget:save";

/** Brings the main window up, opening it where it is closed. */
export const OPEN_MAIN_WINDOW_CHANNEL = "widget:open-main";

/** Takes the widget off the desktop. */
export const HIDE_WIDGET_CHANNEL = "widget:hide";

/** Every sphere's conversation in the widget's project. */
export const WIDGET_WALKS_CHANNEL = "widget:walks";

/** A question from the widget, put to its sphere's conversation. */
export const PUT_WIDGET_WALK_CHANNEL = "widget:put";

/** «ЗУПИНИТИ» in the widget: the sphere's walk ends. */
export const STOP_WIDGET_WALK_CHANNEL = "widget:stop";

/** «НОВА РОЗМОВА»: the sphere's conversation begins again. */
export const FRESH_WIDGET_WALK_CHANNEL = "widget:fresh";

/** Pushed from main: one sphere's conversation as it stands now. */
export const WIDGET_WALK_CHANGED_CHANNEL = "widget:walk-changed";

/** The widget's window takes the height its state asks, its top edge where it stands. */
export const RESIZE_WIDGET_CHANNEL = "widget:resize";
