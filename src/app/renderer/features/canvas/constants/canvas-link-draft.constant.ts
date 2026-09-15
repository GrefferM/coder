import {
  BORDER_AT_REST_COLOR,
  CONTROL_AT_REST_COLOR,
  PANEL_GROUND_COLOR,
  QUIET_MARK_COLOR,
  SECOND_LEVEL_TEXT_COLOR,
} from "../../../constants";

/** The draft line, before a link exists. */

/** Over empty space: dashed, source colour, ring at the loose end. */
export const LINK_DRAFT_WIDTH = 1.6;
export const LINK_DRAFT_DASH = "7 6";
export const LINK_DRAFT_GLOW_WIDTH = 7;
export const LINK_DRAFT_GLOW_PERCENT = 18;
export const LINK_DRAFT_END_RADIUS = 7;
export const LINK_DRAFT_END_FILL = "#0d0f16";

/** Over a sphere: solid, arrowed, target ringed in the accent. */
export const LINK_DRAFT_AIMED_WIDTH = 1.8;
export const LINK_DRAFT_AIMED_GLOW_WIDTH = 8;
export const LINK_DRAFT_AIMED_GLOW_PERCENT = 22;
export const LINK_TARGET_RING_SIZE_PX = 192;
export const LINK_TARGET_RING_COLOR = "#38a3ff";
export const LINK_TARGET_RING_BACKGROUND = "radial-gradient(circle, rgba(56, 163, 255, 0.1) 0%, transparent 68%)";

/** Aimed line's direction text: `FROM → TO`, in the accent. */
export const LINK_DIRECTION_ARROW = " → ";
export const LINK_DIRECTION_BACKGROUND_COLOR = PANEL_GROUND_COLOR;
export const LINK_DIRECTION_BORDER_COLOR = "#38a3ff";
export const LINK_DIRECTION_COLOR = "#38a3ff";
export const LINK_DIRECTION_BORDER_RADIUS_PX = 7;
export const LINK_DIRECTION_PADDING = "3px 8px";
export const LINK_DIRECTION_FONT_SIZE_PX = 9;
export const LINK_DIRECTION_LETTER_SPACING_PX = 1.5;
/** Height of the direction above the line's middle — same place as the chosen link's pill. */
export const LINK_DIRECTION_OFFSET_Y_PX = 34;

/** Hint beside the pointer while the line has no target. */
export const LINK_DRAFT_HINT = "Відпустіть на сфері";
export const LINK_DRAFT_HINT_BACKGROUND_COLOR = "#191d29";
export const LINK_DRAFT_HINT_BORDER_COLOR = BORDER_AT_REST_COLOR;
export const LINK_DRAFT_HINT_BORDER_RADIUS_PX = 8;
export const LINK_DRAFT_HINT_PADDING = "7px 10px";
export const LINK_DRAFT_HINT_COLOR = CONTROL_AT_REST_COLOR;
export const LINK_DRAFT_HINT_OFFSET_PX = 22;

/** Cancelled line — neutral, dashed, crossed; fades over this long. */
export const LINK_DRAFT_CANCELLED_MS = 400;
export const LINK_DRAFT_CANCELLED_COLOR = "#39405a";
export const LINK_DRAFT_CANCELLED_WIDTH = 1.4;
export const LINK_DRAFT_CANCELLED_DASH = "7 6";
export const LINK_DRAFT_CANCELLED_OPACITY = 0.6;
export const LINK_DRAFT_CANCELLED_END_RADIUS = 9;
export const LINK_DRAFT_CANCELLED_END_COLOR = QUIET_MARK_COLOR;
export const LINK_DRAFT_CANCELLED_CROSS_COLOR = CONTROL_AT_REST_COLOR;
export const LINK_DRAFT_CANCELLED_CROSS_ARM_PX = 3.5;
export const LINK_DRAFT_CANCELLED_LABEL = "Скасовано";
export const LINK_DRAFT_CANCELLED_LABEL_COLOR = SECOND_LEVEL_TEXT_COLOR;
