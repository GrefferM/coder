import { useCallback } from "react";
import { copiedAgentName } from "../../logic";
import { deletedAgentLabel } from "../../words";
import { NEW_AGENT_COLOR, NEW_AGENT_MAX_CALLS, NEW_AGENT_TEMPERATURE } from "../../constants";
import { WRITE_AGENT_LABEL } from "../../../project";
import type { Agent, OpenProject } from "../../../../interfaces";
import type { AgentDraft } from "../../interfaces";
import type { PastedAgent } from "../../../../interfaces";
import type { ProjectWrite } from "../../../project";
import type { AgentWrites } from "./interfaces";
import type { Point } from "../../../../utils/math";

/** Every write agents make to the project file, through the one project writer. */
export function useAgentWrites(project: OpenProject, write: ProjectWrite): AgentWrites {
  const { save, defer } = write;

  /** Writes a new agent at the given point and returns its id. */
  const createAgent = useCallback(
    async (name: string, modelId: string, at: Point): Promise<string> => {
      const agent: Agent = {
        id: crypto.randomUUID(),
        name,
        purpose: null,
        modelId,
        promptId: null,
        tools: [],
        color: NEW_AGENT_COLOR,
        isActive: true,
        waitsForAll: true,
        keepsThread: true,
        x: at.x,
        y: at.y,
        maxCalls: NEW_AGENT_MAX_CALLS,
        temperature: NEW_AGENT_TEMPERATURE,
      };

      await save(
        {
          ...project.config,
          agents: [...project.config.agents, agent],
        },
        WRITE_AGENT_LABEL,
      );

      return agent.id;
    },
    [project.config, save],
  );

  /** Writes the settings tab's changes over the agent as stored. */
  const saveAgent = useCallback(
    async (agentId: string, patch: Partial<AgentDraft>) => {
      await save(
        {
          ...project.config,
          agents: project.config.agents.map((agent) =>
            agent.id === agentId
              ? {
                  ...agent,
                  ...patch,
                }
              : agent,
          ),
        },
        WRITE_AGENT_LABEL,
      );
    },
    [project.config, save],
  );

  const deleteAgent = useCallback(
    async (agentId: string) => {
      const previous = project.config;
      const remainingLinks = previous.links.filter((link) => link.from !== agentId && link.to !== agentId);
      const without = {
        ...previous,
        agents: previous.agents.filter((agent) => agent.id !== agentId),
        links: remainingLinks,
      };
      const gone = previous.agents.find((agent) => agent.id === agentId) ?? null;

      await defer(
        without,
        "agent",
        gone?.name ?? "",
        deletedAgentLabel(previous.links.length - remainingLinks.length),
        // The canvas holds the place while the way back is offered.
        gone === null
          ? null
          : {
              x: gone.x,
              y: gone.y,
            },
      );
    },
    [defer, project.config],
  );

  /** Writes a copy — next-numbered name, no links — and returns it. */
  const pasteAgent = useCallback(
    async (sourceAgentId: string, at: Point): Promise<PastedAgent | null> => {
      const source = project.config.agents.find((agent) => agent.id === sourceAgentId);

      if (!source) {
        return null;
      }

      const copy: Agent = {
        ...source,
        id: crypto.randomUUID(),
        name: copiedAgentName(
          source.name,
          project.config.agents.map((agent) => agent.name),
        ),
        x: at.x,
        y: at.y,
      };

      await save({
        ...project.config,
        agents: [...project.config.agents, copy],
      });

      return {
        agentId: copy.id,
        sourceName: source.name,
      };
    },
    [project.config, save],
  );

  /** The release point is saved as the sphere's position. */
  const moveAgent = useCallback(
    async (agentId: string, at: Point) =>
      save(
        {
          ...project.config,
          agents: project.config.agents.map((agent) =>
            agent.id === agentId
              ? {
                  ...agent,
                  x: at.x,
                  y: at.y,
                }
              : agent,
          ),
        },
        WRITE_AGENT_LABEL,
        // A drop is not an explicit save: only its failure is reported.
        true,
      ),
    [project.config, save],
  );

  return {
    createAgent,
    saveAgent,
    deleteAgent,
    pasteAgent,
    moveAgent,
  };
}
