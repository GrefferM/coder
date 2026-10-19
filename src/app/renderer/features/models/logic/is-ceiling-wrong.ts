/**
 * Whether what is typed cannot be a ceiling: a number outside the bounds the file holds. An empty field is not wrong; it
 * is reported at the press.
 */
export function isCeilingWrong(written: string, least: number, most: number): boolean {
  const typed = written.trim();

  return typed !== "" && (Number(typed) < least || Number(typed) > most);
}
