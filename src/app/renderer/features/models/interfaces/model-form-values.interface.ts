import type { ModelKind } from "../../../interfaces";

/** The model form's fields as typed; numbers are text until written. */
export interface ModelFormValues {
  title: string;
  kind: ModelKind;
  provider: string;
  contextCeiling: string;
  answerCeiling: string;
  inputPrice: string;
  outputPrice: string;
}
