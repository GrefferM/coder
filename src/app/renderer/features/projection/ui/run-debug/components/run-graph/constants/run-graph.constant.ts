import {
  BORDER_AT_REST_COLOR,
  CONTROL_AT_REST_COLOR,
  PANEL_GROUND_COLOR,
  QUIET_MARK_COLOR,
} from "../../../../../../../constants";
import { LINE_AT_REST_COLOR } from "../../../../../../../constants";
import { ZOOM_SCALE_STEP } from "../../../../../../../components";

/** The faint line down every column of the flat projection. */
export const RUN_GRAPH_COLUMN_LINE_COLOR = "rgba(255, 255, 255, 0.028)";

/**
 * The projection's own scale ends and opening scale: spheres are drawn small, so it opens closer than the canvas ever
 * goes and zooms out less far.
 */
export const RUN_GRAPH_OPEN_SCALE = 1.2;
export const RUN_GRAPH_SCALE_STOPS = {
  min: 0.5,
  max: 1.5,
  step: ZOOM_SCALE_STEP,
};

/** The ruler: when each turn began, counted from when the question was asked. */
export const RUN_GRAPH_RULER_TOP_PX = 22;
export const RUN_GRAPH_RULER_WIDTH_PX = 120;
export const RUN_GRAPH_RULER_FONT_SIZE_PX = 9;
export const RUN_GRAPH_RULER_LETTER_SPACING_PX = 1.5;
export const RUN_GRAPH_RULER_COLOR = QUIET_MARK_COLOR;

/** The number of the turn, standing over the rim of its sphere. */
export const RUN_GRAPH_NUMBER_SIZE_PX = 20;
export const RUN_GRAPH_NUMBER_RISE_PX = 28;
export const RUN_GRAPH_NUMBER_BACKGROUND_COLOR = PANEL_GROUND_COLOR;
export const RUN_GRAPH_NUMBER_BORDER_COLOR = BORDER_AT_REST_COLOR;
export const RUN_GRAPH_NUMBER_FONT_SIZE_PX = 10;
export const RUN_GRAPH_NUMBER_COLOR = CONTROL_AT_REST_COLOR;

/** Paint of a walk line: the canvas link's paint, quieter than the spheres, one weight for both states. */
export const RUN_GRAPH_EDGE_WIDTH = 1.4;
export const RUN_GRAPH_REST_LINE_COLOR = LINE_AT_REST_COLOR;

/** Ring in the step's colour just outside its sphere's rim. */
export const RUN_GRAPH_RING_GAP_PX = 6;
export const RUN_GRAPH_RING_GLOW_PX = 24;
export const RUN_GRAPH_RING_GLOW_PERCENT = 25;
