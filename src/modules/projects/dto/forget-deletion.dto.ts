import { IsUUID } from "class-validator";

export class ForgetDeletionDto {
  @IsUUID()
  declare id: string;
}
