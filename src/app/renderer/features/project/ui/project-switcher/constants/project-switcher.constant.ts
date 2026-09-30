import {
  BORDER_AT_REST_COLOR,
  FIRST_LEVEL_TEXT_COLOR,
  PANEL_GROUND_COLOR,
  QUIET_MARK_COLOR,
  SECOND_LEVEL_TEXT_COLOR,
} from "../../../../../constants";

/** Switcher position inside the canvas, px from top-left. */
export const SWITCHER_INSET_PX = 16;

export const SWITCHER_BUTTON_WIDTH_PX = 270;

export const SWITCHER_BUTTON_PADDING = "7px 9px 7px 11px";

export const SWITCHER_BUTTON_GAP_PX = 9;

export const SWITCHER_BUTTON_BORDER_RADIUS_PX = 9;

export const SWITCHER_BUTTON_BACKGROUND_COLOR = PANEL_GROUND_COLOR;

export const SWITCHER_BUTTON_BORDER_COLOR = BORDER_AT_REST_COLOR;

export const SWITCHER_NAME_FONT_SIZE_PX = 12.5;

export const SWITCHER_NAME_FONT_WEIGHT = 500;

export const SWITCHER_NAME_COLOR = "#e6e9f2";

export const SWITCHER_BUTTON_PATH_FONT_SIZE_PX = 9;

export const SWITCHER_BUTTON_PATH_LETTER_SPACING_PX = 1;

export const SWITCHER_BUTTON_PATH_COLOR = QUIET_MARK_COLOR;

export const SWITCHER_LIST_WIDTH_PX = 326;

export const SWITCHER_LIST_PADDING_PX = 5;

export const SWITCHER_LIST_GAP_PX = 6;

export const SWITCHER_LIST_BORDER_RADIUS_PX = 10;

/** List border and group-rule colour. */
export const SWITCHER_LIST_BORDER_COLOR = "#2c3550";

/** First group's label. */
export const SWITCHER_LIST_LABEL = "ПРОЄКТИ";

export const SWITCHER_LIST_LABEL_FONT_SIZE_PX = 9;

export const SWITCHER_LIST_LABEL_LETTER_SPACING_PX = 1.5;

export const SWITCHER_LIST_LABEL_PADDING = "8px 10px 5px";

export const SWITCHER_ROW_PADDING = "8px 10px";

/** Four projects stand; past that the list scrolls. */
export const SWITCHER_LIST_SHOWN_MAX = 4;

/** One row: 8px above, name and path with 2px between them, 8px below. */
export const SWITCHER_ROW_HEIGHT_PX = 47;

export const SWITCHER_LIST_MAX_HEIGHT_PX = SWITCHER_ROW_HEIGHT_PX * SWITCHER_LIST_SHOWN_MAX;

export const SWITCHER_ROW_BORDER_RADIUS_PX = 8;

export const SWITCHER_ROW_GAP_PX = 10;

/** Color of a row that is not the open project. */
export const SWITCHER_ROW_NAME_COLOR = FIRST_LEVEL_TEXT_COLOR;

export const SWITCHER_ROW_PATH_FONT_SIZE_PX = 9.5;

export const SWITCHER_ROW_PATH_COLOR = "#5c6478";

export const SWITCHER_ACTION_PADDING = "8px 10px";

export const SWITCHER_ACTION_FONT_SIZE_PX = 12.5;

/**
 * Two acts over a folder: the first opens a folder with a project or turns an empty one into a project under the
 * folder's name; the second looks first and asks to name an empty folder.
 */
export const SWITCHER_OPEN_FOLDER_LABEL = "Відкрити папку";
export const SWITCHER_NEW_PROJECT_LABEL = "Новий проєкт";

/** Puts the project down and goes back to the start screen. */
export const SWITCHER_CLOSE_LABEL = "Закрити проєкт";

/** Shows the open project's folder in the file manager. */
export const SWITCHER_REVEAL_LABEL = "Показати у Finder";

export const SWITCHER_REVEAL_PADDING = "7px 10px 8px";

export const SWITCHER_REVEAL_FONT_SIZE_PX = 11.5;

export const SWITCHER_REVEAL_COLOR = SECOND_LEVEL_TEXT_COLOR;

/** Color a failed reveal or a failed switch is reported in. */
export const SWITCHER_ERROR_COLOR = "#ff6b6b";

/** Backdrop over the page while a new project is being named; the canvas stays visible but inert. */
export const SWITCHER_SCRIM_COLOR = "rgba(8, 10, 16, 0.72)";

/** Shown when a project's folder no longer holds one. */
export const SWITCHER_MISSING_LABEL = "НЕ ЗНАЙДЕНО";

/** Row colour of a missing project. */
export const SWITCHER_MISSING_COLOR = QUIET_MARK_COLOR;

export const SWITCHER_FORGET_LABEL = "Прибрати зі списку";

export const SWITCHER_FORGET_COLOR = QUIET_MARK_COLOR;

/** Agent count, shortened to fit beside the path. */
export const SWITCHER_AGENTS_SHORT_LABEL = " АГ.";
export const SWITCHER_COUNT_LETTER_SPACING_PX = 1;
