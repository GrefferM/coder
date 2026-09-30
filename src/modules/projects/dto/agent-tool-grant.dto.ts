import { IsIn, IsUUID } from "class-validator";
import { AGENT_TOOL_SOURCE } from "../constants";

/**
 * Another agent granted to an agent as a tool, named by `source` a reader branches on. It holds the id of the
 * agent it points at and nothing more — the name and the short description are that agent's own, read when the
 * tool is handed to a model, and there is nothing of the grantor's to pin on a whole agent.
 */
export class AgentToolGrantDto {
  @IsUUID()
  declare id: string;

  @IsIn([AGENT_TOOL_SOURCE])
  declare source: typeof AGENT_TOOL_SOURCE;

  @IsUUID()
  declare agentId: string;
}
