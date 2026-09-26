import type { AttachmentKind } from "./attachment-kind.type";

/** A picked file or folder that was not attached, and why — said to the person instead of becoming a chip. */
export interface RefusedPick {
  path: string;
  name: string;
  /** None where the path could not even be looked at. */
  kind: AttachmentKind | null;
  /** Too big for the ceiling even at its fewest characters, or not ours to read. */
  reason: "tooBig" | "unread";
  /** The system's own code for an unread one, such as `EACCES`; none where there was none. */
  code: string | null;
  /** The system's own words for an unread one; none for one too big. */
  message: string | null;
}
