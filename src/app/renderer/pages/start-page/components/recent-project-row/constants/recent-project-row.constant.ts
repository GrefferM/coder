import { BORDER_AT_REST_COLOR, PANEL_GROUND_COLOR, QUIET_MARK_COLOR } from "../../../../../constants";

export const ROW_BACKGROUND_COLOR = PANEL_GROUND_COLOR;

export const ROW_BORDER_COLOR = BORDER_AT_REST_COLOR;

export const ROW_BORDER_RADIUS_PX = 10;

export const ROW_PADDING = "12px 14px";

/** Gap, in pixels, between a row's name and the path under it. */
export const ROW_TEXT_GAP_PX = 3;

export const ROW_NAME_FONT_SIZE_PX = 13;

export const ROW_PATH_FONT_SIZE_PX = 10;

export const ROW_PATH_COLOR = "#5c6478";

export const ROW_NOTE_LETTER_SPACING_PX = 1;

/** Shown in place of the folder when it no longer holds a project. */
export const ROW_MISSING_LABEL = "НЕ ЗНАЙДЕНО";

/** Colour of a row whose folder no longer holds a project. */
export const ROW_MISSING_COLOR = QUIET_MARK_COLOR;

/** Title of the cross that drops a project from the list. */
export const ROW_FORGET_LABEL = "Прибрати зі списку";

/** Colour of that cross at rest. */
export const ROW_FORGET_COLOR = QUIET_MARK_COLOR;

/** Separator between the agent count and the last-opened day. */
export const ROW_NOTE_SEPARATOR = " · ";
