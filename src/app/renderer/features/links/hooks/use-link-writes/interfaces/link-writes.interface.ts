export interface LinkWrites {
  addLink: (fromAgentId: string, toAgentId: string) => Promise<void>;
  deleteLink: (linkId: string) => Promise<void>;
}
