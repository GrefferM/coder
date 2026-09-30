import { useCallback } from "react";
import { deletedCommandLabel } from "../../words";
import { WRITE_COMMAND_LABEL } from "../../../project";
import { isCommandGrant } from "../../../../interfaces";
import type { OpenProject } from "../../../../interfaces";
import type { CommandFormValues } from "../../interfaces";
import type { ProjectWrite } from "../../../project";
import type { CommandWrites } from "./interfaces";

import { pointsAt } from "../../../../interfaces";
/** Every write the commands make to the project's file, over the project's one writer. */
export function useCommandWrites(project: OpenProject, write: ProjectWrite): CommandWrites {
  const { save, defer } = write;

  /** Writes a declared command — updated in place, or declared for the first time. */
  const saveCommand = useCallback(
    async (commandId: string | null, values: CommandFormValues) => {
      const existing = project.config.commands.find((command) => command.id === commandId);
      const written = {
        name: values.name.trim(),
        description: values.description.trim(),
        run: values.run.trim(),
        parameters: values.parameters,
      };
      // A parameter taken off a command takes every argument fixed on it in every agent; a server's function pins
      // nothing, so its grants are left alone.
      const parameterIds = new Set(values.parameters.map((parameter) => parameter.id));
      const agents = project.config.agents.map((agent) => ({
        ...agent,
        tools: agent.tools.map((grant) =>
          isCommandGrant(grant) && existing !== undefined && pointsAt(grant, existing.id)
            ? {
                ...grant,
                pinned: grant.pinned.filter((pinned) => parameterIds.has(pinned.parameterId)),
              }
            : grant,
        ),
      }));

      await save(
        {
          ...project.config,
          agents,
          commands: existing
            ? project.config.commands.map((command) =>
                command.id === existing.id
                  ? {
                      ...command,
                      ...written,
                    }
                  : command,
              )
            : [
                ...project.config.commands,
                {
                  id: crypto.randomUUID(),
                  ...written,
                },
              ],
        },
        WRITE_COMMAND_LABEL,
      );
    },
    [project.config, save],
  );

  /** Takes a declared command away, and its grants with it. */
  const deleteCommand = useCallback(
    async (commandId: string) => {
      await defer(
        {
          ...project.config,
          agents: project.config.agents.map((agent) => ({
            ...agent,
            tools: agent.tools.filter((grant) => !pointsAt(grant, commandId)),
          })),
          commands: project.config.commands.filter((command) => command.id !== commandId),
        },
        "command",
        project.config.commands.find((command) => command.id === commandId)?.name ?? "",
        deletedCommandLabel(
          project.config.agents.reduce(
            (count, agent) => count + agent.tools.filter((grant) => pointsAt(grant, commandId)).length,
            0,
          ),
        ),
        null,
      );
    },
    [defer, project.config],
  );

  return {
    saveCommand,
    deleteCommand,
  };
}
