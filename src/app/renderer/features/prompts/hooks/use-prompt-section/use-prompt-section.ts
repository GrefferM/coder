import { useState } from "react";
import { promptBlocker, promptChanges, promptFormValues } from "../../logic";
import { UNNAMED_PROMPT_LABEL } from "../../constants";
import { nameTaken } from "../../../../logic";
import { NAME_TAKEN_PROMPT_NOTE } from "../../../../constants";
import type { OpenProject, UnsavedWork } from "../../../../interfaces";
import type { PromptFormValues } from "../../interfaces";
import type { PromptWrites } from "../use-prompt-writes";
import type { PromptSection } from "./interfaces";

/** Holds the editor's draft, so every exit meets the question. */
export function usePromptSection(project: OpenProject, writes: PromptWrites): PromptSection {
  const [chosenPromptId, setChosenPromptId] = useState<string | null>(null);
  const [editedPromptId, setEditedPromptId] = useState<string | "new" | null>(null);
  // The prompt whose deletion is being asked about.
  const [armedPromptId, setArmedPromptId] = useState<string | null>(null);
  // The editor's unwritten draft; `null` while the editor is closed.
  const [form, setForm] = useState<PromptFormValues | null>(null);

  const editedPrompt = project.config.prompts.find((prompt) => prompt.id === editedPromptId) ?? null;
  const armedPrompt = project.config.prompts.find((prompt) => prompt.id === armedPromptId) ?? null;
  // A prompt not yet written names no agents.
  const editedPromptAgentNames =
    editedPrompt === null
      ? []
      : project.config.agents.filter((agent) => agent.promptId === editedPrompt.id).map((agent) => agent.name);
  const armedPromptAgents =
    armedPrompt === null ? [] : project.config.agents.filter((agent) => agent.promptId === armedPrompt.id);

  const saved = promptFormValues(editedPrompt);
  const changes = form === null ? [] : promptChanges(saved, form);
  const isDirty = changes.length > 0;
  // Prompts are named by their name, so a name must be unique in the library.
  const isNameTaken =
    form !== null &&
    nameTaken(
      form.name,
      project.config.prompts.filter((prompt) => prompt.id !== editedPrompt?.id).map((prompt) => prompt.name),
    );
  // What the page's single question shows and answers while a draft exists.
  const unsaved: UnsavedWork | null =
    !isDirty || form === null
      ? null
      : {
          name: form.name.trim() || UNNAMED_PROMPT_LABEL,
          changes,
          blocked: promptBlocker(form),
          blockedNote: isNameTaken ? NAME_TAKEN_PROMPT_NOTE : null,
          save: saveForm,
          discard: () => setForm(saved),
        };

  /** Opens the card and the editor together; `null` opens the editor on a new prompt. */
  function edit(promptId: string | null) {
    setChosenPromptId(promptId);
    setEditedPromptId(promptId ?? "new");
    setForm(promptFormValues(project.config.prompts.find((prompt) => prompt.id === promptId) ?? null));
  }

  function editForm(patch: Partial<PromptFormValues>) {
    setForm((current) =>
      current === null
        ? null
        : {
            ...current,
            ...patch,
          },
    );
  }

  /** Writes the draft; a first save turns `new` into the saved prompt's own id. */
  async function saveForm() {
    if (form === null || isNameTaken) {
      return;
    }

    const written = {
      name: form.name.trim(),
      text: form.text,
    };
    const savedId = await writes.savePrompt(editedPrompt?.id ?? null, written.name, written.text);

    setEditedPromptId(savedId);
    setChosenPromptId(savedId);
    setForm(written);
  }

  /** Puts the editor away, leaving nothing typed behind it. */
  function closeEditor() {
    setEditedPromptId(null);
    setForm(null);
  }

  /** Confirms deletion: removes the prompt and its card's open state. */
  function confirmDelete() {
    if (armedPrompt === null) {
      return;
    }

    setArmedPromptId(null);
    setChosenPromptId(null);
    void writes.deletePrompt(armedPrompt.id);
  }

  function dismissDelete() {
    setArmedPromptId(null);
  }

  return {
    chosenPromptId,
    setChosenPromptId,
    editedPromptId,
    editedPrompt,
    editedPromptAgentNames,
    form,
    // A name counts as moved only once a written one exists.
    wasName: editedPrompt === null || form === null || saved.name === form.name ? null : saved.name,
    isNameTaken,
    isDirty,
    unsaved,
    armedPrompt,
    armedPromptAgents,
    edit,
    editForm,
    saveForm,
    closeEditor,
    arm: setArmedPromptId,
    confirmDelete,
    dismissDelete,
  };
}
