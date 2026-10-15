export interface RunStepSettingRecord {
  id: string;
  promptId: string | null;
  prompt: string;
  temperature: number | null;
  maxCalls: number | null;
  memoryLength: number;
}
