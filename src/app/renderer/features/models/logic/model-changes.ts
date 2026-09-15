import {
  MODEL_ANSWER_CEILING_CHANGE_LABEL,
  MODEL_ANSWER_CEILING_DROPPED_LABEL,
  MODEL_CONTEXT_CEILING_CHANGE_LABEL,
  MODEL_CONTEXT_CEILING_DROPPED_LABEL,
  MODEL_INPUT_PRICE_CHANGE_LABEL,
  MODEL_INPUT_PRICE_DROPPED_LABEL,
  MODEL_OUTPUT_PRICE_CHANGE_LABEL,
  MODEL_OUTPUT_PRICE_DROPPED_LABEL,
  MODEL_PROVIDER_CHANGE_LABEL,
  MODEL_PROVIDER_DROPPED_LABEL,
  MODEL_TITLE_CHANGE_LABEL,
  MODEL_TITLE_DROPPED_LABEL,
} from "../constants";
import type { FieldChange } from "../../../interfaces";
import type { ModelFormValues } from "../interfaces";

/** Fields of a model's form changed from the saved values. */
export function modelChanges(saved: ModelFormValues, form: ModelFormValues): FieldChange[] {
  const written: FieldChange[] = [
    {
      label: MODEL_TITLE_CHANGE_LABEL,
      droppedLabel: MODEL_TITLE_DROPPED_LABEL,
      was: saved.title,
      now: form.title,
    },
    {
      label: MODEL_PROVIDER_CHANGE_LABEL,
      droppedLabel: MODEL_PROVIDER_DROPPED_LABEL,
      was: saved.provider,
      now: form.provider,
    },
    {
      label: MODEL_CONTEXT_CEILING_CHANGE_LABEL,
      droppedLabel: MODEL_CONTEXT_CEILING_DROPPED_LABEL,
      was: saved.contextCeiling,
      now: form.contextCeiling,
    },
    {
      label: MODEL_ANSWER_CEILING_CHANGE_LABEL,
      droppedLabel: MODEL_ANSWER_CEILING_DROPPED_LABEL,
      was: saved.answerCeiling,
      now: form.answerCeiling,
    },
    {
      label: MODEL_INPUT_PRICE_CHANGE_LABEL,
      droppedLabel: MODEL_INPUT_PRICE_DROPPED_LABEL,
      was: saved.inputPrice,
      now: form.inputPrice,
    },
    {
      label: MODEL_OUTPUT_PRICE_CHANGE_LABEL,
      droppedLabel: MODEL_OUTPUT_PRICE_DROPPED_LABEL,
      was: saved.outputPrice,
      now: form.outputPrice,
    },
  ];

  return written.filter((change) => change.was !== change.now);
}
