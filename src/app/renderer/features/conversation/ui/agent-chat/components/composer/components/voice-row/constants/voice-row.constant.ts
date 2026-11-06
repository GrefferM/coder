import {
  CONTROL_AT_REST_COLOR,
  INTERACTION_ACCENT_COLOR,
  SECOND_LEVEL_TEXT_COLOR,
} from "../../../../../../../../../constants";
import type { IconTone } from "../../../../../../../../../components";

/** The row's left while a question is said (4j): the breathing dot and the clock in the accent, then «СКАСУВАТИ». */
export const VOICE_ROW_GAP_PX = 8;
export const VOICE_ROW_DOT_SIZE_PX = 6;
export const VOICE_ROW_COLOR = INTERACTION_ACCENT_COLOR;
export const VOICE_ROW_BREATH_CLASS = "call-breath";
export const VOICE_ROW_BREATH_MS = 1_600;
export const VOICE_ROW_HEARING_COLOR = CONTROL_AT_REST_COLOR;
export const VOICE_ROW_CANCEL_TONE: IconTone = {
  rest: SECOND_LEVEL_TEXT_COLOR,
  lit: INTERACTION_ACCENT_COLOR,
};
