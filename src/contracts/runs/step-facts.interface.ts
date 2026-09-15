import type { TurnHandoff } from "./turn-handoff.interface";

/**
 * Everything one agent's turn is, apart from where it stands and when. Written once here: the record takes a step
 * with these facts and hands the same ones back, and both processes read them off the one shape.
 */
export interface StepFacts {
  /** The question this turn grew from; a flow is asked more than once. */
  questionId: string;
  /** The walk that wrote this step, so a repeat can tell the last one from the ones before it. */
  walkId: string;
  agentId: string;
  /** The agent, the model and the prompt as they stood then, so «then» can be held against «today». */
  agentName: string;
  agentColor: string;
  modelId: string;
  model: string;
  providerId: string;
  /** What a million tokens cost then; nothing where the model carried no price. */
  inputPrice: number | null;
  outputPrice: number | null;
  /** The ceiling that model stood at then, which a turn over it was measured against. */
  contextCeiling: number | null;
  /** The tokens the model was allowed to say, so a cut answer can name what cut it. */
  answerCeiling: number | null;
  promptId: string | null;
  prompt: string;
  temperature: number | null;
  maxCalls: number | null;
  asked: string;
  said: string;
  state: string;
  inputTokens: number;
  outputTokens: number;
  /** What the turn cost at those prices; nothing where they cannot be said. */
  money: number | null;
  /** The steps whose work came into this one; empty for the step the person started. */
  fromStepIds: string[];
  /** The links out of this turn, taken and not taken alike. */
  handoffs: TurnHandoff[];
}
