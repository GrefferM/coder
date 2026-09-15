/**
 * A field's name as a sentence says it — one capital and the rest in small letters. The caps of the
 * pill are the voice of that row, not part of the name, so a sentence takes the name back into plain speech.
 */
export function fieldWord(field: string): string {
  return `${field.slice(0, 1)}${field.slice(1).toLocaleLowerCase("uk")}`;
}
