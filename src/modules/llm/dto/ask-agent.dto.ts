import { ArrayNotEmpty, IsArray, IsInt, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import {
  AGENT_MAX_CALLS_LEAST,
  AGENT_TEMPERATURE_LEAST,
  AGENT_TEMPERATURE_MOST,
  MODEL_ANSWER_CEILING_LEAST,
} from "../../projects/constants";
import type { AgentTool, ChatTurn, ProjectMcpServer } from "../interfaces";

/** One turn asked of an agent; the key is never sent from the screen and is looked up on this side. */
export class AskAgentDto {
  @IsString()
  declare turnId: string;

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

  // The reach of every server a granted function belongs to; a tool names its server by id alone.
  @IsArray()
  declare servers: ProjectMcpServer[];
}
