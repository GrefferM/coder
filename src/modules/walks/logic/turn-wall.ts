import { agentReadiness } from "./agent-readiness";
import { notStartedTurn } from "./not-started-turn";
import { overCeilingNote, reservedNote } from "../words";
import { agentTools, memoryLength, memoryPlan, systemTools, turnLength } from "../../../contracts";
import type { TurnAnswer, TurnAsked, TurnToAsk } from "../../../contracts";

/**
 * Every wall a turn can meet before it is asked: the agent's own (`agentReadiness`), then words that leave the memory
 * less than the ceiling holds back for it (or, where the agent keeps none, more than the ceiling). The first wall met is
 * the answer; with none, what the turn carries to the model, and the budget its memory is first compressed into where it
 * has to be.
 */
export function turnWall(turn: TurnToAsk): TurnAnswer | TurnAsked {
  const { catalogue, asked, stands } = turn;
  const readiness = agentReadiness(turn.agent, stands, catalogue);

  if ("reason" in readiness) {
    return notStartedTurn(readiness.note, readiness.reason);
  }

  const { agent, model } = readiness;
  const systemPrompt = stands.prompt?.text ?? null;
  const length = turnLength({
    systemPrompt,
    asked,
    memoryLength: memoryLength(turn.memory),
    ceiling: model.contextCeiling,
  });

  const plan = memoryPlan(agent, length);

  // The turn does not go at all, and nothing is dropped to make it fit.
  if (plan.kind === "wall") {
    return plan.reserve === 0
      ? notStartedTurn(overCeilingNote(model.title, length), "tooLong", length)
      : notStartedTurn(reservedNote(model.title, length, plan.reserve, plan.limit), "tooLong", {
          ...length,
          memory: plan.reserve,
          total: length.prompt + length.asked + plan.reserve,
        });
  }

  // The system commands the agent was granted become functions, with the agents its lines lead to as the options. A provider
  // without function calls never gets here with a grant (the readiness wall stops it). A tool of its own by the same name
  // gives way.
  const system = systemTools(agent.tools, turn.followers);

  return {
    agent,
    model,
    systemPrompt,
    tools: [
      ...agentTools(agent.tools, catalogue).filter((tool) => !system.some((held) => held.name === tool.name)),
      ...system,
    ],
    compression:
      plan.kind === "compress"
        ? {
            budget: plan.budget,
            at: plan.at,
            to: plan.to,
          }
        : null,
  };
}
