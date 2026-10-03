import type { DeletionController, ProjectController } from "../controllers";
import type { ProjectWatch } from "./project-watch.interface";

/** What `createProjectModule` returns: the wired controllers, and the watch the window asks to look again. */
export interface ProjectModule {
  controller: ProjectController;
  /** Deletion history, held on this machine. */
  deletionController: DeletionController;
  watch: ProjectWatch;
}
