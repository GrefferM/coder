import type { WalkAct } from "./walk-act.interface";

/** The turn the machine named, as the adapter is handed it — everything the provider's answer comes back to. */
export type PutTurn = WalkAct<"askMachine">;
