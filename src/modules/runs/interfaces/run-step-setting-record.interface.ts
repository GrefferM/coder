/** The columns the `run_step_settings` table holds; the entity implements it. */
export interface RunStepSettingRecord {
  id: string;
  promptId: string | null;
  prompt: string;
  temperature: number | null;
  maxCalls: number | null;
}
