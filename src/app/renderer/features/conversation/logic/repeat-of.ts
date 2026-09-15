import { runUnfinished } from "../../record";
import type { WholeRun } from "../../record";
import type { WalkEvent } from "../interfaces";

/**
 * The walk a repeat picks up, read out of the record by the question's id: every turn that did not answer, and
 * work that arrived at a point and was never taken up. A question the record does not hold picks up nothing.
 */
export function repeatOf(
  run: WholeRun,
  questionId: string,
  notSentTo: string | null,
  runKey: string,
): Extract<WalkEvent, { kind: "repeated" }> | null {
  // The question the row stood under, by the id the card carries.
  const stood = run.questions.find((question) => question.id === questionId) ?? null;

  if (stood === null) {
    return null;
  }

  return {
    kind: "repeated",
    left: runUnfinished(run, questionId),
    walk: [...run.walk].sort((one, other) => one.place - other.place),
    // A repeat asks the same agent the question stood before, and the record knows which — the
    // flow's first agent is a different fact, and a question handed on later never belonged to them.
    startAgentId: stood.askedAgentId,
    runKey,
    runId: run.id,
    questionId,
    askedAt: stood.askedAt.getTime(),
    notSentTo,
    asked: stood.asked,
  };
}
