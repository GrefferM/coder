import { IsUUID } from "class-validator";

/** «ЗАПУСТИТИ»: a server is let go by id and starts afresh at the next look. */
export class CloseMcpServerDto {
  @IsUUID()
  declare id: string;
}
