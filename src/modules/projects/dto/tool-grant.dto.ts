import { AgentToolGrantDto } from "./agent-tool-grant.dto";
import { CommandToolGrantDto } from "./command-tool-grant.dto";
import { McpToolGrantDto } from "./mcp-tool-grant.dto";

/** Everything an agent may be granted; `source` is the field to branch on. */
export type ToolGrantDto = CommandToolGrantDto | McpToolGrantDto | AgentToolGrantDto;
