import { useEffect, useState } from "react";
import { ELAPSED_TICK_MS } from "./constants";
import { elapsedClock } from "../../utils/dates";
import { MS_IN_SECOND } from "../../utils/dates/constants";

/** How long something has been running, in whole seconds, counted from its start time and told once a second. */
export function useElapsedSeconds(startedAt: number): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setNow(Date.now());

    const tick = setInterval(() => setNow(Date.now()), ELAPSED_TICK_MS);

    return () => clearInterval(tick);
  }, [startedAt]);

  return Math.max(0, Math.floor((now - startedAt) / MS_IN_SECOND));
}

/** How long something has been running, as mm:ss, counted from its start time. */
export function useElapsed(startedAt: number): string {
  return elapsedClock(useElapsedSeconds(startedAt));
}
