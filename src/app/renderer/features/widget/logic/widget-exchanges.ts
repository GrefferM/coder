import type { ChatMessage, TurnOut } from "../../../../../contracts";
import type { ProjectConfig } from "../../../interfaces";
import type { WidgetExchange, WidgetStep } from "../interfaces";

/**
 * The questions asked of a sphere, as the widget's output lays them out in the stream's order: each with the answers of
 * its walk and the turns still out in it. The stream is the live conversation, or a run opened from the history laid
 * under it.
 */
export function widgetExchanges(
  messages: ChatMessage[],
  out: TurnOut[],
  config: ProjectConfig,
  agentId: string,
): WidgetExchange[] {
  return messages
    .filter((message) => message.from === "person" && message.agentId === agentId)
    .map((question) => ({
      questionId: question.questionId,
      question,
      steps: messages
        .filter((message) => message.from === "agent" && message.questionId === question.questionId)
        .map((said, index) => stepOf(said, index, config)),
      working: out.filter((turn) => question.walkId !== null && turn.runKey === question.walkId),
    }));
}

function stepOf(said: ChatMessage, index: number, config: ProjectConfig): WidgetStep {
  return {
    id: said.id,
    agentId: said.agentId,
    text: said.text,
    at: said.began ?? said.at,
    endedAt: said.at,
    number: index + 1,
    isEnd: !config.links.some((link) => link.from === said.agentId),
    isFailure: said.isFailure,
  };
}
