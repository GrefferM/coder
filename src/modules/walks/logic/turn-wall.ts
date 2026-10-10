import { agentReadiness } from "./agent-readiness";
import { agentTools } from "./agent-tools";
import { notStartedTurn } from "./not-started-turn";
import { memoryLength } from "./memory-length";
import { turnLength } from "./turn-length";
import { overCeilingNote } from "../words";
import type { TurnAnswer, TurnAsked, TurnToAsk } from "../../../contracts";

/**
 * Every wall a turn can meet before it is asked: the agent's own (`agentReadiness`), then words over the model's
 * ceiling, the memory counted with them. The first wall met is the answer; with none, what the turn carries to the model.
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
