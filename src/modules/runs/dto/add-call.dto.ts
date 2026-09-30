import { IsArray, IsIn, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, Min } from "class-validator";
import { RUN_CALL_ENDS, TOOL_SOURCES } from "../../../contracts";
import type { ToolSource } from "../../../contracts";

/** One call as it happened; a refused call has `refusal` and no code, a run call has both. */
export class AddCallDto {
  /** The call's id from the stream, also the one a server's failure count points at. */
  @IsString()
  @IsNotEmpty()
  declare id: string;

  /** What the call went to. */
  @IsIn(TOOL_SOURCES)
  declare source: ToolSource;

  @IsString()
  @IsNotEmpty()
  declare name: string;

  @IsObject()
  declare arguments: Record<string, string>;

  /** Names the person pinned, to tell them from the model's choices. */
  @IsArray()
  @IsString({
    each: true,
  })
  declare pinned: string[];

  @IsString()
  declare line: string;

  @IsString()
  declare output: string;

  @IsString()
  declare refusal: string;

  @IsOptional()
  @IsInt()
  declare exitCode: number | null;

  /** The server the call went to and its name then; none for a command's call. */
  @IsOptional()
  @IsString()
  declare serverId: string | null;

  @IsString()
  declare serverName: string;

  @IsIn(RUN_CALL_ENDS)
  declare end: string;

  @IsInt()
  @Min(0)
  declare startedAt: number;

  @IsInt()
  @Min(0)
  declare endedAt: number;
}
