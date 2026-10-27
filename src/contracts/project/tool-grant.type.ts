import type { AgentToolGrant } from "./agent-tool-grant.interface";
import type { CommandToolGrant } from "./command-tool-grant.interface";
import type { McpToolGrant } from "./mcp-tool-grant.interface";
import type { SystemToolGrant } from "./system-tool-grant.interface";

export type ToolGrant = CommandToolGrant | McpToolGrant | AgentToolGrant | SystemToolGrant;
