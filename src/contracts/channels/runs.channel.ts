/** The channels of a run's record: written while it walks, read afterwards. */
export const OPEN_RUN_CHANNEL = "runs:open";
export const ADD_RUN_STEP_CHANNEL = "runs:step";
/** Another question in a flow already recorded; the record goes on instead of splitting. */
export const ASK_AGAIN_CHANNEL = "runs:ask-again";
export const CLOSE_RUN_CHANNEL = "runs:close";
export const LIST_RUNS_CHANNEL = "runs:list";
export const READ_RUN_CHANNEL = "runs:one";
/** Where one call stands, by its own id — what «ПОКАЗАТИ ВИКЛИК» needs and all it has. */
export const CALL_PLACE_CHANNEL = "runs:call-place";
/** One word looked for through the whole record — questions, the texts of steps, and calls. */
export const SEARCH_RUNS_CHANNEL = "runs:search";
export const FORGET_RUN_CHANNEL = "runs:forget";
/** Every run of the open project, taken by hand from the end of the history. */
export const FORGET_RUNS_CHANNEL = "runs:forget-all";
