import { COMMAND_NAME_MAX_LENGTH, COMMAND_NAME_SHAPE } from "../../../../../contracts";

/**
 * Whether what is typed cannot be a command name: cyrillic, a space, a dash, or too long for the providers. A server's
 * name has its own rule that allows the dash. An empty field is not wrong.
 */
export function isFunctionNameWrong(name: string): boolean {
  return name !== "" && (!COMMAND_NAME_SHAPE.test(name) || name.length > COMMAND_NAME_MAX_LENGTH);
}
