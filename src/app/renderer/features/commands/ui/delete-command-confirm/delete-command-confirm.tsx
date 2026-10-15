import { ConfirmDialog, Words } from "../../../../components";
import { DELETE_COMMAND_NOTE_PREFIX, DELETE_COMMAND_NOTE_SUFFIX, DELETE_COMMAND_QUESTION } from "./constants";
import type { DeleteCommandConfirmProps } from "./interfaces";

/** Command deletion question; the note says the agents granted it lose it. */
export function DeleteCommandConfirm({ command, onConfirm, onDismiss }: DeleteCommandConfirmProps) {
  return (
    <ConfirmDialog question={DELETE_COMMAND_QUESTION} onConfirm={onConfirm} onDismiss={onDismiss}>
      <Words>{`${DELETE_COMMAND_NOTE_PREFIX}${command.name}${DELETE_COMMAND_NOTE_SUFFIX}`}</Words>
    </ConfirmDialog>
  );
}
