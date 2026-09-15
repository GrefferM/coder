import { TEMPLATE_SLOT_PATTERN } from "./constants";
import type { TemplatePart } from "./interfaces";

/** A line split into literals and brace slots; the text between is kept exactly, spaces included. */
export function templateParts(text: string): TemplatePart[] {
  const parts: TemplatePart[] = [];
  let read = 0;

  for (const match of text.matchAll(TEMPLATE_SLOT_PATTERN)) {
    if (match.index > read) {
      parts.push({
        text: text.slice(read, match.index),
        isSlot: false,
      });
    }

    parts.push({
      text: match[0],
      isSlot: true,
    });
    read = match.index + match[0].length;
  }

  if (read < text.length) {
    parts.push({
      text: text.slice(read),
      isSlot: false,
    });
  }

  return parts;
}
