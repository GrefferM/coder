import { RUN_STEP_DONE } from "../constants";
import type { RunUnfinished, WholeRun, WholeStep } from "../interfaces";

/** Whether a link's work became a turn of its own — the step it fed stands in the walk. */
function ledOn(walk: WholeStep[], step: WholeStep, toAgentId: string): boolean {
  return walk.some((other) => other.agentId === toAgentId && other.fromStepIds.includes(step.id));
}

/**
 * What is left of a question whose walk stopped — the turns of its last walk that ended in anything
 * but an answer, to run again word for word, and every link whose work never became a turn. A break ends the walk
 * whole, so the walks before the last one either answered or were picked up already; work that reached a point which
 * never ran is left whichever walk carried it.
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
