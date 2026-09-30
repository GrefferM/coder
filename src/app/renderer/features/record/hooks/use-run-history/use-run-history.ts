import { useEffect, useState } from "react";
import { forgetRun, forgetRuns, listRuns } from "../../api";
import type { RunHistoryState, RunRow } from "../../interfaces";

/** The project's runs from this machine's record, read when the tab opens and on every write. */
export function useRunHistory(directory: string, isOpen: boolean, written: number): RunHistoryState {
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [isFailed, setIsFailed] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let stands = true;

    void listRuns(directory).then((rows) => {
      if (!stands) {
        return;
      }

      setIsFailed(rows === null);
      setRuns(rows ?? []);
    });

    return () => {
      stands = false;
    };
  }, [directory, isOpen, written]);

  return {
    runs,
    isFailed,
    /** Removed from the record and from the list without re-reading. */
    forget: async (runId: string) => {
      if (await forgetRun(runId)) {
        setRuns((standing) => standing.filter((run) => run.id !== runId));
      }
    },
    /** All removed; the list is emptied without re-reading. */
    forgetAll: async () => {
      if ((await forgetRuns(directory)) !== null) {
        setRuns([]);
      }
    },
  };
}
