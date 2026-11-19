import type { RunRow, WholeRun } from "../../../../../contracts";

/** The chosen sphere's past conversations in the widget: the list, the one opened from it, and their deleting. */
export interface WidgetHistory {
  /** The list stands in the output's place. */
  isOpen: boolean;
  /** The sphere's runs, newest first, as last listed. */
  runs: RunRow[];
  /** Those of them that have ended; a run still walking is not deleted. */
  endedRuns: RunRow[];
  /** The run opened from the list, which the conversation goes on in; `null` while the live one stands. */
  opened: WholeRun | null;
  /** The run a cross asked to delete, awaiting the answer. */
  doomedRun: RunRow | null;
  /** «× Видалити N» was pressed and awaits the answer. */
  isForgettingAll: boolean;
  /** Opens the list where the sphere has a run, and closes it where it stands open. */
  toggle: () => void;
  close: () => void;
  /** Opens a run: the output shows it, and the next question goes on in it. */
  open: (runId: string) => void;
  /** Back to the live conversation, the list closed. */
  leave: () => void;
  askToForget: (run: RunRow) => void;
  askToForgetAll: () => void;
  /** The question about deleting is taken back. */
  dismiss: () => void;
  /** Deletes what was asked about: the one run, or every ended one. */
  confirm: () => void;
}
