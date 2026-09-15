import type { RunLedger } from "./run-ledger.interface";
import type { TurnOut } from "./turn-out.interface";
import type { Walk } from "./walk.interface";

/**
 * Everything a stream's walks stand on, in one object. The hook holds it in React state today; the views
 * read it from here, so they never learn which of its parts is a state and which a ref.
 */
export interface WalkState {
  /** The turns out right now, each by its own id; one agent may hold several. */
  out: Record<string, TurnOut>;
  /**
   * Every walk this stream holds, by its own id — its words, its waits, and whether it was stopped or put
   * away. What a walk said lives in the walk: no other walk and no emptied stream can take it away.
   */
  walks: Record<string, Walk>;
  /** What is being written about each run under way. */
  ledgers: Record<string, RunLedger>;
  /** The turns already asked again; the act stands under a turn until it is used. */
  saidAgain: string[];
  /** What stands typed in each stream, the one on screen and every run opened in its place. */
  drafts: Record<string, string>;
  /** Whom the chat is aimed at. */
  aimedAgentId: string | null;
  /**
   * The row the stream on screen writes into — one conversation is one row. It moves at the person's word
   * alone; a walk writing its steps never moves it, not even its own.
   */
  flowRunId: string | null;
}
