import type { ProjectMcpServer } from "../../../interfaces";

/**
 * How a server is reached, as one line to compare two declarations by. A name is not part of it: renaming a server
 * changes nothing about the process behind it, while a changed line, address, way in or list of variables means
 * the thing that is running — or the reason it is not — belongs to a server that no longer exists in that shape.
 */
export function serverReach(server: ProjectMcpServer): string {
  return [server.isLocal ? "local" : "remote", server.run, server.address, server.signIn, ...server.env].join("\n");
}
