/**
 * A turn that is still out, found by its own id. `viaLinkIds` is empty when a person asked, and holds every line the
 * work arrived by.
 */
export interface TurnOut {
  turnId: string;
  /** Whose turn it is. An agent may have several out at once — one for each walk asking it. */
  agentId: string;
  startedAt: number;
  viaLinkIds: string[];
  /** Which walk it belongs to, so a walk put away with the stream draws nothing there. */
  runKey: string;
}
