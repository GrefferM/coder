import { IsUUID } from "class-validator";

/** The page of this server was opened, so «34 → 33» has been read and the arrow goes out. */
export class SeenMcpServerDto {
  @IsUUID()
  declare id: string;
}
