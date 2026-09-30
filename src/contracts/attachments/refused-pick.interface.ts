import type { AttachmentKind } from "./attachment-kind.type";

/** A picked file or folder that was not attached, and why; shown to the person instead of becoming a chip. */
export interface RefusedPick {
  path: string;
  name: string;
  /** None where the path could not even be looked at. */
  kind: AttachmentKind | null;
  /** Too big for the ceiling even at its fewest characters, or unreadable. */
  reason: "tooBig" | "unread";
  /** The system's code for an unreadable pick, such as `EACCES`, or null. */
  code: string | null;
  /** The system's message for an unreadable pick, or null. */
  message: string | null;
}
