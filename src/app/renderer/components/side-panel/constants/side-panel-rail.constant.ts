import {
  BORDER_AT_REST_COLOR,
  CONTROL_AT_REST_COLOR,
  FIRST_LEVEL_TEXT_COLOR,
  PANEL_GROUND_COLOR,
} from "../../../constants";

export const COLLAPSE_LABEL = "Згорнути панель";

export const RAIL_WIDTH_PX = 44;

/** Top and bottom padding, in pixels, of the rail's icon stack, inside `SIDE_PANEL_VERTICAL_MARGIN_PX`. */
export const RAIL_VERTICAL_PADDING_PX = 10;

export const RAIL_BUTTON_SIZE_PX = 32;

export const RAIL_BUTTON_BORDER_RADIUS_PX = 10;

export const RAIL_BUTTON_GAP_PX = 4;

/** Icon color of a rail button neither active nor hovered. */
export const RAIL_ICON_IDLE_COLOR = CONTROL_AT_REST_COLOR;

export const RAIL_ICON_ACTIVE_COLOR = "#38a3ff";

/** Icon color of a hovered, inactive rail button. */
export const RAIL_ICON_HOVER_COLOR = FIRST_LEVEL_TEXT_COLOR;

export const RAIL_BUTTON_HOVER_ACTIVE_BACKGROUND_COLOR = "#1b1f2c";

export const RAIL_TOOLTIP_BACKGROUND_COLOR = PANEL_GROUND_COLOR;

export const RAIL_TOOLTIP_BORDER_COLOR = BORDER_AT_REST_COLOR;

export const RAIL_TOOLTIP_BORDER_RADIUS_PX = 8;

export const RAIL_TOOLTIP_PADDING = "5px 9px";

export const RAIL_TOOLTIP_FONT_SIZE_PX = 11.5;

export const RAIL_TOOLTIP_COLOR = FIRST_LEVEL_TEXT_COLOR;

/** The rule across the rail: project scope above, machine scope below. */
export const RAIL_REALM_RULE_WIDTH_PX = 20;
export const RAIL_REALM_RULE_COLOR = BORDER_AT_REST_COLOR;
export const RAIL_REALM_PADDING_PX = 6;

/** Gap, px, between the button and its tooltip. */
export const RAIL_TOOLTIP_GAP_PX = 8;
