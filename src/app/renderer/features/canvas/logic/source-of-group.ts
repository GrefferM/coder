import { AGENTS_GROUP_KEY, COMMANDS_GROUP_KEY } from "../../../constants";
import type { ToolSource } from "../../../interfaces";

/** The kind of source a group of the arc stands for; any group that is neither command nor agent is a server's. */
export function sourceOfGroup(group: string): ToolSource {
  if (group === COMMANDS_GROUP_KEY) {
    return "command";
  }

  return group === AGENTS_GROUP_KEY ? "agent" : "mcp";
}
