import type { IncomingWork } from "./incoming-work.interface";

/** Work held where lines converge, until every live supplier has had its turn — answered or not. */
export interface WaitedWork {
  /** The agent the person spoke to; the run's reach is worked out from it. */
  startAgentId: string;
  /** Every live supplier this run reaches, in the order their lines were drawn. */
  awaitedIds: string[];
  /** Suppliers whose turn has ended, whether it answered or not. */
  settledIds: string[];
  /** What arrived, in arrival order. */
  arrived: IncomingWork[];
  /** The lines answers came in by, in arrival order, for the marks on them and on the turn that follows. */
  viaLinkIds: string[];
  /** The walk broke under this point, so it stands until a hand runs the broken step again. */
  isAwaitingRepeat: boolean;
  /**
   * The point does not wait: it holds this tally only to know, once every supplier has settled, whether
   * anything came at all. It is no wait the person should see, so the screen draws it no pill.
   */
  isSilent: boolean;
}
