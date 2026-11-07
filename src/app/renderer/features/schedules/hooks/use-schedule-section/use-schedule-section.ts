import { useState } from "react";
import { scheduleBlocker, scheduleChanges, scheduleFormValues } from "../../logic";
import type { UnsavedWork } from "../../../../interfaces";
import type { ScheduleFormValues } from "../../interfaces";
import type { ScheduleSection, ScheduleSectionParts } from "./interfaces";

/** The one form of the schedules section, opened on a schedule or on `new`, and the deletion question. */
export function useScheduleSection({ project, writes }: ScheduleSectionParts): ScheduleSection {
  const [openScheduleId, setOpenScheduleId] = useState<string | "new" | null>(null);
  const [edits, setEdits] = useState<Partial<ScheduleFormValues> | null>(null);
  const [armedScheduleId, setArmedScheduleId] = useState<string | null>(null);

  const { agents } = project.config;
  const openSchedule = project.config.schedules.find((schedule) => schedule.id === openScheduleId) ?? null;
  const armedSchedule = project.config.schedules.find((schedule) => schedule.id === armedScheduleId) ?? null;
  const saved = openScheduleId === null ? null : scheduleFormValues(openSchedule);
  const form =
    saved === null
      ? null
      : {
          ...saved,
          ...edits,
        };
  const changes = saved === null || form === null ? [] : scheduleChanges(saved, form, agents);
  const unsaved: UnsavedWork | null =
    changes.length === 0 || form === null
      ? null
      : {
          name: form.task,
          changes,
          blocked: scheduleBlocker(form),
          blockedNote: null,
          save: saveForm,
          discard: () => setEdits(null),
        };

  /** Opens the form on a schedule, empty on `new`; `null` closes it. */
  function openForm(scheduleId: string | "new" | null) {
    setOpenScheduleId(scheduleId);
    setEdits(null);
  }

  function editForm(patch: Partial<ScheduleFormValues>) {
    setEdits((previous) => ({
      ...previous,
      ...patch,
    }));
  }

  /** Writes the form and closes it, new schedules included. */
  async function saveForm() {
    if (form === null || scheduleBlocker(form).length > 0) {
      return;
    }

    await writes.saveSchedule(openSchedule?.id ?? null, form);
    openForm(null);
  }

  /** The question's yes: the schedule goes; the runs it put stay. */
  function confirmDelete() {
    const leaving = armedScheduleId;

    setArmedScheduleId(null);

    if (leaving === null) {
      return;
    }

    if (leaving === openScheduleId) {
      openForm(null);
    }

    void writes.deleteSchedule(leaving);
  }

  return {
    openScheduleId,
    openSchedule,
    form,
    unsaved,
    armedSchedule,
    openForm,
    editForm,
    saveForm,
    arm: setArmedScheduleId,
    confirmDelete,
    dismissDelete: () => setArmedScheduleId(null),
  };
}
