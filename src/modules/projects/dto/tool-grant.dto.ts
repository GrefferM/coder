import { CommandToolGrantDto } from "./command-tool-grant.dto";
import { McpToolGrantDto } from "./mcp-tool-grant.dto";

/** Everything an agent may be granted; `source` is the one field a reader branches on. */
export type ToolGrantDto = CommandToolGrantDto | McpToolGrantDto;
