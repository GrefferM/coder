import { IsString, IsUUID } from "class-validator";

/** The token for one remote server, by its id; an empty value removes it. */
export class SaveMcpTokenDto {
  @IsUUID()
  declare serverId: string;

  @IsString()
  declare value: string;
}
