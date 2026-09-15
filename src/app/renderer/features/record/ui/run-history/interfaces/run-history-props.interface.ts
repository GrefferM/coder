import type { NamedAgent } from "../../../../../interfaces";
import type { RunHit, RunRow } from "../../../interfaces";

export interface RunHistoryProps {
  runs: RunRow[];
  /** The project's agents as they stand today, so a row's name is fresh and a gone one is known. */
  agents: NamedAgent[];
  /** The record could not be read; an empty list would say the wrong thing. */
  isFailed: boolean;
  /**
   * A row is pressed to read the run in the stream where it happened — and a found place is
   * pressed to land on that very message, so the press carries what was found where there was anything.
   */
  onOpen: (run: RunRow, found: RunHit | null) => void;
  /** The run this row stands for is to be taken out of the record for good. */
  onForget: (run: RunRow) => void;
  /** The word being looked for through the whole record; empty while nobody is looking. */
  query: string;
  /** One hit per run the word stands in — the found words themselves, and where a press should land. */
  hits: RunHit[];
  onQuery: (query: string) => void;
}
