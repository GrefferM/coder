import { IsString, IsUUID } from "class-validator";

/** One argument fixed for one agent; the value is stored as typed and read by the parameter's type. */
export class PinnedArgumentDto {
  @IsUUID()
  declare id: string;

  @IsUUID()
  declare parameterId: string;

  @IsString()
  declare value: string;
}
