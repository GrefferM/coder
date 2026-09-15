/** Work that went down a link and never became a turn — it stands where it landed. */
export interface UnfinishedArrival {
  toAgentId: string;
  fromStepId: string;
  fromAgentId: string;
  text: string;
}
