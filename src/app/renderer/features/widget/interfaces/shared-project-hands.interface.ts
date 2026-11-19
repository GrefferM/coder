import type { OpenProject } from "../../../interfaces";

/** The main window's project, and the way to put another in its place. */
export interface SharedProjectHands {
  project: OpenProject | null;
  onOpened: (project: OpenProject | null) => void;
}
