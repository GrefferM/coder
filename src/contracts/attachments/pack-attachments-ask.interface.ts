/** A question's packing request: the picked paths and the ceiling. */
export interface PackAttachmentsAsk {
  paths: string[];
  /** The model's context ceiling in characters; zero when no model can be asked, and nothing is read. */
  ceiling: number;
}
