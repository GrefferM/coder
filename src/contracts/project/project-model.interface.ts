/**
 * One model in the open project: its provider, prices and two ceilings. An unwritten number is `null`; nothing is
 * filled in.
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
