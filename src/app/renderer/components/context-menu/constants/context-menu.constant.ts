import {
  BORDER_AT_REST_COLOR,
  BROKEN_COLOR,
  FALLEN_COLOR,
  FIRST_LEVEL_TEXT_COLOR,
  PANEL_GROUND_COLOR,
  QUIET_MARK_COLOR,
} from "../../../constants";

/** The menu box. */
export const CONTEXT_MENU_BACKGROUND_COLOR = PANEL_GROUND_COLOR;
export const CONTEXT_MENU_BORDER_COLOR = BORDER_AT_REST_COLOR;
export const CONTEXT_MENU_BORDER_RADIUS_PX = 10;
export const CONTEXT_MENU_PADDING_PX = 4;

/** Menu width, px; wide enough that no line wraps. */
export const CONTEXT_MENU_WIDTH_PX = 222;

export const CONTEXT_MENU_SHADOW = "0 20px 44px rgba(0, 0, 0, 0.55)";

/** Menu line metrics. */
export const CONTEXT_MENU_ITEM_HEIGHT_PX = 30;
export const CONTEXT_MENU_ITEM_PADDING = "0 9px";
export const CONTEXT_MENU_ITEM_BORDER_RADIUS_PX = 7;
export const CONTEXT_MENU_ITEM_GAP_PX = 9;
export const CONTEXT_MENU_ITEM_FONT_SIZE_PX = 12.5;
export const CONTEXT_MENU_ITEM_COLOR = FIRST_LEVEL_TEXT_COLOR;

/** Disabled line color (e.g. paste with nothing copied). */
export const CONTEXT_MENU_DISABLED_COLOR = QUIET_MARK_COLOR;

/** Danger line color at rest and hovered. */
export const CONTEXT_MENU_DANGER_COLOR = BROKEN_COLOR;
export const CONTEXT_MENU_DANGER_HOVER_COLOR = FALLEN_COLOR;

/** Danger line hover and pressed backgrounds. */
export const CONTEXT_MENU_DANGER_HOVER_BACKGROUND_COLOR = "#2a1c20";
export const CONTEXT_MENU_DANGER_PRESSED_BACKGROUND_COLOR = "#241519";

/** Shortcut text: mono, right-aligned. */
export const CONTEXT_MENU_SHORTCUT_FONT_SIZE_PX = 9;
export const CONTEXT_MENU_SHORTCUT_COLOR = QUIET_MARK_COLOR;
export const CONTEXT_MENU_SHORTCUT_DISABLED_COLOR = "#3a4258";

/** Separator between line groups. */
export const CONTEXT_MENU_SEPARATOR_MARGIN = "4px 6px";

export const CONTEXT_MENU_ICON_SIZE_PX = 13;
