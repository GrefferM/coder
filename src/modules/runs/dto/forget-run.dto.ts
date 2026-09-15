import { IsUUID } from "class-validator";

/** One run the person deletes by hand; it takes its steps and calls with it. */
export class ForgetRunDto {
  @IsUUID()
  declare id: string;
}
