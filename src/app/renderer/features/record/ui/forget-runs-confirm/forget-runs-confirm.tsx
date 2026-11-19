import { ConfirmDialog, Words } from "../../../../components";
import { ukrainianPlural } from "../../../../utils/text";
import { runsSpanLabel } from "../../words";
import {
  FORGET_AGENT_RUNS_NOTE,
  FORGET_AGENT_RUNS_NOTE_PREFIX,
  FORGET_AGENT_RUNS_NOTE_SUFFIX,
  FORGET_RUNS_FEW,
  FORGET_RUNS_MANY,
  FORGET_RUNS_NOTE,
  FORGET_RUNS_NOTE_SUFFIX,
  FORGET_RUNS_ONE,
  FORGET_RUNS_QUESTION_PREFIX,
  FORGET_RUNS_QUESTION_SUFFIX,
  FORGET_RUNS_YES_PREFIX,
} from "./constants";
import type { ForgetRunsConfirmProps } from "./interfaces";

/** Confirms forgetting many runs: the number, the days it spans, and what it leaves alone — a project's, or one agent's. */
export function ForgetRunsConfirm({ runs, agentName, onConfirm, onDismiss }: ForgetRunsConfirmProps) {
  const now = new Date();
  const span = runsSpanLabel(runs, now);
  const note =
    agentName === undefined
      ? `${FORGET_RUNS_NOTE}${span}${FORGET_RUNS_NOTE_SUFFIX}`
      : `${FORGET_AGENT_RUNS_NOTE_PREFIX}${agentName}${FORGET_AGENT_RUNS_NOTE}${span}${FORGET_AGENT_RUNS_NOTE_SUFFIX}`;
  const counted = `${runs.length}${ukrainianPlural(runs.length, FORGET_RUNS_ONE, FORGET_RUNS_FEW, FORGET_RUNS_MANY)}`;

  return (
    <ConfirmDialog
      question={`${FORGET_RUNS_QUESTION_PREFIX}${counted}${FORGET_RUNS_QUESTION_SUFFIX}`}
      yesLabel={`${FORGET_RUNS_YES_PREFIX}${runs.length}`}
      onConfirm={onConfirm}
      onDismiss={onDismiss}
    >
      <Words>{note}</Words>
    </ConfirmDialog>
  );
}
