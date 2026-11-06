import type { PackedAttachment } from "../attachments";
import type { QuestionRecording } from "./question-recording.interface";

/** One question of a flow, read back; a conversation is a sequence of them. */
export interface WholeQuestion {
  id: string;
  place: number;
  asked: string;
  askedAt: Date;
  /** The agent this question stood before; a repeat resumes the walk there. */
  askedAgentId: string;
  /** The files and folders sent with it, packed as they went; a repeat puts them in again. */
  attached: PackedAttachment[];
  /** The recordings the question was said with, in the order they were made. */
  recordings: QuestionRecording[];
}
