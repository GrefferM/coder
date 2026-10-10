import { RUN_STEP_DONE } from "./run-step-end.constant";
import type { RunUnfinished } from "./run-unfinished.interface";
import type { WholeRun } from "./whole-run.interface";
import type { WholeStep } from "./whole-step.interface";

/** Whether a link's work became a turn: the step it fed is in the walk. */
function ledOn(walk: WholeStep[], step: WholeStep, toAgentId: string): boolean {
  return walk.some((other) => other.agentId === toAgentId && other.fromStepIds.includes(step.id));
}

/**
 * What is left of a stopped question: the last walk's turns that ended in anything but an answer, to run again word for
 * word, and every link whose work never became a turn. An arrival at a point that never ran is left whichever walk
 * carried it.
 */
export function runUnfinished(run: WholeRun, questionId: string | null): RunUnfinished {
  const walk = [...run.walk].sort((one, other) => one.place - other.place);
  const asked = walk.filter((step) => step.questionId === questionId);
  const last = asked.at(-1)?.walkId ?? null;

  return {
    again: asked
      .filter((step) => step.walkId === last && step.state !== RUN_STEP_DONE)
      .map((step) => ({
        agentId: step.agentId,
        asked: step.asked,
        fromStepIds: step.fromStepIds,
      })),
    arrivals: asked.flatMap((step) =>
      step.handoffs
        .filter((handoff) => !ledOn(walk, step, handoff.toAgentId))
        .map((handoff) => ({
          toAgentId: handoff.toAgentId,
          fromStepId: step.id,
          fromAgentId: step.agentId,
          text: step.said,
        })),
    ),
  };
}
