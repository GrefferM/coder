import { useCallback, useEffect, useRef } from "react";
import { declaredServer } from "../../logic";
import { deletedServerLabel } from "../../words";
import { closeServer, dropServer, saveServerEnvValue, sweepServerKeys } from "../../api";
import { UNDO_STANDS_MS, WRITE_SERVER_LABEL } from "../../../project";
import type { OpenProject } from "../../../../interfaces";
import type { ProjectWrite } from "../../../project";
import type { ServerFormValues } from "../../interfaces";
import type { ServerWrites } from "./interfaces";

import { pointsAt } from "../../../../interfaces";
/**
 * Every write the declaring of a server makes. Two places are written, never one: the
 * project file learns the way to reach the server and the **names** of its variables, and this machine's keychain
 * keeps what opens it. That split is the whole reason the form exists — the file goes into a repository, and a
 * key in it would be a key in a pull request.
 */
export function useServerWrites(project: OpenProject, write: ProjectWrite): ServerWrites {
  const { save, defer } = write;
  /**
   * The project as it stands **now**, read by a timer that fires half a minute after it was set. A deletion's
   * undo puts the server back into the file, and the only honest way to ask whether it came back is to look at
   * the file at the moment the keys would go.
   */
  const standing = useRef(project.config);

  useEffect(() => {
    standing.current = project.config;
  }, [project.config]);

  /** Writes a declared server — changed in place, or declared for the first time. */
  const saveServer = useCallback(
    async (serverId: string | null, values: ServerFormValues) => {
      const existing = project.config.servers.find((server) => server.id === serverId);
      const written = declaredServer(values);
      const id = existing?.id ?? crypto.randomUUID();

      // A variable taken out of the list is a variable the file no longer names, so its value has nobody left to
      // belong to: it goes off this machine rather than lying there under a name nothing asks for.
      await Promise.all(
        (existing?.env ?? [])
          .filter((name) => !written.env.includes(name))
          .map((name) => saveServerEnvValue(id, name, "")),
      );

      await save(
        {
          ...project.config,
          servers: existing
            ? project.config.servers.map((server) =>
                server.id === existing.id
                  ? {
                      ...server,
                      ...written,
                    }
                  : server,
              )
            : [
                ...project.config.servers,
                {
                  id,
                  ...written,
                },
              ],
        },
        WRITE_SERVER_LABEL,
      );

      return id;
    },
    [project.config, save],
  );

  /** Takes a declared server away — its grants with it, and everything this machine held for it. */
  const deleteServer = useCallback(
    async (serverId: string) => {
      const going = project.config.servers.find((server) => server.id === serverId);
      const grants = project.config.agents.reduce(
        (count, agent) => count + agent.tools.filter((grant) => pointsAt(grant, serverId)).length,
        0,
      );

      // The process is stopped at the press — a server gone from the catalogue must not keep running.
      await closeServer(serverId);
      /**
       * The debt is written down **before** the file is touched, so that an app closed inside the
       * thirty seconds still knows what it owes. The keys themselves do not move yet.
       */
      await dropServer(serverId);
      await defer(
        {
          ...project.config,
          agents: project.config.agents.map((agent) => ({
            ...agent,
            tools: agent.tools.filter((grant) => !pointsAt(grant, serverId)),
          })),
          servers: project.config.servers.filter((server) => server.id !== serverId),
        },
        "server",
        going?.name ?? "",
        deletedServerLabel(grants),
        null,
      );

      /**
       * **the keychain waits out the thirty seconds**. The row, the file and the grants go at the
       * press, but the token and the values leave only when the undo line does — otherwise ⌘Z would hand back a
       * server without its keys, and the line would be promising more than it does.
       *
       * The sweep is handed the servers the file names **now**, and it decides: an id that came back is a debt
       * cancelled, an id still gone is a debt paid. Nothing is listed by hand here, so a variable renamed or
       * added between the press and the second cannot be missed.
       */
      window.setTimeout(() => {
        void sweepServerKeys(standing.current.servers.map((server) => server.id));
      }, UNDO_STANDS_MS);
    },
    [defer, project.config],
  );

  return {
    saveServer,
    deleteServer,
  };
}
