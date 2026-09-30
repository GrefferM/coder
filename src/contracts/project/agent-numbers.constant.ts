/**
 * Bounds of an agent's two numbers, shared so the stepper offers nothing the file refuses. Stepper movement and decimal
 * places belong to the screen.
 */
export const AGENT_TEMPERATURE_LEAST = 0;
export const AGENT_TEMPERATURE_MOST = 1;

/** The fewest calls allowed; zero means no ceiling, so the turn calls on until the model asks for nothing more. */
export const AGENT_MAX_CALLS_LEAST = 0;
