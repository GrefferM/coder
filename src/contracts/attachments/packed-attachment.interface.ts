import type { AttachmentKind } from "./attachment-kind.type";

/**
 * A picked file or folder packed into one text block when the question goes. Reading stops as soon as the model's
 * ceiling is crossed, so a pack too big for it comes out just over it.
 */
export interface PackedAttachment {
  /** The path the person picked, as they picked it. */
  path: string;
  /** The leaf name, for the «ПРИКРІПЛЕНО:» record. */
  name: string;
  kind: AttachmentKind;
  text: string;
  /** The paths whose bytes were not text and went in as base64. */
  binaries: string[];
}
