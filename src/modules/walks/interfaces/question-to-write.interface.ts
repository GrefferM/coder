import type { Agent, PackedAttachment, RunLedger } from "../../../contracts";

/** A question as the record writer takes it: the walk's ledger, the project's folder, and what was asked. */
export interface QuestionToWrite {
  ledger: RunLedger;
  directory: string;
  agent: Agent;
  text: string;
  attached: PackedAttachment[];
  runKey: string;
}
