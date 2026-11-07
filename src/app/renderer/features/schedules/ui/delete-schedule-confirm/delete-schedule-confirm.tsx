import { ConfirmDialog, Words } from "../../../../components";
import { DELETE_SCHEDULE_NOTE_PREFIX, DELETE_SCHEDULE_NOTE_SUFFIX, DELETE_SCHEDULE_QUESTION } from "./constants";
import type { DeleteScheduleConfirmProps } from "./interfaces";

/** The schedule's deletion question; the note says the runs it put stay. */
export function DeleteScheduleConfirm({ agentName, onConfirm, onDismiss }: DeleteScheduleConfirmProps) {
  const named = agentName === null ? "" : ` ${agentName}`;

  return (
    <ConfirmDialog question={`${DELETE_SCHEDULE_QUESTION}${named}?`} onConfirm={onConfirm} onDismiss={onDismiss}>
      <Words>{`${DELETE_SCHEDULE_NOTE_PREFIX}${named}${DELETE_SCHEDULE_NOTE_SUFFIX}`}</Words>
    </ConfirmDialog>
  );
}
