import type { McpToolGrant } from "./mcp-tool-grant.interface";
import type { ToolGrant } from "./tool-grant.type";

/**
 * A grant of one function of a server, told apart by its `source` — the other half of `isCommandGrant`, written
 * out so that «only the server's» is one word wherever it is asked rather than a comparison spelled three ways.
 */
export function isServerGrant(grant: ToolGrant): grant is McpToolGrant {
  return grant.source === "mcp";
}
