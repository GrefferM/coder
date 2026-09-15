import { IsUUID } from "class-validator";

/** One run to open, with every step and call inside it. */
export class ReadRunDto {
  @IsUUID()
  declare id: string;
}
