/** Work that went down a link and never became a turn. */
export interface UnfinishedArrival {
  toAgentId: string;
  fromStepId: string;
  fromAgentId: string;
  text: string;
}
