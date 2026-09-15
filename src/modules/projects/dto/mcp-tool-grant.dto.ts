import { IsIn, IsNotEmpty, IsString, IsUUID } from "class-validator";
import { MCP_TOOL_SOURCE } from "../constants";

/**
 * One function of an MCP server granted to an agent, named by the name the server gave it: the server owns that
 * list, so there is no id of ours to hold, and a function that leaves it leaves the grant standing and lost.
 */
export class McpToolGrantDto {
  @IsUUID()
  declare id: string;

  @IsIn([MCP_TOOL_SOURCE])
  declare source: typeof MCP_TOOL_SOURCE;

  @IsUUID()
  declare serverId: string;

  @IsString()
  @IsNotEmpty()
  declare functionName: string;
}
