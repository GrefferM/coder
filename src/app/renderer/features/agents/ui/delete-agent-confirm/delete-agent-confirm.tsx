import { ConfirmDialog, Words } from "../../../../components";
import { deletedAgentNote } from "../../words";
import { DELETE_AGENT_QUESTION } from "./constants";
import type { DeleteAgentConfirmProps } from "./interfaces";

/** Agent deletion question; names the neighbours left alone. */
export function DeleteAgentConfirm({ name, neighbourNames, onConfirm, onDismiss }: DeleteAgentConfirmProps) {
  return (
    <ConfirmDialog question={DELETE_AGENT_QUESTION} onConfirm={onConfirm} onDismiss={onDismiss}>
      <Words>{deletedAgentNote(name, neighbourNames)}</Words>
    </ConfirmDialog>
  );
}
