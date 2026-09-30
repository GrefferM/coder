import type { PackedAttachment } from "../../../interfaces";

/**
 * The turn's words when files are attached: the person's text, then each attachment's packed block. Content goes into
 * the turn's input only; the stream shows the typed question and the «ПРИКРІПЛЕНО:» row.
 */
export function askedWithAttached(text: string, attached: PackedAttachment[]): string {
  if (attached.length === 0) {
    return text;
  }

  const packed = attached.map((one) => one.text).join("\n\n");

  return text === "" ? packed : `${text}\n\n${packed}`;
}
