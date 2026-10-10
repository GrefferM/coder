/**
 * A turn still out, found by its id. `viaLinkIds` is empty when a person asked, else holds every line the work arrived
 * by.
 */
export interface TurnOut {
  turnId: string;
  /** Whose turn it is; an agent may have several out, one per walk asking it. */
  agentId: string;
  startedAt: number;
  viaLinkIds: string[];
  /** The walk it belongs to, so a walk put away with the stream draws nothing. */
  runKey: string;
}
