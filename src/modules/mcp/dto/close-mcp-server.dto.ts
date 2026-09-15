import { IsUUID } from "class-validator";

/** «ЗАПУСТИТИ»: a server is let go by its id, and starts afresh the next time it is looked at. */
export class CloseMcpServerDto {
  @IsUUID()
  declare id: string;
}
