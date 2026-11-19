import { WIDGET_WALK_CHANGED_CHANNEL } from "../../contracts";
import type { WidgetWalk } from "../../contracts";
import type { WidgetVoice } from "../../modules/walks";
import type { AppWindows } from "./app-windows.service";

/** Tells the widget how a sphere's conversation stands; dropped while the widget is not open. */
export class WindowWidgetVoice implements WidgetVoice {
  constructor(private readonly windows: AppWindows) {}

  changed(walk: WidgetWalk): void {
    this.windows.toWidget(WIDGET_WALK_CHANGED_CHANNEL, walk);
  }
}
