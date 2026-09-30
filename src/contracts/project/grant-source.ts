import { isAgentGrant } from "./agent-grant.guard";
import { isCommandGrant } from "./command-grant.guard";
import { GRANT_HANDLE_SEPARATOR } from "./grant-handle.constant";
import type { ToolGrant } from "./tool-grant.type";

/** What a grant points at: the project's own command, or one function of a server. */
export interface GrantSource {
  kind: ToolGrant["source"];
  /** The command's own id, or the server's — never the function's, which the server names and no id of ours holds. */
  id: string;
  /** The name the server gave the function; nothing for a command, which is one whole thing. */
  functionName: string | null;
}

/**
 * The source a grant points at, in one shape whichever kind it is.
 *
 * A grant is a union told apart by `source` — a command names a `commandId`, a server's function a `serverId`
 * and a `functionName`. Every caller asks that question here rather than reading the fields itself, so a third
 * kind of grant is answered for in one place and not in every place that ever asked.
 */
export function sourceOf(grant: ToolGrant): GrantSource {
  if (isCommandGrant(grant)) {
    return {
      kind: grant.source,
      id: grant.commandId,
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

/** Whether this grant points at that command or that server, by the source's own id. */
export function pointsAt(grant: ToolGrant, sourceId: string): boolean {
  return sourceOf(grant).id === sourceId;
}

/** Whether this grant is that server's function: the server and the name together, since two servers may share one name. */
export function namesFunction(grant: ToolGrant, serverId: string, functionName: string): boolean {
  const source = sourceOf(grant);

  return source.id === serverId && source.functionName === functionName;
}

/**
 * What makes a grant the same grant: a command by its id, a server's function by the server and the name
 * together. The same function name on two servers is two different things, and an agent may hold both.
 *
 * It is the **source's** handle and not the grant's, because that is what it answers about — so a row of a
 * picker, which is a source and no grant at all, is compared against a held grant by the one same word.
 */
export function handleOf(source: GrantSource): string {
  return [source.kind, source.id, source.functionName].filter((part) => part !== null).join(GRANT_HANDLE_SEPARATOR);
}
