import {
  MODEL_ANSWER_CEILING_DROPPED_LABEL,
  MODEL_CONTEXT_CEILING_DROPPED_LABEL,
  MODEL_INPUT_PRICE_DROPPED_LABEL,
  MODEL_OUTPUT_PRICE_DROPPED_LABEL,
  MODEL_PROVIDER_DROPPED_LABEL,
  MODEL_TITLE_DROPPED_LABEL,
} from "../constants";
import type { ModelFormValues } from "../interfaces";

/** Required fields still empty: name and provider, and for a text model both ceilings and both prices. */
export function modelBlocker(values: ModelFormValues): string[] {
  const missing: string[] = [];

  if (!values.title.trim()) {
    missing.push(MODEL_TITLE_DROPPED_LABEL);
  }

  if (!values.provider.trim()) {
    missing.push(MODEL_PROVIDER_DROPPED_LABEL);
  }

  // A model that recognises speech has no ceilings and no prices.
  if (values.kind === "listen") {
    return missing;
  }

  if (!values.contextCeiling.trim()) {
    missing.push(MODEL_CONTEXT_CEILING_DROPPED_LABEL);
  }

  if (!values.answerCeiling.trim()) {
    missing.push(MODEL_ANSWER_CEILING_DROPPED_LABEL);
  }

  if (!values.inputPrice.trim()) {
    missing.push(MODEL_INPUT_PRICE_DROPPED_LABEL);
  }

  if (!values.outputPrice.trim()) {
    missing.push(MODEL_OUTPUT_PRICE_DROPPED_LABEL);
  }

  return missing;
}
