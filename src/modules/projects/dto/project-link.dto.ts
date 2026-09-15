import { IsUUID } from "class-validator";

/** One directed link: `from` hands its answer to `to`, which hands its own on the same way. Rings are refused. */
export class ProjectLinkDto {
  @IsUUID()
  declare id: string;

  @IsUUID()
  declare from: string;

  @IsUUID()
  declare to: string;
}
