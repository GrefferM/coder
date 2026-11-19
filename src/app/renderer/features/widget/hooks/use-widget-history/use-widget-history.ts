import { useCallback, useEffect, useState } from "react";
import { freshWalks, goOnInWalks, letGoWalks } from "../../../conversation";
import { forgetRun, listRuns, useOpenedRun } from "../../../record";
import { WALKS_WRITTEN_CHANNEL } from "../../../../../../contracts";
import { thrownWords } from "../../../../utils/errors";
import type { RunRow } from "../../../../../../contracts";
import type { WidgetHistory, WidgetHistoryHands } from "../../interfaces";

/**
 * The chosen sphere's past conversations, from this machine's record: listed when asked for and again with every
 * write while the list stands open, one opened to read and go on in, and deleted one at a time or all at once. A list
 * left with no run of the sphere closes itself.
 */
export function useWidgetHistory({ directory, sphereId, onNote }: WidgetHistoryHands): WidgetHistory {
  const [isOpen, setIsOpen] = useState(false);
  /** The project's runs as last listed. */
  const [listed, setListed] = useState<RunRow[]>([]);
  const [openedRunId, setOpenedRunId] = useState<string | null>(null);
  /** How many times the record has been written to, so the list and the opened run follow it. */
  const [written, setWritten] = useState(0);
  const [doomedRun, setDoomedRun] = useState<RunRow | null>(null);
  const [isForgettingAll, setIsForgettingAll] = useState(false);
  const opened = useOpenedRun(openedRunId, written);
  const runs = listed.filter((run) => run.startedByAgentId === sphereId);
  const endedRuns = runs.filter((run) => run.endedAt !== null);

  useEffect(() => window.electronApi.subscribe(WALKS_WRITTEN_CHANNEL, () => setWritten((was) => was + 1)), []);

  // Another project has a history of its own.
  useEffect(() => {
    setIsOpen(false);
    setListed([]);
    setOpenedRunId(null);
  }, [directory]);

  const list = useCallback(async () => {
    if (directory === undefined || directory === null) {
      return [];
    }

    const rows = await listRuns(directory);

    setListed(rows);

    return rows;
  }, [directory]);

  useEffect(() => {
    if (isOpen) {
      void list();
    }
  }, [isOpen, written, list]);

  // Left with no run of the sphere, as after deleting them all, the list folds away.
  useEffect(() => {
    if (isOpen && runs.length === 0) {
      setIsOpen(false);
    }
  }, [isOpen, runs.length]);

  /** Deletes the runs the record lets go, with their conversations; the opened one gone, the conversation is fresh. */
  const forget = async (doomed: RunRow[]) => {
    const gone: string[] = [];

    for (const run of doomed) {
      // A run the record declines, as one still walking, stays on the list.
      if (await forgetRun(run.id)) {
        gone.push(run.id);
        await letGoWalks(run.id);
      }
    }

    setListed((standing) => standing.filter((run) => !gone.includes(run.id)));

    if (openedRunId !== null && gone.includes(openedRunId)) {
      setOpenedRunId(null);
      await freshWalks();
    }
  };

  return {
    isOpen,
    runs,
    endedRuns,
    opened: opened.run,
    doomedRun,
    isForgettingAll,
    toggle: () => {
      if (isOpen) {
        setIsOpen(false);

        return;
      }

      // A sphere with no runs has no history to show.
      void list().then((rows) => {
        if (rows.some((run) => run.startedByAgentId === sphereId)) {
          setIsOpen(true);
        }
      });
    },
    close: () => setIsOpen(false),
    open: (runId) => {
      setIsOpen(false);
      void goOnInWalks(runId).then(() => setOpenedRunId(runId));
    },
    leave: () => {
      setIsOpen(false);
      setOpenedRunId(null);
    },
    askToForget: setDoomedRun,
    askToForgetAll: () => setIsForgettingAll(true),
    dismiss: () => {
      setDoomedRun(null);
      setIsForgettingAll(false);
    },
    confirm: () => {
      const doomed = doomedRun === null ? endedRuns : [doomedRun];

      setDoomedRun(null);
      setIsForgettingAll(false);
      // A refused removal is said on the widget's line.
      void forget(doomed).catch((failure: unknown) =>
        onNote({
          words: thrownWords(failure),
          act: null,
        }),
      );
    },
  };
}
