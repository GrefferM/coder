import type { McpLook, ProjectMcpServer, ToolGrant } from "../../../interfaces";

import { namesFunction, pointsAt } from "../../../interfaces";
/**
 * A server is connected to an agent as a **whole**, not function by function: the hand's question here is «чи
 * працює цей агент із цим сервером», and picking twenty-four functions one by one was never that question.
 *
 * The project file does not change: it still keeps a grant per function (serverId, functionName), because that is
 * what a call needs. Connecting writes one grant for every function the server hands over **right now**, and
 * that is the whole of it — a function the server adds tomorrow is not granted by yesterday's tick. Whether it
 * should be is a question for a server-level grant, and the file has none.
 */
export function connectedTo(serverId: string, grants: ToolGrant[]): boolean {
  return grants.some((grant) => pointsAt(grant, serverId));
}

/**
 * One function of a server in or out. Connecting takes the whole server; this is what the screen behind its row
 * does, so a big server can be let in without letting all of it in.
 */
export function withFunction(serverId: string, functionName: string, grants: ToolGrant[]): ToolGrant[] {
  const held = grants.find((grant) => namesFunction(grant, serverId, functionName));

  return held === undefined
    ? [
        ...grants,
        {
          id: crypto.randomUUID(),
          source: "mcp",
          serverId,
          functionName,
        },
      ]
    : grants.filter((grant) => grant.id !== held.id);
}

/** Connecting grants everything the server hands over; disconnecting takes back everything of that server. */
export function withServer(server: ProjectMcpServer, look: McpLook | null, grants: ToolGrant[]): ToolGrant[] {
  const without = grants.filter((grant) => !pointsAt(grant, server.id));

  if (connectedTo(server.id, grants)) {
    return without;
  }

  return [
    ...without,
    ...(look?.functions ?? []).map((held) => ({
      id: crypto.randomUUID(),
      source: "mcp" as const,
      serverId: server.id,
      functionName: held.name,
    })),
  ];
}
