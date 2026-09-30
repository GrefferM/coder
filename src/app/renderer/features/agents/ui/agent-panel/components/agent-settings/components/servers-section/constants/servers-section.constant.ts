import { QUIET_MARK_COLOR } from "../../../../../../../../../constants";

/** The tools' lower half: what the agent works with, by whole server. */
export const SERVERS_SECTION_LABEL = "MCP";
export const SERVERS_SECTION_COUNT_SEPARATOR = " · ";
export const SERVERS_SECTION_CHOOSE_LABEL = "Підключити сервер";
export const SERVERS_SECTION_GAP_PX = 8;
export const SERVERS_SECTION_LIST_MAX_HEIGHT_PX = 150;

/** Opens a connected server's functions, with a tick on each, for granting only part of it. */
export const HELD_SERVER_OPEN_LABEL = "Переглянути функції";
/** A function row's line under its name: the server's own sentence. */
export const SERVER_SCREEN_SAID_FONT_SIZE_PX = 11.5;
export const SERVER_SCREEN_SAID_LINE_HEIGHT = 1.5;
export const SERVER_SCREEN_SAID_COLOR = "#6b7490";

/** Function count on a held server's row: quiet, spaced like the row's small caps. */
export const HELD_SERVER_COUNT_COLOR = QUIET_MARK_COLOR;
export const HELD_SERVER_COUNT_LETTER_SPACING_PX = 1;

/** Shown instead of the picker when the provider has no function calls; connected servers stay listed. */
export const SERVERS_SECTION_LOCKED_NOTE = "Провайдер цієї моделі не вміє викликати функції";
