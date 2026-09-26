import type { WalkState } from "../interfaces";

/** A stream with nothing in it — where every walk starts, and what «+ НОВИЙ ЧАТ» comes back to. */
export function emptyWalk(): WalkState {
  return {
    out: {},
    walks: {},
    ledgers: {},
    saidAgain: [],
    drafts: {},
    attachments: {},
    aimedAgentId: null,
    flowRunId: null,
  };
}
