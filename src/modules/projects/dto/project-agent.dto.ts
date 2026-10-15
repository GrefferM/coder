import { AGENT_MEMORIES, handleOf, sourceOf } from "../../../contracts";
import type { AgentMemory } from "../../../contracts";
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsHexColor,
  IsIn,
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

export class ProjectAgentDto {
  @IsUUID()
  declare id: string;

  @IsString()
  @IsNotEmpty()
  declare name: string;

  // Null where unwritten.
  @IsOptional()
  @IsString()
  declare purpose: string | null;

  @IsUUID()
  declare modelId: string;

  @IsOptional()
  @IsUUID()
  declare promptId: string | null;

  // Declared commands, MCP server functions and other agents, each granted once.
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

  @IsIn(AGENT_MEMORIES)
  declare memory: AgentMemory;

  @IsNumber()
  declare x: number;

  @IsNumber()
  declare y: number;

  // Null where the file never carried the number.
  @IsOptional()
  @IsInt()
  @Min(AGENT_MAX_CALLS_LEAST)
  declare maxCalls: number | null;

  // 0 is not sent, so the model keeps its own; same bounds for every provider.
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
