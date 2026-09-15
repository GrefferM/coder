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

import { errorMessage } from "../../../utils/errors";

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
    const [, place = ""] = reason.message.split(REFUSAL_SAID_SEPARATOR);

    return place === "" ? PROJECT_FILE_BROKEN_NOWHERE_NOTE : `${PROJECT_FILE_BROKEN_NOTE}${place}`;
  }

  return errorMessage(reason);
}
