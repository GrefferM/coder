import { RAIL_WIDTH_PX } from "../../../components";
import { RUN_DEBUG_LAYER } from "../../../constants";

/** The projection stands over the canvas and the panel, leaving the rail. */
export const RUN_DEBUG_LAYER_STYLE = {
  position: "absolute",
  inset: `0 ${RAIL_WIDTH_PX}px 0 0`,
  zIndex: RUN_DEBUG_LAYER,
} as const;

export const RIGHT_SIDE_PANEL_WIDTH_PX = 380;

export const AGENTS_PANEL_LABEL = "Агенти";
