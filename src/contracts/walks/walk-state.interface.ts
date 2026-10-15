import type { RunLedger } from "./run-ledger.interface";
import type { TurnOut } from "./turn-out.interface";
import type { Walk } from "./walk.interface";
import type { PickedAttachment } from "../attachments";

/** Everything a stream's walks stand on, in one object; the machine takes it whole and gives it back whole. */
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
  /** Never filled in main: the screen keeps its own drafts. */
  drafts: Record<string, string>;
  /** Never filled in main: the screen keeps its own attachments. */
  attachments: Record<string, PickedAttachment[]>;
  /** Never set in main: the screen keeps its own aim. */
  aimedAgentId: string | null;
  /**
   * The row the on-screen stream writes into (one conversation is one row): the first row a walk of it opens, then moved
   * only at the person's word.
   */
  flowRunId: string | null;
}
