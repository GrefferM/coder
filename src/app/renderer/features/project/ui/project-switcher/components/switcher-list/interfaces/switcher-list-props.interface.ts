import type { ListWalk } from "../../../../../../../hooks";
import type { OpenProject, ProjectEntry } from "../../../../../../../interfaces";

export interface SwitcherListProps {
  /** The project the app is open on — it stands first and is not a way anywhere. */
  project: OpenProject;
  /** The projects this machine remembers, this one aside. */
  others: ProjectEntry[];
  /** The keyboard's walk over the rows, the acts under them counted in. */
  walk: ListWalk;
  onSwitch: (directory: string) => void;
  onForget: (directory: string) => void;
  onChooseFolder: () => void;
  onStartProject: () => void;
  onReveal: () => void;
  onClose: () => void;
}
