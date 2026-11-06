import type { ModelKind } from "./model-kind.type";

/**
 * One model in the open project: what it does, its provider, prices and two ceilings. An unwritten number is `null`;
 * nothing is filled in. A model that recognises speech holds no prices and no ceilings.
 */
export interface ProjectModel {
  id: string;
  title: string;
  kind: ModelKind;
  provider: string;
  inputPrice: number | null;
  outputPrice: number | null;
  /** The biggest turn it will take, in characters. */
  contextCeiling: number | null;
  /** The most it may say in one turn, in tokens — the provider's own count. */
  answerCeiling: number | null;
}
