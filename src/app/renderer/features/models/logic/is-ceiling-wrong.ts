/**
 * Whether what is typed cannot be a ceiling: a number under the floor. An empty field is not wrong; it is reported at
 * the press.
 */
export function isCeilingWrong(written: string, least: number): boolean {
  const typed = written.trim();

  return typed !== "" && Number(typed) < least;
}
