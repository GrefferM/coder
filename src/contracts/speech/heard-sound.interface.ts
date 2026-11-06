/** One recording to be turned into words: its bytes, its type, and the provider and model of the project's choice. */
export interface HeardSound {
  audio: Uint8Array;
  mimeType: string;
  providerId: string;
  /** The model's name as the provider knows it. */
  model: string;
}
