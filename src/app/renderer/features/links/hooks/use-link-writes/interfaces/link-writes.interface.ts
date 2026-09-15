/** A line drawn between two agents, and a line taken away. */
export interface LinkWrites {
  addLink: (fromAgentId: string, toAgentId: string) => Promise<void>;
  deleteLink: (linkId: string) => Promise<void>;
}
