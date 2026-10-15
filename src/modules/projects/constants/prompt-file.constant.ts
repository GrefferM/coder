export const PROMPT_FILE_EXTENSION = ".md";

/** Matches only prompt bodies the app wrote, named by prompt id. */
export const PROMPT_FILE_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.md$/i;
