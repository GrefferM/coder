import { templateParts } from "./template-parts";

/** Names read out of the line's braces, in order, without repeats; empty braces name nothing. */
export function slotNames(text: string): string[] {
  const names = templateParts(text)
    .filter((part) => part.isSlot)
    .map((part) => part.text.slice(1, -1))
    .filter((name) => name.trim() !== "");

  return [...new Set(names)];
}
