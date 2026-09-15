import { IsString, IsUUID } from "class-validator";

/** The token for one remote server, by the server's own id. An empty value takes the token away. */
export class SaveMcpTokenDto {
  @IsUUID()
  declare serverId: string;

  @IsString()
  declare value: string;
}
