import type { McpLook, ProjectMcpServer, ToolGrant } from "../../../interfaces";

import { namesFunction, pointsAt } from "../../../interfaces";
/**
 * A server is connected to an agent as a whole; the file keeps one grant per function (serverId, functionName).
 * Connecting grants the functions the server offers right now.
 */
export function connectedTo(serverId: string, grants: ToolGrant[]): boolean {
  return grants.some((grant) => pointsAt(grant, serverId));
}

/** Puts one function of a server in or out, for letting in part of a big server. */
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

/** Connecting grants all the server's functions; disconnecting removes all of them. */
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
