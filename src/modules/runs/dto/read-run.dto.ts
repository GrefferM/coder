import { IsUUID } from "class-validator";

export class ReadRunDto {
  @IsUUID()
  declare id: string;
}
