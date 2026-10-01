import type { TurnHandoff } from "./turn-handoff.interface";

/** Everything one agent's turn is, apart from where it stands and when. */
export interface StepFacts {
  /** The question this turn grew from. */
  questionId: string;
  /** The walk that wrote this step. */
  walkId: string;
  agentId: string;
  /** The agent, model and prompt as they stood then. */
  agentName: string;
  agentColor: string;
  modelId: string;
  model: string;
  providerId: string;
  /** Price per million tokens then; `null` if the model had none. */
  inputPrice: number | null;
  outputPrice: number | null;
  /** The model's context ceiling then. */
  contextCeiling: number | null;
  /** The tokens the model was allowed to say. */
  answerCeiling: number | null;
  promptId: string | null;
  prompt: string;
  temperature: number | null;
  maxCalls: number | null;
  /** Characters of memory the turn carried ahead of what it was asked. */
  memoryLength: number;
  asked: string;
  said: string;
  state: string;
  inputTokens: number;
  outputTokens: number;
  /** What the turn cost at those prices; `null` where they are unknown. */
  money: number | null;
  /** The steps whose work fed this one; empty for the step the person started. */
  fromStepIds: string[];
  /** The links out of this turn, taken and not taken alike. */
  handoffs: TurnHandoff[];
}
