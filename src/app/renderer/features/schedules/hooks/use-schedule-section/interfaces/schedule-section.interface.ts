import type { ProjectSchedule, UnsavedWork } from "../../../../../interfaces";
import type { ScheduleFormValues } from "../../../interfaces";

/** The schedules section's state: the open form and its draft, and the deletion question. */
export interface ScheduleSection {
  openScheduleId: string | "new" | null;
  openSchedule: ProjectSchedule | null;
  form: ScheduleFormValues | null;
  unsaved: UnsavedWork | null;
  armedSchedule: ProjectSchedule | null;
  openForm: (scheduleId: string | "new" | null) => void;
  editForm: (patch: Partial<ScheduleFormValues>) => void;
  saveForm: () => Promise<void>;
  arm: (scheduleId: string | null) => void;
  confirmDelete: () => void;
  dismissDelete: () => void;
}
