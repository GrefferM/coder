import type { AttachmentKind } from "../../../interfaces";

/**
 * A pick refused before it became a chip: «Завелика» where even its fewest characters would not fit under the ceiling,
 * «немає доступу» where the system denies reading.
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
