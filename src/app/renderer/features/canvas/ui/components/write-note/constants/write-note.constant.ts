import { FALLEN_COLOR, FIRST_LEVEL_TEXT_COLOR, SECOND_LEVEL_TEXT_COLOR } from "../../../../../../constants";

/** Line shown after a write, along the working area's bottom. */
export const WRITE_NOTE_GAP_PX = 10;
export const WRITE_NOTE_ICON_SIZE_PX = 14;
export const WRITE_NOTE_DONE_COLOR = "#4ade80";
export const WRITE_NOTE_DONE_TEXT_COLOR = FIRST_LEVEL_TEXT_COLOR;
export const WRITE_NOTE_FAILED_COLOR = FALLEN_COLOR;
export const WRITE_NOTE_RETRY_LABEL = "ЩЕ РАЗ";
export const WRITE_NOTE_RETRY_COLOR = FIRST_LEVEL_TEXT_COLOR;

/** Done-note timing; a failed note has no timer and waits to be answered. */
export const WRITE_NOTE_MS = 2400;
export const WRITE_NOTE_OUT_MS = 240;

/** Muted detail half of the line. */
export const WRITE_NOTE_DETAIL_COLOR = SECOND_LEVEL_TEXT_COLOR;
