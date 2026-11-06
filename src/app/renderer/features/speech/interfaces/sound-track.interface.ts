/** A recording as a card plays it, found by its own id. */
export interface SoundTrack {
  id: string;
  mimeType: string;
  durationMs: number;
  /** The loudness of each bar of its wave, from 0 to 1. */
  peaks: number[];
  /** The sound itself while it is still on this screen; `null` when it is read from the record by the id. */
  audio: Uint8Array | null;
}
