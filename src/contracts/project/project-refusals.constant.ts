/** Codes the main process refuses a project with, shared by both sides. */

/** A folder that holds no project at all. */
export const PROJECT_NOT_FOUND = "PROJECT_NOT_FOUND";
/** A file stamped with a version this build does not know. */
export const PROJECT_FROM_NEWER_BUILD = "PROJECT_FROM_NEWER_BUILD";
/** The file's lines close a ring. */
export const LINKS_MAKE_RING = "LINKS_MAKE_RING";
/** The same line is drawn twice. */
export const LINKS_REPEAT = "LINKS_REPEAT";
/** The file does not hold a project: a field is missing or invalid. */
export const PROJECT_FILE_BROKEN = "PROJECT_FILE_BROKEN";
/** The folder changed on disk since the screen read it, so a save from that reading would undo the change. */
export const PROJECT_CHANGED_ON_DISK = "PROJECT_CHANGED_ON_DISK";
