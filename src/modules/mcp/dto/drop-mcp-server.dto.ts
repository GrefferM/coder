import { IsUUID } from "class-validator";

/** A server was deleted here; its keys are owed a sweep once the undo runs out. */
export class DropMcpServerDto {
  @IsUUID()
  declare id: string;
}
