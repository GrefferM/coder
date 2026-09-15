import type { ProjectEntry } from "../../../../../interfaces";

/** The projects this machine remembers, and everything the switcher can do with them. */
export interface KnownProjects {
  known: ProjectEntry[];
  /** The last failure, said in the switcher's own words; null while nothing has gone wrong. */
  error: string | null;
  /** Opens the picked project; a folder that no longer holds one is marked gone in the list. */
  switchTo: (directory: string) => Promise<void>;
  /** Opens whatever the chosen folder is, making it a project if it is not one yet: no question asked. */
  chooseFolder: () => Promise<void>;
  /**
   * Starting a project looks into the chosen folder first. One already holding a project is opened
   * where it stands, and an empty one is handed back here to be named before anything is written into it.
   */
  startProject: () => Promise<void>;
  /** The empty folder waiting for a name, with the folder's own name as the first guess; null while none is. */
  naming: { directory: string; name: string } | null;
  /** Writes the project into the folder that was waiting, under the given name, and opens it. */
  nameIt: (name: string) => Promise<void>;
  stopNaming: () => void;
  /** Dropping a project from the list leaves the list open. */
  forget: (directory: string) => Promise<void>;
  reveal: () => Promise<void>;
}
