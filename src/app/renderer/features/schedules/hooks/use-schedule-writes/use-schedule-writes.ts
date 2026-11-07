import { useCallback } from "react";
import { writtenMinutes } from "../../logic";
import { DELETED_SCHEDULE_LABEL } from "../../constants";
import { WRITE_SCHEDULE_LABEL } from "../../../project";
import type { OpenProject, ProjectSchedule } from "../../../../interfaces";
import type { ProjectWrite } from "../../../project";
import type { ScheduleFormValues } from "../../interfaces";
import type { ScheduleWrites } from "./interfaces";

/** Every write the schedules make to the project's file, over the project's one writer. */
export function useScheduleWrites(project: OpenProject, write: ProjectWrite): ScheduleWrites {
  const { save, defer } = write;

  /** Writes a schedule — changed in place, or written for the first time. */
  const saveSchedule = useCallback(
    async (scheduleId: string | null, values: ScheduleFormValues) => {
      const existing = project.config.schedules.find((schedule) => schedule.id === scheduleId) ?? null;
      const schedule: ProjectSchedule = {
        id: existing?.id ?? crypto.randomUUID(),
        agentId: values.agentId,
        task: values.task.trim(),
        everyMinutes: writtenMinutes(values.everyMinutes),
        isActive: values.isActive,
      };

      await save(
        {
          ...project.config,
          schedules:
            existing === null
              ? [...project.config.schedules, schedule]
              : project.config.schedules.map((standing) => (standing.id === schedule.id ? schedule : standing)),
        },
        WRITE_SCHEDULE_LABEL,
      );
    },
    [project.config, save],
  );

  /** Takes a schedule away; the runs it put stay in the history. */
  const deleteSchedule = useCallback(
    async (scheduleId: string) => {
      await defer(
        {
          ...project.config,
          schedules: project.config.schedules.filter((schedule) => schedule.id !== scheduleId),
        },
        "schedule",
        project.config.schedules.find((schedule) => schedule.id === scheduleId)?.task ?? "",
        DELETED_SCHEDULE_LABEL,
        null,
      );
    },
    [defer, project.config],
  );

  return {
    saveSchedule,
    deleteSchedule,
  };
}
