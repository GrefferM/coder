import { ConfirmDialog, Words } from "../../../../components";
import { deleteServerNote } from "../../words";
import { DELETE_SERVER_QUESTION_PREFIX, DELETE_SERVER_QUESTION_SUFFIX } from "../../constants";
import type { DeleteServerConfirmProps } from "./interfaces";

/**
 * The question before a server goes. The heading names which one, and the line under it names
 * the burden in words — the grants the agents lose, and what leaves this machine's keychain. The row in the
 * project file is not named: every deed here changes that file, so it is not news.
 */
export function DeleteServerConfirm({ name, burden, onConfirm, onDismiss }: DeleteServerConfirmProps) {
  return (
    <ConfirmDialog
      question={`${DELETE_SERVER_QUESTION_PREFIX}${name}${DELETE_SERVER_QUESTION_SUFFIX}`}
      onConfirm={onConfirm}
      onDismiss={onDismiss}
    >
      <Words>{deleteServerNote(name, burden)}</Words>
    </ConfirmDialog>
  );
}
