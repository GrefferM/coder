export interface RunQuestionRecordingRecord {
  id: string;
  place: number;
  mimeType: string;
  durationMs: number;
  /** The wave's loudness along the recording, as JSON. */
  peaks: string;
  sound: Buffer;
}
