import { IsUUID } from "class-validator";

/** One run deleted by hand, with its steps and calls. */
export class ForgetRunDto {
  @IsUUID()
  declare id: string;
}
