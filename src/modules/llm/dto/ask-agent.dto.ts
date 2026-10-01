import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateIf,
} from "class-validator";
import {
  AGENT_MAX_CALLS_LEAST,
  AGENT_TEMPERATURE_LEAST,
  AGENT_TEMPERATURE_MOST,
  MODEL_ANSWER_CEILING_LEAST,
} from "../../projects/constants";
import type { AgentTool, ChatTurn, ProjectMcpServer, ReachableAgent } from "../interfaces";

/** One turn asked of an agent; the key is not sent from the screen but looked up here. */
export class AskAgentDto {
  @IsString()
  declare turnId: string;

  // Whose turn this is; used to detect a ring through an agent-tool.
  @IsString()
  declare agentId: string;

  @IsString()
  declare providerId: string;

  @IsString()
  declare model: string;

  @IsString()
  declare directory: string;

  @IsInt()
  @Min(AGENT_MAX_CALLS_LEAST)
  declare maxCalls: number;

  @IsNumber()
  @Min(AGENT_TEMPERATURE_LEAST)
  @Max(AGENT_TEMPERATURE_MOST)
  declare temperature: number;

  @IsNumber()
  @Min(MODEL_ANSWER_CEILING_LEAST)
  declare answerCeiling: number;

  @IsOptional()
  @IsString()
  declare systemPrompt: string | null;

  @IsArray()
  @ArrayNotEmpty()
  declare messages: ChatTurn[];

  @IsArray()
  declare tools: AgentTool[];

  // The reach of every server a granted function belongs to; a tool names its server by id only.
  @IsArray()
  declare servers: ProjectMcpServer[];

  // Every agent reachable as a tool from this one, by id.
  @IsArray()
  declare agents: ReachableAgent[];

  // The row the turn writes into; null only while the conversation has none, never left out.
  @ValidateIf((asked: AskAgentDto) => asked.runId !== null)
  @IsUUID()
  declare runId: string | null;

  // The question the turn works under; an agent it calls with the shared memory reads this one.
  @IsUUID()
  declare questionId: string;
}
