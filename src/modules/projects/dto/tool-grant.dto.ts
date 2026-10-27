import { AgentToolGrantDto } from "./agent-tool-grant.dto";
import { CommandToolGrantDto } from "./command-tool-grant.dto";
import { McpToolGrantDto } from "./mcp-tool-grant.dto";
import { SystemToolGrantDto } from "./system-tool-grant.dto";

export type ToolGrantDto = CommandToolGrantDto | McpToolGrantDto | AgentToolGrantDto | SystemToolGrantDto;
