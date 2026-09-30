import { RUN_RUNNING } from "../constants";
import { runStanding } from "./run-standing";
import type { WholeRun, WholeStep } from "../interfaces";
import { addedMoney } from "../../../../../contracts";

/**
 * One pass of a flow: a single question's walk with its own turns, tokens, money and time; flow totals live in the
 * history.
 */
export function oneWalk(run: WholeRun, questionId: string | null): WholeRun | null {
  const question = run.questions.find((one) => one.id === questionId) ?? null;

  if (question === null) {
    return null;
  }

  const walk = run.walk.filter((step) => step.questionId === question.id);
  const isLast = run.questions.every((one) => one.place <= question.place);

  return {
    ...run,
    asked: question.asked,
    askedAt: question.askedAt,
    // A pass begins when it was asked; the projection's ruler counts from here.
    startedAt: question.askedAt,
    endedAt: ended(walk, question.askedAt),
    state: run.state === RUN_RUNNING && isLast ? RUN_RUNNING : stateOf(walk),
    questions: [question],
    steps: walk.length,
    money: addedMoney(walk.map((step) => step.money)),
    worked: walk.reduce((sum, step) => sum + (step.endedAt.getTime() - step.startedAt.getTime()), 0),
    walk,
  };
}

/** A pass's state, worked out over all its turns as a flow does, not the last turn alone. */
function stateOf(walk: WholeStep[]): string {
  return runStanding(walk.map((step) => step.state));
}

/** When the pass ended: the last turn's end, or the asked time where none ran. */
function ended(walk: WholeStep[], asked: Date): Date {
  return walk.reduce((standing, step) => (step.endedAt > standing ? step.endedAt : standing), asked);
}
