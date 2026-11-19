import type { WalkSnapshot } from "../walks";

/** One sphere's conversation in the widget, found by the agent it begins at. */
export interface WidgetWalk {
  agentId: string;
  snapshot: WalkSnapshot;
}
