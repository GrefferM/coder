import { IsString, IsUUID, Matches } from "class-validator";
import { COMMAND_NAME_PATTERN } from "../../../contracts";

/** The name only says which variable; the value never leaves this machine, and an empty one removes it. */
export class SaveMcpEnvValueDto {
  @IsUUID()
  declare serverId: string;

  @Matches(COMMAND_NAME_PATTERN)
  declare name: string;

  @IsString()
  declare value: string;
}
