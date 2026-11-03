import { isAgentGrant } from "./agent-grant.guard";
import { isCommandGrant } from "./command-grant.guard";
import { isSystemGrant } from "./system-grant.guard";
import { GRANT_HANDLE_SEPARATOR } from "./grant-handle.constant";
import type { ToolGrant } from "./tool-grant.type";

/** What a grant points at: the project's own command, another agent, one function of a server, or an app command. */
export interface GrantSource {
  kind: ToolGrant["source"];
  /** The command's, agent's or server's id, or the app command's own; never the function's, which the server names. */
  id: string;
  /** The name the server gave the function; null for a command or an agent. */
  functionName: string | null;
}

/** The source a grant points at, in one shape for every kind. */
export function sourceOf(grant: ToolGrant): GrantSource {
  if (isCommandGrant(grant)) {
    return {
      kind: grant.source,
      id: grant.commandId,
      functionName: null,
    };
  }

  // One of the app's own commands is told by its id alone.
  if (isSystemGrant(grant)) {
    return {
      kind: grant.source,
      id: grant.command,
      functionName: null,
    };
  }

  // An agent is granted whole, so its handle is its id alone.
  if (isAgentGrant(grant)) {
    return {
      kind: grant.source,
      id: grant.agentId,
      functionName: null,
    };
  }

  return {
    kind: grant.source,
    id: grant.serverId,
    functionName: grant.functionName,
  };
}

/** Whether the grant points at that command, agent or server, by source id. */
export function pointsAt(grant: ToolGrant, sourceId: string): boolean {
  return sourceOf(grant).id === sourceId;
}

/** Whether the grant is that server's function: server and name together, since two servers may share a name. */
export function namesFunction(grant: ToolGrant, serverId: string, functionName: string): boolean {
  const source = sourceOf(grant);

  return source.id === serverId && source.functionName === functionName;
}

/**
 * Identity of a grant's source: a command or an agent by id, a server function by server and name together. A picker
 * row (a source, not a grant) is compared to a held grant by this handle, and the file refuses two grants sharing one.
 */
export function handleOf(source: GrantSource): string {
  return [source.kind, source.id, source.functionName].filter((part) => part !== null).join(GRANT_HANDLE_SEPARATOR);
}
