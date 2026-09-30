import type { AttachmentKind } from "../../../../../../../interfaces";

export interface AttachGlyphProps {
  /** A folder and a file have different glyphs; that alone tells a tree from a file. */
  kind: AttachmentKind;
  size: number;
  color: string;
}
