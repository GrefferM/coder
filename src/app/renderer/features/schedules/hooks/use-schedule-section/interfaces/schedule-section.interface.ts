import type { ProjectSchedule, UnsavedWork } from "../../../../../interfaces";
import type { ScheduleFormValues } from "../../../interfaces";

/** The schedules section's state: the open form and its draft, and the deletion question. */
export interface ScheduleSection {
  openScheduleId: string | "new" | null;
  openSchedule: ProjectSchedule | null;
  form: ScheduleFormValues | null;
  /** Whether a schedule not written yet is switched on once it is. */
  isNewOn: boolean;
  unsaved: UnsavedWork | null;
  armedSchedule: ProjectSchedule | null;
  openForm: (scheduleId: string | "new" | null) => void;
  editForm: (patch: Partial<ScheduleFormValues>) => void;
  /** On a written schedule, switches this machine at once; on a new one, once it is written. */
  switchOpen: (isOn: boolean) => void;
  saveForm: () => Promise<void>;
  arm: (scheduleId: string | null) => void;
  confirmDelete: () => void;
  dismissDelete: () => void;
}
