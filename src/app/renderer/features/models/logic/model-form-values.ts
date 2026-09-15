import type { ProjectModel } from "../../../interfaces";
import type { ModelFormValues } from "../interfaces";
import { EMPTY_MODEL_FORM_VALUES } from "../constants";

/** A saved model as its form holds it, or empty fields for one that does not exist yet. */
export function modelFormValues(model: ProjectModel | null): ModelFormValues {
  if (model === null) {
    return EMPTY_MODEL_FORM_VALUES;
  }

  return {
    title: model.title,
    provider: model.provider,
    // A number nobody wrote opens the form as an empty field, not as the word «null».
    contextCeiling: typed(model.contextCeiling),
    answerCeiling: typed(model.answerCeiling),
    inputPrice: typed(model.inputPrice),
    outputPrice: typed(model.outputPrice),
  };
}

/** A number as the field holds it, and an empty field where the model carries none. */
function typed(value: number | null): string {
  return value === null ? "" : String(value);
}
