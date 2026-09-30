import { BROKEN_COLOR, FALLEN_COLOR } from "../../../constants";
/**
 * A server's state is a live process and connection, so its row has a dot and words. Green is «answering»; the troubled
 * ones are `FALLEN_COLOR` and, for broken but standing, `BROKEN_COLOR`.
 */
export const SERVER_UP_COLOR = "#4ade80";
export const SERVER_UP_GLOW = "0 0 7px #4ade80";
export const SERVER_FELL_COLOR = FALLEN_COLOR;
export const SERVER_LOST_COLOR = BROKEN_COLOR;
/** A server being raised is neither up nor fallen: the waiting colour, breathing by one shared stylesheet rule. */
export const SERVER_STARTING_COLOR = "#e8c46a";
export const SERVER_STARTING_BREATH_CLASS = "mark-breath";
export const SERVER_STARTING_BREATH_MS = 1_600;
