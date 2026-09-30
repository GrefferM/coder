import { useEffect, useState } from "react";
import { readRun } from "../../api";
import type { OpenedRunState, WholeRun } from "../../interfaces";

/** The pressed row's run, read whole and re-read on every write; unreadable is reported. */
export function useOpenedRun(runId: string | null, written: number): OpenedRunState {
  const [run, setRun] = useState<WholeRun | null>(null);
  const [isFailed, setIsFailed] = useState(false);

  useEffect(() => {
    if (runId === null) {
      setRun(null);
      setIsFailed(false);

      return;
    }

    let stands = true;

    void readRun(runId).then((opened) => {
      if (!stands) {
        return;
      }

      setIsFailed(opened === null);
      setRun(opened);
    });

    return () => {
      stands = false;
    };
  }, [runId, written]);

  return {
    run,
    isFailed,
  };
}
