import type { ProjectModel } from "../../../interfaces";
import type { ModelFormValues } from "../interfaces";

/** The model the form describes; a model that recognises speech is written with no numbers at all. */
export function modelFromForm(form: ModelFormValues): Omit<ProjectModel, "id"> {
  const isText = form.kind === "text";

  return {
    title: form.title,
    kind: form.kind,
    provider: form.provider,
    contextCeiling: isText ? Number(form.contextCeiling) : null,
    answerCeiling: isText ? Number(form.answerCeiling) : null,
    inputPrice: isText ? Number(form.inputPrice) : null,
    outputPrice: isText ? Number(form.outputPrice) : null,
  };
}
