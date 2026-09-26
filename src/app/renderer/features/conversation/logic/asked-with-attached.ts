import type { PackedAttachment } from "../../../interfaces";

/**
 * The words a turn is put with when the person attached files to the question: their own text, and then each
 * attachment's packed block after it. The content goes into the turn's input alone — the stream shows the
 * question as it was typed, and the «ПРИКРІПЛЕНО:» row names the files without opening them.
 */
export function askedWithAttached(text: string, attached: PackedAttachment[]): string {
  if (attached.length === 0) {
    return text;
  }

  const packed = attached.map((one) => one.text).join("\n\n");

  return text === "" ? packed : `${text}\n\n${packed}`;
}
