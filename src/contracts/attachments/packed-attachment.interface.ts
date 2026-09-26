import type { AttachmentKind } from "./attachment-kind.type";

/**
 * A picked file or folder packed into one block of text for a question. It is packed when the question goes, and
 * never past what the model's ceiling can hold: a pack that reached the ceiling stops there, over it, so the
 * ceiling's own wall answers it.
 */
export interface PackedAttachment {
  /** The path the person picked, as they picked it. */
  path: string;
  /** The leaf name, for the «ПРИКРІПЛЕНО:» record. */
  name: string;
  /** Whether a file or a folder was picked. */
  kind: AttachmentKind;
  /** The text that goes into the question. */
  text: string;
  /** The paths whose bytes were not text and went in as base64. */
  binaries: string[];
}
