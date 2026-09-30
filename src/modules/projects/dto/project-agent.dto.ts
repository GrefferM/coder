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

  @IsUUID()
  declare modelId: string;

  @IsOptional()
  @IsUUID()
  declare promptId: string | null;

  // What this agent may call — declared commands and functions of MCP servers alike. One
  // command, or one function of one server, is granted once; the same name on two servers is two different things.
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

  // A converging point waits for every supplier where this holds, or runs on each input on its own where it does not.
  @IsBoolean()
  declare waitsForAll: boolean;

  @IsNumber()
  declare x: number;

  @IsNumber()
  declare y: number;

  // Nothing where the file never carried the number; the field is empty and the agent says so.
  @IsOptional()
  @IsInt()
  @Min(AGENT_MAX_CALLS_LEAST)
  declare maxCalls: number | null;

  // 0 holds to what it was handed, 1 puts it more freely; the same bounds for every provider.
  @IsOptional()
  @IsNumber()
  @Min(AGENT_TEMPERATURE_LEAST)
  @Max(AGENT_TEMPERATURE_MOST)
  declare temperature: number | null;
}

/** What makes a grant the same grant; the handle is the boundary's, so the file and the screens agree on it. */
function grantKey(grant: ToolGrantDto): string {
  return handleOf(sourceOf(grant));
}
