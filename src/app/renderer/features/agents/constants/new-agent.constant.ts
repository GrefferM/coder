import { AGENT_COLORS } from "./agent-colors.constant";

/** Starting colour of a canvas-menu agent — the picker's first. */
export const [NEW_AGENT_COLOR] = AGENT_COLORS;

/** Call limit of a canvas-menu agent. */
export const NEW_AGENT_MAX_CALLS = 10;

/** A new agent's starting temperature; its bounds are in `src/contracts`. */
export const NEW_AGENT_TEMPERATURE = 0.3;

/** Stepper increment for temperature, and the decimals written. */
export const AGENT_TEMPERATURE_STEP = 0.1;
export const AGENT_TEMPERATURE_PLACES = 1;
