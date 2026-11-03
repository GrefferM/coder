import { RUN_DEBUG_HEAD_TONE } from "../../../constants";
import type { IconTone } from "../../../../../../../components";

/** «‹ ПИТАННЯ 2 З 2 ›» in the projection's head; it does not wrap at the list's ends. */
export const PASS_SWITCH_WORD = "Питання";
export const PASS_SWITCH_OF = " з ";
export const PASS_SWITCH_GAP_PX = 8;
export const PASS_SWITCH_FONT_SIZE_PX = 10;
export const PASS_SWITCH_LETTER_SPACING_PX = 1.5;
export const PASS_SWITCH_ICON_SIZE_PX = 9;
export const PASS_SWITCH_ICON_STROKE = "2.4";
export const PASS_SWITCH_BACK_ICON_PATH = "m14 6-6 6 6 6";
export const PASS_SWITCH_ON_ICON_PATH = "m10 6 6 6-6 6";
export const PASS_SWITCH_BACK_LABEL = "Попередній прогін";
export const PASS_SWITCH_ON_LABEL = "Наступний прогін";
/** Arrows take the head's tone; the one at the list's end goes out. */
export const PASS_SWITCH_TONE: IconTone = {
  ...RUN_DEBUG_HEAD_TONE,
  dead: "#3a4154",
};
/** Divider between the switch and the pass name. */
export const PASS_SWITCH_DIVIDER_COLOR = "#262b3a";
export const PASS_SWITCH_DIVIDER_HEIGHT_PX = 14;
