import { RUN_STEP_DONE } from "../features/record";
import type { WholeStep } from "../interfaces";

const STEP_STARTED_AT = new Date("2026-08-31T15:05:00");

/** One turn as the record hands it back, built whole; a spec patches what it is about. */
export function aStep(patch: Partial<WholeStep> = {}): WholeStep {
  return {
    id: "step-1",
    questionId: "question-1",
    walkId: "walk-1",
    place: 1,
    agentId: "agent-1",
    agentName: "Шукач",
    agentColor: "#6fd3d8",
    modelId: "model-1",
    model: "deepseek-v4-flash",
    providerId: "openrouter",
    inputPrice: 3,
    outputPrice: 15,
    contextCeiling: 700_000,
    answerCeiling: 4_096,
    promptId: null,
    prompt: "",
    temperature: 0,
    maxCalls: 8,
    asked: "Розбий текст на тези",
    said: "- Починай з малого",
    state: RUN_STEP_DONE,
    inputTokens: 400,
    outputTokens: 200,
    money: 0.01,
    fromStepIds: [],
    handoffs: [],
    startedAt: STEP_STARTED_AT,
    endedAt: new Date(STEP_STARTED_AT.getTime() + 5_000),
    calls: [],
    ...patch,
  };
}
