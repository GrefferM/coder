import { handleOf, sourceOf } from "../../../contracts";
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsHexColor,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from "class-validator";
import type { ToolGrantDto } from "./tool-grant.dto";
import { AGENT_MAX_CALLS_LEAST, AGENT_TEMPERATURE_LEAST, AGENT_TEMPERATURE_MOST } from "../constants";

/** One agent as the project file carries it. */
export class ProjectAgentDto {
  @IsUUID()
  declare id: string;

  @IsString()
  @IsNotEmpty()
  declare name: string;

  // What the agent is for; null where unwritten.
  @IsOptional()
  @IsString()
  declare purpose: string | null;

  @IsUUID()
  declare modelId: string;

  @IsOptional()
  @IsUUID()
  declare promptId: string | null;

  // What this agent may call: declared commands and MCP server functions, each granted once.
  @IsArray()
  @ValidateNested({
    each: true,
  })
  @ArrayUnique(grantKey)
  declare tools: ToolGrantDto[];

  @IsHexColor()
  declare color: string;

  @IsBoolean()
  declare isActive: boolean;

  // Where true, a converging point waits for every supplier; otherwise it runs on each input separately.
  @IsBoolean()
  declare waitsForAll: boolean;

  // Where true, the agent's earlier turns of the conversation go ahead of its input.
  @IsBoolean()
  declare keepsThread: boolean;

  @IsNumber()
  declare x: number;

  @IsNumber()
  declare y: number;

  // Empty where the file never carried the number.
  @IsOptional()
  @IsInt()
  @Min(AGENT_MAX_CALLS_LEAST)
  declare maxCalls: number | null;

  // 0 sticks to the input, 1 is freer; same bounds for every provider.
  @IsOptional()
  @IsNumber()
  @Min(AGENT_TEMPERATURE_LEAST)
  @Max(AGENT_TEMPERATURE_MOST)
  declare temperature: number | null;
}

/** Identity of a grant; the handle is the boundary's. */
function grantKey(grant: ToolGrantDto): string {
  return handleOf(sourceOf(grant));
}
