import { IsUUID } from "class-validator";

/** Which server is being asked what this machine holds for it. */
export class McpSecretsHeldDto {
  @IsUUID()
  declare serverId: string;
}
