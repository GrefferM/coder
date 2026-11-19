import { IsNotEmpty, IsString } from "class-validator";

/** The widget's project, by its folder. */
export class WidgetWalksDto {
  @IsString()
  @IsNotEmpty()
  declare directory: string;
}
