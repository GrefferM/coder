import { useState } from "react";
import { commandBlocker, commandChanges, commandFormValues } from "../../logic";
import { nameTaken } from "../../../../logic";
import { NAME_TAKEN_COMMAND_NOTE } from "../../../../constants";
import type { OpenProject, UnsavedWork } from "../../../../interfaces";
import type { CommandFormValues } from "../../interfaces";
import type { CommandWrites } from "../use-command-writes";
import type { CommandSection } from "./interfaces";

export function useCommandSection(project: OpenProject, writes: CommandWrites): CommandSection {
  // The opened command; `new` before it exists.
  const [openCommandId, setOpenCommandId] = useState<string | "new" | null>(null);
  const [armedCommandId, setArmedCommandId] = useState<string | null>(null);
  const [edits, setEdits] = useState<Partial<CommandFormValues> | null>(null);

  const openCommand = project.config.commands.find((command) => command.id === openCommandId) ?? null;
  const armedCommand = project.config.commands.find((command) => command.id === armedCommandId) ?? null;
  const saved = openCommandId === null ? null : commandFormValues(openCommand);
  const form =
    saved === null
      ? null
      : {
          ...saved,
          ...edits,
        };
  const changes = saved === null || form === null ? [] : commandChanges(saved, form);
  const isNameTaken =
    form !== null &&
    nameTaken(
      form.name,
      project.config.commands.filter((command) => command.id !== openCommandId).map((command) => command.name),
    );
  // A new declaration becomes unsaved work at the first keystroke.
  const unsaved: UnsavedWork | null =
    changes.length === 0 || form === null
      ? null
      : {
          name: openCommand?.name ?? form.name,
          changes,
          blocked: commandBlocker(form),
          blockedNote: isNameTaken ? NAME_TAKEN_COMMAND_NOTE : null,
          save: saveForm,
          discard: () => setEdits(null),
        };

  /** Opens the form on a command, or empty for a new declaration. */
  function openForm(commandId: string | "new" | null) {
    setOpenCommandId(commandId);
    setEdits(null);
  }

  function editForm(patch: Partial<CommandFormValues>) {
    setEdits((previous) => ({
      ...previous,
      ...patch,
    }));
  }

  /** Writes the form and closes it, new declarations included. */
  async function saveForm() {
    // Blocked by the same rules as «Оголосити».
    if (form === null || commandBlocker(form).length > 0 || isNameTaken) {
      return;
    }

    await writes.saveCommand(openCommand?.id ?? null, form);
    setEdits(null);
    setOpenCommandId(null);
  }

  /** The question's yes: the command goes, and every agent it was given to loses it. */
  function confirmDelete() {
    const leaving = armedCommandId;

    setArmedCommandId(null);

    if (leaving !== null) {
      void writes.deleteCommand(leaving);
    }
  }

  function dismissDelete() {
    setArmedCommandId(null);
  }

  return {
    openCommandId,
    openCommand,
    form,
    isDirty: changes.length > 0,
    unsaved,
    armedCommand,
    openForm,
    editForm,
    saveForm,
    arm: setArmedCommandId,
    confirmDelete,
    dismissDelete,
  };
}
