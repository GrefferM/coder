import {
  LINKS_MAKE_RING,
  LINKS_MAKE_RING_NOTE,
  LINKS_REPEAT,
  LINKS_REPEAT_NOTE,
  PROJECT_FILE_BROKEN,
  PROJECT_FILE_BROKEN_NOTE,
  PROJECT_FILE_BROKEN_NOWHERE_NOTE,
  PROJECT_FROM_NEWER_BUILD,
  PROJECT_FROM_NEWER_BUILD_NOTE,
  REFUSAL_SAID_SEPARATOR,
} from "../constants";

import { brokenPlaceNote } from "./broken-place-note";
import { errorMessage } from "../../../utils/errors";
import type { BrokenPlace } from "../../../interfaces";

/** Screen note for a failed open: known refusals in words, anything else verbatim. */
export function projectFailureNote(reason: unknown): string {
  if (reason instanceof Error && reason.message.includes(PROJECT_FROM_NEWER_BUILD)) {
    return PROJECT_FROM_NEWER_BUILD_NOTE;
  }

  if (reason instanceof Error && reason.message.includes(LINKS_MAKE_RING)) {
    return LINKS_MAKE_RING_NOTE;
  }

  if (reason instanceof Error && reason.message.includes(LINKS_REPEAT)) {
    return LINKS_REPEAT_NOTE;
  }

  if (reason instanceof Error && reason.message.includes(PROJECT_FILE_BROKEN)) {
    const place = brokenPlaceOf(reason.message);

    return place === null ? PROJECT_FILE_BROKEN_NOWHERE_NOTE : `${PROJECT_FILE_BROKEN_NOTE}${brokenPlaceNote(place)}`;
  }

  return errorMessage(reason);
}

/**
 * The broken place the refusal carried, or null if it named none; read off the text after the first separator, and
 * unparseable text yields null.
 */
function brokenPlaceOf(message: string): BrokenPlace | null {
  const at = message.indexOf(REFUSAL_SAID_SEPARATOR);

  if (at === -1) {
    return null;
  }

  const said = message.slice(at + REFUSAL_SAID_SEPARATOR.length);

  if (said === "") {
    return null;
  }

  try {
    return <BrokenPlace>JSON.parse(said);
  } catch {
    return null;
  }
}
