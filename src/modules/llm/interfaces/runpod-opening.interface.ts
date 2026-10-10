/** What a RunPod endpoint is opened with: its address, its key, and the turn's two numbers. */
export interface RunPodOpening {
  address: string;
  key: string;
  temperature: number | undefined;
  answerTokens: number;
}
