import type { SystemToolGrant } from "./system-tool-grant.interface";
import type { ToolGrant } from "./tool-grant.type";

/** A grant of one of the app's own commands, told apart by `source`. */
export function isSystemGrant(grant: ToolGrant): grant is SystemToolGrant {
  return grant.source === "system";
}
