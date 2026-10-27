import {
  ROUTE_FINISH_DESCRIPTION,
  ROUTE_FINISH_NAME,
  ROUTE_LABEL_NUMBERED,
  ROUTE_LABEL_SLOT,
  ROUTE_NAME_SLOT,
  ROUTE_NUMBER_SLOT,
  ROUTE_OPTION_LINE,
  ROUTE_OPTION_PURPOSE,
  ROUTE_PASS_DESCRIPTION,
  ROUTE_PASS_NAME,
  ROUTE_PURPOSE_SLOT,
} from "./route-words.constant";
import type { AgentRouteTool, RouteOption } from "../llm";
import type { RouteFollower } from "./route-follower.interface";

/**
 * What an agent that chooses its route is given: `pass_to` to name whom its answer goes to, and `finish_here` to end
 * the branch. None where nobody can take its answer, since there is then nothing to choose.
 */
export function routeTools(followers: RouteFollower[]): AgentRouteTool[] {
  if (followers.length === 0) {
    return [];
  }

  const options = routeOptions(followers);
  const lines = followers.map((follower, index) => {
    const purpose = follower.purpose?.trim() ?? "";
    const label = ROUTE_OPTION_LINE.replace(ROUTE_LABEL_SLOT, options[index].label);

    return purpose === "" ? label : `${label}${ROUTE_OPTION_PURPOSE.replace(ROUTE_PURPOSE_SLOT, purpose)}`;
  });

  return [
    {
      source: "route",
      name: ROUTE_PASS_NAME,
      description: [ROUTE_PASS_DESCRIPTION, ...lines].join("\n"),
      action: "passTo",
      options,
    },
    {
      source: "route",
      name: ROUTE_FINISH_NAME,
      description: ROUTE_FINISH_DESCRIPTION,
      action: "finishHere",
      options,
    },
  ];
}

/** The word for each follower, in their order: the name, and a number after it for a name already taken. */
function routeOptions(followers: RouteFollower[]): RouteOption[] {
  const taken = new Set<string>();

  return followers.map((follower) => {
    let label = follower.name;

    for (let number = 2; taken.has(label); number += 1) {
      label = ROUTE_LABEL_NUMBERED.replace(ROUTE_NAME_SLOT, follower.name).replace(ROUTE_NUMBER_SLOT, String(number));
    }

    taken.add(label);

    return {
      agentId: follower.agentId,
      label,
    };
  });
}
