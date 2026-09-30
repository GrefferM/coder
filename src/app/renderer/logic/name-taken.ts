/** Whether a thing of this kind already has this name. Case is not part of the name. */
export function nameTaken(name: string, taken: string[]): boolean {
  const wanted = plainly(name);

  return wanted !== "" && taken.some((standing) => plainly(standing) === wanted);
}

/** A name as compared: trimmed and case-folded. */
export function plainly(name: string): string {
  return name.trim().toLocaleLowerCase();
}
