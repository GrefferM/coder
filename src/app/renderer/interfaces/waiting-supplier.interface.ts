import type { WaitingSupplierState } from "./waiting-supplier-state.type";

/** One supplier's row in the block over a waiting agent's chat. */
export interface WaitingSupplier {
  agentId: string;
  state: WaitingSupplierState;
  /** How long its turn took, in seconds, once it has answered; `null` until then. */
  seconds: number | null;
}
