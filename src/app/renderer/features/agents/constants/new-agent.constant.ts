import { AGENT_COLORS } from "./agent-colors.constant";

/** Starting colour of a canvas-menu agent. */
export const [NEW_AGENT_COLOR] = AGENT_COLORS;

/** Call limit of a canvas-menu agent. */
export const NEW_AGENT_MAX_CALLS = 10;

/** A new agent's starting temperature; its bounds are in `src/contracts`. */
export const NEW_AGENT_TEMPERATURE = 0.3;

/** A new agent's memory is compressed at this share of the model's ceiling, down to the second; bounds in `src/contracts`. */
export const NEW_AGENT_COMPRESS_AT = 90;
export const NEW_AGENT_COMPRESS_TO = 10;

/** Stepper increment for the compression's threshold and target, in percent. */
export const AGENT_COMPRESS_STEP = 5;

/** Stepper increment for temperature, and the decimals written. */
export const AGENT_TEMPERATURE_STEP = 0.1;
export const AGENT_TEMPERATURE_PLACES = 1;
