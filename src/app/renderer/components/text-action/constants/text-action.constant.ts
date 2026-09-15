import { BROKEN_COLOR, CONTROL_AT_REST_COLOR, FALLEN_COLOR, QUIET_MARK_COLOR } from "../../../constants";

/** Bare text action — mono, uppercase, backdrop only on hover. */
export const TEXT_ACTION_FONT_SIZE_PX = 9;
export const TEXT_ACTION_LETTER_SPACING_PX = 1;
export const TEXT_ACTION_DANGER_COLOR = BROKEN_COLOR;

/** Quiet variant for lists where an accent would read as the primary action. */
export const TEXT_ACTION_QUIET_COLOR = QUIET_MARK_COLOR;
export const TEXT_ACTION_QUIET_HOVER_COLOR = CONTROL_AT_REST_COLOR;
export const TEXT_ACTION_DANGER_HOVER_COLOR = FALLEN_COLOR;
