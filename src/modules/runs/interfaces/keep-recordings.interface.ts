import type { RecordedSound } from "../../../contracts";

/** The recordings a question was said with, kept beside it. */
export interface KeepRecordings {
  questionId: string;
  recordings: RecordedSound[];
}
