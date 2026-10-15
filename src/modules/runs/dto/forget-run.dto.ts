import { IsUUID } from "class-validator";

export class ForgetRunDto {
  @IsUUID()
  declare id: string;
}
