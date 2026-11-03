import {
  CONTROL_AT_REST_COLOR,
  FALLEN_COLOR,
  FIRST_LEVEL_TEXT_COLOR,
  PANEL_GROUND_COLOR,
  SECOND_LEVEL_TEXT_COLOR,
} from "../../../../../constants";
import { RUN_DONE, RUN_FAILED, RUN_NOT_SENT, RUN_RUNNING, RUN_STOPPED } from "../../../../record";
import type { IconTone } from "../../../../../components";
import type { RunStateLook } from "../interfaces";

/** The flat projection of one run; takes the whole field the canvas occupies. */
export const RUN_DEBUG_BACKGROUND_COLOR = "#0d0f16";
export const RUN_DEBUG_BORDER_RADIUS_PX = 12;

/** The head: back button, when the pass was asked, what was asked, how it ended and its cost. */
export const RUN_DEBUG_HEAD_PADDING = "12px 18px";
export const RUN_DEBUG_HEAD_BORDER_COLOR = "#1c202c";
export const RUN_DEBUG_HEAD_GAP_PX = 12;
export const RUN_DEBUG_BACK_LABEL = "Назад до полотна";
export const RUN_DEBUG_BACK_ICON_SIZE_PX = 12;
/** The chevron that stands everywhere the way back is a glyph. */
export const RUN_DEBUG_BACK_ICON_PATH = "m14 6-6 6 6 6";
export const RUN_DEBUG_BACK_COLOR = FIRST_LEVEL_TEXT_COLOR;
export const RUN_DEBUG_WHEN_PREFIX = "Прогін";
export const RUN_DEBUG_SEPARATOR = " · ";
export const RUN_DEBUG_WHEN_COLOR = CONTROL_AT_REST_COLOR;
/** The head's glyphs stand in its own two tones. */
export const RUN_DEBUG_HEAD_TONE: IconTone = {
  rest: RUN_DEBUG_WHEN_COLOR,
  lit: RUN_DEBUG_BACK_COLOR,
};
export const RUN_DEBUG_WHEN_FONT_SIZE_PX = 10;
export const RUN_DEBUG_ASKED_COLOR = FIRST_LEVEL_TEXT_COLOR;
export const RUN_DEBUG_ASKED_FONT_SIZE_PX = 12.5;

/** How the run stands, in a pill of the state's own colour. */
export const RUN_DEBUG_STATE_PADDING = "3px 8px";
export const RUN_DEBUG_STATE_BORDER_RADIUS_PX = 7;
export const RUN_DEBUG_STATE_FONT_SIZE_PX = 9;
export const RUN_DEBUG_STATE_LETTER_SPACING_PX = 1.5;
export const RUN_DEBUG_STATE_BACKGROUND_COLOR = PANEL_GROUND_COLOR;
export const RUN_DEBUG_DONE_COLOR = "#4ade80";
export const RUN_DEBUG_DONE_BORDER_COLOR = "#2c4a3a";
export const RUN_DEBUG_FAILED_COLOR = FALLEN_COLOR;
export const RUN_DEBUG_FAILED_BACKGROUND_COLOR = "#2a1c20";
export const RUN_DEBUG_FAILED_BORDER_COLOR = "#4a2530";
export const RUN_DEBUG_STOPPED_COLOR = "#5c6478";

/** Pill colours per run state; a state without its own colours (nothing sent) gets the quiet ones. */
export const RUN_DEBUG_STATE_LOOKS: Record<string, RunStateLook> = {
  [RUN_RUNNING]: {
    color: RUN_DEBUG_DONE_COLOR,
    background: RUN_DEBUG_STATE_BACKGROUND_COLOR,
    border: RUN_DEBUG_DONE_BORDER_COLOR,
  },
  [RUN_DONE]: {
    color: RUN_DEBUG_DONE_COLOR,
    background: RUN_DEBUG_STATE_BACKGROUND_COLOR,
    border: RUN_DEBUG_DONE_BORDER_COLOR,
  },
  [RUN_FAILED]: {
    color: RUN_DEBUG_FAILED_COLOR,
    background: RUN_DEBUG_FAILED_BACKGROUND_COLOR,
    border: RUN_DEBUG_FAILED_BORDER_COLOR,
  },
  [RUN_STOPPED]: {
    color: RUN_DEBUG_STOPPED_COLOR,
    background: null,
    border: null,
  },
  [RUN_NOT_SENT]: {
    color: RUN_DEBUG_STOPPED_COLOR,
    background: null,
    border: null,
  },
};

/** «3 хв 06 · 6 КРОКІВ · 18 240 ТКН · $0.21»: the pass's totals. */
export const RUN_DEBUG_TOTALS_COLOR = "#5c6478";

/** Shown in the graph's place when the run could not be read. */
export const RUN_DEBUG_FAILED_NOTE = "Не вдалося прочитати цей запуск.";
export const RUN_DEBUG_NOTE_PADDING = "22px 18px";
export const RUN_DEBUG_NOTE_FONT_SIZE_PX = 12.5;
export const RUN_DEBUG_NOTE_COLOR = SECOND_LEVEL_TEXT_COLOR;
