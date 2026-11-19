import {
  BORDER_AT_REST_COLOR,
  FIRST_LEVEL_TEXT_COLOR,
  INTERACTION_ACCENT_COLOR,
  QUIET_MARK_COLOR,
  SECOND_LEVEL_TEXT_COLOR,
} from "../../../constants";

/** The widget's window (52a): its ground and frame. */
export const WIDGET_GROUND_COLOR = "#12151f";
export const WIDGET_BORDER_COLOR = BORDER_AT_REST_COLOR;
export const WIDGET_BORDER_RADIUS_PX = 12;
export const WIDGET_RULE_COLOR = "#1c202c";

/** The head: the project chip and «НОВА РОЗМОВА» (52a, 52k). */
export const WIDGET_HEAD_PADDING = "12px 12px 0";
export const WIDGET_HEAD_GAP_PX = 12;
export const WIDGET_CHIP_PADDING = "7px 9px 7px 11px";
export const WIDGET_CHIP_GAP_PX = 9;
export const WIDGET_CHIP_BORDER_RADIUS_PX = 9;
export const WIDGET_CHIP_SHADOW = "0 6px 16px rgba(0, 0, 0, 0.35)";
export const WIDGET_CHIP_ICON_SIZE_PX = 13;
export const WIDGET_CHIP_NAME_GAP_PX = 2;
export const WIDGET_CHIP_NAME_COLOR = "#e6e9f2";
export const WIDGET_CHIP_NAME_FONT_SIZE_PX = 12.5;
export const WIDGET_CHIP_NAME_FONT_WEIGHT = 500;
export const WIDGET_CHIP_PATH_COLOR = QUIET_MARK_COLOR;
export const WIDGET_CHIP_PATH_LETTER_SPACING_PX = 1;
export const WIDGET_CHIP_CHEVRON_BOX_PX = 22;
export const WIDGET_CHIP_CHEVRON_SIZE_PX = 11;
export const WIDGET_FRESH_COLOR = SECOND_LEVEL_TEXT_COLOR;

/** The stage: the chosen agent's sphere at the component's own size, its name and «→ N» (52a). */
export const WIDGET_STAGE_PADDING = "34px 0 22px";
export const WIDGET_STAGE_SPHERE_PX = 160;
export const WIDGET_STAGE_NAME_GAP_PX = 28;
export const WIDGET_STAGE_LINES_GAP_PX = 4;
export const WIDGET_STAGE_NAME_FONT_SIZE_PX = 11;
export const WIDGET_STAGE_NAME_LETTER_SPACING_PX = 2;
export const WIDGET_ONWARD_COLOR = QUIET_MARK_COLOR;
export const WIDGET_ONWARD_LETTER_SPACING_PX = 1.5;

/** The voice's halo on the stage (52d): its size against the sphere, its colour at the core and edge. */
export const WIDGET_HALO_SCALE = 1.52;
export const WIDGET_HALO_CORE_PERCENT = 50;
export const WIDGET_HALO_EDGE_PERCENT = 20;
export const WIDGET_HALO_EDGE_STOP_PERCENT = 46;
export const WIDGET_HALO_END_STOP_PERCENT = 68;
export const WIDGET_HALO_QUIET_SCALE = 0.94;
export const WIDGET_HALO_LOUD_SCALE = 1.06;
export const WIDGET_HALO_QUIET_OPACITY = 0.34;
export const WIDGET_HALO_SHIMMER_OPACITY = 0.67;
export const WIDGET_HALO_RISE_MS = 80;

/** The carousel: every agent at 32px, scrolling sideways (52a). */
export const WIDGET_CAROUSEL_PADDING = "4px 0 14px 12px";
export const WIDGET_CAROUSEL_CELL_PX = 62;
export const WIDGET_CAROUSEL_GAP_PX = 8;
export const WIDGET_CAROUSEL_SPHERE_PX = 32;
export const WIDGET_CAROUSEL_NAME_FONT_SIZE_PX = 8.5;
export const WIDGET_CAROUSEL_NAME_LETTER_SPACING_PX = 0.6;
export const WIDGET_CELL_DIM_OPACITY = 0.35;

/** The output: the chosen sphere's conversation, newest at the bottom (52e). */
export const WIDGET_OUTPUT_PADDING = "14px 16px";
export const WIDGET_OUTPUT_GAP_PX = 9;
export const WIDGET_BLOCK_GAP_PX = 6;
export const WIDGET_STEP_GAP_PX = 4;
export const WIDGET_HEAD_ROW_GAP_PX = 6;
export const WIDGET_PERSON_HEAD_GAP_PX = 7;
export const WIDGET_PERSON_DOT_PX = 6;
export const WIDGET_PERSON_COLOR = "#dde1ee";
export const WIDGET_TIME_COLOR = "#5c6478";
export const WIDGET_STEP_NOTE_COLOR = QUIET_MARK_COLOR;
export const WIDGET_STEP_NOTE_LETTER_SPACING_PX = 1;
export const WIDGET_CARD_PADDING_PX = 10;
export const WIDGET_CARD_BORDER_RADIUS_PX = 10;
export const WIDGET_CARD_BACKGROUND_COLOR = "#171b26";
export const WIDGET_TEXT_FONT_SIZE_PX = 12.5;
export const WIDGET_TEXT_LINE_HEIGHT = 1.5;
export const WIDGET_STEP_TEXT_COLOR = "#aab3cc";
export const WIDGET_FAILURE_COLOR = "#f0a5ac";
export const WIDGET_WORKING_PADDING_PX = 11;
export const WIDGET_WORKING_GAP_PX = 8;
export const WIDGET_WORKING_FONT_SIZE_PX = 10;
export const WIDGET_WORKING_LETTER_SPACING_PX = 1.5;
export const WIDGET_WORKING_DOT_PX = 5;

/** The field and the row under it (52a, 4j; 4f while a walk is out). */
export const WIDGET_FIELD_AREA_PADDING = "12px 16px 20px";
export const WIDGET_FIELD_AREA_GAP_PX = 8;
export const WIDGET_FIELD_PADDING = "9px 10px";
export const WIDGET_FIELD_HEIGHT_PX = 60;
export const WIDGET_FIELD_BORDER_RADIUS_PX = 10;
export const WIDGET_FIELD_BACKGROUND_COLOR = "#171b26";
export const WIDGET_FIELD_BUSY_BACKGROUND_COLOR = "#141824";
export const WIDGET_FIELD_BUSY_BORDER_COLOR = WIDGET_RULE_COLOR;
export const WIDGET_FIELD_COLOR = FIRST_LEVEL_TEXT_COLOR;
export const WIDGET_FIELD_LINE_HEIGHT = 1.45;
export const WIDGET_BUTTON_SIZE_PX = 28;
export const WIDGET_BUTTON_BORDER_RADIUS_PX = 8;
export const WIDGET_BUTTON_BACKGROUND_COLOR = "#1b1f2c";
export const WIDGET_BUTTON_ICON_SIZE_PX = 14;
export const WIDGET_BUTTON_ICON_COLOR = "#838ba6";
export const WIDGET_SEND_READY_COLOR = INTERACTION_ACCENT_COLOR;
export const WIDGET_STOP_COLOR = "#a9808a";
export const WIDGET_STOP_GAP_PX = 7;
export const WIDGET_STOP_ICON_SIZE_PX = 11;

/** The widget with no project (52b) and a project with no agents (52c). */
export const WIDGET_OPEN_PADDING_PX = 24;
export const WIDGET_OPEN_GAP_PX = 22;
export const WIDGET_OPEN_BUTTON_PADDING = "13px 15px";
export const WIDGET_OPEN_BUTTON_GAP_PX = 10;
export const WIDGET_OPEN_BUTTON_RADIUS_PX = 10;
export const WIDGET_OPEN_BUTTON_FONT_SIZE_PX = 13.5;
export const WIDGET_OPEN_BUTTON_FONT_WEIGHT = 600;
export const WIDGET_OPEN_BUTTON_ICON_SIZE_PX = 15;
export const WIDGET_ACCENT_COLOR = INTERACTION_ACCENT_COLOR;
export const WIDGET_ON_ACCENT_COLOR = "#ffffff";
export const WIDGET_EMPTY_GAP_PX = 16;
export const WIDGET_EMPTY_TEXT_COLOR = SECOND_LEVEL_TEXT_COLOR;
export const WIDGET_EMPTY_BUTTON_PADDING = "9px 14px";
export const WIDGET_EMPTY_BUTTON_RADIUS_PX = 9;

/** The list of projects under the chip or the button (52a, 52b, 30c). */
export const WIDGET_LIST_BACKGROUND_COLOR = "#12151f";
export const WIDGET_LIST_BORDER_COLOR = "#2c3550";
export const WIDGET_LIST_BORDER_RADIUS_PX = 10;
export const WIDGET_LIST_SHADOW = "0 22px 48px rgba(0, 0, 0, 0.5)";
export const WIDGET_LIST_PADDING_PX = 8;
export const WIDGET_LIST_MAX_HEIGHT_PX = 420;
export const WIDGET_LIST_HEAD_PADDING = "6px 10px 8px";
export const WIDGET_LIST_ROW_PADDING = "7px 10px 7px 34px";
export const WIDGET_LIST_ACT_PADDING = "9px 10px";
export const WIDGET_LIST_ROW_RADIUS_PX = 8;
export const WIDGET_LIST_ROW_LIT_COLOR = "#1b1f2c";
export const WIDGET_LIST_NAME_FONT_SIZE_PX = 12.5;
export const WIDGET_LIST_PATH_FONT_SIZE_PX = 9.5;
export const WIDGET_LIST_PATH_COLOR = "#5c6478";
export const WIDGET_LIST_COUNT_COLOR = QUIET_MARK_COLOR;
export const WIDGET_LIST_QUIET_COLOR = SECOND_LEVEL_TEXT_COLOR;
export const WIDGET_LIST_QUIET_FONT_SIZE_PX = 11.5;
export const WIDGET_LIST_GONE_COLOR = "#a9808a";
export const WIDGET_LIST_CHECK_COLOR = INTERACTION_ACCENT_COLOR;
export const WIDGET_LIST_CHECK_LEFT_PX = 12;
export const WIDGET_LIST_ACT_GAP_PX = 10;

/** Where the list of projects stands under the chip or the button. */
export const WIDGET_MENU_INSET_PX = 12;
export const WIDGET_MENU_GAP_PX = 12;

/** The window's height while a sphere has a conversation (52e, 52f); every other state is as tall as it stands. */
export const WIDGET_WALK_HEIGHT_PX = 760;

/** The line under the stage that says why a question did not go (52j). */
export const WIDGET_NOTE_PADDING = "0 16px 12px";
export const WIDGET_NOTE_GAP_PX = 8;
export const WIDGET_NOTE_COLOR = "#a9808a";

/** How long a line without an act stands before it goes (52j). */
export const WIDGET_NOTE_FADE_MS = 12000;

/** The speaker under the head, which silences an end being read. */
export const WIDGET_SPEAKER_SIZE_PX = 16;
export const WIDGET_SPEAKER_BOX_PX = 28;
export const WIDGET_SPEAKER_ROW_PADDING = "6px 12px 0";

/** The switch of macOS's language beside «x1»: its short code on the field's button ground. */
export const WIDGET_LANGUAGE_PADDING = "0 10px";
export const WIDGET_LANGUAGE_FONT_SIZE_PX = 11;
export const WIDGET_LANGUAGE_LETTER_SPACING_PX = 1;
