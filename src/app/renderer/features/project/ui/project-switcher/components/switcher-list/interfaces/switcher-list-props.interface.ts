import type { ListWalk } from "../../../../../../../hooks";
import type { OpenProject, ProjectEntry } from "../../../../../../../interfaces";

export interface SwitcherListProps {
  /** The open project; listed first and not selectable. */
  project: OpenProject;
  /** The projects this machine remembers, this one aside. */
  others: ProjectEntry[];
  /** The keyboard walk over the rows, including the acts under them. */
  walk: ListWalk;
  onSwitch: (directory: string) => void;
  onForget: (directory: string) => void;
  onChooseFolder: () => void;
  onStartProject: () => void;
  onReveal: () => void;
  onClose: () => void;
}
