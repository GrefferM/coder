/** IPC channel a renderer calls to turn a folder into a project. */
export const CREATE_PROJECT_CHANNEL = "projects:create";

/** IPC channel a renderer calls to drop a project from this machine's list, leaving its folder alone. */
export const FORGET_PROJECT_CHANNEL = "projects:forget";

/** IPC channel a renderer calls for the projects this machine has opened, most recent first. */
export const LIST_RECENT_PROJECTS_CHANNEL = "projects:list-recent";

/** IPC channel a renderer calls to learn what a chosen folder holds before anything is written to it. */
export const LOOK_PROJECT_CHANNEL = "projects:look";

/** IPC channel a renderer calls for a folder the user just chose: read it, or make it a project. */
export const OPEN_OR_CREATE_PROJECT_CHANNEL = "projects:open-or-create";

/** IPC channel a renderer calls to read the project in a folder. */
export const OPEN_PROJECT_CHANNEL = "projects:open";

/** IPC channel the main process sends on when the open project's file changed on disk under it. */
export const PROJECT_CHANGED_CHANNEL = "projects:changed";

/** IPC channel a renderer calls for where this machine was looking in a project last time. */
export const PROJECT_VIEW_CHANNEL = "projects:view";

/** IPC channel a renderer calls to note where this machine is looking now. */
export const REMEMBER_PROJECT_VIEW_CHANNEL = "projects:remember-view";

/** IPC channel a renderer calls to write the open project back to its folder. */
export const SAVE_PROJECT_CHANNEL = "projects:save";
