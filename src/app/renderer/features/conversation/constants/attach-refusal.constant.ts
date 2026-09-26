import type { AttachmentKind } from "../../../interfaces";

/**
 * A pick refused before it became a chip, said in a few words on the line over the canvas: which one, and why.
 * «Завелика» where even its fewest characters would not fit under the ceiling, and «немає доступу» where the
 * system would not let us read it.
 */
export const ATTACH_REFUSAL_QUOTE_OPEN = "«";
export const ATTACH_REFUSAL_QUOTE_CLOSE = "»";
export const ATTACH_REFUSAL_DASH = " — ";
export const ATTACH_REFUSAL_SUFFIX = ", не прикріплено";
export const ATTACH_TOO_BIG_WORDS: Record<AttachmentKind | "unknown", string> = {
  folder: "завелика",
  file: "завеликий",
  unknown: "завелике",
};
export const ATTACH_UNREAD_DENIED = "немає доступу";
