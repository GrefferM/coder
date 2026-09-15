/** What a command may be called; the name goes to the provider unchanged as the model's function name. */
export const COMMAND_NAME_PATTERN = /^[a-zA-Z0-9_]+$/;
export const COMMAND_NAME_ALLOWED = /[^a-zA-Z0-9_]+/g;
export const COMMAND_NAME_MAX_LENGTH = 64;
/**
 * The shape a whole name must have, for **refusing** rather than editing: a field that throws away the character
 * somebody just typed loses what they meant, one that keeps it and says what is wrong teaches the rule once.
 * The rule is not ours — the providers refuse by the same one.
 */
export const COMMAND_NAME_SHAPE = /^[a-zA-Z0-9_]+$/;
