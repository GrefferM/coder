/** One recording the person made for a question: its bytes, type, length and the wave drawn from it. */
export interface RecordedSound {
  audio: Uint8Array;
  mimeType: string;
  durationMs: number;
  /** Loudness along the recording, each from 0 to 1, as many as the wave has strokes. */
  peaks: number[];
}
