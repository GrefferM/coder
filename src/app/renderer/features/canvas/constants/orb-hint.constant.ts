/** The words of the hint over a mini-sphere — three cases, and one shape for all three. */
export const ORB_HINT_SERVER_KIND = "MCP-СЕРВЕР";
/** One command is one mark, so the hint says the singular and then that command's own name. */
export const ORB_HINT_COMMAND_KIND = "КОМАНДА ПРОЄКТУ";
/** «ЩЕ 3 СЕРВЕРИ» — a «+» folds one порода, so it has a noun of its own and says how many. */
export const ORB_HINT_REST_KIND = "ЩЕ";
export const ORB_HINT_COMMAND_FORMS: [string, string, string] = ["команда", "команди", "команд"];
export const ORB_HINT_SERVER_FORMS: [string, string, string] = ["сервер", "сервери", "серверів"];
/** «ЩЕ 3 СЕРВЕРИ · 1 ЗЛАМАНИЙ» — the «+» carries two things now, its number and its state. */
export const ORB_HINT_BROKEN_FORMS: [string, string, string] = ["зламаний", "зламані", "зламаних"];
export const ORB_HINT_FUNCTION_FORMS: [string, string, string] = ["функції", "функцій", "функцій"];
export const ORB_HINT_OF = " з ";
export const ORB_HINT_SEPARATOR = " · ";
/** A server the project no longer names still stands on an agent's arc until the grant is taken back. */
export const ORB_HINT_GONE_NAME = "СЕРВЕРА НЕМАЄ";
/** The same for a command the project has let go — the grant stands, and the mark says what is wrong. */
export const ORB_HINT_GONE_COMMAND = "КОМАНДИ НЕМАЄ";
