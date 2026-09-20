/** What a RunPod endpoint is opened with: where it answers, the key that opens it, and the turn's own two numbers. */
export interface RunPodOpening {
  address: string;
  key: string;
  temperature: number;
  answerTokens: number;
}
