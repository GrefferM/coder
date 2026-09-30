import type { ProjectMcpServer } from "../../../interfaces";

/**
 * How a server is reached, as one line to compare two declarations. The name is not part of it; a changed line,
 * address, sign-in or variable list is.
 */
export function serverReach(server: ProjectMcpServer): string {
  return [server.isLocal ? "local" : "remote", server.run, server.address, server.signIn, ...server.env].join("\n");
}
