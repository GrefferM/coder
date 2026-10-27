import { IsIn, IsUUID } from "class-validator";
import { SYSTEM_COMMAND_IDS } from "../../../contracts";
import type { SystemCommandId } from "../../../contracts";
import { SYSTEM_TOOL_SOURCE } from "../constants";

export class SystemToolGrantDto {
  @IsUUID()
  declare id: string;

  @IsIn([SYSTEM_TOOL_SOURCE])
  declare source: typeof SYSTEM_TOOL_SOURCE;

  // A command the app does not know is refused like any other word out of its list.
  @IsIn(SYSTEM_COMMAND_IDS)
  declare command: SystemCommandId;
}
