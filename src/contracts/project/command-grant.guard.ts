import type { CommandToolGrant } from "./command-tool-grant.interface";
import type { ToolGrant } from "./tool-grant.type";

/** A grant of a declared command, told apart by `source`; ask this before reading `commandId` or `pinned`. */
export function isCommandGrant(grant: ToolGrant): grant is CommandToolGrant {
  return grant.source === "command";
}
