import { runUnfinished } from "../../record";
import type { WholeRun } from "../../record";
import type { WalkEvent } from "../interfaces";

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
    notSentTo,
    asked: stood.asked,
  };
}
