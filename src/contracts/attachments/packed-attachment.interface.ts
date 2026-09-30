import type { AttachmentKind } from "./attachment-kind.type";

/**
 * A picked file or folder packed into one text block when the question goes, never past the model's ceiling; a pack
 * that reaches it stops just over it.
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
