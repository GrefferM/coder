import {
  MODEL_FIELD_ANSWER_CEILING,
  MODEL_FIELD_CONTEXT_CEILING,
  MODEL_FIELD_INPUT_PRICE,
  MODEL_FIELD_OUTPUT_PRICE,
} from "./field-names.constant";
import type { FilledModel } from "./filled-model.interface";
import type { ProjectModel } from "./project-model.interface";
import type { WrittenNumber } from "./written-number.type";

/**
 * Every number a model must carry, beside the name its form gives it, in that form's order; one definition of «filled»
 * for card, pill and wall.
 */
export function modelNumbers(model: ProjectModel): WrittenNumber[] {
  return [
    [model.contextCeiling, MODEL_FIELD_CONTEXT_CEILING],
    [model.answerCeiling, MODEL_FIELD_ANSWER_CEILING],
    [model.inputPrice, MODEL_FIELD_INPUT_PRICE],
    [model.outputPrice, MODEL_FIELD_OUTPUT_PRICE],
  ];
}

/** Whether every one is written; no turn goes on another kind of model. */
export function isModelFilled(model: ProjectModel): model is FilledModel {
  return modelNumbers(model).every(([value]) => value !== null);
}
