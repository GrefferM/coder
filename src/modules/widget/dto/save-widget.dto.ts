import { IsBoolean, IsObject, IsOptional, IsString } from "class-validator";
import type { WidgetPlace } from "../interfaces";

/** How this machine keeps the desktop widget. */
export class SaveWidgetDto {
  @IsBoolean()
  declare isShown: boolean;

  @IsOptional()
  @IsString()
  declare directory: string | null;

  @IsOptional()
  @IsObject()
  declare place: WidgetPlace | null;

  @IsObject()
  declare chosen: Record<string, string>;
}
