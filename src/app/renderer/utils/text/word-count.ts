export function wordCount(text: string): number {
  const words = text.trim();

  return words === "" ? 0 : words.split(/\s+/).length;
}
