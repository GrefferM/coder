import { COMMAND_NAME_ALLOWED, COMMAND_NAME_MAX_LENGTH } from "../../../contracts";

/**
 * Filters a typed name to latin letters, digits and underscore, capped at the providers' max length; shared by declared
 * commands and servers.
 */
export function functionName(name: string): string {
  return name.replace(COMMAND_NAME_ALLOWED, "").slice(0, COMMAND_NAME_MAX_LENGTH);
}
