import {
  SCHEDULE_ACTIVE_CHANGE_LABEL,
  SCHEDULE_ACTIVE_DROPPED_LABEL,
  SCHEDULE_ACTIVE_OFF_LABEL,
  SCHEDULE_ACTIVE_ON_LABEL,
  SCHEDULE_AGENT_CHANGE_LABEL,
  SCHEDULE_AGENT_DROPPED_LABEL,
  SCHEDULE_INTERVAL_CHANGE_LABEL,
  SCHEDULE_INTERVAL_DROPPED_LABEL,
  SCHEDULE_TASK_CHANGE_LABEL,
  SCHEDULE_TASK_DROPPED_LABEL,
} from "../constants";
import type { Agent, FieldChange } from "../../../interfaces";
import type { ScheduleFormValues } from "../interfaces";

/** Fields of a schedule's form changed from the saved values; the agent compares by id and is told by name. */
export function scheduleChanges(saved: ScheduleFormValues, form: ScheduleFormValues, agents: Agent[]): FieldChange[] {
  const agentChange: FieldChange[] =
    saved.agentId === form.agentId
      ? []
      : [
          {
            label: SCHEDULE_AGENT_CHANGE_LABEL,
            droppedLabel: SCHEDULE_AGENT_DROPPED_LABEL,
            was: agentName(saved.agentId, agents),
            now: agentName(form.agentId, agents),
          },
        ];
  const written: FieldChange[] = [
    {
      label: SCHEDULE_TASK_CHANGE_LABEL,
      droppedLabel: SCHEDULE_TASK_DROPPED_LABEL,
      was: saved.task,
      now: form.task,
    },
    {
      label: SCHEDULE_INTERVAL_CHANGE_LABEL,
      droppedLabel: SCHEDULE_INTERVAL_DROPPED_LABEL,
      was: saved.everyMinutes,
      now: form.everyMinutes,
    },
    {
      label: SCHEDULE_ACTIVE_CHANGE_LABEL,
      droppedLabel: SCHEDULE_ACTIVE_DROPPED_LABEL,
      was: saved.isActive ? SCHEDULE_ACTIVE_ON_LABEL : SCHEDULE_ACTIVE_OFF_LABEL,
      now: form.isActive ? SCHEDULE_ACTIVE_ON_LABEL : SCHEDULE_ACTIVE_OFF_LABEL,
    },
  ];

  return [...agentChange, ...written.filter((change) => change.was !== change.now)];
}

function agentName(agentId: string | null, agents: Agent[]): string {
  return agents.find((agent) => agent.id === agentId)?.name ?? "";
}
