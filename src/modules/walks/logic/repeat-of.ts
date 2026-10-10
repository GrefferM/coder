import { runUnfinished } from "../../../contracts";
import type { WalkEvent, WholeRun } from "../../../contracts";

/**
 * The walk a repeat picks up from the record by question id: every turn that did not answer, and work that reached a
 * point and was never taken up; nothing for an unknown question.
 */
export function repeatOf(
  run: WholeRun,
  questionId: string,
  notSentTo: string | null,
  runKey: string,
): Extract<WalkEvent, { kind: "repeated" }> | null {
  // The question the row stood under, by the card's id.
  const stood = run.questions.find((question) => question.id === questionId) ?? null;

  if (stood === null) {
    return null;
  }

  return {
    kind: "repeated",
    left: runUnfinished(run, questionId),
    walk: [...run.walk].sort((one, other) => one.place - other.place),
    // A repeat asks the agent the question originally stood before, not the flow's first agent.
    startAgentId: stood.askedAgentId,
    runKey,
    runId: run.id,
    questionId,
    askedAt: stood.askedAt.getTime(),
    // A question with no step in the record went nowhere, so it goes again to whom it was put.
    notSentTo: notSentTo ?? (run.walk.some((step) => step.questionId === questionId) ? null : stood.askedAgentId),
    asked: stood.asked,
    attached: stood.attached,
  };
}
