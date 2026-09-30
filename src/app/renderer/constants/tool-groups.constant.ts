import { sourceOf } from "../interfaces";
import type { ToolGrant } from "../interfaces";

/**
 * Which head a granted function stands under — the project's own commands, or one named
 * server. The word is shared by the panel that draws the heads and the canvas that presses through to them, so it
 * lives with neither: a group key is the vocabulary between them.
 */
export const COMMANDS_GROUP_KEY = "commands";
export const SERVER_GROUP_PREFIX = "server:";
/** The head every agent granted as a tool stands under — its own, not a command's. */
export const AGENTS_GROUP_KEY = "agents";

/** The group one granted function belongs to; a server's is named by the server's id and by nothing else. */
export function groupOfGrant(grant: ToolGrant): string {
  const source = sourceOf(grant);

  if (source.kind === "mcp") {
    return `${SERVER_GROUP_PREFIX}${source.id}`;
  }

  return source.kind === "agent" ? AGENTS_GROUP_KEY : COMMANDS_GROUP_KEY;
}
