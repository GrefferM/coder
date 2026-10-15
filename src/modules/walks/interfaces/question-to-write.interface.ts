import type { Agent, PackedAttachment, RunLedger } from "../../../contracts";

export interface QuestionToWrite {
  ledger: RunLedger;
  directory: string;
  agent: Agent;
  text: string;
  attached: PackedAttachment[];
  runKey: string;
}
