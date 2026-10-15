import { IsUUID } from "class-validator";

export class McpSecretsHeldDto {
  @IsUUID()
  declare serverId: string;
}
