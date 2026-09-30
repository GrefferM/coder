/** Why a link out of a turn was not taken: the agent is off or busy. */
export const CHAT_STOP_REASONS = ["off", "busy"] as const;

export type ChatStopReason = (typeof CHAT_STOP_REASONS)[number];
