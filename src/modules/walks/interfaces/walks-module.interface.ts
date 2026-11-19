import type { WalkController, WidgetWalkController } from "../controllers";
import type { ScheduledWalks, WalkHub, WidgetWalks } from "../services";

export interface WalksModule {
  controller: WalkController;
  widgetController: WidgetWalkController;
  hub: WalkHub;
  /** Where the schedules' tasks walk. */
  scheduled: ScheduledWalks;
  /** Where the widget's spheres walk. */
  widget: WidgetWalks;
}
