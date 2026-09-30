import { handleOf, sourceOf } from "../../../../../../../../../interfaces";
import type { ToolGrant } from "../../../../../../../../../interfaces";
import type { ToolChoice } from "../../../../../../../interfaces";

/** The grant this row stands for, or nothing where the agent does not hold it — one handle against another. */
export function grantedOf(option: ToolChoice, grants: ToolGrant[]): ToolGrant | null {
  return grants.find((grant) => handleOf(sourceOf(grant)) === option.key) ?? null;
}

/** A grant for this row, made fresh. A command's carries its pinned arguments; a server's and an agent's pin nothing. */
export function grantFor(option: ToolChoice): ToolGrant {
  if (option.source === "command") {
    return {
      id: crypto.randomUUID(),
      source: "command",
      commandId: <string>option.commandId,
      pinned: [],
    };
  }

  if (option.source === "agent") {
    return {
      id: crypto.randomUUID(),
      source: "agent",
      agentId: <string>option.agentId,
    };
  }

  return {
    id: crypto.randomUUID(),
    source: "mcp",
    serverId: <string>option.serverId,
    functionName: option.name,
  };
}
