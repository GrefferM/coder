/**
 * The bounds of a model's two ceilings, shared by the form and the file: the context's in characters, the answer's in
 * tokens. Under the least nothing worth asking fits; over the most is a stray zero.
 */
export const MODEL_CONTEXT_CEILING_LEAST = 1;
export const MODEL_CONTEXT_CEILING_MOST = 1_048_576;
export const MODEL_ANSWER_CEILING_LEAST = 1_024;
export const MODEL_ANSWER_CEILING_MOST = 524_288;

/** The least a price may be; zero is real, for a model run locally. */
export const MODEL_PRICE_LEAST = 0;
