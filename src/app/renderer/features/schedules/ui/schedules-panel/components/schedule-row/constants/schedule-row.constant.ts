import type { ScheduleRowState } from "../../../../../interfaces";

/** One schedule in the list, by the history row's recipe (23a, 51a). */
export const SCHEDULE_ROW_PADDING_PX = 11;
export const SCHEDULE_ROW_GAP_PX = 7;
export const SCHEDULE_ROW_HEAD_GAP_PX = 8;
export const SCHEDULE_ROW_BORDER_RADIUS_PX = 10;
export const SCHEDULE_ROW_BACKGROUND_COLOR = "#171b26";
export const SCHEDULE_ROW_BORDER_COLOR = "#262b3a";
export const SCHEDULE_ROW_OUT_BORDER_COLOR = "#2c4a3a";
export const SCHEDULE_ROW_GONE_BACKGROUND_COLOR = "#1f1a20";
export const SCHEDULE_ROW_GONE_BORDER_COLOR = "#4a2530";
export const SCHEDULE_ROW_DOT_SIZE_PX = 6;
export const SCHEDULE_ROW_QUIET_FONT_SIZE_PX = 9;
export const SCHEDULE_ROW_QUIET_LETTER_SPACING_PX = 1;
export const SCHEDULE_ROW_QUIET_COLOR = "#5c6478";
export const SCHEDULE_ROW_GONE_COLOR = "#a9808a";
export const SCHEDULE_ROW_TIME_COLOR = "#aab3cc";
export const SCHEDULE_ROW_TASK_COLOR = "#dde1ee";
export const SCHEDULE_ROW_TASK_FONT_SIZE_PX = 12.5;
export const SCHEDULE_ROW_TASK_LINE_HEIGHT = 1.5;
export const SCHEDULE_ROW_CHEVRON_SIZE_PX = 12;
export const SCHEDULE_ROW_SEPARATOR = " · ";

/** The dot of each state: a colour, the glow of one that runs, the edge of one not filled. */
export const SCHEDULE_ROW_DOTS: Record<ScheduleRowState, { color: string; glow?: number; border?: string }> = {
  out: {
    color: "#4ade80",
    glow: 8,
  },
  on: {
    color: "#4ade80",
    glow: 6,
  },
  off: {
    color: "#4a5268",
  },
  unfilled: {
    color: "transparent",
    border: "1px solid #5c6478",
  },
  agentGone: {
    color: "#f0a5ac",
  },
};
