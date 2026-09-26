import type { AttachmentKind } from "../../../interfaces";

/**
 * What a sent question carries under it, for the «ПРИКРІПЛЕНО:» row: a file or folder by its leaf name and
 * kind, and nothing of the content — the content went into the walk's input, not into this record.
 */
export interface AttachedFile {
  name: string;
  kind: AttachmentKind;
}
