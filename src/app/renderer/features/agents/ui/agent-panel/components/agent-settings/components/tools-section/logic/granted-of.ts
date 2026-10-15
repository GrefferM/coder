import { handleOf, sourceOf } from "../../../../../../../../../interfaces";
import type { ToolGrant } from "../../../../../../../../../interfaces";
import type { ToolChoice } from "../../../../../../../interfaces";

/** The grant this row stands for, or null if the agent does not hold it. */
export function grantedOf(option: ToolChoice, grants: ToolGrant[]): ToolGrant | null {
  return grants.find((grant) => handleOf(sourceOf(grant)) === option.key) ?? null;
}

/** A fresh grant for this row; a command's starts with nothing pinned. */
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
