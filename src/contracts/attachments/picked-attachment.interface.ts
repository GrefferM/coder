import type { AttachmentKind } from "./attachment-kind.type";

/**
 * A file or folder the person picked, named and weighed but not read: this is what the chip stands for until the
 * question goes. Reading waits for the send, so a folder of any size is picked in the time it takes to count it.
 */
export interface PickedAttachment {
  /** The path the person picked — the chip's own id, and what the × takes off. */
  path: string;
  /** The leaf name shown on the chip. */
  name: string;
  kind: AttachmentKind;
  /** The size of every file in it, in bytes — the weight the chip says. */
  bytes: number;
  /**
   * The fewest characters its pack can come to — the paths exactly, and every file at a quarter of its bytes,
   * since no character is longer than four. A pick whose least is over the room under the ceiling is refused.
   */
  least: number;
}
