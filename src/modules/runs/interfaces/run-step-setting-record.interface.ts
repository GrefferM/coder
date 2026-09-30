/** Columns of `run_step_settings`; the entity implements it. */
export interface RunStepSettingRecord {
  id: string;
  promptId: string | null;
  prompt: string;
  temperature: number | null;
  maxCalls: number | null;
}
