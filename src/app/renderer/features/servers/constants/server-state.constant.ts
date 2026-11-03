import { BROKEN_COLOR, FALLEN_COLOR } from "../../../constants";
/** «Answering»; troubled servers take `FALLEN_COLOR`, or `BROKEN_COLOR` when broken but standing. */
export const SERVER_UP_COLOR = "#4ade80";
export const SERVER_UP_GLOW = "0 0 7px #4ade80";
export const SERVER_FELL_COLOR = FALLEN_COLOR;
export const SERVER_LOST_COLOR = BROKEN_COLOR;
/** A server being raised is neither up nor fallen: the waiting colour, breathing by one shared stylesheet rule. */
export const SERVER_STARTING_COLOR = "#e8c46a";
export const SERVER_STARTING_BREATH_CLASS = "mark-breath";
export const SERVER_STARTING_BREATH_MS = 1_600;
