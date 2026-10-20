import type { ChatTurn } from "../../../contracts";

/** One silent call that writes down a memory: no tools, nothing said onward, a stop ends it like any turn. */
export interface ModelCompose {
  turnId: string;
  providerId: string;
  model: string;
  temperature: number;
  answerCeiling: number;
  /** One message: the memory, then the instruction to write it down; the composer has no system prompt. */
  messages: ChatTurn[];
  runId: string | null;
  questionId: string;
}
