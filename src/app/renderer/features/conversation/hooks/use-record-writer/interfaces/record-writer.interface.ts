import type { Agent } from "../../../../../interfaces";
import type { RunLedger, WrittenTurn } from "../../../interfaces";

/**
 * The one hand that writes this stream's record. Every walk writes in the order it ran — a question, then
 * its steps, then the closing — and nothing of a walk overtakes anything else of it.
 */
export interface RecordWriter {
  /** The walks this stream is writing, as the walk state reads them. */
  walks: () => Record<string, RunLedger>;
  /** A walk begins: from here its words are written under it. */
  hold: (runKey: string, ledger: RunLedger) => void;
  /** A walk is over or was let go: the writer holds it no longer. */
  drop: (runKey: string) => void;
  /** The person's question, written the moment it is asked — it opens the row or goes on in the one standing. */
  askQuestion: (ledger: RunLedger, directory: string, agent: Agent, text: string, runKey: string) => void;
  /** One finished turn, written after everything this walk wrote before it. */
  writeTurn: (ledger: RunLedger, runKey: string, turn: WrittenTurn, onStep: (stepId: string) => void) => void;
  /** The last turn of the walk is back; its row closes with it unless another walk of the row is out. */
  closeWalk: (ledger: RunLedger, runKey: string, endedAt: number) => void;
  /** Everything one walk wrote — the record has to hold what happened a moment ago, and only that walk's own. */
  settled: (runKey?: string) => Promise<void>;
  /** The row this stream goes on writing into is forgotten with the conversation. */
  forgetOpening: () => void;
}
