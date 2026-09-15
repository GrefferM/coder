/**
 * Whether what is typed **cannot** be a ceiling — a number under the floor the file itself refuses. A ceiling of
 * nought is not a small ceiling: it is a model nothing can be sent to.
 *
 * An empty field is not wrong: nothing is typed yet, and an empty required field is answered at the press and
 * not before it.
 */
export function isCeilingWrong(written: string, least: number): boolean {
  const typed = written.trim();

  return typed !== "" && Number(typed) < least;
}
