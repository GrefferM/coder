import { sourceOf } from "../interfaces";
import type { ToolGrant } from "../interfaces";

/** Which head a granted function stands under: the project's commands or one named server. */
export const COMMANDS_GROUP_KEY = "commands";
export const SERVER_GROUP_PREFIX = "server:";
/** The head of every agent granted as a tool. */
export const AGENTS_GROUP_KEY = "agents";
/** The head of every system command granted to an agent. */
export const SYSTEM_GROUP_KEY = "system";

/** The group a grant belongs to; a server's carries the server's id. */
export function groupOfGrant(grant: ToolGrant): string {
  const source = sourceOf(grant);

  if (source.kind === "mcp") {
    return `${SERVER_GROUP_PREFIX}${source.id}`;
  }

  if (source.kind === "system") {
    return SYSTEM_GROUP_KEY;
  }

  return source.kind === "agent" ? AGENTS_GROUP_KEY : COMMANDS_GROUP_KEY;
}
