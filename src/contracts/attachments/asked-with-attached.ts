import type { PackedAttachment } from "./packed-attachment.interface";

/**
 * The turn's input when files are attached: the person's text, then each attachment's packed block. The walk and the
 * shared memory both glue a question with it.
 */
export function askedWithAttached(text: string, attached: PackedAttachment[]): string {
  if (attached.length === 0) {
    return text;
  }

  const packed = attached.map((one) => one.text).join("\n\n");

  return text === "" ? packed : `${text}\n\n${packed}`;
}
