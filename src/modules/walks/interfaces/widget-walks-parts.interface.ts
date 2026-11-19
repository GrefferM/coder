import type { WalkHubParts } from "./walk-hub-parts.interface";
import type { WidgetVoice } from "./widget-voice.interface";

/** What the widget's conversations stand on: the hub's parts, and the widget to tell. */
export interface WidgetWalksParts extends WalkHubParts {
  widget: WidgetVoice;
}
