/** A field's name as a sentence: one capital, the rest lower case. */
export function fieldWord(field: string): string {
  return `${field.slice(0, 1)}${field.slice(1).toLocaleLowerCase("uk")}`;
}
