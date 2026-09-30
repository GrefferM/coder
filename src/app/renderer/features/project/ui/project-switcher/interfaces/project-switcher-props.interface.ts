import type { OpenProject } from "../../../../../interfaces";

export interface ProjectSwitcherProps {
  project: OpenProject;
  onProjectChange: (project: OpenProject) => void;
  /** Closes the open project, returning to the start screen. */
  onClose: () => void;
}
