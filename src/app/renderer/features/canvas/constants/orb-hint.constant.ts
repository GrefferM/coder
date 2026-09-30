import type { ToolSource } from "../../../interfaces";

/** Words of the hint over a mini-sphere: three cases, one shape. */
export const ORB_HINT_SERVER_KIND = "MCP-СЕРВЕР";
/** One command is one mark: the singular, then the command's name. */
export const ORB_HINT_COMMAND_KIND = "КОМАНДА ПРОЄКТУ";
/** One agent granted as a tool is one mark: the singular, then the agent's name. */
export const ORB_HINT_AGENT_KIND = "АГЕНТ ЯК ІНСТРУМЕНТ";
/** «ЩЕ 3 СЕРВЕРИ»: a «+» folds one kind, so it has its own noun and a count. */
export const ORB_HINT_REST_KIND = "ЩЕ";
export const ORB_HINT_COMMAND_FORMS: [string, string, string] = ["команда", "команди", "команд"];
export const ORB_HINT_SERVER_FORMS: [string, string, string] = ["сервер", "сервери", "серверів"];
export const ORB_HINT_AGENT_FORMS: [string, string, string] = ["агент", "агенти", "агентів"];
/** A «+»'s noun, by the kind of source it folds. */
export const ORB_HINT_SOURCE_FORMS: Record<ToolSource, [string, string, string]> = {
  command: ORB_HINT_COMMAND_FORMS,
  mcp: ORB_HINT_SERVER_FORMS,
  agent: ORB_HINT_AGENT_FORMS,
};
/** «ЩЕ 3 СЕРВЕРИ · 1 ЗЛАМАНИЙ»: the «+» carries a number and a state. */
export const ORB_HINT_BROKEN_FORMS: [string, string, string] = ["зламаний", "зламані", "зламаних"];
export const ORB_HINT_FUNCTION_FORMS: [string, string, string] = ["функції", "функцій", "функцій"];
export const ORB_HINT_OF = " з ";
export const ORB_HINT_SEPARATOR = " · ";
/** A server the project no longer names stays on the arc until the grant is taken back. */
export const ORB_HINT_GONE_NAME = "СЕРВЕРА НЕМАЄ";
/** Likewise a command the project has dropped. */
export const ORB_HINT_GONE_COMMAND = "КОМАНДИ НЕМАЄ";
/** Likewise an agent the project has dropped. */
export const ORB_HINT_GONE_AGENT = "АГЕНТА НЕМАЄ";
