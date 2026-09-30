import type { WaitingSupplier } from "./waiting-supplier.interface";

/**
 * An agent of the conversation on screen holding work where lines converge, with every live supplier it waits on, in
 * line order.
 */
export interface WaitingAgent {
  agentId: string;
  suppliers: WaitingSupplier[];
  /** Every supplier has had its turn and the walk broke; it now waits for the repeat. */
  isAwaitingRepeat: boolean;
}
