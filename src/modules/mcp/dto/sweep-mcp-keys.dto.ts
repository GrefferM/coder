import { IsArray, IsUUID } from "class-validator";

/** The servers the project still names; every id dropped here and not among them is owed a sweep. */
export class SweepMcpKeysDto {
  @IsArray()
  @IsUUID(undefined, {
    each: true,
  })
  declare serverIds: string[];
}
