export interface RunStepModelRecord {
  id: string;
  modelId: string;
  title: string;
  providerId: string;
  inputPrice: number | null;
  outputPrice: number | null;
  contextCeiling: number | null;
  answerCeiling: number | null;
}
