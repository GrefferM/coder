import { COMMAND_NAME_MAX_LENGTH, COMMAND_NAME_SHAPE } from "../../../../../contracts";

/**
 * Whether what is typed **cannot** be the name of a command — cyrillic, a space, a dash, or simply too
 * long for the providers to take. A server's name is asked by its own rule, which lets the dash through.
 *
 * An empty field is not wrong: nothing is typed yet, and an empty required field is answered at the press and
 * not before it. So this asks only of a name somebody has actually started writing.
 */
export function isFunctionNameWrong(name: string): boolean {
  return name !== "" && (!COMMAND_NAME_SHAPE.test(name) || name.length > COMMAND_NAME_MAX_LENGTH);
}
