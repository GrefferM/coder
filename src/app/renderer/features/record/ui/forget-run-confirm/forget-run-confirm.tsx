import { ConfirmDialog, Words } from "../../../../components";
import { dayLabel, timeLabel } from "../../../../utils/dates";
import { FORGET_RUN_NOTE_PREFIX, FORGET_RUN_NOTE_SUFFIX, FORGET_RUN_QUESTION } from "./constants";
import type { ForgetRunConfirmProps } from "./interfaces";

/** Asks before deleting a run, which has no undo. */
export function ForgetRunConfirm({ run, onConfirm, onDismiss }: ForgetRunConfirmProps) {
  const when = `${dayLabel(run.startedAt, new Date())} ${timeLabel(run.startedAt)}`;

  return (
    <ConfirmDialog question={FORGET_RUN_QUESTION} onConfirm={onConfirm} onDismiss={onDismiss}>
      <Words>{`${FORGET_RUN_NOTE_PREFIX}${when}${FORGET_RUN_NOTE_SUFFIX}`}</Words>
    </ConfirmDialog>
  );
}
