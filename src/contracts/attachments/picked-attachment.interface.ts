import type { AttachmentKind } from "./attachment-kind.type";

/** A picked file or folder, named and weighed but not read until the question goes. */
export interface PickedAttachment {
  /** The picked path: the chip's id, and what the × removes. */
  path: string;
  /** The leaf name shown on the chip. */
  name: string;
  kind: AttachmentKind;
  /** Total size in bytes of every file in it. */
  bytes: number;
  /**
   * The fewest characters its pack can come to: paths exactly, each file at a quarter of its bytes. A pick whose least
   * exceeds the room under the ceiling is refused.
   */
  least: number;
}
