import type { OpenProject } from "../../../../../interfaces";

export interface ProjectSwitcherProps {
  project: OpenProject;
  onProjectChange: (project: OpenProject) => void;
  /** Puts the open project down; the start screen is what stands with none. */
  onClose: () => void;
}
