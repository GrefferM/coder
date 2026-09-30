import { sourceOf } from "../interfaces";
import type { ToolGrant } from "../interfaces";

/** Which head a granted function stands under: the project's commands or one named server. */
export const COMMANDS_GROUP_KEY = "commands";
export const SERVER_GROUP_PREFIX = "server:";
/** The head of every agent granted as a tool. */
export const AGENTS_GROUP_KEY = "agents";

/** The group a grant belongs to; a server's is its id. */
export function groupOfGrant(grant: ToolGrant): string {
  const source = sourceOf(grant);

  if (source.kind === "mcp") {
    return `${SERVER_GROUP_PREFIX}${source.id}`;
  }

  return source.kind === "agent" ? AGENTS_GROUP_KEY : COMMANDS_GROUP_KEY;
}
