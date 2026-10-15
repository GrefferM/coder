import { BROKEN_COLOR, LINE_AT_REST_COLOR, QUIET_MARK_COLOR, SECOND_LEVEL_TEXT_COLOR } from "../../../constants";

/** Link at rest, plus its idle drift. */
export const CANVAS_LINK_COLOR = LINE_AT_REST_COLOR;
export const CANVAS_LINK_WIDTH = 1.2;
export const CANVAS_LINK_ARROW_COLOR = QUIET_MARK_COLOR;

/** Drift overlay: short strokes moving along the line. */
export const CANVAS_LINK_DRIFT_COLOR = QUIET_MARK_COLOR;
export const CANVAS_LINK_DRIFT_WIDTH = 1.5;
export const CANVAS_LINK_DRIFT_DASH = "2 12";
export const CANVAS_LINK_DRIFT_DURATION = "5.5s";
export const CANVAS_LINK_DRIFT_OPACITY = 0.62;

/** Work-speed drift: long dashes, source colour, thicker, five times faster. */
export const CANVAS_LINK_FLOW_DASH = "12 16";
export const CANVAS_LINK_FLOW_WIDTH = 2.4;
export const CANVAS_LINK_FLOW_DURATION = "1.1s";
export const CANVAS_LINK_FLOW_OPACITY = 1;

/** Link dashed and drift stopped while either end is dragged. */
export const CANVAS_LINK_DRAGGED_COLOR = QUIET_MARK_COLOR;
export const CANVAS_LINK_DRAGGED_ARROW_COLOR = SECOND_LEVEL_TEXT_COLOR;
export const CANVAS_LINK_DRAGGED_DASH = "6 6";

/** Chosen link: source colour, thicker, brighter drift, square middle handle. */
export const CANVAS_LINK_SELECTED_PERCENT = 45;
export const CANVAS_LINK_SELECTED_WIDTH = 2;
export const CANVAS_LINK_SELECTED_GLOW_PERCENT = 14;
export const CANVAS_LINK_SELECTED_GLOW_WIDTH = 9;
export const CANVAS_LINK_SELECTED_DRIFT_WIDTH = 1.8;
export const CANVAS_LINK_SELECTED_DRIFT_OPACITY = 0.9;
export const CANVAS_LINK_HANDLE_SIZE_PX = 9;
export const CANVAS_LINK_HANDLE_FILL = "#0d0f16";
export const CANVAS_LINK_HANDLE_WIDTH = 1.6;

export const CANVAS_LINK_HIT_WIDTH = 16;

/** Links of an agent under a deletion ask: dashed red, drift stopped. */
export const CANVAS_LINK_DOOMED_COLOR = BROKEN_COLOR;
export const CANVAS_LINK_DOOMED_DASH = "6 6";

/** A line into a waiting agent: solid source colour arrived, dashed coming, grey dashed never. */
export const CANVAS_LINK_LIVE_PERCENT = 40;
export const CANVAS_LINK_LIVE_DRIFT_OPACITY = 0.8;
export const CANVAS_LINK_AWAITED_DASH = "5 6";
export const CANVAS_LINK_SILENT_COLOR = "#3a4154";

/** The doomed tone. */
export const CANVAS_LINK_DOOMED_OPACITY = 0.55;
