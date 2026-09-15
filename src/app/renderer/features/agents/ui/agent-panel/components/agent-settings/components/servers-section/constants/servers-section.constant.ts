import { QUIET_MARK_COLOR } from "../../../../../../../../../constants";

/**
 * The lower half of the tools: what this agent works **with**, by whole servers. The question here is not which
 * of the twenty-four functions — that is the server's own business — but whether the agent is connected at all.
 */
export const SERVERS_SECTION_LABEL = "MCP";
export const SERVERS_SECTION_COUNT_SEPARATOR = " · ";
export const SERVERS_SECTION_CHOOSE_LABEL = "Підключити сервер";
export const SERVERS_SECTION_GAP_PX = 8;
export const SERVERS_SECTION_LIST_MAX_HEIGHT_PX = 150;

/**
 * A connected server opens: the whole of what it hands over, with a tick on each. Connecting is the coarse act
 * and takes everything; this is the fine one, for the agent that should not be given the whole of a big server.
 */
export const HELD_SERVER_OPEN_LABEL = "Переглянути функції";
/** What a function's row says under its name — the server's own sentence, as it came. */
export const SERVER_SCREEN_SAID_FONT_SIZE_PX = 11.5;
export const SERVER_SCREEN_SAID_LINE_HEIGHT = 1.5;
export const SERVER_SCREEN_SAID_COLOR = "#6b7490";

/** The count of functions on a held server's row — quiet, and spaced like the row's own small caps. */
export const HELD_SERVER_COUNT_COLOR = QUIET_MARK_COLOR;
export const HELD_SERVER_COUNT_LETTER_SPACING_PX = 1;
