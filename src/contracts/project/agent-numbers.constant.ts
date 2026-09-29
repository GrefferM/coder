/**
 * The bounds of an agent's own two numbers. Both sides must answer them alike: the stepper offers nothing
 * outside them, and the file refuses anything outside them on the way in — a screen offering a number the machine
 * will not take is the app arguing with itself in front of the person.
 *
 * How the stepper moves through them and how many places it writes are the screen's own business, and stay there.
 */
export const AGENT_TEMPERATURE_LEAST = 0;
export const AGENT_TEMPERATURE_MOST = 1;

/** The fewest calls an agent may be allowed — nought, which is no ceiling at all: the turn calls on until
 * the model has nothing more to ask for. Any whole number above it is a ceiling that many calls high. */
export const AGENT_MAX_CALLS_LEAST = 0;
