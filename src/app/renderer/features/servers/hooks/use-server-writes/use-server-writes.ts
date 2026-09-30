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
 * Every write of declaring a server: the project file gets the way to reach it and the variable names; this machine's
 * keychain keeps the secrets. The file never holds a key.
 */
export function useServerWrites(project: OpenProject, write: ProjectWrite): ServerWrites {
  const { save, defer } = write;
  /**
   * The project as it stands at the time, read by the timer that fires half a minute later; an undo may have put the
   * server back in the file.
   */
  const standing = useRef(project.config);

  useEffect(() => {
    standing.current = project.config;
  }, [project.config]);

  /** Writes a declared server, changed in place or declared for the first time. */
  const saveServer = useCallback(
    async (serverId: string | null, values: ServerFormValues) => {
      const existing = project.config.servers.find((server) => server.id === serverId);
      const written = declaredServer(values);
      const id = existing?.id ?? crypto.randomUUID();

      // A variable removed from the list is no longer named by the file, so its value goes off this machine.
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

  /** Removes a declared server, its grants, and everything this machine held for it. */
  const deleteServer = useCallback(
    async (serverId: string) => {
      const going = project.config.servers.find((server) => server.id === serverId);
      const grants = project.config.agents.reduce(
        (count, agent) => count + agent.tools.filter((grant) => pointsAt(grant, serverId)).length,
        0,
      );

      // Stops the process at the press, so a server gone from the catalogue stops running.
      await closeServer(serverId);
      /**
       * The sweep debt is recorded before the file is touched, so an app closed within the thirty seconds still knows it. The
       * keys do not move yet.
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
       * The row, file and grants go at the press, the token and values only when the undo line does. The sweep gets the
       * servers the file names at that time: a returned id cancels the debt, a still-gone id pays it.
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
