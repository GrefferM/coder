import type { ModelFormValues } from "../interfaces";

/** How the leave-the-form question names each field of a model's form. */
export const MODEL_TITLE_CHANGE_LABEL = "назва";
export const MODEL_KIND_CHANGE_LABEL = "вид";
export const MODEL_PROVIDER_CHANGE_LABEL = "провайдер";
export const MODEL_CONTEXT_CEILING_CHANGE_LABEL = "стеля контексту";
export const MODEL_ANSWER_CEILING_CHANGE_LABEL = "стеля відповіді";
export const MODEL_INPUT_PRICE_CHANGE_LABEL = "вхідна ціна";
export const MODEL_OUTPUT_PRICE_CHANGE_LABEL = "вихідна ціна";

/** A new model opens as a text model with both ceilings empty. */
export const EMPTY_MODEL_FORM_VALUES: ModelFormValues = {
  title: "",
  kind: "text",
  provider: "",
  contextCeiling: "",
  answerCeiling: "",
  inputPrice: "",
  outputPrice: "",
};

/** The same names as objects, for «Скидаємо назву й провайдера до записаного». */
export const MODEL_TITLE_DROPPED_LABEL = "назву";
export const MODEL_KIND_DROPPED_LABEL = "вид";
export const MODEL_PROVIDER_DROPPED_LABEL = "провайдера";
export const MODEL_CONTEXT_CEILING_DROPPED_LABEL = "стелю контексту";
export const MODEL_ANSWER_CEILING_DROPPED_LABEL = "стелю відповіді";
export const MODEL_INPUT_PRICE_DROPPED_LABEL = "вхідну ціну";
export const MODEL_OUTPUT_PRICE_DROPPED_LABEL = "вихідну ціну";
