/**
 * One model in the open project: which it is, whose provider serves it, its prices and its two ceilings. A number
 * nobody wrote stands as `null` — the model is unfinished and says so, and nothing is filled in for it.
 */
export interface ProjectModel {
  id: string;
  title: string;
  provider: string;
  inputPrice: number | null;
  outputPrice: number | null;
  /** The biggest turn it will take, in characters. */
  contextCeiling: number | null;
  /** The most it may say in one turn, in tokens — the provider's own count. */
  answerCeiling: number | null;
}
