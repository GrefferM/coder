import { IsUUID } from "class-validator";

/** The server's page was opened, so «34 → 33» has been read and the arrow goes out. */
export class SeenMcpServerDto {
  @IsUUID()
  declare id: string;
}
