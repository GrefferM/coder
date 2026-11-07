import { useCallback, useEffect, useState } from "react";
import { WALKS_WRITTEN_CHANNEL } from "../../../../../../contracts";
import { followSchedules, scheduleStandings } from "../../api";
import { SCHEDULE_BEAT_MS } from "../../constants";
import type { OpenProject, ScheduleStanding } from "../../../../interfaces";
import type { SchedulesState } from "./interfaces";

/**
 * The open project's schedules with the clock. The clock is handed the project whenever it changes, so the schedules
 * run while the project stays open, whatever section is on screen; their standings are asked again after every
 * write to the record, since a task put or ended moves them, and on a beat the countdowns read against.
 */
export function useSchedules(project: OpenProject): SchedulesState {
  const [standings, setStandings] = useState<Record<string, ScheduleStanding>>({});
  const [now, setNow] = useState(() => Date.now());

  const refresh = useCallback(async () => {
    const answer = await scheduleStandings();

    setStandings(Object.fromEntries(answer.map((standing) => [standing.scheduleId, standing])));
  }, []);

  // A clock the window cannot reach leaves the rows as they last stood.
  useEffect(() => {
    void followSchedules(project.directory, project.config)
      .then(refresh)
      .catch(() => undefined);
  }, [project.directory, project.config, refresh]);

  useEffect(
    () => window.electronApi.subscribe(WALKS_WRITTEN_CHANNEL, () => void refresh().catch(() => undefined)),
    [refresh],
  );

  useEffect(() => {
    const beat = setInterval(() => {
      setNow(Date.now());
      void refresh().catch(() => undefined);
    }, SCHEDULE_BEAT_MS);

    return () => clearInterval(beat);
  }, [refresh]);

  return {
    standings,
    now,
  };
}
