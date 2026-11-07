import type { Agent, ProjectSchedule } from "../../../../../interfaces";
import type { ScheduleFormValues } from "../../../interfaces";

export interface ScheduleFormProps {
  values: ScheduleFormValues;
  /** The schedule as written; null for a new one. */
  schedule: ProjectSchedule | null;
  agents: Agent[];
  /** Whether the form moved away from what is written. */
  isDirty: boolean;
  onChange: (patch: Partial<ScheduleFormValues>) => void;
  onSave: () => Promise<void>;
  /** Back to the list, or the draft dropped where the foot offers that. */
  onCancel: () => void;
  onRevert: () => void;
  onDelete: () => void;
}
