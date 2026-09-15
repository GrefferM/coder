import {
  MODEL_FIELD_ANSWER_CEILING,
  MODEL_FIELD_CONTEXT_CEILING,
  MODEL_FIELD_INPUT_PRICE,
  MODEL_FIELD_OUTPUT_PRICE,
} from "../constants";
import type { FilledModel, ProjectModel, WrittenNumber } from "../interfaces";

/**
 * Every number a model must carry, beside the name its own form gives it, in the order that form
 * asks for them. One list, so the card, the pill and the wall before a turn all mean the same thing by «filled».
 */
export function modelNumbers(model: ProjectModel): WrittenNumber[] {
  return [
    [model.contextCeiling, MODEL_FIELD_CONTEXT_CEILING],
    [model.answerCeiling, MODEL_FIELD_ANSWER_CEILING],
    [model.inputPrice, MODEL_FIELD_INPUT_PRICE],
    [model.outputPrice, MODEL_FIELD_OUTPUT_PRICE],
  ];
}

/** Whether every one of them is written — a turn goes on no other kind of model. */
export function isModelFilled(model: ProjectModel): model is FilledModel {
  return modelNumbers(model).every(([value]) => value !== null);
}
