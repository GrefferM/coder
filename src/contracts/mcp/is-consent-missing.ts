import { MCP_CONSENT_MISSING } from "./mcp-refusals.constant";
import type { McpLook } from "./mcp-look.interface";

/**
 * A look refused before anything was started, since this machine has not agreed to the server's run line. It says
 * nothing about the server: the row holds no look for it, and a turn granted it does not begin.
 */
export function isConsentMissing(look: McpLook): boolean {
  return !look.isUp && (look.failure ?? "").includes(MCP_CONSENT_MISSING);
}
