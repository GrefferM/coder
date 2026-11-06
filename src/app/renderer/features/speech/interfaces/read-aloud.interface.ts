/** One voice reading for the whole window: which card it reads, by the message's id, and its two hands. */
export interface ReadAloud {
  /** The message being read; `null` while the voice is silent. */
  readingId: string | null;
  /** Reads these words for that message, stopping whatever else was being read. */
  read: (id: string, text: string) => void;
  stop: () => void;
}
