import { IsArray, IsUUID } from "class-validator";

/** The servers the project still names; every dropped id not among them is swept. */
export class SweepMcpKeysDto {
  @IsArray()
  @IsUUID(undefined, {
    each: true,
  })
  declare serverIds: string[];
}
