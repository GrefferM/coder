/** What the composer's message is told as, ahead of the turn's thread: what it is, then its words, then a gap. */
export const COMPOSED_MEMORY_OPENING = "ПОПЕРЕДНЯ РОЗМОВА, СТИСЛО — усе, що було між нами до цього:\n";
export const COMPOSED_MEMORY_END = "\n\n";

/** The composer's message as the model is given it, or nothing where the memory was never compressed. */
export function composedMemory(text: string | null): string {
  return text === null ? "" : `${COMPOSED_MEMORY_OPENING}${text}${COMPOSED_MEMORY_END}`;
}
