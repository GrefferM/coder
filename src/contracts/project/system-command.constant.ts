/** `pass_to` names the agents the work goes to; it is also the name the model calls it by. */
export const PASS_TO_COMMAND = "pass_to";
/** `finish_here` ends the branch; it is also the name the model calls it by. */
export const FINISH_HERE_COMMAND = "finish_here";

/** The app's own commands an agent may be granted: not written by anybody, the same in every project. */
export const SYSTEM_COMMAND_IDS = [PASS_TO_COMMAND, FINISH_HERE_COMMAND] as const;

export type SystemCommandId = (typeof SYSTEM_COMMAND_IDS)[number];
