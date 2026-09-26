/** What a question asks packed as it goes: the picked paths, and the ceiling the pack may not read far past. */
export interface PackAttachmentsAsk {
  paths: string[];
  /** The model's context ceiling, in characters; zero where no model can be asked, and then nothing is read. */
  ceiling: number;
}
