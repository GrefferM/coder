import type { WaitingSupplier } from "./waiting-supplier.interface";

/**
 * An agent of the conversation on screen holding work where lines converge, with every live
 * supplier that walk waits on, in line order.
 */
export interface WaitingAgent {
  agentId: string;
  suppliers: WaitingSupplier[];
  /** Every supplier has had its turn and the walk broke — what it waits for now is the repeat. */
  isAwaitingRepeat: boolean;
}
