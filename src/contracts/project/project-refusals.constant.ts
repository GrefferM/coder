/**
 * What the main process refuses a project with, in the words both sides read. The screen that opens a project
 * names each of them in its own sentence, so the code is one and stands here rather than twinned on each side.
 */

/** A folder that holds no project at all. */
export const PROJECT_NOT_FOUND = "PROJECT_NOT_FOUND";
/** A file stamped with a version this build does not know; it cannot be opened without losing what it holds. */
export const PROJECT_FROM_NEWER_BUILD = "PROJECT_FROM_NEWER_BUILD";
/** The lines of the file close a ring, so work handed down them would walk it for ever. */
export const LINKS_MAKE_RING = "LINKS_MAKE_RING";
/** The same line is drawn twice, so work would go down it twice. */
export const LINKS_REPEAT = "LINKS_REPEAT";
/** The file is there but does not hold a project: a field is missing, or holds something it may not. */
export const PROJECT_FILE_BROKEN = "PROJECT_FILE_BROKEN";
