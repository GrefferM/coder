import type { ProjectEntry } from "../../../../../interfaces";

/** The projects this machine remembers, and what the switcher can do with them. */
export interface KnownProjects {
  known: ProjectEntry[];
  /** The last failure in the switcher's words; `null` when none. */
  error: string | null;
  /** Opens the picked project; a folder that no longer holds one is marked gone. */
  switchTo: (directory: string) => Promise<void>;
  /** Opens the chosen folder, making it a project if it is not one; no question asked. */
  chooseFolder: () => Promise<void>;
  /**
   * Looks into the chosen folder first: one holding a project is opened as is, an empty one is handed back to be named
   * before anything is written.
   */
  startProject: () => Promise<void>;
  /** The empty folder waiting for a name, with its own name as the first guess; `null` if none. */
  naming: { directory: string; name: string } | null;
  /** Writes the project into the waiting folder under the given name and opens it. */
  nameIt: (name: string) => Promise<void>;
  stopNaming: () => void;
  /** Dropping a project from the list leaves the list open. */
  forget: (directory: string) => Promise<void>;
  reveal: () => Promise<void>;
}
