export {
  AGENT_FIELD_MAX_CALLS,
  AGENT_FIELD_TEMPERATURE,
  MODEL_FIELD_ANSWER_CEILING,
  MODEL_FIELD_CONTEXT_CEILING,
  MODEL_FIELD_INPUT_PRICE,
  MODEL_FIELD_OUTPUT_PRICE,
} from "../../../contracts/project";

/** What a thing lacking a field says, and the dot carrying the field's name. */
export const NOT_FILLED_LABEL = "НЕ ЗАПОВНЕНО";
export const NOT_FILLED_SEPARATOR = " · ";

/** How a model's price is written: two numbers, a dot, what they buy. */
export const MODEL_PRICE_SEPARATOR = " · ";
export const MODEL_PRICE_UNIT = " / 1M";
export const MODEL_PRICE_PLACES = 2;
