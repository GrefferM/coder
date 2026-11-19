import type { ProjectEntry } from "../../../interfaces";

/** The projects this machine has opened, as the widget's lists show and change them. */
export interface WidgetProjects {
  recent: ProjectEntry[];
  /** The list under «Відкрити проєкт» stands open. */
  isListOpen: boolean;
  toggleList: () => void;
  /** Reads the recent projects again. */
  load: () => void;
  /** Makes a folder the widget's project. */
  open: (directory: string) => void;
  /** Asks for a folder and makes it the widget's project. */
  openFolder: () => void;
  /** Takes a project off this machine's list; its folder stays. */
  forget: (directory: string) => void;
}
