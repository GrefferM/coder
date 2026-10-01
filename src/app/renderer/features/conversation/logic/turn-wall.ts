import { agentReadiness } from "./agent-readiness";
import { agentTools } from "./agent-tools";
import { fittedThread } from "./fitted-thread";
import { notStartedTurn } from "./not-started-turn";
import { turnLength } from "./turn-length";
import { overCeilingNote } from "../words";
import type { TurnAnswer, TurnAsked, TurnToAsk } from "../interfaces";

/**
 * Every wall a turn can meet before it is asked: the agent's own (`agentReadiness`), then words over the model's
 * ceiling. The first wall met is the answer; with none, what the turn carries to the model, its thread cut to the room
 * the prompt and the question leave.
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
    thread: fittedThread(turn.thread, length.ceiling - length.total),
    tools: agentTools(agent.tools, catalogue),
  };
}
