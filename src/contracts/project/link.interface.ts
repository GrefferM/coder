/** One directed link; the graph is acyclic, and at a convergence the agent works once after every live supplier. */
export interface Link {
  id: string;
  from: string;
  to: string;
}
