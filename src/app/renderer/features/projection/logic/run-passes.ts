import type { WholeRun } from "../../record";

/**
 * The passes of one flow in the order they were asked, each named by its own question. A question that
 * started no walk is not a pass.
 */
export function runPasses(run: WholeRun): string[] {
  return [...run.questions]
    .sort((one, other) => one.place - other.place)
    .filter((question) => run.walk.some((step) => step.questionId === question.id))
    .map((question) => question.id);
}
