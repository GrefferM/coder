import type { AttachmentKind } from "./attachment-kind.type";

/** Every kind a pick can be; the record refuses any other word. */
export const ATTACHMENT_KINDS: readonly AttachmentKind[] = ["file", "folder"];
