import type { WalkAct } from "./walk-act.interface";

/** The turn the machine named, as the adapter receives it. */
export type PutTurn = WalkAct<"askMachine">;
