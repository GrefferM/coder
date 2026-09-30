import { BORDER_AT_REST_COLOR, FIRST_LEVEL_TEXT_COLOR } from "../../../../../constants";

/** The question for a model with agents on it, and the note and chips under it. */
export const DELETE_MODEL_QUESTION = "Видалити модель разом з агентами?";
export const DELETE_MODEL_CHIP_GAP_PX = 5;
export const DELETE_MODEL_CHIP_PADDING = "2px 7px";
export const DELETE_MODEL_CHIP_BORDER_RADIUS_PX = 6;
export const DELETE_MODEL_CHIP_BACKGROUND_COLOR = "#0d0f16";
export const DELETE_MODEL_CHIP_BORDER_COLOR = BORDER_AT_REST_COLOR;
export const DELETE_MODEL_CHIP_COLOR = FIRST_LEVEL_TEXT_COLOR;
export const DELETE_MODEL_CHIP_FONT_SIZE_PX = 9;
export const DELETE_MODEL_CHIP_LETTER_SPACING_PX = 1;
export const DELETE_MODEL_CHIP_DOT_SIZE_PX = 6;

/** The same question for a model with no agents: same box, quieter tone. */
export const DELETE_MODEL_EMPTY_QUESTION_PREFIX = "Видалити модель ";
export const DELETE_MODEL_EMPTY_QUESTION_SUFFIX = "?";
export const DELETE_MODEL_EMPTY_YES_LABEL = "Видалити";
export const DELETE_MODEL_EMPTY_NOTE =
  "Заберемо саме оголошення: на ній немає жодного агента. На полотні гасити нічого, ланцюги цілі.";
