import { IsString, IsUUID, Matches } from "class-validator";
import { COMMAND_NAME_PATTERN } from "../../../contracts";

/**
 * The value of one environment variable of one server; the name only says which, and the value never leaves this
 * machine.
 */
export class SaveMcpEnvValueDto {
  @IsUUID()
  declare serverId: string;

  @Matches(COMMAND_NAME_PATTERN)
  declare name: string;

  @IsString()
  declare value: string;
}
