import type { SpokenWord } from "./spoken-word.interface";

/** One voice reading for the whole window: which card it reads, by the message's id, and its two hands. */
export interface ReadAloud {
  /** The message being read; `null` while the voice is silent. */
  readingId: string | null;
  /** The word the voice is at in that message; `null` before the first word, and on a voice that does not say. */
  spoken: SpokenWord | null;
  /** Reads these words for that message, stopping whatever else was being read. */
  read: (id: string, text: string) => void;
  stop: () => void;
}
