import { AGENT_COLORS } from "./agent-colors.constant";

/** Starting colour of a canvas-menu agent — the picker's first. */
export const [NEW_AGENT_COLOR] = AGENT_COLORS;

/** Call limit of a canvas-menu agent. */
export const NEW_AGENT_MAX_CALLS = 10;

/** What a new agent stands at. The bounds it stands between are the boundary's — `src/contracts` holds them. */
export const NEW_AGENT_TEMPERATURE = 0.3;

/** How the stepper walks through those bounds, and how many places it writes: the screen's own business. */
export const AGENT_TEMPERATURE_STEP = 0.1;
export const AGENT_TEMPERATURE_PLACES = 1;
