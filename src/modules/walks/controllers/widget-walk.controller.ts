import { Validate } from "../../../utils/dto-validation";
import { WidgetWalks } from "../services";
import { OfWidgetSphereDto, PutWidgetWalkDto, WidgetWalksDto } from "../dto";
import type { PutWalkAnswer, WidgetWalk } from "../../../contracts";

export class WidgetWalkController {
  constructor(private readonly widgetWalks: WidgetWalks) {}

  @Validate()
  async walks(payload: WidgetWalksDto): Promise<WidgetWalk[]> {
    return this.widgetWalks.walks(payload.directory);
  }

  @Validate()
  async put(payload: PutWidgetWalkDto): Promise<PutWalkAnswer | null> {
    return this.widgetWalks.put(payload);
  }

  @Validate()
  async stop(payload: OfWidgetSphereDto): Promise<void> {
    this.widgetWalks.stop(payload.agentId);
  }

  @Validate()
  async fresh(payload: OfWidgetSphereDto): Promise<void> {
    this.widgetWalks.fresh(payload.agentId);
  }
}
