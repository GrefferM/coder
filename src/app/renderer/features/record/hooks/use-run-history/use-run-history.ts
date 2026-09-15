import { useEffect, useState } from "react";
import { forgetRun, forgetRuns, listRuns } from "../../api";
import type { RunHistoryState, RunRow } from "../../interfaces";

/** The project's runs from this machine's record, read when the tab is opened and again on every write to it. */
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
    /** Gone from the record, and gone from the list without reading it again. */
    forget: async (runId: string) => {
      if (await forgetRun(runId)) {
        setRuns((standing) => standing.filter((run) => run.id !== runId));
      }
    },
    /** Gone for good, and the list is emptied without reading the record again. */
    forgetAll: async () => {
      if ((await forgetRuns(directory)) !== null) {
        setRuns([]);
      }
    },
  };
}
