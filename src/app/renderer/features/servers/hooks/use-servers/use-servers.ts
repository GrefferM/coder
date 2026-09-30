import { useCallback, useEffect, useRef, useState } from "react";
import { closeServer, lookServer, seenServer, sweepServerKeys } from "../../api";
import { serverReach } from "../../logic";
import type { McpLook, ProjectMcpServer } from "../../../../interfaces";
import type { ServersState } from "./interfaces";

/**
 * Every declared server, asked what it hands over. The answer is held only while the project is open, never written
 * down; a server is asked once when the project names it, and again only on request.
 */
export function useServers(directory: string, servers: ProjectMcpServer[]): ServersState {
  const [looks, setLooks] = useState<Record<string, McpLook>>({});
  // When each ask began, from which the row counts a clock up.
  const [askingSince, setAskingSince] = useState<Record<string, number>>({});
  // The declared list as it stands now, so `look` stays one callback.
  const declared = useRef(servers);

  declared.current = servers;
  /**
   * Which servers have been asked and how each was reached then; a server whose address or sign-in changed is a different
   * server behind the same id, so its old answer is dropped.
   */
  const asked = useRef(new Map<string, string>());
  /**
   * The turn of asking each server is on. An ask cannot be recalled, so «СКАСУВАТИ» moves to the next turn and the
   * earlier turn's answer is dropped on arrival.
   */
  const turns = useRef(new Map<string, number>());

  const ask = useCallback(
    (serverId: string) => {
      const server = declared.current.find((held) => held.id === serverId) ?? null;

      if (server === null) {
        return;
      }

      const turn = (turns.current.get(serverId) ?? 0) + 1;

      turns.current.set(serverId, turn);
      setAskingSince((asking) => (asking[serverId] === undefined ? started(asking, serverId) : asking));
      void lookServer(directory, server)
        .then((look) => {
          if (turns.current.get(serverId) !== turn) {
            return;
          }

          setLooks((held) => ({
            ...held,
            [serverId]: look,
          }));
        })
        .finally(() => {
          if (turns.current.get(serverId) !== turn) {
            return;
          }

          setAskingSince((asking) => without(asking, serverId));
        });
    },
    [directory],
  );

  const restart = useCallback(
    (serverId: string) => {
      setAskingSince((asking) => (asking[serverId] === undefined ? started(asking, serverId) : asking));
      void closeServer(serverId).then(() => ask(serverId));
    },
    [ask],
  );

  /** «СКАСУВАТИ»: releases the process, ends the row's waiting and drops what the server said before. */
  const cancel = useCallback((serverId: string) => {
    turns.current.set(serverId, (turns.current.get(serverId) ?? 0) + 1);
    setAskingSince((asking) => without(asking, serverId));
    setLooks((held) => Object.fromEntries(Object.entries(held).filter(([id]) => id !== serverId)));
    void closeServer(serverId);
  }, []);

  /** The page was opened, so the «34 → 33» arrow goes out here as well as on this machine. */
  const seen = useCallback((serverId: string) => {
    void seenServer(serverId);
    setLooks((held) => {
      const look = held[serverId];

      if (look === undefined || look.wasCount === null) {
        return held;
      }

      return {
        ...held,
        [serverId]: {
          ...look,
          wasCount: null,
        },
      };
    });
  }, []);

  /** Finishes a deletion interrupted by an app close: the debt left written is paid once when the project opens. */
  const swept = useRef(false);

  useEffect(() => {
    if (swept.current) {
      return;
    }

    swept.current = true;
    void sweepServerKeys(servers.map((server) => server.id));
  }, [servers]);

  // A server the project no longer names is forgotten with its answer.
  useEffect(() => {
    const ids = new Set(servers.map((server) => server.id));
    // Declared anew since it last answered, so its answer is the old server's and is dropped.
    const redeclared = new Set(
      servers
        .filter((server) => {
          const asFound = asked.current.get(server.id);

          return asFound !== undefined && asFound !== serverReach(server);
        })
        .map((server) => server.id),
    );

    setLooks((held) => {
      const kept = Object.fromEntries(Object.entries(held).filter(([id]) => ids.has(id) && !redeclared.has(id)));

      return Object.keys(kept).length === Object.keys(held).length ? held : kept;
    });

    for (const id of asked.current.keys()) {
      if (!ids.has(id)) {
        asked.current.delete(id);
      }
    }

    // A server is asked when first named and again only on request, except when redeclared, which leaves the process
    // stale.
    for (const server of servers) {
      const reach = serverReach(server);

      if (asked.current.get(server.id) === reach) {
        continue;
      }

      const isNew = !asked.current.has(server.id);

      asked.current.set(server.id, reach);

      if (isNew) {
        ask(server.id);
      } else {
        restart(server.id);
      }
    }
  }, [servers, ask, restart]);

  return {
    looks,
    askingSince,
    look: ask,
    restart,
    cancel,
    seen,
  };
}

/** Records the moment an ask begins, for the row's clock. */
function started(asking: Record<string, number>, serverId: string): Record<string, number> {
  return {
    ...asking,
    [serverId]: Date.now(),
  };
}

function without(asking: Record<string, number>, serverId: string): Record<string, number> {
  return Object.fromEntries(Object.entries(asking).filter(([id]) => id !== serverId));
}
