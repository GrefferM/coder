import type { ChatStopReason } from "./stop-reason.type";

/** Work that went down a link and never became a turn. */
export interface UnfinishedArrival {
  toAgentId: string;
  fromStepId: string;
  fromAgentId: string;
  text: string;
  /**
   * Why the link was not taken, as the record has it. Work that went through, or stopped for a reason that can change
   * (`off`, `busy`), is put again; a link the agent did not choose or ended stays cut.
   */
  stopReason: ChatStopReason | null;
}
