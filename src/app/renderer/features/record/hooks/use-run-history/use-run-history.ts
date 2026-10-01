import { useEffect, useState } from "react";
import { forgetRun, forgetRuns, listRuns } from "../../api";
import { RECORD_UNFORGOTTEN_NOTE, RECORD_UNREAD_NOTE } from "../../constants";
import { recordNote } from "../../words";
import { thrownWords } from "../../../../utils/errors";
import type { RunHistoryState, RunRow } from "../../interfaces";

/** The project's runs from this machine's record, read when the tab opens and on every write. */
export function useRunHistory(directory: string, isOpen: boolean, written: number): RunHistoryState {
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [refusal, setRefusal] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let stands = true;

    void listRuns(directory).then(
      (rows) => {
        if (stands) {
          setRefusal(null);
          setRuns(rows);
        }
      },
      (failure: unknown) => {
        if (stands) {
          setRefusal(recordNote(RECORD_UNREAD_NOTE, thrownWords(failure)));
          setRuns([]);
        }
      },
    );

    return () => {
      stands = false;
    };
  }, [directory, isOpen, written]);

  /** Runs a removal; one the record declined takes nothing off the list, and a refused one is said too. */
  async function removed(remove: () => Promise<boolean | number>): Promise<boolean> {
    try {
      return (await remove()) !== false;
    } catch (failure) {
      setRefusal(recordNote(RECORD_UNFORGOTTEN_NOTE, thrownWords(failure)));

      return false;
    }
  }

  return {
    runs,
    refusal,
    /** Removed from the record and from the list without re-reading. */
    forget: async (runId: string) => {
      const isGone = await removed(() => forgetRun(runId));

      if (isGone) {
        setRuns((standing) => standing.filter((run) => run.id !== runId));
      }

      return isGone;
    },
    /** All removed; the list is emptied without re-reading. */
    forgetAll: async () => {
      const isGone = await removed(() => forgetRuns(directory));

      if (isGone) {
        setRuns([]);
      }

      return isGone;
    },
  };
}
