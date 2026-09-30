import { SERVER_NAME_MAX_LENGTH, SERVER_NAME_SHAPE } from "../../../../../contracts";

/**
 * Whether the typed text cannot be a server name: cyrillic, a space, a dot, or too long for a list. A dash is allowed.
 * An empty field is not wrong.
 */
export function isServerNameWrong(name: string): boolean {
  return name !== "" && (!SERVER_NAME_SHAPE.test(name) || name.length > SERVER_NAME_MAX_LENGTH);
}
