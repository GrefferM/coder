import { attachedName } from "./attached-name";
import {
  ATTACHMENT_DENIED_CODES,
  ATTACH_REFUSAL_DASH,
  ATTACH_REFUSAL_QUOTE_CLOSE,
  ATTACH_REFUSAL_QUOTE_OPEN,
  ATTACH_REFUSAL_SUFFIX,
  ATTACH_TOO_BIG_WORDS,
  ATTACH_UNREAD_DENIED,
} from "../constants";
import type { RefusedPick } from "../../../interfaces";

/** Why one pick is not attached: «big-repo/» — завелика, не прикріплено. */
export function refusedPickNote({ name, kind, reason, code, message }: RefusedPick): string {
  const said = `${ATTACH_REFUSAL_QUOTE_OPEN}${attachedName(name, kind)}${ATTACH_REFUSAL_QUOTE_CLOSE}`;

  return `${said}${ATTACH_REFUSAL_DASH}${reason === "tooBig" ? ATTACH_TOO_BIG_WORDS[kind ?? "unknown"] : unreadWhy(code, message)}${ATTACH_REFUSAL_SUFFIX}`;
}

/** «Not yours to read» in words; anything else as the system said it. */
function unreadWhy(code: string | null, message: string | null): string {
  return code !== null && ATTACHMENT_DENIED_CODES.includes(code) ? ATTACH_UNREAD_DENIED : (message ?? "");
}
