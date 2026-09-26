import { FALLEN_COLOR, FIRST_LEVEL_TEXT_COLOR, SECOND_LEVEL_TEXT_COLOR } from "../../../../../../constants";

/** Line shown after a write, a change from outside or a refusal — along the working area's top. */
export const WRITE_NOTE_GAP_PX = 10;
export const WRITE_NOTE_ICON_SIZE_PX = 14;
export const WRITE_NOTE_DONE_COLOR = "#4ade80";
export const WRITE_NOTE_DONE_TEXT_COLOR = FIRST_LEVEL_TEXT_COLOR;
export const WRITE_NOTE_FAILED_COLOR = FALLEN_COLOR;
export const WRITE_NOTE_RETRY_LABEL = "ЩЕ РАЗ";
export const WRITE_NOTE_RETRY_COLOR = FIRST_LEVEL_TEXT_COLOR;

/** Done-note timing; a failed note has no timer and waits to be answered. */
export const WRITE_NOTE_MS = 4800;
export const WRITE_NOTE_OUT_MS = 240;
/** A refusal says why in a sentence, so it stands long enough to be read, and then leaves like a done one. */
export const WRITE_NOTE_REFUSAL_MS = 12000;

/** Muted detail half of the line. */
export const WRITE_NOTE_DETAIL_COLOR = SECOND_LEVEL_TEXT_COLOR;
