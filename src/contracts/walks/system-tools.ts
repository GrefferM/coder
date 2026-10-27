import {
  ROUTE_FINISH_DESCRIPTION,
  ROUTE_LABEL_NUMBERED,
  ROUTE_LABEL_SLOT,
  ROUTE_NAME_SLOT,
  ROUTE_NUMBER_SLOT,
  ROUTE_OPTION_LINE,
  ROUTE_OPTION_PURPOSE,
  ROUTE_PASS_DESCRIPTION,
  ROUTE_PURPOSE_SLOT,
} from "./route-words.constant";
import { FINISH_HERE_COMMAND, PASS_TO_COMMAND } from "../project/system-command.constant";
import { isSystemGrant } from "../project/system-grant.guard";
import type { AgentSystemTool, RouteOption } from "../llm";
import type { SystemCommandId } from "../project/system-command.constant";
import type { ToolGrant } from "../project/tool-grant.type";
import type { RouteFollower } from "./route-follower.interface";

/**
 * What an agent is given of the system commands it was granted: `pass_to` to name whom its answer goes to, `finish_here` to
 * end the branch. None where nobody can take its answer, since there is then nothing to pass or end, and none for a
 * command it was not granted. They come in the order of the grants.
 */
export function systemTools(grants: ToolGrant[], followers: RouteFollower[]): AgentSystemTool[] {
  const commands = grantedCommands(grants);

  if (commands.length === 0 || followers.length === 0) {
    return [];
  }

  const options = routeOptions(followers);

  return commands.map((command) => (command === PASS_TO_COMMAND ? passTool(options, followers) : finishTool()));
}

/** The system commands among the grants, once each, in the order of the grants. */
function grantedCommands(grants: ToolGrant[]): SystemCommandId[] {
  const commands: SystemCommandId[] = [];

  for (const grant of grants) {
    if (isSystemGrant(grant) && !commands.includes(grant.command)) {
      commands.push(grant.command);
    }
  }

  return commands;
}

/** `pass_to`, its description listing each option with what the follower is for. */
function passTool(options: RouteOption[], followers: RouteFollower[]): AgentSystemTool {
  const lines = followers.map((follower, index) => optionLine(options[index].label, follower.purpose));

  return {
    source: "system",
    name: PASS_TO_COMMAND,
    description: [ROUTE_PASS_DESCRIPTION, ...lines].join("\n"),
    command: PASS_TO_COMMAND,
    options,
  };
}

/** `finish_here`, which names nobody. */
function finishTool(): AgentSystemTool {
  return {
    source: "system",
    name: FINISH_HERE_COMMAND,
    description: ROUTE_FINISH_DESCRIPTION,
    command: FINISH_HERE_COMMAND,
    options: [],
  };
}

/** One option of `pass_to` as the model reads it; the purpose follows where one is written. */
function optionLine(label: string, purpose: string | null): string {
  const said = ROUTE_OPTION_LINE.replace(ROUTE_LABEL_SLOT, label);
  const written = purpose?.trim() ?? "";

  return written === "" ? said : `${said}${ROUTE_OPTION_PURPOSE.replace(ROUTE_PURPOSE_SLOT, written)}`;
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
