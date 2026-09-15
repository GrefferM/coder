import { useCallback, useEffect, useRef, useState } from "react";
import { closeServer, lookServer, seenServer, sweepServerKeys } from "../../api";
import { serverReach } from "../../logic";
import type { McpLook, ProjectMcpServer } from "../../../../interfaces";
import type { ServersState } from "./interfaces";

/**
 * Every server the project declares, asked what it hands over. The answer is nobody's file — it is what
 * the server said this time — so it is held here for as long as the project stands open and never written down.
 *
 * A server is asked once when the project names it, and again only when somebody asks: the ask starts a process,
 * and a beat of its own would start one over and over for a list nobody is looking at.
 */
export function useServers(directory: string, servers: ProjectMcpServer[]): ServersState {
  const [looks, setLooks] = useState<Record<string, McpLook>>({});
  // **when** each ask began, and not merely that it is going on — the row counts a clock up from it.
  const [askingSince, setAskingSince] = useState<Record<string, number>>({});
  // The declared list as it stands now: `look` is one callback for as long as the screen holds it, whatever changes.
  const declared = useRef(servers);

  declared.current = servers;
  /**
   * Which servers have been asked, and **how each was reached when it was asked**. The second half is what makes
   * an answer worth keeping: a server whose address or way in was changed is a different server behind the same
   * id, and what the old one said — «ПОТРІБЕН ТОКЕН» most of all — would otherwise stand over the new one until
   * somebody thought to press «ЗАПУСТИТИ».
   */
  const asked = useRef(new Map<string, string>());
  /**
   * Which turn of asking each server is on. An ask cannot be called back once it is out — the main
   * process is already starting a program — so «СКАСУВАТИ» counts the server one turn on instead, and the answer
   * to the turn before it is dropped when it comes. Without this, a row let go of would light up by itself.
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

  /**
   * «СКАСУВАТИ» gives the place back at once and asks nothing. The process is let go, the row stops
   * waiting, and what the server said before is dropped with it — a catalogue read from a process that has just
   * been killed is a list of functions nobody can call.
   */
  const cancel = useCallback((serverId: string) => {
    turns.current.set(serverId, (turns.current.get(serverId) ?? 0) + 1);
    setAskingSince((asking) => without(asking, serverId));
    setLooks((held) => Object.fromEntries(Object.entries(held).filter(([id]) => id !== serverId)));
    void closeServer(serverId);
  }, []);

  /**
   * The page of this server was opened, so «34 → 33» has been read. The arrow goes out **here** as
   * well as on this machine: the news is read the moment the page opens, not the next time the server is asked.
   */
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

  /**
   * The sweep that finishes a deletion the app was closed in the middle of. The keys of a server
   * deleted here wait out the undo's thirty seconds; an app that closed inside them left the debt written down,
   * and this is where it is paid — once, quietly, when the project opens.
   */
  const swept = useRef(false);

  useEffect(() => {
    if (swept.current) {
      return;
    }

    swept.current = true;
    void sweepServerKeys(servers.map((server) => server.id));
  }, [servers]);

  // A server the project no longer names is forgotten with it; what it said is about a server, not about a name.
  useEffect(() => {
    const ids = new Set(servers.map((server) => server.id));
    // Declared anew since it last answered: the answer in hand is the old server's, and it is dropped, not shown.
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

    // A server is asked when it is first named, and asking again is somebody's own doing — except that
    // declaring it afresh **is** somebody's own doing, and the process started from the old declaration is stale.
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

/** The clock of a row starts when the ask does, so the moment is written down at the one place the ask begins. */
function started(asking: Record<string, number>, serverId: string): Record<string, number> {
  return {
    ...asking,
    [serverId]: Date.now(),
  };
}

function without(asking: Record<string, number>, serverId: string): Record<string, number> {
  return Object.fromEntries(Object.entries(asking).filter(([id]) => id !== serverId));
}
