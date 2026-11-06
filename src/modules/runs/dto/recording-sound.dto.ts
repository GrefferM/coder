import { IsUUID } from "class-validator";

export class RecordingSoundDto {
  @IsUUID()
  declare id: string;
}
