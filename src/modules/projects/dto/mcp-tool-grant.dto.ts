import { IsIn, IsNotEmpty, IsString, IsUUID } from "class-validator";
import { MCP_TOOL_SOURCE } from "../constants";

/** One function of an MCP server granted to an agent, named as the server names it (no id of ours). */
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
