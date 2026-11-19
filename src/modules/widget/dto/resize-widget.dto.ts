import { IsNumber, IsPositive } from "class-validator";

/** The height the widget's state asks of its window. */
export class ResizeWidgetDto {
  @IsNumber()
  @IsPositive()
  declare height: number;
}
