import { AGENTS_GROUP_KEY, COMMANDS_GROUP_KEY } from "../../../constants";
import type { ToolSource } from "../../../interfaces";

/** The kind of source one group of the arc stands for; every group that is neither is a server's. */
export function sourceOfGroup(group: string): ToolSource {
  if (group === COMMANDS_GROUP_KEY) {
    return "command";
  }

  return group === AGENTS_GROUP_KEY ? "agent" : "mcp";
}
