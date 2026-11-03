import { useCallback, useState } from "react";
import { consentServer, isServerConsented } from "../../api";
import type { ProjectMcpServer } from "../../../../interfaces";
import type { ServerConsentState } from "./interfaces";

/**
 * The consent before a local server's run line first runs on this machine. Which server the window stands over is held
 * by id, so a server the project stops naming takes its window with it.
 */
export function useServerConsent(servers: ProjectMcpServer[], restart: (serverId: string) => void): ServerConsentState {
  const [askedId, setAskedId] = useState<string | null>(null);
  const asked = servers.find((server) => server.id === askedId) ?? null;

  const raise = useCallback(
    (serverId: string) => {
      const server = servers.find((held) => held.id === serverId) ?? null;

      if (server === null) {
        return;
      }

      void isServerConsented(server).then((isGiven) => {
        if (!isGiven) {
          setAskedId(serverId);

          return;
        }

        restart(serverId);
      });
    },
    [servers, restart],
  );

  const agree = useCallback(async () => {
    if (asked === null) {
      return;
    }

    setAskedId(null);
    await consentServer(asked);
    restart(asked.id);
  }, [asked, restart]);

  const decline = useCallback(() => {
    setAskedId(null);
  }, []);

  return {
    asked,
    raise,
    ask: setAskedId,
    agree,
    decline,
  };
}
