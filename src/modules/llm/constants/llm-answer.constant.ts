/** The metadata fields providers name their stop reason under. */
export const LLM_CEILING_REASON_KEYS = ["finish_reason", "stop_reason", "done_reason", "finishReason"];
/** The stop reasons providers give for a stream that ended at the answer's ceiling. */
export const LLM_CEILING_REASONS = ["length", "max_tokens", "max_output_tokens", "model_length"];
