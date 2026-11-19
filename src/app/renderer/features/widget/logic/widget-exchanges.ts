import type { ChatMessage, WalkSnapshot } from "../../../../../contracts";
import type { ProjectConfig } from "../../../interfaces";
import type { WidgetExchange, WidgetStep } from "../interfaces";

/** A sphere's walks as the widget's output lays them out, oldest first: each question with its answers and turns out. */
export function widgetExchanges(snapshot: WalkSnapshot, config: ProjectConfig): WidgetExchange[] {
  return Object.entries(snapshot.walks)
    .filter(([, walk]) => !walk.isPutAway)
    .sort(([, one], [, other]) => one.askedAt - other.askedAt)
    .map(([walkId, walk]) => ({
      walkId,
      question: walk.said.find((said) => said.from === "person") ?? null,
      steps: walk.said.filter((said) => said.from === "agent").map((said, index) => stepOf(said, index, config)),
      working: Object.values(snapshot.out).filter((turn) => turn.runKey === walkId),
      isStopped: walk.isStopped,
    }));
}

function stepOf(said: ChatMessage, index: number, config: ProjectConfig): WidgetStep {
  return {
    id: said.id,
    agentId: said.agentId,
    text: said.text,
    at: said.began ?? said.at,
    number: index + 1,
    isEnd: !config.links.some((link) => link.from === said.agentId),
    isFailure: said.isFailure,
  };
}
