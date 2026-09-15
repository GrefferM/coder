import { sourceOf } from "../interfaces";
import type { ToolGrant } from "../interfaces";

/**
 * Which head a granted function stands under — the project's own commands, or one named
 * server. The word is shared by the panel that draws the heads and the canvas that presses through to them, so it
 * lives with neither: a group key is the vocabulary between them.
 */
export const COMMANDS_GROUP_KEY = "commands";
export const SERVER_GROUP_PREFIX = "server:";

/** The group one granted function belongs to; a server's is named by the server's id and by nothing else. */
export function groupOfGrant(grant: ToolGrant): string {
  const source = sourceOf(grant);

  return source.kind === "mcp" ? `${SERVER_GROUP_PREFIX}${source.id}` : COMMANDS_GROUP_KEY;
}
