import { handleOf, sourceOf } from "../../../../../../../../../interfaces";
import type { ToolGrant } from "../../../../../../../../../interfaces";
import type { ToolChoice } from "../../../../../../../interfaces";

/** The grant this row stands for, or nothing where the agent does not hold it — one handle against another. */
export function grantedOf(option: ToolChoice, grants: ToolGrant[]): ToolGrant | null {
  return grants.find((grant) => handleOf(sourceOf(grant)) === option.key) ?? null;
}

/** A grant for this row, made fresh. A command's carries its pinned arguments; a server's function pins nothing. */
export function grantFor(option: ToolChoice): ToolGrant {
  return option.source === "command"
    ? {
        id: crypto.randomUUID(),
        source: "command",
        commandId: <string>option.commandId,
        pinned: [],
      }
    : {
        id: crypto.randomUUID(),
        source: "mcp",
        serverId: <string>option.serverId,
        functionName: option.name,
      };
}
