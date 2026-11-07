import type { HeldProject, WalkRunner } from "../services";

/** One schedule's conversation and the project it walks in. */
export interface ScheduledConversation {
  project: HeldProject;
  runner: WalkRunner;
}
