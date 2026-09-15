import { RUN_RUNNING } from "../constants";
import { runStanding } from "./run-standing";
import type { WholeRun, WholeStep } from "../interfaces";
import { addedMoney } from "../../../../../contracts";

/**
 * One pass of a flow — the walk of a single question, with that question's own turns, tokens, money
 * and time. The whole flow's totals stand in the history.
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
    // A pass begins when it was asked: the projection's ruler counts from here.
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

/**
 * How a pass stands — worked out over every turn of it, exactly as a flow takes its own word. Not
 * the last turn alone: one agent hands to two, and a branch that fell must not hide behind one that answered later.
 */
function stateOf(walk: WholeStep[]): string {
  return runStanding(walk.map((step) => step.state));
}

/** When the pass was over: the last turn to end, or the moment it was asked, where none ran. */
function ended(walk: WholeStep[], asked: Date): Date {
  return walk.reduce((standing, step) => (step.endedAt > standing ? step.endedAt : standing), asked);
}
