import { CONTROL_AT_REST_COLOR } from ".";
import { BORDER_AT_REST_COLOR, FALLEN_COLOR, FIRST_LEVEL_TEXT_COLOR } from "./palette.constant";

/** Colors and transition of every pressable thing at rest, lit and pressed. */
export const INTERACTION_REST_BACKGROUND_COLOR = "#171b26";
export const INTERACTION_HOVER_BACKGROUND_COLOR = "#1b1f2c";
export const INTERACTION_PRESSED_BACKGROUND_COLOR = "#141824";
export const INTERACTION_REST_BORDER_COLOR = BORDER_AT_REST_COLOR;
export const INTERACTION_HOVER_BORDER_COLOR = "#2c3550";
export const INTERACTION_REST_TEXT_COLOR = CONTROL_AT_REST_COLOR;
export const INTERACTION_HOVER_TEXT_COLOR = FIRST_LEVEL_TEXT_COLOR;
export const INTERACTION_ACCENT_COLOR = "#38a3ff";
export const INTERACTION_ACCENT_HOVER_COLOR = "#7cc4ff";
export const INTERACTION_PRESSED_SHIFT_PX = 1;
export const INTERACTION_TRANSITION =
  "background 0.15s ease, border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease";

/** Focus ring size and colours; destructive controls use their own. */
export const INTERACTION_FOCUS_RING_PX = 2;
export const INTERACTION_FOCUS_RING_COLOR = "#38a3ff44";
/** The fallen shade at the ring's opacity; the trailing digits are alpha. */
export const INTERACTION_DANGER_FOCUS_RING_COLOR = `${FALLEN_COLOR}3d`;

/** Hover backdrop of a bare text action; also its click boundary. */
export const INTERACTION_TEXT_BACKDROP_RADIUS_PX = 5;
export const INTERACTION_TEXT_BACKDROP_PADDING = "3px 7px";
export const INTERACTION_TEXT_BACKDROP_MARGIN = "-3px -7px";
