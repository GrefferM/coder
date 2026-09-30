import { useState } from "react";
import { modelBlocker, modelFormValues, modelChanges } from "../../logic";
import type { OpenProject, UnsavedWork } from "../../../../interfaces";
import type { ModelFormValues } from "../../interfaces";
import type { ModelWrites } from "../use-model-writes";
import type { ModelSection } from "./interfaces";

export function useModelSection(project: OpenProject, writes: ModelWrites): ModelSection {
  // The opened model; `new` before it exists.
  const [openModelId, setOpenModelId] = useState<string | "new" | null>(null);
  const [armedModelId, setArmedModelId] = useState<string | null>(null);
  // The form was opened by a card's act, so it opens on the field that card named.
  const [isMending, setIsMending] = useState(false);
  const [edits, setEdits] = useState<Partial<ModelFormValues> | null>(null);

  const openModel = project.config.models.find((model) => model.id === openModelId) ?? null;
  const saved = openModelId === null ? null : modelFormValues(openModel);
  const form =
    saved === null
      ? null
      : {
          ...saved,
          ...edits,
        };
  const changes = saved === null || form === null ? [] : modelChanges(saved, form);
  // A new model becomes unsaved work at the first keystroke.
  const unsaved: UnsavedWork | null =
    changes.length === 0 || form === null
      ? null
      : {
          name: openModel?.title ?? form.title,
          changes,
          blocked: modelBlocker(form),
          blockedNote: null,
          save: saveForm,
          discard: () => setEdits(null),
        };

  /** Opens the form on a model, or empty for a new one. */
  function openForm(modelId: string | "new" | null, isMended = false) {
    setOpenModelId(modelId);
    setEdits(null);
    setIsMending(isMended);
  }

  /** Puts one change into the form's draft. */
  function editForm(patch: Partial<ModelFormValues>) {
    setEdits((previous) => ({
      ...previous,
      ...patch,
    }));
  }

  /** Puts every field back to its saved value without closing the form. */
  function revertForm() {
    setEdits(null);
  }

  /** Writes the form and closes it — a new model included. */
  async function saveForm() {
    if (form === null) {
      return;
    }

    await writes.saveModel(openModel?.id ?? null, {
      title: form.title,
      provider: form.provider,
      contextCeiling: Number(form.contextCeiling),
      answerCeiling: Number(form.answerCeiling),
      inputPrice: Number(form.inputPrice),
      outputPrice: Number(form.outputPrice),
    });
    setEdits(null);
    setOpenModelId(null);
  }

  /** The question's yes: the model goes, and every agent on it. */
  function confirmDelete() {
    const leaving = armedModelId;

    setArmedModelId(null);

    if (leaving !== null) {
      void writes.deleteModel(leaving);
    }
  }

  function dismissDelete() {
    setArmedModelId(null);
  }

  return {
    openModelId,
    openModel,
    form,
    saved,
    isDirty: changes.length > 0,
    unsaved,
    armedModelId,
    isMending,
    openForm,
    editForm,
    revertForm,
    saveForm,
    arm: setArmedModelId,
    confirmDelete,
    dismissDelete,
  };
}
