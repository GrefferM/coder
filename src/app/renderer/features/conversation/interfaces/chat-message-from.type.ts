/**
 * Turn author: the person, the agent whose chat it is, `supplier` (work arrived), `handoff` (work handed on) or
 * `notSent` (a question aimed at a switched-off agent, which never went and has no sender behind it).
 */
export type ChatMessageFrom = "person" | "agent" | "supplier" | "handoff" | "notSent";
