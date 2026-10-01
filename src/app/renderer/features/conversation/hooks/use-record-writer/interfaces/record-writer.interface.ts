import type { Agent, PackedAttachment } from "../../../../../interfaces";
import type { RunLedger, WrittenTurn } from "../../../interfaces";

/**
 * The one writer of this stream's record; each walk writes in run order (question, steps, closing) and nothing of a
 * walk overtakes another part of it.
 */
export interface RecordWriter {
  /** The walks this stream is writing, as the walk state reads them. */
  walks: () => Record<string, RunLedger>;
  /** A walk begins: from here its words are written under it. */
  hold: (runKey: string, ledger: RunLedger) => void;
  /** A walk is over or was let go: the writer holds it no longer. */
  drop: (runKey: string) => void;
  /** The person's question, written when asked: opens the row or goes on in the standing one; rejects when refused. */
  askQuestion: (
    ledger: RunLedger,
    directory: string,
    agent: Agent,
    text: string,
    attached: PackedAttachment[],
    runKey: string,
  ) => Promise<void>;
  /** One finished turn, written after everything its walk wrote before; gives the step's id, rejects when refused. */
  writeTurn: (ledger: RunLedger, runKey: string, turn: WrittenTurn) => Promise<string>;
  /** The walk's last turn is back; its row closes with it; rejects when refused. */
  closeWalk: (ledger: RunLedger, runKey: string, endedAt: number) => Promise<void>;
  /** Everything one walk wrote, landed or refused; only that walk's own. */
  settled: (runKey?: string) => Promise<void>;
  /** Forgets the row this stream keeps writing into; called when the conversation ends. */
  forgetOpening: () => void;
}
