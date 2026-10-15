import { ArrayUnique, IsArray, IsIn, IsUUID, ValidateNested } from "class-validator";
import { COMMAND_TOOL_SOURCE } from "../constants";
import { PinnedArgumentDto } from "./pinned-argument.dto";

export class CommandToolGrantDto {
  @IsUUID()
  declare id: string;

  @IsIn([COMMAND_TOOL_SOURCE])
  declare source: typeof COMMAND_TOOL_SOURCE;

  @IsUUID()
  declare commandId: string;

  // What is fixed for this agent alone.
  @IsArray()
  @ValidateNested({
    each: true,
  })
  @ArrayUnique((pinned: PinnedArgumentDto) => pinned.parameterId)
  declare pinned: PinnedArgumentDto[];
}
