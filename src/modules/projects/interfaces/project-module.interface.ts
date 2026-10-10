import type { DeletionController, ProjectController } from "../controllers";
import type { ProjectFinder } from "../services";
import type { ProjectWatch } from "./project-watch.interface";

/** What `createProjectModule` returns: the wired controllers, and the watch the window asks to look again, and the finder a command line asks. */
export interface ProjectModule {
  controller: ProjectController;
  /** Deletion history, held on this machine. */
  deletionController: DeletionController;
  watch: ProjectWatch;
  /** Finds a project by the name or folder a command line was given. */
  finder: ProjectFinder;
}
