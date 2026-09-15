/** How many words a text holds — counted on a prompt and in its header. */
export function wordCount(text: string): number {
  const words = text.trim();

  return words === "" ? 0 : words.split(/\s+/).length;
}
