import { IsArray, IsIn, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, Min } from "class-validator";
import { RUN_CALL_ENDS, TOOL_SOURCES } from "../../../contracts";
import type { ToolSource } from "../../../contracts";

/** One call as it happened; a refused one carries `refusal` and no code, a call that ran carries both. */
export class AddCallDto {
  /**
   * The call's own id — the one it wore in the stream, and the one a server's count of failures points at. An id
   * made here instead would give the same call two, and nothing could be led back to it from anywhere else.
   */
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

  /** The names the person pinned, so the record can tell them from what the model decided. */
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

  /** Which server the call went to, and its name then; a command's call carries neither. */
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
