import { useEffect, useState } from "react";
import { useOpenedRun } from "../use-opened-run";
import { WALKS_WRITTEN_CHANNEL } from "../../../../../../contracts";
import type { WholeRun } from "../../interfaces";

/** The record of the conversation going on, re-read on every write, for a screen that keeps no count of the writes. */
export function useLiveRun(runId: string | null): WholeRun | null {
  const [written, setWritten] = useState(0);
  const { run } = useOpenedRun(runId, written);

  useEffect(() => window.electronApi.subscribe(WALKS_WRITTEN_CHANNEL, () => setWritten((was) => was + 1)), []);

  return run;
}
