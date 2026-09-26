import type { AnsweredTurn, ChatMessage } from "../interfaces";

/**
 * The card one turn becomes in the stream: the words as the agent said them, the app's word beside them, the
 * calls where they happened, and what the turn was asked. The step is not known yet — the record answers with it.
 */
export function answeredCard(turn: AnsweredTurn): ChatMessage {
  return {
    id: turn.id,
    agentId: turn.agentId,
    from: "agent",
    text: turn.said,
    questionId: turn.questionId,
    askedAt: turn.askedAt,
    note: turn.answer.note,
    asked: turn.asked,
    fedBy: turn.fedBy,
    attached: [],
    at: new Date(turn.endedAt).toISOString(),
    cost: turn.answer.cost,
    answerCeiling: turn.answer.answerCeiling,
    otherAgentId: null,
    stopReason: null,
    isFailure: turn.answer.isFailure,
    notStarted: turn.answer.notStarted,
    wouldGo: turn.answer.wouldGo,
    // A live turn says which step of the walk it is, exactly as a read one does.
    began: new Date(turn.startedAt).toISOString(),
    stepId: null,
    walkId: turn.walkId,
    calls: turn.answer.calls,
  };
}
