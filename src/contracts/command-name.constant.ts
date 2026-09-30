/** What a command may be called; sent to the provider unchanged as the function name. */
export const COMMAND_NAME_PATTERN = /^[a-zA-Z0-9_]+$/;
export const COMMAND_NAME_ALLOWED = /[^a-zA-Z0-9_]+/g;
export const COMMAND_NAME_MAX_LENGTH = 64;
/** The shape a whole name must have, used to refuse rather than edit; providers apply the same rule. */
export const COMMAND_NAME_SHAPE = /^[a-zA-Z0-9_]+$/;
