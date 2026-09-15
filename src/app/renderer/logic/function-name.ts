import { COMMAND_NAME_ALLOWED, COMMAND_NAME_MAX_LENGTH } from "../../../contracts";

/**
 * Filters a typed name to latin letters, digits and underscore, capped at the providers' max length. One rule for
 * both things that wear a name of this shape — a declared command and a declared server — so it lives
 * above either of them and neither borrows it from the other.
 */
export function functionName(name: string): string {
  return name.replace(COMMAND_NAME_ALLOWED, "").slice(0, COMMAND_NAME_MAX_LENGTH);
}
