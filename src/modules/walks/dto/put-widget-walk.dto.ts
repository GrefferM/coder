import { IsArray, IsNotEmpty, IsObject, IsString, IsUUID } from "class-validator";
import type { PackedAttachment } from "../../../contracts";
import type { ProjectConfig } from "../../../contracts";

/** A question from the widget: its project as read, the sphere it begins at, and its words. */
export class PutWidgetWalkDto {
  @IsString()
  @IsNotEmpty()
  declare directory: string;

  @IsObject()
  declare config: ProjectConfig;

  @IsUUID()
  declare agentId: string;

  @IsString()
  declare text: string;

  @IsArray()
  declare attached: PackedAttachment[];
}
