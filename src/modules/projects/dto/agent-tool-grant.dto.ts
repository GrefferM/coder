import { IsIn, IsUUID } from "class-validator";
import { AGENT_TOOL_SOURCE } from "../constants";

/** Another agent granted as a tool, holding only that agent's id; `source` is what a reader branches on. */
export class AgentToolGrantDto {
  @IsUUID()
  declare id: string;

  @IsIn([AGENT_TOOL_SOURCE])
  declare source: typeof AGENT_TOOL_SOURCE;

  @IsUUID()
  declare agentId: string;
}
