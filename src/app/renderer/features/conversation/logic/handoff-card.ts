import type { ChatMessage, HandoffSaid } from "../interfaces";

/**
 * The stream row for one link, spoken by the app: «ПЕРЕДАЄ» where work went down it, «НЕ ПЕРЕДАЄ · ВИМКНЕНИЙ» where it
 * could not, and for no sender a row about the person's own question.
 */
export function handoffCard(said: HandoffSaid): ChatMessage {
  const spoke = said.fromAgentId ?? said.toAgentId;

  return {
    id: said.id,
    agentId: spoke,
    from: said.fromAgentId === null ? "notSent" : "handoff",
    text: "",
    at: new Date(said.at).toISOString(),
    questionId: said.questionId,
    askedAt: said.askedAt,
    cost: null,
    answerCeiling: null,
    otherAgentId: said.toAgentId,
    stopReason: said.stopReason,
    isFailure: false,
    notStarted: null,
    wouldGo: null,
    began: null,
    stepId: null,
    // The walk this row belongs to, so a repeat finds its question by walk rather than by time.
    walkId: said.runKey,
    note: null,
    asked: null,
    fedBy: [],
    attached: [],
    calls: [],
  };
}
