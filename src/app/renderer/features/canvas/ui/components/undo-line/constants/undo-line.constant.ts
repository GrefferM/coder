import {
  BORDER_AT_REST_COLOR,
  CONTROL_AT_REST_COLOR,
  PANEL_GROUND_COLOR,
  QUIET_MARK_COLOR,
} from "../../../../../../constants";

export const UNDO_ACTION_LABEL = "СКАСУВАТИ ⌘Z";

/** «30 С» — the seconds this offer has left. */
export const UNDO_SECONDS_SUFFIX = "С";

export const UNDO_LINE_GAP_PX = 10;
export const UNDO_LINE_PADDING = "8px 12px";
export const UNDO_LINE_BORDER_RADIUS_PX = 9;
export const UNDO_LINE_FONT_SIZE_PX = 9;
export const UNDO_LINE_LETTER_SPACING_PX = 1.5;
export const UNDO_LINE_BACKGROUND_COLOR = PANEL_GROUND_COLOR;
export const UNDO_LINE_SHADOW = "0 14px 30px rgba(0, 0, 0, 0.5)";
export const UNDO_LINE_ANIMATION = "undo-line-in 0.16s cubic-bezier(0.2, 0, 0, 1)";

export const UNDO_LINE_BORDER_COLOR = BORDER_AT_REST_COLOR;
export const UNDO_LINE_MESSAGE_COLOR = CONTROL_AT_REST_COLOR;
export const UNDO_LINE_ACTION_COLOR = "#38a3ff";
export const UNDO_LINE_SECONDS_COLOR = QUIET_MARK_COLOR;

/** An offer pushed up by a newer one dims but keeps its own countdown and undo. */
export const UNDO_LINE_OLDER_OPACITY = 0.72;
export const UNDO_LINE_OLDER_BORDER_COLOR = "#1c202c";
export const UNDO_LINE_OLDER_MESSAGE_COLOR = "#5c6478";
export const UNDO_LINE_OLDER_ACTION_COLOR = "#2c6ba8";
export const UNDO_LINE_OLDER_SECONDS_COLOR = "#3a4154";

export const UNDO_LINE_SEPARATOR_WIDTH_PX = 1;
export const UNDO_LINE_SEPARATOR_HEIGHT_PX = 14;
