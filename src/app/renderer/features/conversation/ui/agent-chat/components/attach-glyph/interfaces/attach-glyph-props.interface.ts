import type { AttachmentKind } from "../../../../../../../interfaces";

export interface AttachGlyphProps {
  /** A folder and a file wear different glyphs — the eye tells a tree from a single file by this alone. */
  kind: AttachmentKind;
  size: number;
  color: string;
}
