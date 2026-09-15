import {
  CONTROL_AT_REST_COLOR,
  FIRST_LEVEL_TEXT_COLOR,
  PANEL_GROUND_COLOR,
  SECOND_LEVEL_TEXT_COLOR,
} from "../../../../../../../constants";
import type { WaitingSupplierState } from "../../../../../../../interfaces";

/** The block over a waiting agent's chat — who its suppliers are and where each stands. */
export const WAITING_CARD_HEAD_PREFIX = "Відповіли";
export const WAITING_CARD_HEAD_SEPARATOR = " / ";
export const WAITING_CARD_WORKING_WORD = "ще працює";
export const WAITING_CARD_SILENT_WORD = "не відповів";
export const WAITING_CARD_SECONDS_SUFFIX = " c";

/** One supplier left to answer, and more than one — the verb changes with the number. */
export const WAITING_CARD_STARTS_PREFIX = "Візьметься до роботи, щойно ";
export const WAITING_CARD_STARTS_END_ONE = " або відповість, або перестане відповідати зовсім.";
export const WAITING_CARD_STARTS_END_MANY = " або відповідять, або перестануть відповідати зовсім.";
export const WAITING_CARD_NAME_SEPARATOR = ", ";

export const WAITING_CARD_GAP_PX = 9;
export const WAITING_CARD_PADDING_PX = 12;
export const WAITING_CARD_BORDER_RADIUS_PX = 10;
export const WAITING_CARD_BACKGROUND_COLOR = "#171b26";
export const WAITING_CARD_BORDER_COLOR = "#2c3550";

export const WAITING_CARD_HEAD_GAP_PX = 8;
export const WAITING_CARD_HEAD_FONT_SIZE_PX = 10;
export const WAITING_CARD_HEAD_COLOR = FIRST_LEVEL_TEXT_COLOR;

export const WAITING_CARD_DOT_SIZE_PX = 5;
export const WAITING_CARD_DOT_GAP_PX = 3;
export const WAITING_CARD_DOT_PERCENTS = [100, 45, 20];

export const WAITING_CARD_ROWS_GAP_PX = 7;
export const WAITING_CARD_ROW_GAP_PX = 9;
export const WAITING_CARD_ROW_PADDING = "8px 9px";
export const WAITING_CARD_ROW_BORDER_RADIUS_PX = 8;
export const WAITING_CARD_ROW_BACKGROUND_COLOR = PANEL_GROUND_COLOR;
export const WAITING_CARD_ROW_FONT_SIZE_PX = 10.5;
export const WAITING_CARD_ROW_NAME_COLOR = FIRST_LEVEL_TEXT_COLOR;
export const WAITING_CARD_ROW_QUIET_COLOR = CONTROL_AT_REST_COLOR;
export const WAITING_CARD_ROW_ASIDE_FONT_SIZE_PX = 9;
export const WAITING_CARD_ROW_ASIDE_COLOR = "#5c6478";

export const WAITING_CARD_MARK_SIZE_PX = 12;
export const WAITING_CARD_TICK_COLOR = "#4ade80";
export const WAITING_CARD_TICK_WIDTH = 2.4;
export const WAITING_CARD_TICK_PATH = "m5 13 4 4L19 7";
export const WAITING_CARD_RING_COLOR = "#5c6478";
export const WAITING_CARD_RING_WIDTH_PX = 1.4;

/** A supplier that said nothing: a whole ring with a bar across it; the dashed one means «still working». */
export const WAITING_CARD_SILENT_RING_COLOR = "#3a4154";
export const WAITING_CARD_SILENT_BAR_WIDTH_PX = 5;
export const WAITING_CARD_SILENT_BAR_HEIGHT_PX = 1.4;
export const WAITING_CARD_SILENT_NAME_COLOR = SECOND_LEVEL_TEXT_COLOR;

export const WAITING_CARD_NOTE_FONT_SIZE_PX = 12.5;
export const WAITING_CARD_NOTE_LINE_HEIGHT = 1.55;
export const WAITING_CARD_NOTE_COLOR = "#aab3cc";

/** The answer read in full, the one still coming a step quieter, the one that never came quieter again. */
export const WAITING_CARD_NAME_COLORS: Record<WaitingSupplierState, string> = {
  answered: WAITING_CARD_ROW_NAME_COLOR,
  working: WAITING_CARD_ROW_QUIET_COLOR,
  silent: WAITING_CARD_SILENT_NAME_COLOR,
};
