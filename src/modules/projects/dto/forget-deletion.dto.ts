import { IsUUID } from "class-validator";

/** Names the history row to hard-delete. */
export class ForgetDeletionDto {
  @IsUUID()
  declare id: string;
}
