import type { WalkState } from "./walk-state.interface";

/** What the screen is told of a conversation's walks: everything of them that is not the screen's own. */
export type WalkSnapshot = Pick<WalkState, "out" | "walks" | "saidAgain" | "flowRunId">;
