/** The columns the `run_steps` table holds; the entity implements it. */
export interface RunStepRecord {
  id: string;
  place: number;
  walkId: string;
  asked: string;
  said: string;
  state: string;
  inputTokens: number;
  outputTokens: number;
  money: number | null;
  startedAt: Date;
  endedAt: Date;
}
