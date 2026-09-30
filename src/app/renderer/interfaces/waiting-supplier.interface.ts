import type { WaitingSupplierState } from "./waiting-supplier-state.type";

/** One supplier's row in the block over a waiting agent's chat. */
export interface WaitingSupplier {
  agentId: string;
  state: WaitingSupplierState;
  /** How long its turn took, seconds; `null` until it has answered. */
  seconds: number | null;
}
