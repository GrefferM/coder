import { compressionOf } from "../../../contracts";
import type { AnsweredTurn, ChatMessage } from "../../../contracts";

/**
 * The stream card of one turn: the agent's words, the app's word, the calls, and what the turn was asked. The step is
 * filled in by the record.
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
    // A live turn names its step of the walk exactly as a read one does.
    began: new Date(turn.startedAt).toISOString(),
    stepId: null,
    walkId: turn.walkId,
    calls: turn.answer.calls,
    compressed: turn.answer.compressed === null ? null : compressionOf(turn.answer.compressed.facts),
  };
}
