import type { McpToolGrant } from "./mcp-tool-grant.interface";
import type { ToolGrant } from "./tool-grant.type";

/** A grant of one function of a server, told apart by its `source`. */
export function isServerGrant(grant: ToolGrant): grant is McpToolGrant {
  return grant.source === "mcp";
}
