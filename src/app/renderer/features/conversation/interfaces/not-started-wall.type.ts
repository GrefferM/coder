import type { NotStartedReason } from "../../../interfaces";

/**
 * The walls the **main process** refuses a turn with — one per refusal code `src/contracts` declares. Taken out
 * of the family rather than written beside it, so a member renamed there stops compiling here.
 */
export type MachineWall = Extract<NotStartedReason, "noKey" | "noAddress" | "silent" | "noProvider">;

/**
 * Every wall the card's own sentence is written for: the four the machine refuses with, and the one the screen
 * works out for itself before anything is sent. The other five reasons of the family say their piece elsewhere.
 */
export type NotStartedWall = MachineWall | Extract<NotStartedReason, "notFilled">;
