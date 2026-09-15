import { SERVER_NAME_MAX_LENGTH, SERVER_NAME_SHAPE } from "../../../../../contracts";

/**
 * Whether what is typed **cannot** be the name of a server — cyrillic, a space, a dot, or simply too
 * long to stand in a list. The dash is not among them: a server's name goes into the project file and onto the
 * screen, never to a model, so `playwright-mcp` is a name and not a mistake.
 *
 * An empty field is not wrong: nothing is typed yet, and an empty required field is answered at the press and
 * not before it.
 */
export function isServerNameWrong(name: string): boolean {
  return name !== "" && (!SERVER_NAME_SHAPE.test(name) || name.length > SERVER_NAME_MAX_LENGTH);
}
