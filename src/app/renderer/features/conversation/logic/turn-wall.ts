import { agentReadiness } from "./agent-readiness";
import { agentTools } from "./agent-tools";
import { notStartedTurn } from "./not-started-turn";
import { turnLength } from "./turn-length";
import { overCeilingNote } from "../words";
import type { TurnAnswer, TurnAsked, TurnToAsk } from "../interfaces";

/**
 * Every wall a turn can meet before it is asked: the agent's own, read by `agentReadiness`, and then words over
 * the model's ceiling. The first wall met is the answer; where there is none, what the turn carries to the model
 * comes back instead.
 */
export function turnWall(turn: TurnToAsk): TurnAnswer | TurnAsked {
  const { catalogue, asked, stands } = turn;
  const readiness = agentReadiness(turn.agent, stands, catalogue);

  if ("reason" in readiness) {
    return notStartedTurn(readiness.note, readiness.reason);
  }

  const { agent, model } = readiness;
  const systemPrompt = stands.prompt?.text ?? null;
  const length = turnLength(systemPrompt, asked, model.contextCeiling);

  // Over the ceiling the turn does not go at all.
  if (length.total > length.ceiling) {
    return notStartedTurn(overCeilingNote(model.title, length), "tooLong", length);
  }

  return {
    agent,
    model,
    systemPrompt,
    tools: agentTools(agent.tools, catalogue),
  };
}
