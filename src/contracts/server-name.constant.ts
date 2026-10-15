import { COMMAND_NAME_MAX_LENGTH } from "./command-name.constant";

/** The shape a server's name must have; it never reaches a model, so a dash is legal (`playwright-mcp`). */
export const SERVER_NAME_SHAPE = /^[a-zA-Z0-9_-]+$/;

export const SERVER_NAME_MAX_LENGTH = COMMAND_NAME_MAX_LENGTH;
