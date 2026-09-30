import type { NamedAgent } from "../../../../../interfaces";
import type { RunHit, RunRow } from "../../../interfaces";

export interface RunHistoryProps {
  runs: RunRow[];
  /** The project's current agents; row names are looked up by id and a gone agent is known. */
  agents: NamedAgent[];
  /** The record could not be read, so an empty list would mislead. */
  isFailed: boolean;
  /** Opens the run in the stream; for a found place it carries the hit so the stream lands on that message. */
  onOpen: (run: RunRow, found: RunHit | null) => void;
  /** Takes the run out of the record for good. */
  onForget: (run: RunRow) => void;
  /** The word searched through the whole record; empty when not searching. */
  query: string;
  /** One hit per place the word stands in: the found words and where a press lands. */
  hits: RunHit[];
  onQuery: (query: string) => void;
}
