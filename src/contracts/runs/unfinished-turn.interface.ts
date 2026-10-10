/** A turn that ended in anything but an answer, to be run again word for word. */
export interface UnfinishedTurn {
  agentId: string;
  asked: string;
  fromStepIds: string[];
}
