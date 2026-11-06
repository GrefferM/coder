/** The draft with the heard words written after it, a space between where the draft has words of its own. */
export function heardIntoDraft(draft: string, heard: string): string {
  const typed = draft.trimEnd();

  return typed === "" ? heard : `${typed} ${heard}`;
}
