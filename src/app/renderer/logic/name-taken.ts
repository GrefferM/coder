/**
 * Whether a thing of this kind is already called this. A name is what a person says out loud about an agent, a prompt
 * or a command — and a word that means two things names neither, so the project file refuses the second. Case is not
 * part of the name: the canvas writes every sphere's label in capitals, so «Тезар» and «ТЕЗАР» are one picture, and a
 * rule that let both stand would forbid nothing the eye can see. Ids are what everything is found by; this is for the
 * person alone.
 */
export function nameTaken(name: string, taken: string[]): boolean {
  const wanted = plainly(name);

  return wanted !== "" && taken.some((standing) => plainly(standing) === wanted);
}

/** One name as it is compared: without the space around it and without its case. */
export function plainly(name: string): string {
  return name.trim().toLocaleLowerCase();
}
