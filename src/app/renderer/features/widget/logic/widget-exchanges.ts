import type { ChatMessage } from "../../../../../contracts";
import type { ProjectConfig } from "../../../interfaces";
import type { ExchangesAsked, WidgetExchange, WidgetStep } from "../interfaces";

/**
 * The questions asked of a sphere, as the widget's output lays them out in the stream's order: each with the answers of
 * its walk and the turns still out in it. The stream is the live conversation, or a run opened from the history laid
 * under it.
 */
export function widgetExchanges({ messages, out, walking, config, agentId }: ExchangesAsked): WidgetExchange[] {
  return messages
    .filter((message) => message.from === "person" && message.agentId === agentId)
    .map((question) => ({
      questionId: question.questionId,
      question,
      steps: messages
        .filter((message) => message.from === "agent" && message.questionId === question.questionId)
        .map((said, index) => stepOf(said, index, config)),
      working: out.filter((turn) => question.walkId !== null && turn.runKey === question.walkId),
      isOut: question.walkId !== null && walking.includes(question.walkId),
    }));
}

function stepOf(said: ChatMessage, index: number, config: ProjectConfig): WidgetStep {
  return {
    id: said.id,
    agentId: said.agentId,
    // A turn stopped or fallen with no words shows the app's word for it, as the chat does.
    text: said.text === "" ? (said.note ?? "") : said.text,
    at: said.began ?? said.at,
    endedAt: said.at,
    number: index + 1,
    isEnd: !config.links.some((link) => link.from === said.agentId),
    // A turn with no words of its own is not an answer to read aloud.
    isFailure: said.isFailure || said.text === "",
    // The record names each answer's step; the live conversation does not.
    isLive: said.stepId === null,
  };
}
