/** The renderer closes the open project so main stops watching it. */
export const CLOSE_PROJECT_CHANNEL = "projects:close";

export const CREATE_PROJECT_CHANNEL = "projects:create";

/** Drops a project from this machine's list, leaving its folder alone. */
export const FORGET_PROJECT_CHANNEL = "projects:forget";

/** The projects this machine has opened, most recent first. */
export const LIST_RECENT_PROJECTS_CHANNEL = "projects:list-recent";

/** What a chosen folder holds, learned before anything is written to it. */
export const LOOK_PROJECT_CHANNEL = "projects:look";

/** A folder the person just chose: read it, or make it a project. */
export const OPEN_OR_CREATE_PROJECT_CHANNEL = "projects:open-or-create";

export const OPEN_PROJECT_CHANNEL = "projects:open";

/** Pushed from main when the open project's file changed on disk under it. */
export const PROJECT_CHANGED_CHANNEL = "projects:changed";

/** Where this machine was looking in a project last time. */
export const PROJECT_VIEW_CHANNEL = "projects:view";

/** Notes where this machine is looking now. */
export const REMEMBER_PROJECT_VIEW_CHANNEL = "projects:remember-view";

export const SAVE_PROJECT_CHANNEL = "projects:save";
