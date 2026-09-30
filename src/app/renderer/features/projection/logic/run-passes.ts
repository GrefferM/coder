import type { WholeRun } from "../../record";

/** The flow's passes in the order asked, each named by its question; a question that started no walk is not a pass. */
export function runPasses(run: WholeRun): string[] {
  return [...run.questions]
    .sort((one, other) => one.place - other.place)
    .filter((question) => run.walk.some((step) => step.questionId === question.id))
    .map((question) => question.id);
}
