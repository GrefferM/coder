import { IsUUID } from "class-validator";

/** A directed link: `from` hands its answer to `to`. Rings are refused. */
export class ProjectLinkDto {
  @IsUUID()
  declare id: string;

  @IsUUID()
  declare from: string;

  @IsUUID()
  declare to: string;
}
