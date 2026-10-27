/**
 * Why a link out of a turn was not taken: the agent is off or busy, or the answering agent chose another way: `notChosen`
 * where it named other agents to hand the answer to, `finished` where it ended the branch.
 */
export const CHAT_STOP_REASONS = ["off", "busy", "notChosen", "finished"] as const;

export type ChatStopReason = (typeof CHAT_STOP_REASONS)[number];
