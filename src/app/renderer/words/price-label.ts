import { notFilledLabel } from "./not-filled-label";
import { modelNumbers } from "../logic";
import { MODEL_PRICE_PLACES, MODEL_PRICE_SEPARATOR, MODEL_PRICE_UNIT } from "../constants";
import type { ProjectModel } from "../interfaces";

/**
 * What a model costs, in words: the input price, the output price, and what they buy. A model with a
 * number nobody has written says that instead, and names the field that is missing — the pill on a
 * sphere says it in the same words. The catalogue row and the picker row both ask here.
 */
export function priceLabel(model: ProjectModel): string {
  const unfilled = notFilledLabel(modelNumbers(model));

  if (unfilled !== null) {
    return unfilled;
  }

  const input = `$${model.inputPrice?.toFixed(MODEL_PRICE_PLACES)}`;
  const output = `$${model.outputPrice?.toFixed(MODEL_PRICE_PLACES)}`;

  return `${input}${MODEL_PRICE_SEPARATOR}${output}${MODEL_PRICE_UNIT}`;
}
