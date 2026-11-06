/** A recording kept with a question, without its sound, which is fetched by the recording's id when played. */
export interface QuestionRecording {
  id: string;
  /** Its place among the question's recordings, from one. */
  place: number;
  mimeType: string;
  durationMs: number;
  peaks: number[];
}
