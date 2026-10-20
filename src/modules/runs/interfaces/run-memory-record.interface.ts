export interface RunMemoryRecord {
  id: string;
  agentId: string;
  coversPlace: number;
  text: string;
  lengthBefore: number;
  lengthAfter: number;
  compressAt: number;
  compressTo: number;
  inputTokens: number;
  outputTokens: number;
  money: number | null;
}
