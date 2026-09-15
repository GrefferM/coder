import { COMMAND_NAME_MAX_LENGTH } from "./command-name.constant";

/**
 * The shape a **server's** name must have. This rule is ours and not a provider's — a server's name never reaches
 * a model, which is told the names the server gives its own functions — so the dash is legal, and `playwright-mcp`
 * is a name and not a mistake.
 */
export const SERVER_NAME_SHAPE = /^[a-zA-Z0-9_-]+$/;

/** The same number as a command's, so the house has one length and not two: the name stands in lists either way. */
export const SERVER_NAME_MAX_LENGTH = COMMAND_NAME_MAX_LENGTH;
