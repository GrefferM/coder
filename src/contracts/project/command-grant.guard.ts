import type { CommandToolGrant } from "./command-tool-grant.interface";
import type { ToolGrant } from "./tool-grant.type";

/**
 * A grant of a declared command, told apart by its `source`. The two kinds share almost nothing — a command is the
 * person's own line with arguments they fixed, a server's function is named by the server and pinned to nothing —
 * so anything reading `commandId` or `pinned` asks this first, and forgetting to ask does not compile.
 */
export function isCommandGrant(grant: ToolGrant): grant is CommandToolGrant {
  return grant.source === "command";
}
