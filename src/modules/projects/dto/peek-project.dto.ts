import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

/** A project read for the desktop widget: its folder, and whether the widget is opening it now. */
export class PeekProjectDto {
  @IsString()
  @IsNotEmpty()
  declare directory: string;

  @IsBoolean()
  declare isOpened: boolean;
}
