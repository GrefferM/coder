import type { RouteChoice } from "./route-choice.interface";

/**
 * Whether the agent decided where its work goes: it passed something on or ended the branch. Such a turn needs no words
 * of its own to have done its part.
 */
export function isRouteDecided(route: RouteChoice | null): boolean {
  return route !== null && (route.isFinished || route.passes.length > 0);
}
