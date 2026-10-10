import type { AttachmentKind } from "../attachments";

/**
 * What a sent question carries for the «ПРИКРІПЛЕНО:» row: a file or folder by leaf name and kind, without content (the
 * content went into the walk's input).
 */
export interface AttachedFile {
  name: string;
  kind: AttachmentKind;
}
