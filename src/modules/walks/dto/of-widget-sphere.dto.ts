import { IsUUID } from "class-validator";

/** One sphere of the widget, by its agent's id. */
export class OfWidgetSphereDto {
  @IsUUID()
  declare agentId: string;
}
