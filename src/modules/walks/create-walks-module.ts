import { WalkController, WidgetWalkController } from "./controllers";
import { ScheduledWalks, WalkHub, WidgetWalks } from "./services";
import type { WalksModule, WidgetWalksParts } from "./interfaces";

export function createWalksModule(parts: WidgetWalksParts): WalksModule {
  const hub = new WalkHub(parts);
  const widget = new WidgetWalks(parts);

  return {
    controller: new WalkController(hub),
    widgetController: new WidgetWalkController(widget),
    hub,
    scheduled: new ScheduledWalks(parts),
    widget,
  };
}
