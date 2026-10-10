import type { IncomingWork } from "./incoming-work.interface";

/** Work held where lines converge until every live supplier has had its turn, answered or not. */
export interface WaitedWork {
  /** The agent the person spoke to; the run's reach is computed from it. */
  startAgentId: string;
  /** Every live supplier this run reaches, in line-drawing order. */
  awaitedIds: string[];
  /** Suppliers whose turn has ended, whether it answered or not. */
  settledIds: string[];
  /** What arrived, in arrival order. */
  arrived: IncomingWork[];
  /** Lines answers came in by, in arrival order, for the marks on them and on the next turn. */
  viaLinkIds: string[];
  /** The walk broke under this point, which stands until a hand repeats the broken step. */
  isAwaitingRepeat: boolean;
  /**
   * The point does not wait: it holds this tally only to know, once every supplier has settled, whether anything came;
   * the screen draws no pill for it.
   */
  isSilent: boolean;
}
