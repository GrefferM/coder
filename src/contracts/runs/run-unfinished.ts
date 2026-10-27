import { RUN_STEP_DONE } from "./run-step-end.constant";
import { WORK_BLOCK_SEPARATOR } from "../walks/work-block.constant";
import type { RunUnfinished } from "./run-unfinished.interface";
import type { WholeRun } from "./whole-run.interface";
import type { WholeStep } from "./whole-step.interface";

/** Whether a link's work became a turn: the step it fed is in the walk. */
function ledOn(walk: WholeStep[], step: WholeStep, toAgentId: string): boolean {
  return walk.some((other) => other.agentId === toAgentId && other.fromStepIds.includes(step.id));
}

/**
 * What a step's lines carried: its own words, or, where it passed on without any, what was handed to it — the words the
 * steps that fed it carried, or its own ask where no step fed it.
 */
function carriedBy(walk: WholeStep[], step: WholeStep): string {
  if (step.said !== "") {
    return step.said;
  }

  const feeders = walk.filter((other) => step.fromStepIds.includes(other.id));

  if (feeders.length === 0) {
    return step.asked;
  }

  return feeders.map((feeder) => carriedBy(walk, feeder)).join(WORK_BLOCK_SEPARATOR);
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
          text: carriedBy(walk, step),
          stopReason: handoff.stopReason,
        })),
    ),
  };
}
