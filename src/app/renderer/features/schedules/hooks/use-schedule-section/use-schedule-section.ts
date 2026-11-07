import { useState } from "react";
import { scheduleBlocker, scheduleChanges, scheduleFormValues } from "../../logic";
import type { UnsavedWork } from "../../../../interfaces";
import type { ScheduleFormValues } from "../../interfaces";
import type { ScheduleSection, ScheduleSectionParts } from "./interfaces";

/** The one form of the schedules section, opened on a schedule or on `new`, and the deletion question. */
export function useScheduleSection({ project, writes, schedules }: ScheduleSectionParts): ScheduleSection {
  const [openScheduleId, setOpenScheduleId] = useState<string | "new" | null>(null);
  const [edits, setEdits] = useState<Partial<ScheduleFormValues> | null>(null);
  const [isNewOn, setIsNewOn] = useState(false);
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
    setIsNewOn(false);
  }

  function editForm(patch: Partial<ScheduleFormValues>) {
    setEdits((previous) => ({
      ...previous,
      ...patch,
    }));
  }

  function switchOpen(isOn: boolean) {
    if (openSchedule === null) {
      setIsNewOn(isOn);

      return;
    }

    void schedules.switchOn(openSchedule.id, isOn);
  }

  /** Writes the form and closes it; a new schedule switched on in the form is switched on once written. */
  async function saveForm() {
    if (form === null || scheduleBlocker(form).length > 0) {
      return;
    }

    const scheduleId = await writes.saveSchedule(openSchedule?.id ?? null, form);

    if (openSchedule === null && isNewOn) {
      await schedules.switchOn(scheduleId, true);
    }

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
    isNewOn,
    unsaved,
    armedSchedule,
    openForm,
    editForm,
    switchOpen,
    saveForm,
    arm: setArmedScheduleId,
    confirmDelete,
    dismissDelete: () => setArmedScheduleId(null),
  };
}
