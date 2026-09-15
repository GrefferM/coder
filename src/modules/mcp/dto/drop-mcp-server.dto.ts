import { IsUUID } from "class-validator";

/** A server was deleted here, so its keys are owed a sweep once the undo has run out. */
export class DropMcpServerDto {
  @IsUUID()
  declare id: string;
}
