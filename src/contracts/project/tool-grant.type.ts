import type { CommandToolGrant } from "./command-tool-grant.interface";
import type { McpToolGrant } from "./mcp-tool-grant.interface";

/** Union of grant kinds, discriminated by `source`. */
export type ToolGrant = CommandToolGrant | McpToolGrant;
