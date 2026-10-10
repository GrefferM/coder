import type { AddCall } from "./add-call.interface";
import type { AddHandoff } from "./add-handoff.interface";

/** One agent's turn, written when it ends: the agent as it then stood, what it said, every call. */
export interface AddStep {
  runId: string;
  questionId: string;
  /** The walk this turn ran in; shared by every step of the walk. */
  walkId: string;
  agentId: string;
  agentName: string;
  agentColor: string;
  modelId: string;
  model: string;
  providerId: string;
  /** Empty where the model carried no such number, rather than a made-up zero. */
  inputPrice: number | null;
  outputPrice: number | null;
  contextCeiling: number | null;
  answerCeiling: number | null;
  promptId: string | null;
  prompt: string;
  temperature: number | null;
  maxCalls: number | null;
  memoryLength: number;
  asked: string;
  said: string;
  /** How the turn ended, in the screen's word. */
  state: string;
  inputTokens: number;
  outputTokens: number;
  money: number | null;
  fromStepIds: string[];
  handoffs: AddHandoff[];
  startedAt: number;
  endedAt: number;
  calls: AddCall[];
}
