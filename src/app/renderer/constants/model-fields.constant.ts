/**
 * What a model's own fields are called. The model form writes them over its rows, and the word that
 * says a field is unwritten names it with the same words, so the person looks for what they were told to look for.
 */
export const MODEL_FIELD_CONTEXT_CEILING = "СТЕЛЯ КОНТЕКСТУ";
export const MODEL_FIELD_ANSWER_CEILING = "СТЕЛЯ ВІДПОВІДІ";
export const MODEL_FIELD_INPUT_PRICE = "ВХІДНА ЦІНА";
export const MODEL_FIELD_OUTPUT_PRICE = "ВИХІДНА ЦІНА";

/** What an agent's own two numbers are called, in the words its settings tab writes over their rows. */
export const AGENT_FIELD_MAX_CALLS = "МАКСИМУМ ВИКЛИКІВ";
export const AGENT_FIELD_TEMPERATURE = "ТЕМПЕРАТУРА";

/** What a thing lacking one of them says, and the dot that carries the field's name after it. */
export const NOT_FILLED_LABEL = "НЕ ЗАПОВНЕНО";
export const NOT_FILLED_SEPARATOR = " · ";

/** How a model's price is said wherever it is said: two numbers, a dot between them, and what they buy. */
export const MODEL_PRICE_SEPARATOR = " · ";
export const MODEL_PRICE_UNIT = " / 1M";
export const MODEL_PRICE_PLACES = 2;
