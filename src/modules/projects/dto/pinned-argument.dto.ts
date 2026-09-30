import { IsString, IsUUID } from "class-validator";

/** An argument fixed for one agent; stored as typed, read by the parameter's type. */
export class PinnedArgumentDto {
  @IsUUID()
  declare id: string;

  @IsUUID()
  declare parameterId: string;

  @IsString()
  declare value: string;
}
