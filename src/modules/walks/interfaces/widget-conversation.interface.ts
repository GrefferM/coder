import type { HeldProject, WalkRunner } from "../services";

/** One sphere's conversation in the widget and the project it walks in. */
export interface WidgetConversation {
  project: HeldProject;
  runner: WalkRunner;
}
