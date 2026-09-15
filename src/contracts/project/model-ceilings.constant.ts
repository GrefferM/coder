/**
 * The floors of a model's two ceilings. Both sides must answer them alike: the form refuses a number under
 * the floor before anything is written, and the file refuses it again on the way in. A ceiling of nought is not a
 * small ceiling — it is a model nothing can be sent to and nothing can be said by.
 */
export const MODEL_CONTEXT_CEILING_LEAST = 1;
export const MODEL_ANSWER_CEILING_LEAST = 1;

/** The least a price may be. Nought is a real price — a model this machine runs costs nothing per token. */
export const MODEL_PRICE_LEAST = 0;
