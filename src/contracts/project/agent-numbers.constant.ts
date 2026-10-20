/**
 * Bounds of an agent's numbers, shared so the stepper offers nothing the file refuses. Stepper movement and decimal
 * places belong to the screen.
 */
export const AGENT_TEMPERATURE_LEAST = 0;
export const AGENT_TEMPERATURE_MOST = 1;

/** The fewest calls allowed; zero means no ceiling, so the turn calls on until the model asks for nothing more. */
export const AGENT_MAX_CALLS_LEAST = 0;

/**
 * Where an agent's memory is compressed, as a share of the model's context ceiling in percent: lower would squeeze a
 * memory that still has room, higher leaves the turn too little to grow into.
 */
export const AGENT_COMPRESS_AT_LEAST = 70;
export const AGENT_COMPRESS_AT_MOST = 90;

/** What the compressed memory is written down to, in percent of the ceiling. */
export const AGENT_COMPRESS_TO_LEAST = 10;
export const AGENT_COMPRESS_TO_MOST = 30;
