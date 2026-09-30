import type { ModelFormValues } from "../interfaces";

/** The four numbers of the form, in the order its rows stand. */
const MENDED_FIELDS: (keyof ModelFormValues)[] = ["contextCeiling", "answerCeiling", "inputPrice", "outputPrice"];

/** The row the form opens on when a card sent the person here: the first unwritten number, in the card's order. */
export function mendedField(values: ModelFormValues): keyof ModelFormValues | null {
  return MENDED_FIELDS.find((field) => !values[field].trim()) ?? null;
}
