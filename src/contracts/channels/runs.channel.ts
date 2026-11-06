/** The channels of a run's record, read afterwards from the history and forgotten by hand. */
export const LIST_RUNS_CHANNEL = "runs:list";
export const READ_RUN_CHANNEL = "runs:one";
/** Where one call stands, by id; what «ПОКАЗАТИ ВИКЛИК» needs. */
export const CALL_PLACE_CHANNEL = "runs:call-place";
/** One word searched through the whole record: questions, step texts and calls. */
export const SEARCH_RUNS_CHANNEL = "runs:search";
export const FORGET_RUN_CHANNEL = "runs:forget";
/** Every run of the open project, deleted by hand from the history's end. */
export const FORGET_RUNS_CHANNEL = "runs:forget-all";

/** One recording kept with a question: its sound, by the recording's id. */
export const RECORDING_SOUND_CHANNEL = "runs:recording-sound";
