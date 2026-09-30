import type { RunLedger } from "./run-ledger.interface";
import type { TurnOut } from "./turn-out.interface";
import type { Walk } from "./walk.interface";
import type { PickedAttachment } from "../../../interfaces";

/** Everything a stream's walks stand on, in one object, so views never learn which parts are state and which refs. */
export interface WalkState {
  /** Turns out now, by id; one agent may hold several. */
  out: Record<string, TurnOut>;
  /**
   * Every walk this stream holds, by id: its words, waits, and whether stopped or put away. What a walk said lives in it,
   * safe from other walks and from an emptied stream.
   */
  walks: Record<string, Walk>;
  /** What is being written about each run under way. */
  ledgers: Record<string, RunLedger>;
  /** Turns already asked again; the act stands under a turn until used. */
  saidAgain: string[];
  /** What is typed in each stream: the one on screen and every run opened in its place. */
  drafts: Record<string, string>;
  /** Files and folders attached in each stream, waiting under the field for the question to go. */
  attachments: Record<string, PickedAttachment[]>;
  /** Whom the chat is aimed at. */
  aimedAgentId: string | null;
  /**
   * The row the on-screen stream writes into (one conversation is one row); moves only at the person's word, never when a
   * walk writes steps.
   */
  flowRunId: string | null;
}
