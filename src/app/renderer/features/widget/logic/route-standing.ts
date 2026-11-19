import type { RouteStanding, WidgetExchange } from "../interfaces";

/** How an agent of the route stands in a question's walk: a turn out wins, then a fall, then an answer. */
export function routeStanding(exchange: WidgetExchange, agentId: string): RouteStanding {
  if (exchange.working.some((turn) => turn.agentId === agentId)) {
    return "working";
  }

  const said = exchange.steps.filter((step) => step.agentId === agentId);

  if (said.some((step) => step.isFailure)) {
    return "failed";
  }

  return said.length > 0 ? "done" : "waiting";
}
