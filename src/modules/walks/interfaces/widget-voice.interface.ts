import type { WidgetWalk } from "../../../contracts";

/** Where the widget is told what happens to a sphere's conversation. */
export interface WidgetVoice {
  changed(walk: WidgetWalk): void;
}
