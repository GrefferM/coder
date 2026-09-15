import { BROKEN_COLOR, FALLEN_COLOR } from "../../../constants";
/**
 * A server's state is the one thing a command has not — it is a live process and a connection, so its
 * row carries a dot and the words that go with it. Green is the app's own «answering», and the two
 * troubled ones are the trouble family: `FALLEN_COLOR`, and `BROKEN_COLOR` for what is broken but standing.
 */
export const SERVER_UP_COLOR = "#4ade80";
export const SERVER_UP_GLOW = "0 0 7px #4ade80";
export const SERVER_FELL_COLOR = FALLEN_COLOR;
export const SERVER_LOST_COLOR = BROKEN_COLOR;
/**
 * A server being raised is neither up nor fallen, and its dot says so in the waiting colour and by breathing.
 * The breath is one rule in the stylesheet, so nothing in the app waits at two different speeds.
 */
export const SERVER_STARTING_COLOR = "#e8c46a";
export const SERVER_STARTING_BREATH_CLASS = "mark-breath";
export const SERVER_STARTING_BREATH_MS = 1_600;
