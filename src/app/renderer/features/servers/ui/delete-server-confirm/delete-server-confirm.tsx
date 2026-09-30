import { ConfirmDialog, Words } from "../../../../components";
import { deleteServerNote } from "../../words";
import { DELETE_SERVER_QUESTION_PREFIX, DELETE_SERVER_QUESTION_SUFFIX } from "../../constants";
import type { DeleteServerConfirmProps } from "./interfaces";

/**
 * The question before a server goes: the heading names it and the line under it names the burden (the grants lost and
 * what leaves the keychain). The project-file row is not named.
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
