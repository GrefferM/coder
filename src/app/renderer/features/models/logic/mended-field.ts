import type { ModelFormValues } from "../interfaces";

/** The four numbers of the form, in the order its rows stand. */
const MENDED_FIELDS: (keyof ModelFormValues)[] = ["contextCeiling", "answerCeiling", "inputPrice", "outputPrice"];

/**
 * Which row the form opens on when a card sent the person here — the first number nobody wrote,
 * counted in the same order the card names it, so the cursor lands where the word pointed.
 */
export function mendedField(values: ModelFormValues): keyof ModelFormValues | null {
  return MENDED_FIELDS.find((field) => !values[field].trim()) ?? null;
}
