/** An agent the answering agent's line leads to, and can take work: what it is told of it when it chooses whom to hand to. */
export interface RouteFollower {
  agentId: string;
  name: string;
  /** What the follower is for, as its owner wrote it; null where unwritten. */
  purpose: string | null;
}
