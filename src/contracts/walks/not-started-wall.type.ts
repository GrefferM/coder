import type { NotStartedReason } from "../llm";

/**
 * Walls the **main process** refuses a turn with, one per refusal code in `llm`; extracted from the family so
 * a rename there breaks compilation here.
 */
export type MachineWall = Extract<NotStartedReason, "noKey" | "noAddress" | "silent" | "noProvider">;

/**
 * Every wall the card's own sentence is written for: the four the machine refuses with, and `notFilled`, which the
 * screen works out before sending.
 */
export type NotStartedWall = MachineWall | Extract<NotStartedReason, "notFilled">;
