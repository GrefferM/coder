import type { Agent, PackedAttachment, RecordedSound, RunLedger } from "../../../contracts";

export interface QuestionToWrite {
  ledger: RunLedger;
  directory: string;
  agent: Agent;
  text: string;
  attached: PackedAttachment[];
  /** The recordings the question was said with; none for a repeat or work down a line. */
  recordings: RecordedSound[];
  runKey: string;
}
