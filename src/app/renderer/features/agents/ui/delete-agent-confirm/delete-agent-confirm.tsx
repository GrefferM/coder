import { ConfirmDialog, Words } from "../../../../components";
import { agentSchedulesNote, deletedAgentNote } from "../../words";
import { DELETE_AGENT_QUESTION } from "./constants";
import type { DeleteAgentConfirmProps } from "./interfaces";

/** Agent deletion question; names the neighbours left alone and the schedules left with no agent. */
export function DeleteAgentConfirm({
  name,
  neighbourNames,
  scheduleCount,
  onConfirm,
  onDismiss,
}: DeleteAgentConfirmProps) {
  const schedules = agentSchedulesNote(scheduleCount);

  return (
    <ConfirmDialog question={DELETE_AGENT_QUESTION} onConfirm={onConfirm} onDismiss={onDismiss}>
      <Words>
        {schedules === ""
          ? deletedAgentNote(name, neighbourNames)
          : `${deletedAgentNote(name, neighbourNames)} ${schedules}`}
      </Words>
    </ConfirmDialog>
  );
}
