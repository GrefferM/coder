import { IsObject, IsOptional, IsString } from "class-validator";
import type { WidgetPlace } from "../interfaces";

/** A change to how this machine keeps the desktop widget: only what changed is given. */
export class SaveWidgetDto {
  @IsOptional()
  @IsString()
  declare directory?: string | null;

  @IsOptional()
  @IsObject()
  declare place?: WidgetPlace | null;

  @IsOptional()
  @IsObject()
  declare chosen?: Record<string, string>;
}
