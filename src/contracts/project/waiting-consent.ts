import { isConsentMissing } from "../mcp";
import { isServerGrant } from "./server-grant.guard";
import type { GrantTargets } from "./grant-targets.interface";
import type { ProjectMcpServer } from "./mcp-server.interface";
import type { ToolGrant } from "./tool-grant.type";

/**
 * The first server these grants reach, in grant order, whose run line this machine has not agreed to (36k), or `null`
 * where every granted server may be started. A grant naming no server of the project is `brokenCause`'s, not this.
 */
export function waitingConsent(grants: ToolGrant[], targets: GrantTargets): ProjectMcpServer | null {
  const { servers, looks } = targets;
  const waiting = grants
    .filter(isServerGrant)
    .map((grant) => servers.find((server) => server.id === grant.serverId) ?? null)
    .find((server) => {
      const look = server === null ? undefined : looks[server.id];

      return look !== undefined && isConsentMissing(look);
    });

  return waiting ?? null;
}
