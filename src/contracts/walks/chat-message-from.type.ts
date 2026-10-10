/**
 * Turn author: the person, the chat's agent, `supplier` (work arrived), `handoff` (work handed on) or `notSent` (a
 * question aimed at a switched-off agent; never went, no sender).
 */
export type ChatMessageFrom = "person" | "agent" | "supplier" | "handoff" | "notSent";
