import type { DeletionController, ProjectController } from "../controllers";

/** What `createProjectModule` returns: the module's fully wired controllers. */
export interface ProjectModule {
  controller: ProjectController;
  /** Deletion history, held on this machine. */
  deletionController: DeletionController;
}
