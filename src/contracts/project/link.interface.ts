/** One directed link; the graph is acyclic. What a convergence does is the target's `waitsForAll`. */
export interface Link {
  id: string;
  from: string;
  to: string;
}
