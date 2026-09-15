import { useCallback } from "react";
import { cannotDrawLink } from "../../logic";
import { DELETED_LINK_LABEL, LINK_NAME_SEPARATOR } from "../../constants";
import type { OpenProject } from "../../../../interfaces";
import type { ProjectWrite } from "../../../project";
import type { LinkWrites } from "./interfaces";

/** Every write the links make to the project's file, over the project's one writer. */
export function useLinkWrites(project: OpenProject, write: ProjectWrite): LinkWrites {
  const { save, defer } = write;

  /** A link is `from → to`. A line that already stands, or would close a ring, is not drawn. */
  const addLink = useCallback(
    async (fromAgentId: string, toAgentId: string) => {
      if (cannotDrawLink(project.config.links, fromAgentId, toAgentId)) {
        return;
      }

      await save({
        ...project.config,
        links: [
          ...project.config.links,
          {
            id: crypto.randomUUID(),
            from: fromAgentId,
            to: toAgentId,
          },
        ],
      });
    },
    [project.config, save],
  );

  /** Takes the link alone, with the same thirty seconds every deletion has. */
  const deleteLink = useCallback(
    async (linkId: string) => {
      const gone = project.config.links.find((link) => link.id === linkId) ?? null;
      const ends = project.config.agents.filter((agent) => agent.id === gone?.from || agent.id === gone?.to);

      await defer(
        {
          ...project.config,
          links: project.config.links.filter((link) => link.id !== linkId),
        },
        "link",
        ends.map((agent) => agent.name).join(LINK_NAME_SEPARATOR),
        DELETED_LINK_LABEL,
        null,
      );
    },
    [defer, project.config],
  );

  return {
    addLink,
    deleteLink,
  };
}
