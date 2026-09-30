import type { AttachmentKind } from "../../../interfaces";

/**
 * What a sent question carries for the «ПРИКРІПЛЕНО:» row: a file or folder by leaf name and kind, without content (the
 * content went into the walk's input).
 */
export interface AttachedFile {
  name: string;
  kind: AttachmentKind;
}
